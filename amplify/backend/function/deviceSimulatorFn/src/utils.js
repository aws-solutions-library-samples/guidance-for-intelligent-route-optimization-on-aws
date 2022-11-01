const { mqtt, iot } = require("aws-iot-device-sdk-v2");
const {
  LocationClient,
  CalculateRouteCommand,
} = require("@aws-sdk/client-location");
const { lineString } = require("@turf/helpers");
const along = require("@turf/along").default;
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const locationClient = new LocationClient();

/**
 * Create an MQTT connection to the AWS IoT Core endpoint.
 *
 * @param {string} clientId
 * @param {string} endpoint
 * @param {string} cert
 * @param {string} key
 *
 * @returns {mqtt.Client}
 */
const buildConnection = (clientId, endpoint, cert, key) => {
  let configBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder(
    cert,
    key
  );
  configBuilder.with_clean_session(false);
  configBuilder.with_client_id(clientId);
  configBuilder.with_endpoint(endpoint);
  const config = configBuilder.build();
  const client = new mqtt.MqttClient();

  return client.new_connection(config);
};

class RouteLeg {
  /**
   * @param {import('@aws-sdk/client-location').Leg} leg
   */
  constructor(leg) {
    this.startPosition = leg.StartPosition;
    this.endPosition = leg.EndPosition;
    this.totalDistance = leg.Distance;
    this.lineString = lineString(leg.Geometry?.LineString);

    /** @type {number} */
    this.currentStep = 0;
  }

  /** @param {number} stepDistance */
  advance = (stepDistance) => {
    this.currentStep += stepDistance;
    const nextPoint = along(this.lineString, this.currentStep, {
      units: "kilometers",
    });

    return nextPoint.geometry.coordinates;
  };
}

class Itinerary {
  /**
   * @param {string} itineraryId
   * @param {import('@aws-lambda-powertools/logger').Logger} logger
   */
  constructor(itineraryId, logger, secretId) {
    this.id = itineraryId;
    this.logger = logger;

    this.ioTConnection = undefined;
    this.ioTtopic = undefined;

    /** @type {?RouteLeg[]} */
    this.legs = null;
    // Total distance in km
    /** @type {number} */
    this.totalDistance = -1;
    // Total distance left in km
    /** @type {number} */
    this.distanceLeft = -1;
    // Total distance covered in km
    /** @type {number} */
    this.distanceCovered = -1;
    // Distance covered by each update in km
    /** @type {number} */
    this.stepDistance = -1;

    this.currentLegIdx = 0;
    this.updateFrequency = -1;
    this.hasNextStep = false;

    this.secretsManagerClient = new SecretsManagerClient({});
    this.secretId = secretId;
  }

  getCertAndKey = async () => {
    if (!this.cert || !this.key) {
      const secret = await this.secretsManagerClient.send(
        new GetSecretValueCommand({
          SecretId: this.secretId,
        })
      );
      const { SecretString } = secret;
      if (!SecretString) {
        throw new Error("Could not find secret");
      }
      const { cert, keyPair } = JSON.parse(SecretString);

      this.cert = cert;
      this.key = keyPair;

      if (!this.cert || !this.key) {
        throw new Error("Could not find cert or key");
      }

      this.logger.info("Got cert and key from Secrets Manager");
    }

    return {
      cert: this.cert,
      key: this.key,
    };
  };

  connect = async (clientId, endpoint, topic) => {
    try {
      this.ioTtopic = topic;
      const { cert, key } = await this.getCertAndKey();
      const connection = buildConnection(clientId, endpoint, cert, key);
      this.logger.info("Connecting to IoT Core");
      await connection.connect();
      this.logger.info("Successfully connected to IoT Core");
      this.ioTConnection = connection;
    } catch (err) {
      this.logger.error("Error connecting to IoT Core", { err });
      throw err;
    }
  };

  publishUpdate = async (location) => {
    const payload = {
      deviceID: this.id,
      timestamp: new Date().getTime(),
      latitude: location[0],
      longitude: location[1],
    };

    await this.ioTConnection.publish(
      this.ioTtopic,
      JSON.stringify({
        ...payload,
      }),
      mqtt.QoS.AtMostOnce
    );
  };

  /**
   * We want to send updates at a rate that allows to complete the route
   * within 14 minutes, because the Lambda function will time out after
   * 15 minutes.
   *
   * To do so, knowing the total distance of the route and the frequency
   * of the updates (30 seconds), we can calculate the distance
   * between any two updates.
   *
   * @param {number} totalDistance
   * @param {number} updateFrequency
   */
  getDistanceBetweenUpdates = (totalDistance, updateFrequency) => {
    // 14 min (max Lambda timeout) in hours
    const maxTime = 0.233333;
    // This is the optimal avg speed in km/h needed to complete the route
    const optimalSpeed = totalDistance / maxTime;
    // Calculate the distance between each update to be sent
    // (optimalSpeed)km : 3600 seconds = (step)km : (updateFrequency)seconds
    const step = (optimalSpeed * updateFrequency) / 3600;

    return step;
  };

  /**
   *
   * @param {{ lat: number, lng: number }} waypoints
   * @returns {Route}
   */
  calculateRoute = async (waypoints) => {
    const departureMarker = waypoints[0];
    const destinationMarker = waypoints[waypoints.length - 1];
    const commandInput = {
      CalculatorName: process.env.ROUTE_CALCULATOR_NAME,
      TravelMode: "Car",
      IncludeLegGeometry: true,
      DeparturePosition: [departureMarker.lng, departureMarker.lat],
      DestinationPosition: [destinationMarker.lng, destinationMarker.lat],
    };

    if (waypoints.length > 2) {
      const midWaypoints = waypoints.slice(1, -1);
      commandInput.WaypointPositions = midWaypoints.map(({ lng, lat }) => [
        lng,
        lat,
      ]);
    }

    try {
      /** @type {Promise<import('@aws-sdk/client-location').CalculateRouteCommandOutput>} */
      const result = await locationClient.send(
        new CalculateRouteCommand(commandInput)
      );
      console.log(result);

      this.legs = result.Legs.map((leg) => new RouteLeg(leg));
      // Total distance in kilometers
      this.totalDistance = result.Summary?.Distance;
      this.distanceLeft = this.totalDistance;
      this.distanceCovered = 0;
    } catch (err) {
      this.logger.error(`Error calculating route: ${err}`);
      throw err;
    }
  };

  /**
   * @param {number} updateFrequency
   */
  start = async (updateFrequency) => {
    this.updateFrequency = updateFrequency;
    this.stepDistance = this.getDistanceBetweenUpdates(
      this.totalDistance,
      this.updateFrequency
    );
    this.hasNextStep = true;

    this.publishUpdate(this.legs[0].startPosition);
    while (this.hasNextStep) {
      await this.makeStep();
    }

    this.stop();
  };

  makeStep = async () => {
    if (this.distanceLeft <= this.stepDistance) {
      this.hasNextStep = false;
      this.publishUpdate(this.legs[this.legs.length - 1].endPosition);
      this.logger.warn("Route completed");
      return;
    }

    const leg = this.legs[this.currentLegIdx];
    // There is still some distance left to cover
    if (leg.currentStep + this.stepDistance <= leg.totalDistance) {
      const nextPoint = leg.advance(this.stepDistance);

      this.publishUpdate(nextPoint);
      this.distanceCovered += this.stepDistance;
      this.distanceLeft -= this.stepDistance;
      this.logger.info(
        `Update sent to Iot Core, distance covered: ${this.distanceCovered} - left: ${this.distanceLeft}`
      );
      this.logger.debug({
        routeLegIdx: this.currentLegIdx,
        currentStep: leg.currentStep,
        distanceLeft: this.distanceLeft,
        nextPoint,
      });

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * this.updateFrequency)
      );
    } else {
      // We have reached the end of the current leg
      this.currentLegIdx++;
      if (this.currentLegIdx >= this.legs.length) {
        // We have reached the end of the route
        this.hasNextStep = false;
        this.publishUpdate(this.legs[this.legs.length - 1].endPosition);
        this.logger.warn("Route completed");
        return;
      }
    }
  };

  stop = async () => {
    this.hasNextStep = false;
    this.ioTConnection.disconnect();
    this.logger.info("Disconnected from IoT Core");
  };
}

module.exports = {
  Itinerary,
};

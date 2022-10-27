/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	API_LOCATIONWORKSHOP_ITINERARYTABLE_NAME
	API_LOCATIONWORKSHOP_ITINERARYTABLE_ARN
	API_LOCATIONWORKSHOP_GRAPHQLAPIIDOUTPUT
	ROUTE_CALCULATOR_NAME
Amplify Params - DO NOT EDIT */
const { Itinerary } = require("./utils");
const { Logger } = require("@aws-lambda-powertools/logger");

const logger = new Logger({ serviceName: "aws-intelligent-supply-chain" });

const THING_ENDPOINT = "[some-id]-ats.iot.[region-name].amazonaws.com";
const CLIENT_ID = "trackerThing";
const IOT_TOPIC = "iot/trackedAssets";
const SECRET_ID = "locationworkshop";

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  logger.debug("event", { event });

  const itineraryId = event.id;
  const waypoints = event.waypoints;

  logger.info(`Starting itinerary ${itineraryId}`);
  logger.debug({
    itineraryId,
    waypointsNo: waypoints.length,
  });

  const itinerary = new Itinerary(itineraryId, logger, SECRET_ID);
  await itinerary.connect(CLIENT_ID, THING_ENDPOINT, IOT_TOPIC);
  await itinerary.calculateRoute(waypoints);

  // 5 seconds between each update
  const updateFrequency = 5;
  await itinerary.start(updateFrequency);

  return true;
};

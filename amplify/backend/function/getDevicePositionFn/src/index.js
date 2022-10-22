/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	TRACKER_NAME
Amplify Params - DO NOT EDIT */
const {
  LocationClient,
  GetDevicePositionCommand,
} = require("@aws-sdk/client-location");
const { Logger } = require("@aws-lambda-powertools/logger");

const locationClient = new LocationClient();
const logger = new Logger({ serviceName: "aws-intelligent-supply-chain" });

/**
 * @type {import('@types/aws-lambda').AppSyncResolverHandler}
 */
exports.handler = async (event) => {
  logger.debug("event", { event });

  const itineraryId = event.arguments.id;

  try {
    const { Position: position } = await locationClient.send(
      new GetDevicePositionCommand({
        TrackerName: process.env.TRACKER_NAME,
        DeviceId: itineraryId,
      })
    );

    return [
      {
        lng: position[0],
        lat: position[1],
      },
    ];
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

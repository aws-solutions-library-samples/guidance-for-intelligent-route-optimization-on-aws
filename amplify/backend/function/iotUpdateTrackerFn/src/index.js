/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	TRACKER_NAME
	POWERTOOLS_SERVICE_NAME
Amplify Params - DO NOT EDIT */
const { logger } = require("/opt/powertools");
const {
  LocationClient,
  BatchUpdateDevicePositionCommand,
} = require("@aws-sdk/client-location");

const locationClient = new LocationClient();

/**
 * @type {import('@types/aws-lambda').IoTEvent}
 */
exports.handler = async (event) => {
  logger.debug("event", { event });

  const { payload } = event;
  const updates = [
    {
      DeviceId: payload.deviceId,
      SampleTime: new Date(payload.timestamp),
      Position: payload.location,
    },
  ];

  logger.debug("updates", { updates });

  try {
    await locationClient.send(
      new BatchUpdateDevicePositionCommand({
        TrackerName: process.env.TRACKER_NAME,
        Updates: updates,
      })
    );

    logger.info("Successfully updated device position");
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

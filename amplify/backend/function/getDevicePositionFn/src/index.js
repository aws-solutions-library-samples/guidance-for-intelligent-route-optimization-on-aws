/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	TRACKER_NAME
	POWERTOOLS_SERVICE_NAME
Amplify Params - DO NOT EDIT */
const { logger } = require("/opt/powertools");
const {
  LocationClient,
  GetDevicePositionCommand,
  GetDevicePositionHistoryCommand,
} = require("@aws-sdk/client-location");

const locationClient = new LocationClient();

/**
 * @type {import('@types/aws-lambda').AppSyncResolverHandler}
 */
exports.handler = async (event) => {
  logger.debug("event", { event });

  const itineraryId = event.arguments.id;
  const history = event.arguments.history;

  try {
    if (history) {
      const input = {
        TrackerName: process.env.TRACKER_NAME,
        DeviceId: itineraryId,
      };
      let nextToken = "-1";
      let devicePositions = [];
      while (nextToken) {
        if (nextToken !== "-1") {
          input.NextToken = nextToken;
        }
        const { DevicePositions, NextToken } = await locationClient.send(
          new GetDevicePositionHistoryCommand(input)
        );
        devicePositions = devicePositions.concat(
          DevicePositions.map((position) => ({
            lng: position.Position[0],
            lat: position.Position[1],
          }))
        );
        nextToken = NextToken;
      }

      return devicePositions;
    }

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
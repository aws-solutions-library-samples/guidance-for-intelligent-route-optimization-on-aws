/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	FUNCTION_DEVICESIMULATORFN_NAME
	API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_NAME
	API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_ARN
	API_AWSSUPPLYCHAINDEMO_GRAPHQLAPIIDOUTPUT
	POWERTOOLS_SERVICE_NAME
Amplify Params - DO NOT EDIT */
const { logger } = require("/opt/powertools");
const {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
// TODO: see if we can use msgpack
// const { encode } = require("@msgpack/msgpack");

class ItineraryAlreadyStarted extends Error {
  constructor(message) {
    super(message);
    this.name = "ItineraryAlreadyStarted";
  }
}

class ItineraryNotOptimizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "ItineraryNotOptimizedError";
  }
}

const dynamoDBClient = new DynamoDBClient();
const lambdaClient = new LambdaClient();

/**
 * @type {import('@types/aws-lambda').AppSyncResolverHandler}
 */
exports.handler = async (event) => {
  logger.debug("event", { event });

  const itineraryId = event.arguments.id;

  let waypoints = [];
  try {
    const { Item: itinerary } = await dynamoDBClient.send(
      new GetItemCommand({
        TableName: process.env.API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_NAME,
        Key: marshall({
          id: itineraryId,
        }),
        ProjectionExpression: "points,optimized,hasStarted",
      })
    );
    const { points, optimized, hasStarted } = unmarshall(itinerary);

    if (!optimized) {
      throw new ItineraryNotOptimizedError("Itinerary is not optimized");
    }

    if (hasStarted) {
      throw new ItineraryAlreadyStarted("Itinerary has already started");
    }

    waypoints = points.map((point) => ({
      lng: point.point.lng,
      lat: point.point.lat,
    }));
  } catch (err) {
    if (err instanceof ItineraryNotOptimizedError) {
      logger.error(`Itinerary ${itineraryId} is not optimized`);
      return {
        statusCode: 400,
        body: "Itinerary is not optimized",
      };
    } else if (err instanceof ItineraryAlreadyStarted) {
      logger.error(`Itinerary ${itineraryId} has already started`);
      return {
        statusCode: 400,
        body: "Itinerary has already started",
      };
    }

    logger.error(`Error getting itinerary: ${err}`);
    return {
      statusCode: 500,
      body: "Error getting itinerary",
    };
  }

  // const encodedWaypoints = encode(waypoints);
  logger.debug("payload", {
    id: itineraryId,
    waypoints: waypoints,
  });

  try {
    // TODO: see if we should use InvokeAsyncCommand instead
    await lambdaClient.send(
      new InvokeCommand({
        FunctionName: process.env.FUNCTION_DEVICESIMULATORFN_NAME,
        Payload: JSON.stringify({
          id: itineraryId,
          waypoints: waypoints,
        }),
        InvocationType: "Event",
      })
    );
    logger.info("Simulation started");
  } catch (err) {
    logger.error(`Error starting simulation: ${err}`);
    return {
      statusCode: 500,
      body: "Error starting itinerary",
    };
  }

  try {
    await dynamoDBClient.send(
      new UpdateItemCommand({
        TableName: process.env.API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_NAME,
        Key: marshall({
          id: itineraryId,
        }),
        UpdateExpression: "set hasStarted = :hasStarted",
        ExpressionAttributeValues: marshall({
          ":hasStarted": true,
        }),
        ReturnValues: "NONE",
      })
    );
  } catch (err) {
    logger.error(`Error updating itinerary: ${err}`);
    return {
      statusCode: 500,
      body: "Error updating itinerary",
    };
  }

  logger.info("Itinerary set as started");

  return true;
};

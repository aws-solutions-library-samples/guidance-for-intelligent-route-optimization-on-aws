/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	API_LOCATIONWORKSHOP_ITINERARYTABLE_NAME
	API_LOCATIONWORKSHOP_ITINERARYTABLE_ARN
	API_LOCATIONWORKSHOP_GRAPHQLAPIIDOUTPUT
	ROUTE_CALCULATOR_NAME
Amplify Params - DO NOT EDIT */

const {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const {
  LocationClient,
  CalculateRouteMatrixCommand,
} = require("@aws-sdk/client-location");
const { Logger } = require("@aws-lambda-powertools/logger");

const dynamoDBClient = new DynamoDBClient();
const locationClient = new LocationClient();
const logger = new Logger({ serviceName: "aws-intelligent-supply-chain" });

class ItineraryAlreadyStarted extends Error {
  constructor(message) {
    super(message);
    this.name = "ItineraryAlreadyStarted";
  }
}

class ItineraryAlreadyOptimizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "ItineraryAlreadyOptimizedError";
  }
}

class ItineraryTooShortError extends Error {
  constructor(message) {
    super(message);
    this.name = "ItineraryTooShortError";
  }
}

/**
 * @type {import('@types/aws-lambda').AppSyncResolverHandler}
 */
exports.handler = async (event) => {
  logger.debug("event", { event });

  const itineraryId = event.arguments.id;
  let waypoints = [];
  let markers;
  try {
    const { Item: itinerary } = await dynamoDBClient.send(
      new GetItemCommand({
        TableName: process.env.API_LOCATIONWORKSHOP_ITINERARYTABLE_NAME,
        Key: marshall({
          id: itineraryId,
        }),
        ProjectionExpression: "points,optimized,hasStarted",
      })
    );
    const { points, optimized, hasStarted } = unmarshall(itinerary);

    if (optimized) {
      throw new ItineraryAlreadyOptimizedError(
        "Itinerary is already optimized"
      );
    }

    if (hasStarted) {
      throw new ItineraryAlreadyStarted("Itinerary has already started");
    }

    if (points.length < 3) {
      throw new ItineraryTooShortError("Itinerary is too short");
    }

    waypoints = points.map((point) => [point.point.lng, point.point.lat]);
    markers = points;
  } catch (err) {
    if (err instanceof ItineraryAlreadyOptimizedError) {
      logger.error(`Itinerary ${itineraryId} has already been optimized`);
      return {
        statusCode: 400,
        body: "Itinerary has already been optimized",
      };
    } else if (err instanceof ItineraryAlreadyStarted) {
      logger.error(`Itinerary ${itineraryId} has already started`);
      return {
        statusCode: 400,
        body: "Itinerary has already started",
      };
    } else if (err instanceof ItineraryTooShortError) {
      logger.error(`Itinerary ${itineraryId} has less than 3 points`);
      return {
        statusCode: 400,
        body: "Itinerary has less than 3 points",
      };
    }
    logger.error(`Error getting itinerary: ${err}`);
    return {
      statusCode: 500,
      body: "Error getting itinerary",
    };
  }

  logger.debug("payload", {
    id: itineraryId,
    waypoints: waypoints,
  });

  let routeMatrix;
  try {
    const { RouteMatrix } = await locationClient.send(
      new CalculateRouteMatrixCommand({
        CalculatorName: process.env.ROUTE_CALCULATOR_NAME,
        DeparturePositions: waypoints,
        DestinationPositions: waypoints,
      })
    );

    routeMatrix = RouteMatrix;
  } catch (err) {
    logger.error(`Error calculating route matrix: ${err}`);
    return {
      statusCode: 500,
      body: "Error calculating route matrix",
    };
  }

  // Departure city starts from 0; next departure city is determined based on sort results for shortest time
  // Implement Djikstra's algorithm - O(nlogn)
  const optimizedMarkers = [];
  const visitedIdx = new Set();
  let current = 0;
  while (optimizedMarkers.length < markers.length) {
    optimizedMarkers.push(markers[current]);
    visitedIdx.add(current);
    let closest = Infinity;
    let closestIdx = -1;
    routeMatrix[current].forEach(({ DurationSeconds }, idx) => {
      if (visitedIdx.has(idx)) {
        return;
      }
      if (DurationSeconds < closest) {
        closestIdx = idx;
        closest = DurationSeconds;
      }
    });
    current = closestIdx;
  }

  try {
    const { Attributes: updatedItinerary } = await dynamoDBClient.send(
      new UpdateItemCommand({
        TableName: process.env.API_LOCATIONWORKSHOP_ITINERARYTABLE_NAME,
        Key: marshall({
          id: itineraryId,
        }),
        UpdateExpression:
          "set optimized = :optimized, points = :points, updatedAt = :updatedAt",
        ExpressionAttributeValues: marshall({
          ":points": optimizedMarkers,
          ":optimized": true,
          ":updatedAt": new Date().toISOString(),
        }),
        ReturnValues: "ALL_NEW",
      })
    );

    return unmarshall(updatedItinerary);
  } catch (err) {
    logger.error(`Error updating itinerary: ${err}`);
    return {
      statusCode: 500,
      body: "Error updating itinerary",
    };
  }
};

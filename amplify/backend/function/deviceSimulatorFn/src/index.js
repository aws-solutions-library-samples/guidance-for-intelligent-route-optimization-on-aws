/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_NAME
	API_AWSSUPPLYCHAINDEMO_ITINERARYTABLE_ARN
	API_AWSSUPPLYCHAINDEMO_GRAPHQLAPIIDOUTPUT
	ROUTE_CALCULATOR_NAME
Amplify Params - DO NOT EDIT */
// const { Decoder } = require("@msgpack/msgpack");
const { logger } = require("/opt/powertools");
const { Itinerary } = require("./utils");

const THING_ENDPOINT = "[some-id]-ats.iot.[region-name].amazonaws.com";
const CLIENT_ID = "trackerThing";
const IOT_TOPIC = "iot/trackedAssets";

// const decoder = new Decoder();

exports.handler = async (event) => {
  logger.debug("event", { event });

  const itineraryId = event.id;
  // TODO: see if we can use msgpack
  /* const encodedWaypoints = event.waypoints;
  const waypoints = decode(encodedWaypoints); */
  const waypoints = event.waypoints;

  logger.info(`Starting itinerary ${itineraryId}`);
  logger.debug({
    itineraryId,
    waypointsNo: waypoints.length,
  });

  const itinerary = new Itinerary(itineraryId);
  await itinerary.connect(CLIENT_ID, THING_ENDPOINT, IOT_TOPIC);
  await itinerary.calculateRoute(waypoints);

  // 5 seconds between each update
  const updateFrequency = 5;
  await itinerary.start(updateFrequency);

  return true;
};

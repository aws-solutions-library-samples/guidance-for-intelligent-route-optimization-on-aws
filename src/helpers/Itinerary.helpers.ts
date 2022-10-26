import { Hub, Logger } from "aws-amplify";
import { API, GraphQLResult, graphqlOperation } from "@aws-amplify/api";
import { Auth } from "@aws-amplify/auth";
import {
  AmazonLocationServiceMapStyle,
  Geo,
  Place,
  Coordinates,
} from "@aws-amplify/geo";
import {
  CalculateRouteCommand,
  CalculateRouteCommandInput,
  LocationClient,
} from "@aws-sdk/client-location";
import { featureCollection, lineString, point } from "@turf/helpers";
import combine from "@turf/combine";
import bbox from "@turf/bbox";
import { Position, FeatureCollection, Properties, BBox } from "@turf/helpers";
import { ICredentials } from "@aws-amplify/core";

import {
  getItinerary as getItineraryQ,
  itinerariesByDate,
  getDevicePosition as getDevicePositionQ,
} from "../graphql/queries";
import {
  createItinerary,
  deleteItinerary as deleteItineraryM,
  updateItinerary as updateItineraryM,
  optimized as optimizedM,
  startItinerary as startItineraryM,
} from "../graphql/mutations";
import { Itinerary, Marker } from "../models";
import {
  CreateItineraryMutation,
  DeleteItineraryMutation,
  GetItineraryQuery,
  UpdateItineraryMutation,
  UpdateItineraryMutationVariables,
  OptimizedMutation,
  ItinerariesByDateQuery,
  ItinerariesByDateQueryVariables,
  ModelSortDirection,
  StartItineraryMutation,
  GetDevicePositionQuery,
} from "../API";

const logger = new Logger(
  "Itinerary.helpers",
  process.env.NODE_ENV === "production" ? "INFO" : "DEBUG"
);

type MarkerPoint = {
  lng: number;
  lat: number;
};

type MarkerItem = {
  point: MarkerPoint;
  label: string;
};

const buildPlace = (place: Place) => {
  const placeCoords = place?.geometry?.point;
  const placeLabel = place?.label;
  if (!placeCoords || !placeLabel) throw new Error("No place found");
  const point: MarkerPoint = { lng: placeCoords[0], lat: placeCoords[1] };
  return { point, label: placeLabel };
};

const addMarker = async (
  coords: Coordinates,
  label?: string
): Promise<MarkerItem> => {
  if (!label) {
    const res = await Geo.searchByCoordinates(coords);
    return buildPlace(res);
  } else {
    return { point: { lng: coords[0], lat: coords[1] }, label };
  }
};

const getSuggestions = async (text: string, biasPosition: Coordinates) => {
  if (text.trim() === "") return [];
  const res = await Geo.searchByText(text, {
    maxResults: 5,
    biasPosition: biasPosition,
  });

  return res;
};

const getItineraries = async (future: boolean, nextToken?: string) => {
  // Default limit of items to return
  const limit = 2;

  const load = async (
    future: boolean,
    limit: number,
    full: boolean = true,
    nextToken?: string
  ) => {
    const variables: ItinerariesByDateQueryVariables = {
      limit: limit,
      date: {
        [future ? "ge" : "lt"]: new Date().toISOString().split("T")[0],
      },
      type: "itinerary",
      sortDirection: ModelSortDirection.ASC,
    };

    let itineraries: Itinerary[] = [];
    let isFirstQuery = true;
    let nextPageNextToken: string | null | undefined = nextToken;

    while ((nextPageNextToken || isFirstQuery) && itineraries.length < limit) {
      isFirstQuery = false;

      const currentVars: ItinerariesByDateQueryVariables = {
        ...variables,
      };
      if (nextPageNextToken && nextPageNextToken !== "-1")
        currentVars.nextToken = nextPageNextToken;
      const op = graphqlOperation(itinerariesByDate, currentVars);
      const res = (await API.graphql(
        op
      )) as GraphQLResult<ItinerariesByDateQuery>;

      if (
        !res.data ||
        !res.data.hasOwnProperty("itinerariesByDate") ||
        !res.data.itinerariesByDate?.hasOwnProperty("items") ||
        !res.data.itinerariesByDate?.hasOwnProperty("nextToken")
      ) {
        throw new Error("Unable to load itineraries");
      }

      itineraries = itineraries.concat([
        ...(res.data?.itinerariesByDate.items as Itinerary[]),
      ]);
      nextPageNextToken = res.data?.itinerariesByDate.nextToken;

      if (!full) {
        break;
      }
    }

    return {
      items: itineraries,
      nextToken: nextPageNextToken,
    } as {
      items: Itinerary[];
      nextToken?: string;
    };
  };

  try {
    const { items, nextToken: newNextToken } = await load(
      future,
      limit,
      true,
      nextToken
    );

    let potentialNextPage: boolean = false;
    if (items.length === limit && newNextToken) {
      const { items } = await load(future, 1, false, newNextToken);
      potentialNextPage = items.length > 0;
    }

    return {
      itineraries: items,
      nextToken: potentialNextPage ? newNextToken : undefined,
    };
  } catch (err) {
    logger.error(err);
    console.log(err);
    Hub.dispatch("errors", {
      event: "getItineraries",
      data: "Error loading itineraries",
    });
    throw err;
  }
};

const deleteItinerary = async (id: string) => {
  try {
    const op = graphqlOperation(deleteItineraryM, { input: { id: id } });
    return (await API.graphql(op)) as GraphQLResult<DeleteItineraryMutation>;
  } catch (err) {
    logger.error(err);
    Hub.dispatch("errors", {
      event: "deleteItinerary",
      data: "Error deleting itinerary",
    });
  }
};

const saveItinerary = async (label: string, date: string) => {
  try {
    const res = (await API.graphql(
      graphqlOperation(createItinerary, {
        input: {
          label,
          date,
          optimized: false,
          points: [],
          type: "itinerary",
          hasStarted: false,
        },
      })
    )) as GraphQLResult<CreateItineraryMutation>;

    const newItinerary = res.data?.createItinerary;

    return newItinerary as Itinerary;
  } catch (err) {
    logger.error(err);
    Hub.dispatch("errors", {
      event: "saveItinerary",
      data: "Error saving itinerary",
    });
  }
};

class ItineraryNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItineraryNotFoundError";
  }
}

const getItinerary = async (id: string): Promise<Itinerary | undefined> => {
  try {
    const op = graphqlOperation(getItineraryQ, { id: id });
    const res = (await API.graphql(op)) as GraphQLResult<GetItineraryQuery>;

    const itinerary = res.data?.getItinerary;
    if (!itinerary) {
      throw new ItineraryNotFoundError(
        'Unable to find itinerary with id "' + id + '"'
      );
    }

    return itinerary;
  } catch (err) {
    logger.error(err);
    Hub.dispatch("errors", {
      event: "getItinerary",
      data:
        err instanceof ItineraryNotFoundError
          ? err.message
          : "Error loading itinerary",
    });
  }
};

const updateItinerary = async (
  id: string,
  {
    label,
    date,
    points,
  }: {
    label?: string;
    date?: string;
    points?: Marker[];
  }
) => {
  try {
    if (!label && !date && !points) return;
    const variables: UpdateItineraryMutationVariables = {
      input: {
        id: id,
      },
    };
    if (label) variables.input.label = label;
    if (date) variables.input.date = date;
    if (points) variables.input.points = points;
    if (points) variables.input.optimized = false;
    const op = graphqlOperation(updateItineraryM, variables);
    const res = (await API.graphql(
      op
    )) as GraphQLResult<UpdateItineraryMutation>;

    return res.data?.updateItinerary;
  } catch (err) {
    logger.error(err);
    Hub.dispatch("errors", {
      event: "updateItinerary",
      data: "Error updating itinerary",
    });
  }
};

const calculateMarkersHash = (markers: Marker[]) =>
  markers.reduce(function (acc, obj) {
    return acc + (obj.point.lng + obj.point.lat);
  }, 0);

const optimizeItinerary = async (id: string) => {
  try {
    const op = graphqlOperation(optimizedM, {
      id: id,
    });

    const res = (await API.graphql(op)) as GraphQLResult<OptimizedMutation>;

    const optimizedItinerary = res.data?.optimized;
    if (!optimizedItinerary) {
      throw new Error("Unable to optimize itinerary");
    }

    return optimizedItinerary;
  } catch (err) {
    logger.error(err);
    Hub.dispatch("errors", {
      event: "optimizeItinerary",
      data: "Error optimizing itinerary",
    });
  }
};

let cachedCredentials: ICredentials;
const getCredentials = async () => {
  if (!cachedCredentials || cachedCredentials.expiration === undefined) {
    cachedCredentials = await Auth.currentCredentials();
    return cachedCredentials;
  }
  // If credentials are expired or about to expire, refresh them
  if ((cachedCredentials.expiration.getTime() - Date.now()) / 1000 < 60) {
    cachedCredentials = await Auth.currentCredentials();
    return cachedCredentials;
  }

  return cachedCredentials;
};

let client: LocationClient;
const getLocationClient = async () => {
  const credentials = await getCredentials();
  if (!client || credentials.accessKeyId !== cachedCredentials.accessKeyId) {
    client = new LocationClient({
      credentials,
      region: (Geo.getDefaultMap() as AmazonLocationServiceMapStyle).region,
    });

    return client;
  }

  return client;
};

const commandInput: Partial<CalculateRouteCommandInput> = {
  CalculatorName: "routecalculator_location_workshop",
  TravelMode: "Car",
  IncludeLegGeometry: true,
};

export type RoutePath = FeatureCollection<
  {
    type: "MultiLineString";
    coordinates: number[][] | number[][][] | number[][][][];
  },
  {
    collectedProperties: Properties[];
  }
>;

export type RoutePathResult = {
  distance: number;
  duration: number;
  route: RoutePath;
  bbox: BBox;
};

const getRoutePath = async (markers: Marker[]): Promise<RoutePathResult> => {
  const client = await getLocationClient();

  const departureMarker = markers[0];
  commandInput.DeparturePosition = [
    departureMarker.point.lng,
    departureMarker.point.lat,
  ];
  const destinationMarker = markers[markers.length - 1];
  commandInput.DestinationPosition = [
    destinationMarker.point.lng,
    destinationMarker.point.lat,
  ];

  if (markers.length > 2) {
    const waypoints = markers.slice(1, -1);
    commandInput.WaypointPositions = waypoints.map(
      ({ point: { lng, lat } }) => [lng, lat]
    );
  }

  const result = await client.send(
    new CalculateRouteCommand(commandInput as CalculateRouteCommandInput)
  );

  const distance = result.Summary?.Distance || 0;
  const duration = result.Summary?.DurationSeconds || 0;

  if (!result.Legs)
    throw new Error("Unable to load intinerary geometry for legs");

  const routeFeatureCollection = featureCollection([
    ...result.Legs.map((leg) => {
      return lineString(leg.Geometry?.LineString as Position[]);
    }),
  ]);

  const combineFeauterCollection = combine(routeFeatureCollection);

  return {
    distance,
    duration,
    route: combineFeauterCollection as RoutePath,
    bbox: bbox(combineFeauterCollection),
  };
};

const getMarkersBbox = (markers: Marker[]) => {
  const points = markers.map((marker) =>
    point([marker.point.lng, marker.point.lat])
  );
  return bbox(featureCollection(points));
};

const startItinerary = async (id: string) => {
  try {
    const op = graphqlOperation(startItineraryM, {
      id: id,
    });

    const res = (await API.graphql(
      op
    )) as GraphQLResult<StartItineraryMutation>;

    const hasStarted = res.data?.startItinerary;
    if (!hasStarted) {
      throw new Error("Unable to optimize itinerary");
    }

    return;
  } catch (err) {
    logger.error(err);
    Hub.dispatch("errors", {
      event: "startItinerary",
      data: "Error starting the itinerary",
    });
  }
};

const trackItinerary = async (id: string) => {
  try {
    const op = graphqlOperation(getDevicePositionQ, {
      id,
    });

    const res = (await API.graphql(
      op
    )) as GraphQLResult<GetDevicePositionQuery>;

    return res.data?.getDevicePosition;
  } catch (err) {
    logger.error(err);
    Hub.dispatch("errors", {
      event: "trackItinerary",
      data: "Error tracking the itinerary",
    });
  }
};

export {
  addMarker,
  buildPlace,
  getSuggestions,
  getItineraries,
  deleteItinerary,
  saveItinerary,
  getItinerary,
  updateItinerary,
  calculateMarkersHash,
  optimizeItinerary,
  getRoutePath,
  getMarkersBbox,
  startItinerary,
  trackItinerary,
};

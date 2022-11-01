// @ts-nocheck
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
  // TODO: ✏️ implement addMarker function here
};

const getSuggestions = async (text: string, biasPosition: Coordinates) => {
  // TODO: ✏️ implement getSuggestions function here
};

const getItineraries = async (
  future: boolean,
  nextToken?: string
): Promise<{
  itineraries: Itinerary[];
  nextToken: string | undefined;
}> => {
  // TODO: ✏️ Add getItineraries code here
};

const deleteItinerary = async (id: string): Promise<any> => {
  // TODO: ✏️ Add deleteItinerary code here
};

const saveItinerary = async (
  label: string,
  date: string
): Promise<Itinerary | undefined> => {
  // TODO: ✏️ Add saveItinerary code here
};

class ItineraryNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItineraryNotFoundError";
  }
}

const getItinerary = async (id: string): Promise<Itinerary | undefined> => {
  // TODO: ✏️ Add getItinerary code here
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
): Promise<any> => {
  // TODO: ✏️ Add updateItinerary code here
};

const calculateMarkersHash = (markers: Marker[]) =>
  markers.reduce(function (acc, obj) {
    return acc + (obj.point.lng + obj.point.lat);
  }, 0);

const optimizeItinerary = async (id: string): Promise<any> => {
  // TODO: ✏️ Add optimizeItinerary code here
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
  // TODO: ✏️ Add getRoutePath code here
};

const getMarkersBbox = (markers: Marker[]) => {
  const points = markers.map((marker) =>
    point([marker.point.lng, marker.point.lat])
  );
  return bbox(featureCollection(points));
};

const startItinerary = async (id: string) => {
  // TODO: ✏️ Add startItinerary code here
};

const trackItinerary = async (id: string) => {
  // TODO: ✏️ Add trackItinerary code here
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

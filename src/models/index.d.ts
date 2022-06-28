import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";



export declare class Coords {
  readonly lng: number;
  readonly lat: number;
  constructor(init: ModelInit<Coords>);
}

export declare class Marker {
  readonly point: Coords;
  readonly label?: string | null;
  constructor(init: ModelInit<Marker>);
}

type ItineraryMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Itinerary {
  readonly id: string;
  readonly label: string;
  readonly points: (Marker | null)[];
  readonly date: string;
  readonly optimized: boolean;
  readonly hasStarted: boolean;
  readonly type: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Itinerary, ItineraryMetaData>);
  static copyOf(source: Itinerary, mutator: (draft: MutableModel<Itinerary, ItineraryMetaData>) => MutableModel<Itinerary, ItineraryMetaData> | void): Itinerary;
}
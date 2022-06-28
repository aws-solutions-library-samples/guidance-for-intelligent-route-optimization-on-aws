/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Itinerary = {
  __typename: "Itinerary",
  id: string,
  label: string,
  points:  Array<Marker | null >,
  date: string,
  optimized: boolean,
  hasStarted: boolean,
  type: string,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type Marker = {
  __typename: "Marker",
  point: Coords,
  label?: string | null,
};

export type Coords = {
  __typename: "Coords",
  lng: number,
  lat: number,
};

export type CreateItineraryInput = {
  id?: string | null,
  label: string,
  points: Array< MarkerInput | null >,
  date: string,
  optimized: boolean,
  hasStarted: boolean,
  type: string,
};

export type MarkerInput = {
  point: CoordsInput,
  label?: string | null,
};

export type CoordsInput = {
  lng: number,
  lat: number,
};

export type ModelItineraryConditionInput = {
  label?: ModelStringInput | null,
  date?: ModelStringInput | null,
  optimized?: ModelBooleanInput | null,
  hasStarted?: ModelBooleanInput | null,
  type?: ModelStringInput | null,
  and?: Array< ModelItineraryConditionInput | null > | null,
  or?: Array< ModelItineraryConditionInput | null > | null,
  not?: ModelItineraryConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type UpdateItineraryInput = {
  id: string,
  label?: string | null,
  points?: Array< MarkerInput | null > | null,
  date?: string | null,
  optimized?: boolean | null,
  hasStarted?: boolean | null,
  type?: string | null,
};

export type DeleteItineraryInput = {
  id: string,
};

export type ModelItineraryFilterInput = {
  id?: ModelIDInput | null,
  label?: ModelStringInput | null,
  date?: ModelStringInput | null,
  optimized?: ModelBooleanInput | null,
  hasStarted?: ModelBooleanInput | null,
  type?: ModelStringInput | null,
  and?: Array< ModelItineraryFilterInput | null > | null,
  or?: Array< ModelItineraryFilterInput | null > | null,
  not?: ModelItineraryFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelItineraryConnection = {
  __typename: "ModelItineraryConnection",
  items:  Array<Itinerary | null >,
  nextToken?: string | null,
};

export type ModelStringKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type OptimizedMutationVariables = {
  id?: string | null,
};

export type OptimizedMutation = {
  optimized?:  {
    __typename: "Itinerary",
    id: string,
    label: string,
    points:  Array< {
      __typename: "Marker",
      point:  {
        __typename: "Coords",
        lng: number,
        lat: number,
      },
      label?: string | null,
    } | null >,
    date: string,
    optimized: boolean,
    hasStarted: boolean,
    type: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type StartItineraryMutationVariables = {
  id?: string | null,
};

export type StartItineraryMutation = {
  startItinerary?: boolean | null,
};

export type CreateItineraryMutationVariables = {
  input: CreateItineraryInput,
  condition?: ModelItineraryConditionInput | null,
};

export type CreateItineraryMutation = {
  createItinerary?:  {
    __typename: "Itinerary",
    id: string,
    label: string,
    points:  Array< {
      __typename: "Marker",
      point:  {
        __typename: "Coords",
        lng: number,
        lat: number,
      },
      label?: string | null,
    } | null >,
    date: string,
    optimized: boolean,
    hasStarted: boolean,
    type: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateItineraryMutationVariables = {
  input: UpdateItineraryInput,
  condition?: ModelItineraryConditionInput | null,
};

export type UpdateItineraryMutation = {
  updateItinerary?:  {
    __typename: "Itinerary",
    id: string,
    label: string,
    points:  Array< {
      __typename: "Marker",
      point:  {
        __typename: "Coords",
        lng: number,
        lat: number,
      },
      label?: string | null,
    } | null >,
    date: string,
    optimized: boolean,
    hasStarted: boolean,
    type: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteItineraryMutationVariables = {
  input: DeleteItineraryInput,
  condition?: ModelItineraryConditionInput | null,
};

export type DeleteItineraryMutation = {
  deleteItinerary?:  {
    __typename: "Itinerary",
    id: string,
    label: string,
    points:  Array< {
      __typename: "Marker",
      point:  {
        __typename: "Coords",
        lng: number,
        lat: number,
      },
      label?: string | null,
    } | null >,
    date: string,
    optimized: boolean,
    hasStarted: boolean,
    type: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetDevicePositionQueryVariables = {
  id: string,
  history?: boolean | null,
};

export type GetDevicePositionQuery = {
  getDevicePosition?:  Array< {
    __typename: "Coords",
    lng: number,
    lat: number,
  } | null > | null,
};

export type GetItineraryQueryVariables = {
  id: string,
};

export type GetItineraryQuery = {
  getItinerary?:  {
    __typename: "Itinerary",
    id: string,
    label: string,
    points:  Array< {
      __typename: "Marker",
      point:  {
        __typename: "Coords",
        lng: number,
        lat: number,
      },
      label?: string | null,
    } | null >,
    date: string,
    optimized: boolean,
    hasStarted: boolean,
    type: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListItinerariesQueryVariables = {
  filter?: ModelItineraryFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListItinerariesQuery = {
  listItineraries?:  {
    __typename: "ModelItineraryConnection",
    items:  Array< {
      __typename: "Itinerary",
      id: string,
      label: string,
      points:  Array< {
        __typename: "Marker",
        label?: string | null,
      } | null >,
      date: string,
      optimized: boolean,
      hasStarted: boolean,
      type: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ItinerariesByDateQueryVariables = {
  type: string,
  date?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelItineraryFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ItinerariesByDateQuery = {
  itinerariesByDate?:  {
    __typename: "ModelItineraryConnection",
    items:  Array< {
      __typename: "Itinerary",
      id: string,
      label: string,
      points:  Array< {
        __typename: "Marker",
        label?: string | null,
      } | null >,
      date: string,
      optimized: boolean,
      hasStarted: boolean,
      type: string,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateItinerarySubscriptionVariables = {
  owner?: string | null,
};

export type OnCreateItinerarySubscription = {
  onCreateItinerary?:  {
    __typename: "Itinerary",
    id: string,
    label: string,
    points:  Array< {
      __typename: "Marker",
      point:  {
        __typename: "Coords",
        lng: number,
        lat: number,
      },
      label?: string | null,
    } | null >,
    date: string,
    optimized: boolean,
    hasStarted: boolean,
    type: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateItinerarySubscriptionVariables = {
  owner?: string | null,
};

export type OnUpdateItinerarySubscription = {
  onUpdateItinerary?:  {
    __typename: "Itinerary",
    id: string,
    label: string,
    points:  Array< {
      __typename: "Marker",
      point:  {
        __typename: "Coords",
        lng: number,
        lat: number,
      },
      label?: string | null,
    } | null >,
    date: string,
    optimized: boolean,
    hasStarted: boolean,
    type: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteItinerarySubscriptionVariables = {
  owner?: string | null,
};

export type OnDeleteItinerarySubscription = {
  onDeleteItinerary?:  {
    __typename: "Itinerary",
    id: string,
    label: string,
    points:  Array< {
      __typename: "Marker",
      point:  {
        __typename: "Coords",
        lng: number,
        lat: number,
      },
      label?: string | null,
    } | null >,
    date: string,
    optimized: boolean,
    hasStarted: boolean,
    type: string,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

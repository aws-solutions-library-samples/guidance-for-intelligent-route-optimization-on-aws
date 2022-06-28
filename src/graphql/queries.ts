/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDevicePosition = /* GraphQL */ `
  query GetDevicePosition($id: ID!, $history: Boolean) {
    getDevicePosition(id: $id, history: $history) {
      lng
      lat
    }
  }
`;
export const getItinerary = /* GraphQL */ `
  query GetItinerary($id: ID!) {
    getItinerary(id: $id) {
      id
      label
      points {
        point {
          lng
          lat
        }
        label
      }
      date
      optimized
      hasStarted
      type
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listItineraries = /* GraphQL */ `
  query ListItineraries(
    $filter: ModelItineraryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listItineraries(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        label
        points {
          label
        }
        date
        optimized
        hasStarted
        type
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const itinerariesByDate = /* GraphQL */ `
  query ItinerariesByDate(
    $type: String!
    $date: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelItineraryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itinerariesByDate(
      type: $type
      date: $date
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        label
        points {
          label
        }
        date
        optimized
        hasStarted
        type
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

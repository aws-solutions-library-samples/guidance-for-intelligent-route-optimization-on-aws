/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const optimized = /* GraphQL */ `
  mutation Optimized($id: ID) {
    optimized(id: $id) {
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
export const startItinerary = /* GraphQL */ `
  mutation StartItinerary($id: ID) {
    startItinerary(id: $id)
  }
`;
export const createItinerary = /* GraphQL */ `
  mutation CreateItinerary(
    $input: CreateItineraryInput!
    $condition: ModelItineraryConditionInput
  ) {
    createItinerary(input: $input, condition: $condition) {
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
export const updateItinerary = /* GraphQL */ `
  mutation UpdateItinerary(
    $input: UpdateItineraryInput!
    $condition: ModelItineraryConditionInput
  ) {
    updateItinerary(input: $input, condition: $condition) {
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
export const deleteItinerary = /* GraphQL */ `
  mutation DeleteItinerary(
    $input: DeleteItineraryInput!
    $condition: ModelItineraryConditionInput
  ) {
    deleteItinerary(input: $input, condition: $condition) {
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

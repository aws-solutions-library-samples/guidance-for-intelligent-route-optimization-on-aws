/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateItinerary = /* GraphQL */ `
  subscription OnCreateItinerary($owner: String) {
    onCreateItinerary(owner: $owner) {
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
export const onUpdateItinerary = /* GraphQL */ `
  subscription OnUpdateItinerary($owner: String) {
    onUpdateItinerary(owner: $owner) {
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
export const onDeleteItinerary = /* GraphQL */ `
  subscription OnDeleteItinerary($owner: String) {
    onDeleteItinerary(owner: $owner) {
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

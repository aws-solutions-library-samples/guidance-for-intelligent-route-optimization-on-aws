// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Itinerary, Coords, Marker } = initSchema(schema);

export {
  Itinerary,
  Coords,
  Marker
};
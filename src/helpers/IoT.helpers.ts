import { getItinerary } from './Itinerary.helpers';

type SimulateProps = {
  itineraryId: string;
}

const simulate = (options: SimulateProps) => {
  if (!options.itineraryId) {
    throw new Error('itineraryId is required');
  }

  const itinerary = getItinerary(options.itineraryId);

  console.log(itinerary);
}

export { simulate };
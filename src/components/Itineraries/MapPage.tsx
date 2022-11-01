import React from "react";
// @ts-ignore
import { useInterpret } from "@xstate/react";

import { mapMachine, MapContext } from "../Map";
import Map from "../Map/Map";

type MapPageProps = {
  children?: React.ReactNode;
};

const MapPage: React.FC<MapPageProps> = () => {
  const mapService = useInterpret(mapMachine);

  return (
    <MapContext.Provider value={mapService}>
      <Map />
    </MapContext.Provider>
  );
};

export default MapPage;

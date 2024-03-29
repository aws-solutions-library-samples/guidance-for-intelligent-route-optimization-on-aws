import React, { useContext, useEffect } from "react";
import { useSelector } from "@xstate/react";
import { useParams } from "react-router-dom";
import { MapView } from "@aws-amplify/ui-react-geo";
import { Logger } from "@aws-amplify/core";
import { NavigationControl } from "react-map-gl";
import { MapLayerMouseEvent } from "react-map-gl";

import { MapContext, ItineraryDate } from "../Map";
import RoutingMenu from "../RoutingMenu";
import DeviceMarker from "./DeviceMarker";
import MarkersControl from "./MarkersControl";
import RouteControl from "./RouteControl";

const logger = new Logger(
  "Map",
  process.env.NODE_ENV === "production" ? "INFO" : "DEBUG"
);

type MapProps = {
  children?: React.ReactNode;
};

const Map: React.FC<MapProps> = () => {
  const service = useContext(MapContext);
  const viewState = useSelector(
    service,
    (state: any) => state?.context?.viewState
  );
  const itineraryDate: ItineraryDate = useSelector(
    service,
    (state: any) => state?.context?.itineraryDate
  );

  const params = useParams();

  useEffect(() => {
    const loadData = async (id: string) => {
      logger.debug("Loading data for", id);
      service.send("MOUNT", {
        id,
      });
    };

    if (params.id) {
      loadData(params.id);
    }
  }, [params.id, service]);

  useEffect(() => {
    if (!itineraryDate) return;

    if (itineraryDate.when === "PAST") service.send("VIEW_ONLY");
  }, [itineraryDate, service]);

  const handleMapClick = (e: MapLayerMouseEvent) =>
    service.send("ADD_MARKER", { point: e.lngLat.toArray() });

  return (
    <MapView initialViewState={viewState} onClick={handleMapClick}>
      <NavigationControl position="top-left" />
      <RoutingMenu />
      <DeviceMarker />
      <MarkersControl />
      <RouteControl />
    </MapView>
  );
};

export default Map;

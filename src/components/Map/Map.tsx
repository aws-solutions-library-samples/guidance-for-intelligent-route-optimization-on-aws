import React, { useContext, useEffect, useRef } from "react";
import { useSelector } from "@xstate/react";
import { useParams } from "react-router-dom";
import { MapView } from "@aws-amplify/ui-react";
import { Logger } from "@aws-amplify/core";
import { Layer, MapRef, NavigationControl, Source } from "react-map-gl";
import { MapLayerMouseEvent, MarkerDragEvent, LayerProps } from "react-map-gl";

import { MapContext } from "../Map";
import { MarkerItem, ItineraryDate } from "../Map";
import RoutingMenu from "../RoutingMenu";
import Marker from "./Marker";
import { getMarkersBbox } from "../../helpers/Itinerary.helpers";
import DeviceMarker from "./DeviceMarker";

const logger = new Logger(
  "Map",
  process.env.NODE_ENV === "production" ? "INFO" : "DEBUG"
);

type MapProps = {
  children?: React.ReactNode;
};

const layerStyleDriving: LayerProps = {
  id: "linesLayer",
  type: "line",
  layout: {
    "line-cap": "round",
  },
  paint: {
    "line-color": "#5B21B6",
    "line-width": 5,
  },
};

const Map: React.FC<MapProps> = ({ children }) => {
  const service = useContext(MapContext);
  const itineraryDate: ItineraryDate = useSelector(
    service,
    (state: any) => state?.context?.itineraryDate
  );
  const markers: MarkerItem[] = useSelector(
    service,
    (state: any) => state?.context?.markers || []
  );
  const draggedMarker = useSelector(
    service,
    (state: any) => state?.context?.draggedMarker
  );
  const viewState = useSelector(
    service,
    (state: any) => state?.context?.viewState
  );
  const isOptimized = useSelector(
    service,
    (state: any) => state?.context?.isOptimized
  );
  const routePath = useSelector(
    service,
    (state: any) => state?.context?.routePath
  );
  const deviceLocation = useSelector(
    service,
    (state: any) => state?.context?.deviceLocation
  );
  const params = useParams();
  const mapRef = useRef<MapRef | null>(null);
  const markerCountRef = useRef(0);

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

  // If a route is present, center and zoom on it, else try to center the bounding box of the markers
  useEffect(() => {
    // Add some padding to the bounding box to account for the right panel
    const fitBoundsOptions = {
      padding: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 450,
      },
      speed: 0.8,
      linear: false,
    };

    if (markers.length > 0 && markers.length !== markerCountRef.current) {
      markerCountRef.current = markers.length;

      // If there's only one marker, center on it
      if (markers.length === 1) {
        mapRef.current?.flyTo({
          center: [markers[0].point.lng, markers[0].point.lat],
        });

        return;
      }

      // If there's more than one marker, calculate the bounding box and center on it
      const bbox = getMarkersBbox(markers);
      mapRef.current?.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        fitBoundsOptions
      );
    } else if (
      // If there's a route with an actual bounding box, center on it
      routePath &&
      routePath.bbox.every((x: number) => x !== Math.abs(Infinity))
    ) {
      mapRef.current?.fitBounds(
        [
          [routePath.bbox[0], routePath.bbox[1]],
          [routePath.bbox[2], routePath.bbox[3]],
        ],
        fitBoundsOptions
      );
      // If there's no route, center on the bounding box of the markers
      // (if any & if different from the current view)
    }
  }, [routePath, markers, service]);

  const handleMarkerDragStart = (idx: number) => {
    service.send("DRAG_MARKER_START", { idx: idx });
  };

  const handleMarkerDragEnd = (e: MarkerDragEvent) => {
    service.send("DRAG_MARKER_STOP", { newCoords: e.lngLat });
  };

  return (
    <MapView
      initialViewState={viewState}
      onClick={(e: MapLayerMouseEvent) =>
        service.send("ADD_MARKER", { point: e.lngLat.toArray() })
      }
      ref={mapRef}
    >
      <NavigationControl position="top-left" />
      <RoutingMenu />
      {markers.map((marker, idx) => (
        <Marker
          key={marker.point.lng + marker.point.lat + isOptimized}
          idx={idx}
          style={{ display: idx === draggedMarker ? "none" : "block" }}
          marker={marker}
          handleDragStart={handleMarkerDragStart}
          handleDragEnd={handleMarkerDragEnd}
          isOptimized={isOptimized}
        />
      ))}
      {deviceLocation.length > 0 && (
        <DeviceMarker location={deviceLocation[0]} />
      )}
      {routePath ? (
        <Source key="source" id="my-data" type="geojson" data={routePath.route}>
          <Layer {...layerStyleDriving} />
        </Source>
      ) : null}
    </MapView>
  );
};

export default Map;

import React, { useContext, useEffect, useRef } from "react";
import { useSelector } from "@xstate/react";
import { Source, Layer, LayerProps, useMap } from "react-map-gl";

import { MapContext, MarkerItem } from "../Map";
import { getMarkersBbox } from "../../helpers/Itinerary.helpers";

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

type RouteControlProps = {
  children?: React.ReactNode;
};

const RouteControl: React.FC<RouteControlProps> = () => {
  const service = useContext(MapContext);
  const routePath = useSelector(
    service,
    (state: any) => state?.context?.routePath
  );
  const markers: MarkerItem[] = useSelector(
    service,
    (state: any) => state?.context?.markers || []
  );
  const markerCountRef = useRef(0);
  const mapRef = useMap();

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
  }, [routePath, markers, service, mapRef]);

  if (!routePath) return null;

  return (
    <>
      <Source key="source" id="my-data" type="geojson" data={routePath.route}>
        <Layer {...layerStyleDriving} />
      </Source>
    </>
  );
};

export default RouteControl;

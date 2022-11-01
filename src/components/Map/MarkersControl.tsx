import React, { useContext } from "react";
// @ts-ignore
import { useSelector } from "@xstate/react";
import { MarkerDragEvent } from "react-map-gl";

import { MapContext, MarkerItem } from "../Map";
import Marker from "./Marker";

type MarkersControlProps = {
  children?: React.ReactNode;
};

const MarkersControl: React.FC<MarkersControlProps> = () => {
  const service = useContext(MapContext);
  const isOptimized = useSelector(
    service,
    (state: any) => state?.context?.isOptimized
  );
  const draggedMarker = useSelector(
    service,
    (state: any) => state?.context?.draggedMarker
  );
  const markers: MarkerItem[] = useSelector(
    service,
    (state: any) => state?.context?.markers || []
  );

  const handleMarkerDragStart = (idx: number) => {
    service.send("DRAG_MARKER_START", { idx: idx });
  };

  const handleMarkerDragEnd = (e: MarkerDragEvent) => {
    service.send("DRAG_MARKER_STOP", { newCoords: e.lngLat });
  };

  return (
    <>
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
    </>
  );
};

export default MarkersControl;

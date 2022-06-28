import React from "react";
import { Marker as MapMarker } from "react-map-gl";
import type { MarkerDragEvent } from "react-map-gl";

import PinIcon from "./PinIcon";
import type { MarkerItem } from "./Map.state-machine";

type MarkerProps = {
  children?: React.ReactNode;
  idx: number;
  style: React.CSSProperties;
  marker: MarkerItem;
  isOptimized: boolean;
  handleDragStart: (idx: number) => void;
  handleDragEnd: (e: MarkerDragEvent) => void;
};

const Marker: React.FC<MarkerProps> = ({
  idx,
  marker,
  style,
  isOptimized,
  handleDragStart,
  handleDragEnd,
}) => {
  const iconSize = 45;
  const color = "#3eb0ce";

  if (!isOptimized) {
    return (
      <MapMarker
        draggable
        style={style}
        longitude={marker.point.lng}
        latitude={marker.point.lat}
        onDragStart={() => handleDragStart(idx)}
        onDragEnd={handleDragEnd}
      />
    );
  }

  return (
    <MapMarker
      draggable
      style={style}
      longitude={marker.point.lng}
      latitude={marker.point.lat}
      onDragStart={() => handleDragStart(idx)}
      onDragEnd={handleDragEnd}
    >
      <PinIcon label={`${idx + 1}`} size={iconSize} color={color} />
    </MapMarker>
  );
};

export default Marker;

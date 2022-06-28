import React, { useContext, useState, cloneElement } from "react";
import { createPortal } from "react-dom";
import { useControl } from "react-map-gl";
import { useSelector } from "@xstate/react";
import { Logger } from "@aws-amplify/core";
import { View, Flex, Button } from "@aws-amplify/ui-react";
import { useParams } from "react-router-dom";
import type { Place } from "@aws-amplify/geo";

import Input from "./Input";
import CustomControl from "./CustomControl";
import SuggestionItem from "./SuggestionItem";
import MarkerItemLine from "./MarkerItemLine";
import ItineraryWhenText from "./ItineraryWhenText";

import { MapContext } from "../Map";
import type { MarkerItem } from "../Map";

const logger = new Logger(
  "RoutingMenu",
  process.env.NODE_ENV === "production" ? "INFO" : "DEBUG"
);

type RoutingMenuProps = {
  children?: React.ReactNode;
};

// Component: RoutingMenu - Routing menu always displayed on map
const RoutingMenu: React.FC<RoutingMenuProps> = () => {
  const service = useContext(MapContext);
  const markers: MarkerItem[] = useSelector(
    service,
    (state: any) => state?.context?.markers
  );
  const suggestions: Place[] = useSelector(
    service,
    (state: any) => state?.context?.suggestions
  );
  const isOptimized = useSelector(
    service,
    (state: any) => state?.context?.isOptimized
  );
  const itineraryDate = useSelector(
    service,
    (state: any) => state?.context?.itineraryDate
  );
  const state = useSelector(service, (state: any) => state.value);
  const params = useParams();

  logger.debug("Current Map State: ", state);

  const handleOptimize = () => {
    if (params.id) {
      logger.info("Optimizing itinerary for", params.id);
      service.send("OPTIMIZE", { itineraryId: params.id });
    }
  };

  const handleStart = () => {
    if (params.id) {
      logger.info("Starting itinerary for", params.id);
      service.send("START_ROUTE", { itineraryId: params.id });
    }
  };

  return (
    <View
      style={{
        zIndex: 50,
        pointerEvents: "all",
        top: 10,
        right: 10,
      }}
      backgroundColor="var(--amplify-colors-neutral-20)"
      borderRadius="var(--amplify-radii-medium)"
      boxShadow="var(--amplify-shadows-medium)"
      padding="var(--amplify-space-xs)"
      width="24rem"
      position="relative"
    >
      <ItineraryWhenText
        date={itineraryDate}
        hasStarted={state === "tracking"}
      />
      {isOptimized && itineraryDate?.when === "TODAY" ? null : <Input />}
      {suggestions.length > 0 ? (
        suggestions.map((place, idx) => (
          <SuggestionItem key={idx} place={place} />
        ))
      ) : (
        <>
          <Button
            onClick={handleOptimize}
            isDisabled={markers.length <= 2 || isOptimized}
            isLoading={state === "optimizing"}
            loadingText="Optimizing"
            title={
              isOptimized
                ? "This itinerary has already been optimized"
                : "Click to optimize this itinerary"
            }
          >
            Optimize
          </Button>
          <Button
            onClick={handleStart}
            isDisabled={!isOptimized || itineraryDate?.when !== "TODAY"}
            isLoading={state === "starting" || state === "tracking"}
            loadingText={state === "starting" ? "Starting" : "Tracking"}
            title={
              itineraryDate?.when !== "TODAY"
                ? "You cannot start a future itinerary"
                : !isOptimized
                ? "You must optimize this itinerary first"
                : "Click to start this itinerary"
            }
          >
            Start
          </Button>
          <Flex direction="column">
            {markers.map((marker, idx) => (
              <MarkerItemLine
                key={idx}
                place={marker}
                idx={idx}
                disabled={isOptimized && itineraryDate?.when === "TODAY"}
              />
            ))}
          </Flex>
        </>
      )}
    </View>
  );
};

const MarkerControl = () => {
  const [ve, setVersion] = useState(0);
  const ctrl = useControl(
    () => {
      // const forceUpdate = () => setVersion((v) => v + 1);
      const forceUpdate = () => {
        if (ve === 0) {
          setVersion(1);
        }
      };
      return new CustomControl(forceUpdate, "routing-menu");
    },
    { position: "top-right" }
  );

  const el = ctrl.getElement();
  const map = ctrl.getMap();
  if (!el || !ctrl.getMap()) {
    return null;
  } else {
    return createPortal(cloneElement(<RoutingMenu />, map), el);
  }
};

export default React.memo(MarkerControl);

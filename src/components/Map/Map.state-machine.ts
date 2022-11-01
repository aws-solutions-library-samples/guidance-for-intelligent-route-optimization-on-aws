import { createContext } from "react";
import { createMachine, assign } from "xstate";
import { InterpreterFrom } from "xstate/lib/types";
import { Geo, Place, Coordinates } from "@aws-amplify/geo";
import { Logger } from "@aws-amplify/core";
// @ts-ignore
import { LngLat, ViewState } from "react-map-gl";
import { isToday as isDateToday, compareAsc, startOfDay, parseISO } from "date-fns";

import {
  addMarker,
  buildPlace,
  getSuggestions,
  getItinerary,
  getRoutePath,
  optimizeItinerary,
  startItinerary,
  trackItinerary,
  updateItinerary,
} from "../../helpers/Itinerary.helpers";
import { RoutePathResult } from "../../helpers/Itinerary.helpers";
import { Itinerary } from "../../API";

const logger = new Logger(
  "Map.state-machine",
  process.env.NODE_ENV === "production" ? "INFO" : "DEBUG"
);

type MarkerPoint = {
  lng: number;
  lat: number;
};

type MarkerItem = {
  point: MarkerPoint;
  label: string;
};

type ItineraryWhen = "TODAY" | "PAST" | "FUTURE";

type ItineraryDate = {
  date: Date;
  when: ItineraryWhen;
};

type MapContextType = {
  itineraryId: string;
  markers: MarkerItem[];
  draggedMarker: number;
  viewState: Partial<ViewState>;
  suggestions: Place[];
  isOptimized: boolean;
  routePath?: RoutePathResult;
  itineraryDate?: ItineraryDate;
  hasStarted?: boolean;
  deviceLocation: Coordinates[];
};

const removeMarker = async (markerIdx: number, markers: MarkerItem[]) => {
  markers.splice(markerIdx, 1);
  return markers;
};

const modifyMarkerAtIdx = async (
  markerIdx: number,
  markers: MarkerItem[],
  newCoords: LngLat
) => {
  const res = await Geo.searchByCoordinates(newCoords.toArray() as Coordinates);
  const newPlace = buildPlace(res);
  markers[markerIdx] = newPlace;
  return markers;
};

const mapMachine = createMachine<MapContextType>(
  {
    id: "map",
    initial: "readyToMount",
    context: {
      itineraryId: "",
      markers: [],
      draggedMarker: -1,
      viewState: {
        latitude: 37.8,
        longitude: -122.4,
        zoom: 14,
      },
      suggestions: [],
      isOptimized: false,
      routePath: undefined,
      itineraryDate: undefined,
      deviceLocation: [],
    },
    states: {
      readyToMount: {
        on: {
          MOUNT: "fetchData",
        },
      },
      idle: {
        on: {
          ADD_MARKER: {
            target: "addMarker",
            cond: "canAddMarker",
          },
          DRAG_MARKER_START: {
            target: "dragging",
          },
          TYPING_START: {
            target: "typing",
          },
          REMOVE_MARKER: {
            target: "removeMarker",
            cond: "canRemoveMarker",
          },
          OPTIMIZE: {
            target: "optimizing",
          },
          VIEW_ONLY: {
            target: "viewOnly",
          },
        },
      },
      fetchData: {
        invoke: {
          id: "fetchData",
          src: async (_context, event) => {
            const itinerary = await getItinerary(event.id);

            if (itinerary === undefined) {
              throw new Error("No itinerary found");
            }

            const markers: MarkerItem[] =
              itinerary.points.length > 0
                ? ([...itinerary.points] as MarkerItem[])
                : [];
            let routepath = undefined;
            if (markers.length > 0 && itinerary.optimized) {
              routepath = await getRoutePath(markers);
            }

            const today = startOfDay(new Date());
            const itineraryDate = startOfDay(
              new Date(parseISO((itinerary as Itinerary).date))
            );
            const itineraryWhen = isDateToday(itineraryDate)
              ? "TODAY"
              : compareAsc(today, itineraryDate) === 1
                ? "PAST"
                : "FUTURE";

            return {
              id: itinerary.id,
              isOptimized: itinerary.optimized || false,
              markers: itinerary.points || [],
              routePath: routepath,
              itineraryDate: {
                date: itineraryDate,
                when: itineraryWhen,
              },
              hasStarted: itinerary.hasStarted,
            };
          },
          onDone: [
            {
              target: "startable",
              cond: (_context, event) =>
                event.data.itineraryDate.when === "TODAY" &&
                !event.data.hasStarted &&
                event.data.isOptimized,
              // TODO: serialize this & below
              actions: [
                assign({
                  itineraryId: (_context, event) => event.data.id,
                }),
                assign({
                  markers: (_context, event) => [...event.data.markers],
                }),
                assign({
                  isOptimized: (_context, event) => event.data.isOptimized,
                }),
                assign({
                  routePath: (_context, event) => event.data.routePath,
                }),
                assign({
                  itineraryDate: (_context, event) => event.data.itineraryDate,
                }),
              ],
            },
            {
              target: "tracking",
              cond: (_context, event) =>
                event.data.itineraryDate.when === "TODAY" &&
                event.data.hasStarted,
              // TODO: serialize this & below
              actions: [
                assign({
                  itineraryId: (_context, event) => event.data.id,
                }),
                assign({
                  markers: (_context, event) => [...event.data.markers],
                }),
                assign({
                  isOptimized: (_context, event) => event.data.isOptimized,
                }),
                assign({
                  routePath: (_context, event) => event.data.routePath,
                }),
                assign({
                  itineraryDate: (_context, event) => event.data.itineraryDate,
                }),
              ],
            },
            {
              // TODO: if date is past go directly to VIEW_ONLY & remove the check in the map component (it's redundant)
              target: "idle",
              actions: [
                assign({
                  itineraryId: (_context, event) => event.data.id,
                }),
                assign({
                  markers: (_context, event) => [...event.data.markers],
                }),
                assign({
                  isOptimized: (_context, event) => event.data.isOptimized,
                }),
                assign({
                  routePath: (_context, event) => event.data.routePath,
                }),
                assign({
                  itineraryDate: (_context, event) => event.data.itineraryDate,
                }),
              ],
            },
          ],
          onError: {
            target: "failure",
            actions: "handleFetchDataError",
          },
        },
      },
      addMarker: {
        entry: "resetSuggestions",
        invoke: {
          id: "addMarker",
          src: (_context, event) => addMarker(event.point, event.label),
          onDone: {
            target: "persisting",
            actions: [
              assign({
                isOptimized: (_context, _event) => false,
              }),
              assign({
                markers: (context, event) => [...context.markers, event.data],
              }),
              assign({
                routePath: (_context, _event) => undefined,
              }),
            ],
          },
          onError: {
            target: "failure",
            // actions: assign({ error: (context, event) => event.data })
            actions: "handleAddMarkerError",
          },
        },
      },
      removeMarker: {
        invoke: {
          id: "removeMarker",
          src: async (context, event) => [
            ...(await removeMarker(event.idx, [...context.markers])),
          ],
          onDone: {
            target: "persisting",
            actions: [
              assign({
                markers: (_context, event) => [...event.data],
              }),
              assign({
                isOptimized: (_context, _event) => false,
              }),
              assign({
                routePath: (_context, _event) => undefined,
              }),
            ],
          },
          onError: {
            target: "failure",
            // actions: assign({ error: (context, event) => event.data })
            actions: "handleRemoveMarkerError",
          },
        },
      },
      dragging: {
        entry: ["setDraggedMarker"],
        on: {
          DRAG_MARKER_STOP: "modifyMarkerAtIdx",
        },
      },
      typing: {
        on: {
          TYPING_STOP: "getSuggestions",
        },
      },
      modifyMarkerAtIdx: {
        invoke: {
          id: "modifyMarkerAtIdx",
          src: async (context, event) => [
            ...(await modifyMarkerAtIdx(
              context.draggedMarker,
              context.markers,
              event.newCoords
            )),
          ],
          onDone: {
            target: "persisting",
            actions: [
              assign({
                markers: (_context, event) => [...event.data],
              }),
              assign({
                isOptimized: (_context, _event) => false,
              }),
              assign({
                routePath: (_context, _event) => undefined,
              }),
            ],
          },
          onError: {
            target: "failure",
            // actions: assign({ error: (context, event) => event.data })
            actions: "handleModifyMarkerAtIdxError",
          },
        },
        exit: ["resetDraggedMarker"],
      },
      getSuggestions: {
        invoke: {
          id: "getSuggestions",
          src: async (context, event) => [
            ...(await getSuggestions(event.text, [
              context.viewState.longitude || 0,
              context.viewState.latitude || 0,
            ])),
          ],
          onDone: {
            target: "idle",
            actions: assign({
              suggestions: (_context, event) => event.data,
            }),
          },
          onError: {
            target: "failure",
            // actions: assign({ error: (context, event) => event.data })
            actions: "handleGetSuggestionsError",
          },
        },
      },
      persisting: {
        invoke: {
          id: "updateItinerary",
          src: async (context, _event) => {
            if (context.itineraryId.trim() === "")
              throw new Error("No itinerary id");
            return await updateItinerary(context.itineraryId, {
              points: context.markers,
            });
          },
          onDone: {
            target: "idle",
            actions: [
              assign({
                markers: (_context, event) => [...event.data.points],
              }),
            ],
          },
          onError: {
            target: "failure",
            actions: "handleUpdateError",
          },
        },
      },
      optimizing: {
        invoke: {
          id: "optimize",
          src: async (_context, event) => {
            console.log("Optimizing route ", event.itineraryId);
            return await optimizeItinerary(event.itineraryId);
          },
          onDone: {
            target: "gettingRoutePath",
            actions: [
              assign({
                markers: (_context, event) => [...event.data.points],
              }),
              assign({
                isOptimized: (_context, _event) => true,
              }),
            ],
          },
          onError: {
            target: "failure",
            // actions: assign({ error: (context, event) => event.data })
            actions: "handleOptimizeError",
          },
        },
      },
      gettingRoutePath: {
        invoke: {
          id: "getRoutePath",
          src: async (context, _event) => {
            return await getRoutePath(context.markers);
          },
          onDone: [
            {
              target: "startable",
              cond: (context, _event) =>
                context.itineraryDate?.when === "TODAY",
              actions: [
                assign({
                  routePath: (_context, event) => event.data,
                }),
              ],
            },
            {
              target: "idle",
              cond: (context, _event) =>
                context.itineraryDate?.when === "FUTURE",
              actions: [
                assign({
                  routePath: (_context, event) => event.data,
                }),
              ],
            },
          ],
          onError: {
            target: "failure",
            actions: "handleGetRoutePathError",
          },
        },
      },
      startable: {
        on: {
          START_ROUTE: {
            target: "starting",
            cond: (context, _event) => context.itineraryDate?.when === "TODAY",
          },
        },
      },
      starting: {
        invoke: {
          id: "startItinerary",
          src: async (context, _event) => {
            await startItinerary(context.itineraryId);
            await new Promise((resolve) => setTimeout(resolve, 2000));

            return;
          },
          onDone: {
            target: "tracking",
            actions: [
              assign({
                hasStarted: (_context, _event) => true,
              }),
            ],
          },
          onError: {
            target: "failure",
            actions: "handleStartItineraryError",
          },
        },
      },
      tracking: {
        invoke: {
          id: "trackItinerary",
          src: async (context, event) => {
            if (
              event.type === "done.invoke.trackItinerary" ||
              event.type === "done.invoke.startItinerary"
            ) {
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
            return await trackItinerary(context.itineraryId);
          },
          onDone: {
            target: "tracking",
            actions: [
              assign({
                deviceLocation: (_context, event) => [...event.data],
              }),
            ],
          },
          onError: {
            target: "failure",
            actions: "handleTrackItineraryError",
          },
        },
      },
      viewOnly: {
        type: "final",
      },
      failure: {
        type: "final",
      },
    },
  },
  {
    actions: {
      setDraggedMarker: (context, event) => {
        context.draggedMarker = event.idx;
      },
      resetDraggedMarker: (context, _event) => {
        context.draggedMarker = -1;
      },
      resetSuggestions: (context, _event) => {
        if (context.suggestions.length > 0) context.suggestions = [];
      },
      handleFetchDataError: (_context, event) => {
        logger.error(event.data);
      },
      handleAddMarkerError: (_context, event) => {
        logger.error(event.data);
      },
      handleRemoveMarkerError: (_context, event) => {
        logger.error(event.data);
      },
      handleModifyMarkerAtIdxError: (_context, event) => {
        logger.error(event.data);
      },
      handleGetSuggestionsError: (_context, event) => {
        logger.error(event.data);
      },
      handleOptimizeError: (_context, event) => {
        logger.error(event.data);
      },
      handleUpdateError: (_context, event) => {
        logger.error(event.data);
      },
      handleGetRoutePathError: (_context, event) => {
        logger.error(event.data);
      },
      handleStartItineraryError: (_context, event) => {
        logger.error(event.data);
      },
      handleTrackItineraryError: (_context, event) => {
        logger.error(event.data);
      },
    },
    guards: {
      canAddMarker: (context) => context.markers.length <= 10,
      canRemoveMarker: (context) => context.markers.length > 0,
    },
  }
);

const MapContext = createContext({
  mapService: {},
} as unknown as InterpreterFrom<typeof mapMachine>);

export default mapMachine;

export { mapMachine, MapContext };

export type { MarkerPoint, MarkerItem, ItineraryWhen, ItineraryDate };

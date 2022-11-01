// @ts-ignore
import { MapboxMap, IControl } from "react-map-gl";
import { Logger } from "@aws-amplify/core";

const logger = new Logger(
  "RoutingMenu.CustomControl.prototype",
  process.env.NODE_ENV === "production" ? "INFO" : "DEBUG"
);

export default class CustomControl implements IControl {
  _redraw: () => void;
  _id: string;
  _container?: HTMLElement;
  _map?: MapboxMap;

  constructor(redraw: () => void, id: string) {
    this._redraw = redraw;
    this._id = id;
  }

  onAdd(map: MapboxMap) {
    logger.debug("Adding CustomControl on MAP");
    this._map = map;
    // map.on("move", this._redraw);
    this._container = document.createElement("div");
    this._container.className = "maplibre-ctrl";
    this._container.id = this._id;
    this._redraw();
    return this._container;
  }

  onRemove() {
    logger.debug("Removing CustomControl on MAP");
    if (this._container) this._container.remove();
    // if (this._map) this._map.off("move", this._redraw);
    this._map = undefined;
  }

  getMap() {
    return this._map;
  }

  getElement() {
    return this._container;
  }
}

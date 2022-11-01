import React, { useContext, useEffect, useState, useRef } from "react";
import { TextField, useTheme } from "@aws-amplify/ui-react";
// @ts-ignore
import { useSelector } from "@xstate/react";
import { Logger } from "@aws-amplify/core";
import { useDebounce } from "use-debounce";

import { MapContext } from "../Map";

const logger = new Logger(
  "RoutingMenu.Input",
  process.env.NODE_ENV === "production" ? "INFO" : "DEBUG"
);

type InputProps = {
  children?: React.ReactNode;
};

const Input: React.FC<InputProps> = () => {
  const [value, setValue] = useState<string>("");
  const [debouncedValue] = useDebounce(value, 500);
  const valueRef = useRef<string>(value);
  const service = useContext(MapContext);
  const markers = useSelector(
    service,
    (state: any) => state?.context?.markers?.length || 0
  );
  const isTyping = useSelector(service, (state: any) =>
    state.matches("typing")
  );
  const isIdle = useSelector(service, (state: any) => state.matches("idle"));
  const isGettingSuggestion = useSelector(service, (state: any) =>
    state.matches("getSuggestions")
  );
  const { send } = service;
  const { tokens } = useTheme();

  logger.debug("Rendering Input");

  useEffect(() => {
    if (isGettingSuggestion) return;
    if (
      isIdle &&
      debouncedValue !== "" &&
      debouncedValue !== valueRef.current
    ) {
      send("TYPING_START");
    } else if (isTyping && debouncedValue !== valueRef.current) {
      logger.debug("Committing value", debouncedValue);
      valueRef.current = debouncedValue;
      send("TYPING_STOP", { text: debouncedValue.trim() });
    }
  }, [debouncedValue, isTyping, isIdle, isGettingSuggestion, send]);

  return (
    <TextField
      labelHidden
      label=""
      defaultValue={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setValue(e.target.value)
      }
      backgroundColor={tokens.colors.white}
      isDisabled={markers.length >= 10 || isGettingSuggestion}
      isReadOnly={markers.length >= 10}
      placeholder={
        markers.length >= 10
          ? "Please remove a marker to add a new one"
          : "Search for a place"
      }
      title={
        markers.length >= 10
          ? "Please remove a marker to add a new one"
          : "Search for a place"
      }
    />
  );
};

export default React.memo(Input);

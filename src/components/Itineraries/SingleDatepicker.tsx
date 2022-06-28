import React, { useState, useCallback, useEffect } from "react";
import { TextField, View, useTheme } from "@aws-amplify/ui-react";
import { DayClickEventHandler, DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import "react-day-picker/dist/style.css";
import { useFloating, shift } from "@floating-ui/react-dom";

import useOnClickOutside from "../../hooks/use-onclick-outside.hook";

const DATE_FORMAT = "yyyy-MM-dd";

export interface SingleDatepickerProps {
  value?: Date;
  isDisabled?: boolean;
  onChange?: (date?: Date) => void;
  isRequired?: boolean;
  name?: string;
  label?: string;
}

export const SingleDatepicker = ({
  value,
  isDisabled,
  isRequired,
  name,
  onChange,
  label,
}: SingleDatepickerProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [proposedDate, setProposedDate] = useState<string>(
    value ? format(value, DATE_FORMAT) : ""
  );

  useEffect(() => {
    if (!proposedDate && value) {
      setProposedDate(format(value, DATE_FORMAT));
    }
  }, [proposedDate, value]);

  const { tokens } = useTheme();
  const { x, y, refs, strategy } = useFloating({
    placement: "right-start",
    middleware: [shift()],
  });

  const closePopover = useCallback(() => {
    if (popoverOpen) {
      (refs.reference.current as HTMLInputElement)?.focus();
      setPopoverOpen(false);
    }
  }, [refs.reference, popoverOpen]);

  useOnClickOutside({
    ref: refs.floating,
    handler: useCallback(() => closePopover(), [closePopover]),
  });

  const onChangePrime = (date?: Date) => {
    if (onChange) onChange(date);
    if (date) {
      setProposedDate(format(date, DATE_FORMAT));
    }
  };

  const handleDayClick: DayClickEventHandler = (day, _modifiers) => {
    onChangePrime(day);
    closePopover();
    return;
  };

  return (
    <>
      <TextField
        backgroundColor="white"
        value={proposedDate}
        isDisabled={isDisabled}
        ref={refs.reference as React.MutableRefObject<HTMLInputElement | null>}
        label={label}
        onFocus={() => (proposedDate !== "" ? null : setPopoverOpen(true))}
        onClick={() => setPopoverOpen(true)}
        onChange={(e: any) => {
          setProposedDate(e.target.value);
        }}
        onBlur={() => {
          const d = parse(proposedDate, DATE_FORMAT, new Date());
          isValid(d) ? onChangePrime(d) : onChangePrime(undefined);
        }}
        name={name}
        isRequired={isRequired}
      />
      <View
        width="300px"
        ref={refs.floating}
        display={popoverOpen ? "block" : "none"}
        height="350px"
        borderRadius="5px"
        border={`1px solid ${tokens.colors.border.primary}`}
        backgroundColor={tokens.colors.background.primary}
        style={{
          position: strategy,
          top: y ?? "",
          left: x ?? "",
        }}
      >
        <DayPicker
          fromDate={new Date()}
          toYear={2025}
          captionLayout="dropdown"
          onDayClick={handleDayClick}
        />
      </View>
    </>
  );
};

export default SingleDatepicker;

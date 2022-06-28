import React from "react";
import { Text, useTheme } from "@aws-amplify/ui-react";

import { ItineraryDate } from "../Map/Map.state-machine";

type ItineraryWhenTextProps = {
  children?: React.ReactNode;
  date?: ItineraryDate;
  hasStarted?: boolean;
};

const ItineraryWhenText: React.FC<ItineraryWhenTextProps> = ({
  date,
  hasStarted,
}) => {
  const theme = useTheme();

  if (!date) return null;
  const text =
    date?.when === "TODAY"
      ? "today"
      : Intl.DateTimeFormat("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }).format(date?.date);

  if (hasStarted) {
    return (
      <Text
        fontSize={theme.tokens.fontSizes.medium}
        textAlign={"center"}
        marginBottom={theme.tokens.space.xs}
      >
        Itinerary is running
      </Text>
    );
  }

  return (
    <Text
      fontSize={theme.tokens.fontSizes.medium}
      textAlign={"center"}
      marginBottom={theme.tokens.space.xs}
    >
      Itinerary{" "}
      {date?.when === "FUTURE" || date?.when === "TODAY"
        ? "scheduled for"
        : "completed"}{" "}
      {text}
    </Text>
  );
};

export default ItineraryWhenText;

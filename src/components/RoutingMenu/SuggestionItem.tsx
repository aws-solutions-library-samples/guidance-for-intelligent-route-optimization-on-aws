import React, { useContext } from "react";
import { Flex, Text, useTheme } from "@aws-amplify/ui-react";
import { Place } from "@aws-amplify/geo";

import { MapContext } from "../Map";

type SuggestionItemProps = {
  children?: React.ReactNode;
  place: Place;
};

const SuggestionItem: React.FC<SuggestionItemProps> = ({ place }) => {
  const { send } = useContext(MapContext);
  const { tokens } = useTheme();

  return (
    <Flex
      gap="0"
      padding={`${tokens.space.xxs}`}
      style={{
        cursor: "pointer",
        borderBottom: `1px solid ${tokens.colors.border.primary}`,
      }}
      onClick={() =>
        send("ADD_MARKER", { point: place.geometry?.point, label: place.label })
      }
    >
      <Flex
        width="90%"
        justifyContent={"flex-start"}
        alignItems={"center"}
        paddingRight={tokens.space.xs}
      >
        <Text isTruncated={true}>{place.label}</Text>
      </Flex>
    </Flex>
  );
};

export default SuggestionItem;

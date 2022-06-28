import React, { useContext } from "react";
import {
  Flex,
  Text,
  Button,
  IconRemove,
  useTheme,
} from "@aws-amplify/ui-react";

import { MapContext } from "../Map";
import type { MarkerItem } from "../Map";

type MarkerItemLineProps = {
  children?: React.ReactNode;
  place: MarkerItem;
  idx: number;
  disabled?: boolean;
};

const MarkerItemLine: React.FC<MarkerItemLineProps> = ({
  place: { label },
  idx,
  disabled,
}) => {
  const service = useContext(MapContext);
  const { send } = service;
  const { tokens } = useTheme();

  return (
    <Flex gap="0" padding={`${tokens.space.xxxs} ${tokens.space.xxs}`}>
      <Flex
        width="90%"
        justifyContent={"flex-start"}
        alignItems={"center"}
        paddingRight={tokens.space.xs}
      >
        <Text isTruncated={true}>{label}</Text>
      </Flex>
      <Flex width="10%" justifyContent={"center"} alignItems={"center"}>
        {disabled ? null : (
          <Button size={"small"} onClick={() => send("REMOVE_MARKER", { idx })}>
            <IconRemove />
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

export default MarkerItemLine;

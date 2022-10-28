import React, { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  View,
  Flex,
  Button,
  Text,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
} from "@aws-amplify/ui-react";
import { HiTrash, HiPencil, HiEye } from "react-icons/hi";

import {
  deleteItinerary,
  getItineraries,
} from "../../helpers/Itinerary.helpers";
import { Itinerary } from "../../models";

type ItinerariesProps = {
  children?: React.ReactNode;
};

const Itineraries: React.FC<ItinerariesProps> = () => {
  const { tokens } = useTheme();
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const firstLoad = useRef<boolean>(true);
  const [future, setFuture] = useState(true);
  const [nextToken, setNextToken] = useState<string>();

  const loadItineraries = useCallback(
    async (
      itineraries: Itinerary[],
      nextToken?: string,
      future: boolean = true
    ) => {
      const { itineraries: newItineraries, nextToken: newNextToken } =
        await getItineraries(future, nextToken);
      setItineraries([...itineraries, ...newItineraries]);
      setNextToken(newNextToken);
    },
    []
  );

  // Load itineraries only on first mount
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      loadItineraries(itineraries);
    }
  }, [itineraries, loadItineraries]);

  const handleLoadMore = async (
    itineraries: Itinerary[],
    future: boolean,
    nextToken?: string,
    force: boolean = false
  ) => {
    if (nextToken || force) {
      await loadItineraries(itineraries, nextToken, future);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItinerary(id);
      setItineraries(itineraries.filter((itinerary) => itinerary.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View height="100%" width="90%" margin="auto">
      <Flex margin={`${tokens.space.xs} 0`}>
        <Flex width="20%" justifyContent={"flex-start"}>
          <Text
            fontSize={tokens.fontSizes.large}
            fontWeight={tokens.fontWeights.bold}
          >
            {future ? "" : "Past "}Itineraries
          </Text>
        </Flex>
        <Flex width="80%" justifyContent={"flex-end"}>
          <Button onClick={() => navigate("/new")} size={"small"}>
            Create New
          </Button>
        </Flex>
      </Flex>
      <Table highlightOnHover={true}>
        <TableHead>
          <TableRow textAlign={"left"}>
            <TableCell as="th">Label</TableCell>
            <TableCell as="th">Date</TableCell>
            <TableCell as="th">Waypoints</TableCell>
            <TableCell as="th">Optimized</TableCell>
            <TableCell as="th">Status</TableCell>
            <TableCell as="th">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {itineraries.map((itinerary) => (
            <TableRow key={itinerary.id}>
              <TableCell>{itinerary.label}</TableCell>
              <TableCell>{itinerary.date}</TableCell>
              <TableCell>{itinerary?.points?.length || 0}</TableCell>
              <TableCell>{itinerary.optimized ? "Yes" : "No"}</TableCell>
              <TableCell>
                {itinerary.hasStarted
                  ? "Running"
                  : itinerary.optimized
                  ? "Ready"
                  : "Planned"}
              </TableCell>
              <TableCell>
                <View as="span" margin={`0 ${tokens.space.xxs} 0 0`}>
                  <HiEye
                    cursor={"pointer"}
                    title="See itinerary"
                    className="table-action-icon"
                    onClick={() => navigate(`/${itinerary.id}/map`)}
                  />
                </View>
                <View as="span" margin={`0 ${tokens.space.xxs} 0 0`}>
                  <HiPencil
                    cursor={"pointer"}
                    title="Edit itinerary"
                    className="table-action-icon"
                    onClick={() => navigate(`/${itinerary.id}`)}
                  />
                </View>
                <View as="span" margin={`0 ${tokens.space.xxs} 0 0`}>
                  <HiTrash
                    cursor={"pointer"}
                    title="Delete itinerary"
                    className="table-action-icon"
                    onClick={() => handleDelete(itinerary.id)}
                  />
                </View>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Flex width="100%">
        <Flex width="50%" alignItems={"flex-end"} direction={"column"}>
          <Button
            variation={"link"}
            onClick={() => {
              setFuture(!future);
              setNextToken(undefined);
              setItineraries([]);
              handleLoadMore([], !future, undefined, true);
            }}
          >
            See {future ? "past" : "future"} itineraries
          </Button>
        </Flex>
        <Flex width="50%">
          <Button
            variation={"link"}
            disabled={!nextToken}
            onClick={() => {
              handleLoadMore(itineraries, future, nextToken, false);
            }}
          >
            Load More
          </Button>
        </Flex>
      </Flex>
    </View>
  );
};

export default Itineraries;

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Link as UiLink,
  Text,
  View,
  Flex,
  Button,
  useTheme,
  TextField,
} from "@aws-amplify/ui-react";

import SingleDatepicker from "./SingleDatepicker";
import {
  getItinerary,
  saveItinerary,
  updateItinerary,
} from "../../helpers/Itinerary.helpers";
import { Itinerary } from "../../models";

const uuid = new RegExp(
  /^\/[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
);

type NewItineraryProps = {
  children?: React.ReactNode;
};

const NewItinerary: React.FC<NewItineraryProps> = () => {
  const { tokens } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [itinerary, setItinerary] = useState<Itinerary>();

  useEffect(() => {
    const loadItinerary = async (id: string) => {
      const itinerary = await getItinerary(id);
      setItinerary(itinerary);
    };

    if (location.pathname === "/new") return;

    if (location.pathname.match(uuid) && params.id) {
      loadItinerary(params.id);
    }
  }, [location.pathname, params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const label = (form.elements.namedItem("label") as HTMLInputElement).value;
    const date = (form.elements.namedItem("date") as HTMLInputElement).value;

    let newOrUpdatedItinerary;
    if (location.pathname.match(uuid) && itinerary) {
      newOrUpdatedItinerary = await updateItinerary(itinerary.id, {
        label,
        date,
      });
    } else {
      newOrUpdatedItinerary = await saveItinerary(label, date);
    }
    if (newOrUpdatedItinerary) {
      navigate(`/${newOrUpdatedItinerary.id}/map`);
    }
  };

  return (
    <View height="100%" width="90%" margin="auto">
      <Flex margin={`${tokens.space.xs} 0`}>
        <Flex width="100%" justifyContent={"flex-start"}>
          <Text
            fontSize={tokens.fontSizes.large}
            fontWeight={tokens.fontWeights.bold}
          >
            <UiLink as={Link} to="/">
              Itineraries
            </UiLink>{" "}
            / {location.pathname.match(uuid) ? "Edit" : "New"} Itinerary
          </Text>
        </Flex>
      </Flex>
      <View as="form" width="50%" onSubmit={handleSubmit}>
        <View margin={`${tokens.space.xs} 0 0 0`}>
          <TextField
            label="Name"
            name="label"
            isRequired
            defaultValue={itinerary?.label}
          />
        </View>
        <View margin={`${tokens.space.xs} 0 0 0`}>
          <SingleDatepicker
            label="Date"
            name="date"
            isRequired
            value={itinerary?.date ? new Date(itinerary.date) : undefined}
          />
        </View>
        <Flex justifyContent={"flex-end"} margin={`${tokens.space.xs} 0`}>
          <Button type="submit">Continue</Button>
        </Flex>
      </View>
    </View>
  );
};

export default NewItinerary;

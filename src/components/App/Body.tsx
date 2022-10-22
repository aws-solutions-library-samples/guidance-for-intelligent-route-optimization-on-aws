import React, { useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";
import { Hub } from "aws-amplify";
import { HubCallback } from "@aws-amplify/core";
import { Flex, Alert, useTheme, Button } from "@aws-amplify/ui-react";
import useWindowDimensions from "../../hooks/use-windows-dimensions.hook";

const WindowContext = createContext({});

type BodyProps = {
  children?: React.ReactNode;
  justifyContent?: string;
  alignItems?: string;
  width?: string;
  style?: React.CSSProperties;
};

type ErrorMessage = {
  message: string;
};

const Body: React.FC<BodyProps> = ({
  justifyContent = "center",
  alignItems = "center",
  width = "100%",
  style,
  children,
}) => {
  const [error, setError] = useState<ErrorMessage | null>(null);
  const { tokens } = useTheme();
  const navigate = useNavigate();
  const { height: windowHeight } = useWindowDimensions();

  const handleErrors: HubCallback = ({ payload: { data } }) => {
    setError({
      message: data,
    });
  };

  useEffect(() => {
    Hub.listen("errors", handleErrors);

    // Clean up subscriptions when the component unmounts
    return () => {
      Hub.remove("errors", handleErrors);
    };
  });

  return (
    <WindowContext.Provider value={{ error, windowHeight }}>
      <Flex
        width={width}
        margin="auto"
        height={`calc(${windowHeight}px - ${tokens.space.xxl.value})`}
        justifyContent={error ? "center" : justifyContent}
        alignItems={error ? "center" : alignItems}
        style={style}
        direction="column"
        gap="0"
      >
        {error ? (
          <>
            <Alert variation="error">{error.message}</Alert>
            <Button
              onClick={() => {
                setError(null);
                navigate(-1);
              }}
            >
              Back
            </Button>
          </>
        ) : (
          children
        )}
      </Flex>
    </WindowContext.Provider>
  );
};

export { WindowContext };

export default Body;

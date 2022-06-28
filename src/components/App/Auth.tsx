import React, { ReactElement } from "react";
import {
  Authenticator,
  View,
  Image,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";

const Header = () => {
  const { tokens } = useTheme();

  return (
    <View textAlign="center" padding={tokens.space.large}>
      <Image width={100} alt="Amplify logo" src="/aws_logo.svg" />
    </View>
  );
};

const Footer = () => {
  const { tokens } = useTheme();
  return (
    <View textAlign="center" padding={tokens.space.large}>
      <Text color={`${tokens.colors.black}`}>&copy; All Rights Reserved</Text>
    </View>
  );
};

type AuthComponentProps = {
  children?: ReactElement;
};

const AuthComponent: React.FC<AuthComponentProps> = ({ children }) => {
  return (
    <Authenticator
      formFields={{
        signIn: {
          username: {
            labelHidden: false,
          },
          password: {
            labelHidden: false,
          },
        },
        signUp: {
          email: {
            labelHidden: false,
          },
          password: {
            labelHidden: false,
          },
        },
      }}
      components={{
        Header,
        Footer,
      }}
    >
      {() => <>{children}</>}
    </Authenticator>
  );
};

export default AuthComponent;

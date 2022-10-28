import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { AmplifyProvider } from "@aws-amplify/ui-react";
import "normalize.css";
import "@aws-amplify/ui-react/styles.css";
import "./index.css";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

const theme = {
  name: "suppy-chain-theme",
  tokens: {},
};

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
root.render(
  <AmplifyProvider theme={theme}>
    <App />
  </AmplifyProvider>
);

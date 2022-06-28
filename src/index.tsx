import { createRoot } from "react-dom/client";
import App from "./components/App";
import { AmplifyProvider } from "@aws-amplify/ui-react";
import "normalize.css";
import "@aws-amplify/ui-react/styles.css";
import "./index.css";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import reportWebVitals from "./reportWebVitals";

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

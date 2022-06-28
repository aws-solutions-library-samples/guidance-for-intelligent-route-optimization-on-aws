import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./Auth";
import Header from "./Header";
import Body from "./Body";
import Itineraries from "../Itineraries";

const NewItinerary = lazy(() => import("../Itineraries/NewItinerary"));
const MapPage = lazy(() => import("../Itineraries/MapPage"));

const App: React.FC = () => {
  return (
    <Auth>
      <BrowserRouter>
        <Header />
        <Body justifyContent={"normal"} alignItems={"normal"}>
          <Suspense fallback={<div style={{ color: "red" }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Itineraries />} />
              <Route path="/new" element={<NewItinerary />} />
              <Route path="/:id" element={<NewItinerary />} />
              <Route path="/:id/map" element={<MapPage />} />
            </Routes>
          </Suspense>
        </Body>
      </BrowserRouter>
    </Auth>
  );
};

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Team from "./pages/Team/Team";
import "leaflet/dist/leaflet.css";
import HospitalFinder from "./pages/HospitalFinder";
import Chatbot from "./pages/Chatbot/Chatbot";
import HospitalComparison from "./pages/HospitalComparison/HospitalComparison";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/team" element={<Team />} />
        <Route path="/find-hospitals" element={<HospitalFinder />} />
        <Route path="/compare" element={<HospitalComparison />} />

        <Route path="/chatbot" element={<Chatbot />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

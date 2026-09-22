import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Team from "./pages/Team/Team";
import SamplePage from "./pages/SamplePage/SamplePage";
import ThemeLab from "./pages/ThemeLab/ThemeLab";
import "leaflet/dist/leaflet.css";
import HospitalFinder from "./pages/HospitalFinder";
import Chatbot from "./pages/Chatbot/Chatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =================================
            HOME
        ================================= */}

        <Route path="/" element={<Home />} />

        {/* =================================
            SAMPLE PAGE 1
        ================================= */}

        <Route
          path="/sample-page-1"
          element={
            <SamplePage
              eyebrow="SAMPLE PAGE 01"
              title="A product-focused page."
              description="A reusable inner-page structure for presenting a project's solution, architecture, features, or workflow."
              pageNumber="01"
            />
          }
        />

        {/* =================================
            TEAM
        ================================= */}

        <Route path="/team" element={<Team />} />
        <Route path="/find-hospitals" element={<HospitalFinder />} />

        <Route path="/theme-lab" element={<ThemeLab />} />
        <Route path="/chatbot" element={<Chatbot />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

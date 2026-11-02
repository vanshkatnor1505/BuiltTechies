import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import About from "./pages/Team/About";
import "leaflet/dist/leaflet.css";
import HospitalFinder from "./pages/HospitalFinder";
import Chatbot from "./pages/Chatbot/Chatbot";
import HospitalComparison from "./pages/HospitalComparison/HospitalComparison";
import FAQ from "./pages/FAQ/FAQ";
import Contact from "./pages/Contact/Contact";
import PublicHealthcare from "./pages/PublicHealthcare/PublicHealthcare";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />
        <Route path="/team" element={<About />} />
        <Route path="/find-hospitals" element={<HospitalFinder />} />
        <Route path="/compare" element={<HospitalComparison />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/public-healthcare" element={<PublicHealthcare />} />

        <Route path="/chatbot" element={<Chatbot />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

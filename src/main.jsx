import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/globals.css";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { HospitalSearchProvider } from "./context/HospitalSearchContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <HospitalSearchProvider>
          <App />
        </HospitalSearchProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);

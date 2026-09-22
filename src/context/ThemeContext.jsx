import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const ThemeContext = createContext(null);

/* =================================
   DEFAULTS
================================= */

const DEFAULT_THEME = "cyber";
const DEFAULT_MODE = "dark";

/* =================================
   DEVELOPMENT THEME
   ---------------------------------
   Change these values while
   designing/testing the boilerplate.
================================= */

// available themes : cyber, minimal, brutalist, luxury, aurora

const DEV_THEME = "vital";
const DEV_MODE = "light";

/*
  true  → always use DEV_THEME / DEV_MODE
  false → use saved/profile preferences
*/
const USE_DEV_THEME = true;

/* =================================
   VALID VALUES
================================= */

const VALID_THEMES = [
  "cyber",
  "aurora",
  "luxury",
  "minimal",
  "brutalist",
  "eco",
  "civic",
  "resolve",
  "vital",
  "learn",
  "agri",
  "transit",
  "relief",
];

const VALID_MODES = ["dark", "light"];

/* =================================
   INITIAL THEME
================================= */

function getInitialTheme() {
  /* Development override */

  if (USE_DEV_THEME) {
    return VALID_THEMES.includes(DEV_THEME) ? DEV_THEME : DEFAULT_THEME;
  }

  /* SSR safety */

  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  /* Saved browser preference */

  const savedTheme = localStorage.getItem("hackathon-theme");

  return VALID_THEMES.includes(savedTheme) ? savedTheme : DEFAULT_THEME;
}

/* =================================
   INITIAL MODE
================================= */

function getInitialMode() {
  /* Development override */

  if (USE_DEV_THEME) {
    return VALID_MODES.includes(DEV_MODE) ? DEV_MODE : DEFAULT_MODE;
  }

  /* SSR safety */

  if (typeof window === "undefined") {
    return DEFAULT_MODE;
  }

  /* Saved browser preference */

  const savedMode = localStorage.getItem("hackathon-mode");

  return VALID_MODES.includes(savedMode) ? savedMode : DEFAULT_MODE;
}

/* =================================
   PROVIDER
================================= */

function ThemeProvider({ children }) {
  const { user, profile, updateProfile } = useAuth();

  const [theme, setTheme] = useState(getInitialTheme);

  const [mode, setMode] = useState(getInitialMode);

  const [profileSynced, setProfileSynced] = useState(false);

  /* =================================
     APPLY THEME + MODE
  ================================= */

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    document.documentElement.dataset.mode = mode;

    /*
      Only persist preferences when
      development override is disabled.
    */

    if (!USE_DEV_THEME) {
      localStorage.setItem("hackathon-theme", theme);

      localStorage.setItem("hackathon-mode", mode);
    }
  }, [theme, mode]);

  /* =================================
     LOAD PROFILE PREFERENCES
     ---------------------------------
     Only used when DEV mode is off.
  ================================= */

  useEffect(() => {
    /*
      Development mode completely ignores
      authenticated profile preferences.
    */

    if (USE_DEV_THEME || !user || !profile || profileSynced) {
      return;
    }

    const profileTheme = VALID_THEMES.includes(profile.preferred_theme)
      ? profile.preferred_theme
      : null;

    const profileMode = VALID_MODES.includes(profile.preferred_mode)
      ? profile.preferred_mode
      : null;

    if (profileTheme) {
      setTheme(profileTheme);
    }

    if (profileMode) {
      setMode(profileMode);
    }

    setProfileSynced(true);
  }, [user, profile, profileSynced]);

  /* =================================
     RESET PROFILE SYNC ON LOGOUT
  ================================= */

  useEffect(() => {
    if (!user) {
      setProfileSynced(false);
    }
  }, [user]);

  /* =================================
     CHANGE MODE
  ================================= */

  const changeMode = useCallback(
    async (nextMode) => {
      if (!VALID_MODES.includes(nextMode)) {
        return;
      }

      setMode(nextMode);

      /*
        Don't write development testing
        values into the user's profile.
      */

      if (!USE_DEV_THEME && user) {
        await updateProfile({
          preferred_mode: nextMode,
        });
      }
    },
    [user, updateProfile],
  );

  /* =================================
     TOGGLE MODE
     ---------------------------------
     Kept in the context so a ThemeToggle
     component can still be added later
     without changing the architecture.
  ================================= */

  const toggleMode = useCallback(() => {
    setMode((currentMode) => {
      const nextMode = currentMode === "dark" ? "light" : "dark";

      /*
        Only persist to profile when
        not using the developer override.
      */

      if (!USE_DEV_THEME && user) {
        updateProfile({
          preferred_mode: nextMode,
        });
      }

      return nextMode;
    });
  }, [user, updateProfile]);

  /* =================================
     CHANGE THEME
  ================================= */

  const changeTheme = useCallback(
    async (nextTheme) => {
      if (!VALID_THEMES.includes(nextTheme)) {
        return;
      }

      setTheme(nextTheme);

      /*
        Only persist to profile when
        not using the developer override.
      */

      if (!USE_DEV_THEME && user) {
        await updateProfile({
          preferred_theme: nextTheme,
        });
      }
    },
    [user, updateProfile],
  );

  /* =================================
     CONTEXT VALUE
  ================================= */

  const value = useMemo(
    () => ({
      /* Current values */

      theme,
      mode,

      /* Theme controls */

      setTheme: changeTheme,
      setMode: changeMode,
      toggleMode,

      /* Available values */

      themes: VALID_THEMES,
      modes: VALID_MODES,

      /* Developer configuration */

      isDevelopmentOverride: USE_DEV_THEME,
    }),
    [theme, mode, changeTheme, changeMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/* =================================
   HOOK
================================= */

function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}

export { ThemeProvider, useTheme };

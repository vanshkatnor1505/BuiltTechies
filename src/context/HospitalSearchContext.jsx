import { createContext, useContext, useEffect, useMemo, useState } from "react";

const HospitalSearchContext = createContext(null);
const STORAGE_KEY = "curepulse-hospital-search";

function getInitialSearchState() {
  const emptyState = {
    query: "",
    facilities: [],
    compareIds: [],
    researchById: {},
    updatedAt: null,
  };

  try {
    const storedState = window.localStorage.getItem(STORAGE_KEY);
    return storedState ? { ...emptyState, ...JSON.parse(storedState) } : emptyState;
  } catch (error) {
    console.warn("Unable to restore saved hospital comparison data.", error);
    return emptyState;
  }
}

export function HospitalSearchProvider({ children }) {
  const [searchState, setSearchState] = useState(getInitialSearchState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(searchState));
    } catch (error) {
      console.warn("Unable to save hospital comparison data.", error);
    }
  }, [searchState]);

  const value = useMemo(
    () => ({ searchState, setSearchState }),
    [searchState],
  );

  return (
    <HospitalSearchContext.Provider value={value}>
      {children}
    </HospitalSearchContext.Provider>
  );
}

export function useHospitalSearch() {
  const context = useContext(HospitalSearchContext);
  if (!context) {
    throw new Error("useHospitalSearch must be used inside HospitalSearchProvider.");
  }
  return context;
}

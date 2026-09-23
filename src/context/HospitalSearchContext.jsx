import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
    if (!storedState) {
      return emptyState;
    }

    const parsedState = JSON.parse(storedState);

    return {
      ...emptyState,
      ...parsedState,
      facilities: Array.isArray(parsedState.facilities)
        ? parsedState.facilities
        : [],
      compareIds: Array.isArray(parsedState.compareIds)
        ? parsedState.compareIds
        : [],
      researchById:
        parsedState.researchById &&
        typeof parsedState.researchById === "object"
          ? parsedState.researchById
          : {},
    };
  } catch (error) {
    console.warn("Unable to restore saved hospital comparison data.", error);
    return emptyState;
  }
}

export function HospitalSearchProvider({ children }) {
  const [searchState, setSearchState] = useState(getInitialSearchState);

  const toggleCompare = useCallback((facility) => {
    const facilityId = facility?.id;

    if (!facilityId) {
      return;
    }

    setSearchState((current) => {
      const currentIds = Array.isArray(current.compareIds)
        ? current.compareIds
        : [];

      const nextIds = currentIds.includes(facilityId)
        ? currentIds.filter((id) => id !== facilityId)
        : currentIds.length < 3
          ? [...currentIds, facilityId]
          : currentIds;

      return { ...current, compareIds: nextIds };
    });
  }, []);

  const clearComparison = useCallback(() => {
    setSearchState((current) => ({
      ...current,
      compareIds: [],
    }));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(searchState));
    } catch (error) {
      console.warn("Unable to save hospital comparison data.", error);
    }
  }, [searchState]);

  const value = useMemo(
    () => ({
      searchState,
      setSearchState,
      toggleCompare,
      clearComparison,
    }),
    [clearComparison, searchState, toggleCompare],
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

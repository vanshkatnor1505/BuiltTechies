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

function createInitialSearchState() {
  return {
    query: "",
    draftQuery: "",
    facilities: [],
    compareIds: [],
    researchById: {},
    updatedAt: null,
    finder: {
      searchScope: "india",
      radius: 5,
      userLocation: null,
      userState: "",
      locationLabel: "",
      facilityType: "all",
      ownershipFilter: "all",
      schemeFilter: "all",
      emergencyOnly: false,
      sortBy: "match",
      viewMode: "split",
      selectedFacilityId: null,
      route: null,
      resultsPage: 0,
      stateSearchCompleted: false,
      stateCenter: null,
      stateLimitReached: false,
    },
  };
}

export function HospitalSearchProvider({ children }) {
  const [searchState, setSearchState] = useState(createInitialSearchState);

  useEffect(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Unable to clear legacy hospital search data.", error);
    }
  }, []);

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

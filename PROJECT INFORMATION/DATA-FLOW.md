# 🔄 CurePulse Data Flow

## 📋 Table of contents

- [System overview](#-system-overview)
- [Frontend state ownership](#-frontend-state-ownership)
- [Nearby search flow](#-nearby-search-flow)
- [India-wide recommendation flow](#-india-wide-recommendation-flow)
- [Punjab state-level flow](#-punjab-state-level-flow)
- [Hospital research flow](#-hospital-research-flow)
- [Chatbot and upload flow](#-chatbot-and-upload-flow)
- [Error and fallback principles](#-error-and-fallback-principles)

---

## 🗺️ System overview

```mermaid
flowchart TB
    %%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
    BR["🖥️ Browser\nReact routes, components, contexts"]

    GEO[("Geoapify service")]
    NEARBY["Nearby facility data"]

    SB[("Supabase")]
    AUTHF["Authentication /\nprofile flows"]

    subgraph API["🔧 Express API (/api/*)"]
        direction TB
        GRQ[("Groq")] --> CHATR["Chat & speech responses"]
        RSCH[("Research providers")] --> RSCHR["Hospital research"]
        FALL[("Application fallbacks")] --> FALLR["Curated recommendations"]
        FILE[("File parsers")] --> FILER["PDF / audio processing"]
    end

    BR --> GEO --> NEARBY
    BR --> API
    BR --> SB --> AUTHF

    style API fill:#fef3e0,stroke:#FB8C00,color:#111111
```

---

## 🗂️ Frontend state ownership

```mermaid
flowchart TB
    %%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
    subgraph Global["🌐 Global contexts"]
        AUTH["AuthContext\nAuth & profile state"]
        THEME["ThemeContext\ndata-theme / data-mode\nattributes → CSS tokens"]
        HSC["HospitalSearchContext\nSurvives finder ↔ comparison"]
    end

    subgraph HSCDetail["HospitalSearchContext holds"]
        Q["Current search query"]
        FR["Facility results"]
        CID["Selected comparison IDs"]
        RR["Research results by facility ID"]
        META["Last update metadata"]
    end

    subgraph Local["📍 Local page state (transient)"]
        LOAD["Loading & error state"]
        FILT["Active filters & sorting"]
        SEL["Selected facility"]
        VIEW["Map / list / split view"]
        ROUTE["Route loading & geometry"]
        FORM["Form submission state"]
    end

    HSC --- HSCDetail

    style Global fill:#e8f4fd,stroke:#2196F3,color:#111111
    style Local fill:#fef3e0,stroke:#FB8C00,color:#111111
    style HSCDetail fill:#f5f5f5,stroke:#616161,color:#111111
```

| Context | Owns |
| --- | --- |
| **`AuthContext`** | Authentication and profile-related state. Shared navigation controls use this to render the correct signed-in / signed-out experience. |
| **`ThemeContext`** | The active visual theme and mode. Applied via `data-theme` and `data-mode` attributes consumed by the CSS token system. |
| **`HospitalSearchContext`** | Search state that needs to survive between the finder and comparison experiences — query, facility results, comparison IDs, research results by facility ID, and last-update metadata. |
| **Local page state** | Transient concerns: loading/error state, filters/sorting, selected facility, current view, route geometry, form status. |

---

## 📍 Nearby search flow

```mermaid
sequenceDiagram
    %%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
    actor U as User
    participant Br as Browser
    participant Finder as Finder Page
    participant Geo as Geoapify

    U->>Br: Grant geolocation permission
    Br-->>Finder: lat, lng, accuracy
    Finder->>Geo: Request nearby facilities (location + radius)
    Geo-->>Finder: Raw facility features
    Finder->>Finder: Validate & transform → facility objects
    Finder->>Finder: Discard invalid coordinates / malformed features
    Finder->>Finder: Filter by radius & user criteria
    Finder->>Finder: Update HospitalSearchContext
    Finder->>Finder: Render list & map from same normalized objects
```

1. The browser requests geolocation permission.
2. The finder receives latitude, longitude, and accuracy.
3. The frontend calls the Geoapify service with the location and radius.
4. Geoapify features are validated and transformed into application facility objects.
5. Invalid coordinates or malformed features are discarded.
6. Results are filtered by radius and user-selected criteria.
7. The search context is updated for comparison and later navigation.
8. The list and map render the same normalized facility objects.

---

## 🌏 India-wide recommendation flow

```mermaid
flowchart TD
    %%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
    A["User enters healthcare search"] --> B["Mark recommendations as loading"]
    B --> C["Request /api/state-hospital-recommendations"]
    C --> D{"Response valid?"}
    D -->|"Yes"| E["Normalize into facility cards"]
    D -->|"No / unavailable"| F["Display curated fallback hospitals"]
    E --> G["Loading ends"]
    F --> G

    style D fill:#fff3cd,stroke:#c9a300,color:#111111
    style F fill:#fdecea,stroke:#c62828,color:#111111
    style G fill:#eafaf1,stroke:#2E7D32,color:#111111
```

1. The user enters a healthcare search.
2. The frontend marks recommendations as loading.
3. The frontend requests `/api/state-hospital-recommendations`.
4. The response is validated before its recommendation data is used.
5. The results are normalized into facility cards.
6. If research is unavailable, curated fallback hospitals are displayed.
7. Loading ends only after facilities are available or an error/fallback is established.

---

## 📌 Punjab state-level flow

```mermaid
flowchart LR
    %%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
    CUR["Curated Punjab\nhospital list"] -->|"Normalize"| FM["Same facility shape\nas nearby / India-wide"]
    FM --> CARD["Facility cards"]
    FM --> MAP["Maps"]
    FM --> COMPARE["Comparison"]
    FM --> NAV["Navigation"]
```

The state-level UI currently uses a curated list of top Punjab hospitals. This provides a predictable state-level experience and avoids presenting empty or unrelated results when a user selects the state-level option.

The curated entries are normalized into the same facility shape used by nearby and India-wide results, so cards, maps, comparison, and navigation can reuse the same presentation logic.

---

## 🔬 Hospital research flow

```mermaid
sequenceDiagram
    %%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
    actor U as User
    participant FE as Frontend
    participant BE as Express Backend
    participant P as Research Providers
    participant CTX as Search Context

    U->>FE: Choose "research" on a facility
    FE->>BE: Send name, address, website
    BE->>P: Call configured research providers
    P-->>BE: Research data
    BE-->>FE: Normalized data or explicit error
    FE->>CTX: Store result by facility ID
    CTX-->>FE: Facility card & comparison view render stored result
```

1. A user chooses a research action on a facility.
2. The frontend sends the facility name, address, and website to the backend.
3. The backend calls configured research providers.
4. The backend returns normalized research data or an explicit error.
5. The frontend stores the result by facility ID in search context.
6. The facility card and comparison view can render the stored result.

---

## 🤖 Chatbot and upload flow

```mermaid
sequenceDiagram
    %%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
    actor U as User
    participant FE as Chatbot Page
    participant BE as Express API
    participant Prov as Configured Provider

    U->>FE: Enter message or select report/audio file
    FE->>BE: Send request
    BE->>BE: Validate request
    BE->>Prov: Invoke provider
    alt Upload present
        Prov-->>BE: Parsed / transcribed content
    end
    Prov-->>BE: Response
    BE-->>FE: Response or clear failure message
    FE->>FE: Render result & preserve conversation state
```

1. The user enters a message or selects a report/audio file.
2. The frontend sends the request to the Express API.
3. The backend validates the request and invokes the configured provider.
4. Uploaded content is parsed or transcribed when the relevant service is configured.
5. The backend returns a response or a clear failure message.
6. The frontend renders the assistant result and preserves the conversation state required by the page.

---

## ⚠️ Error and fallback principles

- 🚫 Never treat an unfinished request as an empty result.
- ⏳ Set loading state before starting an async operation.
- ✅ Validate HTTP status and response shape.
- 🔔 Show a user-readable error when a provider fails.
- 📋 Use curated fallback data only when it is clearly presented as a starting point.
- 🕒 Keep stale responses from overwriting newer searches.
- 🔐 Do not expose provider credentials in frontend code.
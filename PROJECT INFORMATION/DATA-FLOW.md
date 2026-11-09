# 🔄 CurePulse Data Flow

## 📋 Table of contents

- [System overview](#-system-overview)
- [Frontend state ownership](#-frontend-state-ownership)
- [Nearby search flow](#-nearby-search-flow)
- [India-wide recommendation flow](#-india-wide-recommendation-flow)
- [Punjab state-level flow](#-punjab-state-level-flow)
- [Hospital research flow](#-hospital-research-flow)
- [Chatbot and upload flow](#-chatbot-and-upload-flow)
- [Public healthcare reports flow](#-public-healthcare-reports-flow)
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
    AUTHF["Authentication &\nprofile flows"]
    REPORTDB["Private reports /\napproved category counts"]

    subgraph API["🔧 Express API (/api/*)"]
        direction TB
        GRQ[("Groq")] --> CHATR["Chat, speech, report analysis,\nestimates & extraction"]
        TVLY[("Tavily")] --> RSCHR["Recommendations &\nhospital research"]
        FALL[("Application fallbacks")] --> FALLR["Curated recommendations"]
        FILE[("PDF parser")] --> FILER["Report text extraction"]
        PUB["Public report endpoints"]
    end

    BR --> GEO --> NEARBY
    BR -->|"Authenticated features"| API
    BR --> SB --> AUTHF
    BR -->|"Anonymous report calls"| PUB
    PUB --> SB --> REPORTDB

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
        LANG["LanguageProvider\nEnglish / Hindi / Punjabi"]
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
| **`HospitalSearchContext`** | Search state that needs to survive between the finder and comparison experiences — query, facility results, comparison IDs, research results by facility ID, and last-update metadata. This state is persisted in browser `localStorage`. |
| **`LanguageProvider`** | The selected English, Hindi, or Punjabi interface language. Uses the bundled translation catalog and stores the selection in browser `localStorage`; switching languages does not call a translation API. |
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

### Compatibility and distance

Compatibility uses listed specialty keyword evidence (weight 70) and
emergency evidence (weight 10) for emergency searches; included dimensions
are normalized. Distance is not an input to the score and remains available
separately for display, filtering, and sorting. When specialty details are
absent, specialty fit starts at 50% and is an estimate, not a verified match.

---

## 🌏 India-wide recommendation flow

```mermaid
flowchart TD
    %%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
    A["Signed-in user enters healthcare search"] --> B["Mark recommendations as loading"]
    B --> C["POST /api/state-hospital-recommendations\nwith Supabase session"]
    C --> D{"Tavily configured\nand request succeeds?"}
    D -->|"Yes"| E["Use source-backed results"]
    D -->|"No key"| F["Backend returns curated fallback data"]
    D -->|"Provider / request error"| G["Frontend shows curated hospitals\nand an error message"]
    E --> H["Normalize into facility cards"]
    F --> H
    G --> H
    H --> I["Save facilities in search context"]

    style D fill:#fff3cd,stroke:#c9a300,color:#111111
    style F fill:#fdecea,stroke:#c62828,color:#111111
    style I fill:#eafaf1,stroke:#2E7D32,color:#111111
```

1. A signed-in user enters a healthcare search; the frontend requests a Supabase session token.
2. The frontend posts the disease/treatment and optional state to `/api/state-hospital-recommendations`.
3. If Tavily is configured, the backend searches and returns source-backed results. Without Tavily, it returns curated India-wide hospitals and resources.
4. If the provider request fails, the frontend shows curated hospitals with an error message rather than treating the failure as an empty result.
5. Valid results are normalized into facility objects and saved in `HospitalSearchContext`.

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
    BE-->>FE: Normalized data, source links, or explicit error
    FE->>CTX: Store result by facility ID
    CTX-->>FE: Facility card & comparison view render stored result
```

1. A user chooses a research action on a facility.
2. The frontend sends the facility name, address, and website to the backend.
3. The backend calls configured research providers.
4. The backend returns normalized research data or an explicit error.
5. The frontend stores the result by facility ID in search context.
6. The facility card and comparison view can render the stored result and its
   source titles/links. Only valid HTTP(S) links are rendered.

The research request requires the backend and any configured provider. The
bundled interface translations do not; language selection is independent of
the research flow.

---

## 🤖 Chatbot and upload flow

```mermaid
sequenceDiagram
    %%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
    actor U as User
    participant FE as Chatbot Page
    participant BE as Express API
    participant Groq as Groq
    participant PDF as PDF parser

    U->>FE: Send healthcare messages
    FE->>BE: POST /api/chat (messages, language, session)
    BE->>Groq: Generate healthcare-focused reply
    Groq-->>BE: Reply
    BE-->>FE: { success, message, language }
    U->>FE: Upload PDF or record audio
    alt PDF medical report
        FE->>BE: POST /api/analyze-report (report, language, session)
        BE->>PDF: Extract report text
        BE->>Groq: Explain report without diagnosing
        Groq-->>BE: Analysis
        BE-->>FE: { success, analysis, filename, pages, language }
    else Voice input
        FE->>BE: POST /api/transcribe (audio, language, session)
        BE->>Groq: Transcribe supported audio
        Groq-->>BE: Transcript
        BE-->>FE: { success, text, language }
    end
```

Chat, PDF analysis, and transcription require a valid Supabase session. PDF
uploads are limited to 10 MB and must contain extractable text; scanned
image-only PDFs are not OCR-processed. Audio is sent separately from chat and
supports English, Hindi, and Punjabi. Speech playback uses browser speech
synthesis rather than a backend audio-generation endpoint.

---

## 🏥 Public healthcare reports flow

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Public Healthcare Page
    participant API as Express API
    participant SB as Supabase
    participant Reviewer as Report reviewer

    U->>FE: Submit hospital, location, category and optional details
    FE->>API: POST /api/public-healthcare/reports (no account required)
    API->>SB: Store report with pending status
    API-->>FE: Acknowledge receipt
    Reviewer->>SB: Approve or reject report
    FE->>API: GET /api/public-healthcare/issue-trends
    API->>SB: Count approved reports by category
    SB-->>API: Category totals only
    API-->>FE: Approved category totals
```

Reports are submitted anonymously and remain private while pending review.
Only counts for approved categories are returned publicly; hospital names and
report details are not included in the trends response. This is a community
reporting feature, not an official grievance channel.

---

## ⚠️ Error and fallback principles

- 🚫 Never treat an unfinished request as an empty result.
- ⏳ Set loading state before starting an async operation.
- ✅ Validate HTTP status and response shape.
- 🔔 Show a user-readable error when a provider fails.
- 📋 Use curated fallback data only when it is clearly presented as a starting point.
- 🕒 Keep stale responses from overwriting newer searches.
- 🔐 Do not expose provider credentials in frontend code.
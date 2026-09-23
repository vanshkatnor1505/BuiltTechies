# 🔌 API and Integration Summary

The Express backend connects the React application to AI, research, upload, and health-check services. The frontend uses **Geoapify directly** for nearby healthcare search, and uses the **backend** for provider integrations that require server-side credentials.

---

## 📋 Table of contents

- [Integration flow at a glance](#-integration-flow-at-a-glance)
- [Backend endpoints](#-backend-endpoints)
- [Main request examples](#-main-request-examples)
- [Integration responsibilities](#-integration-responsibilities)
- [Implementation principles](#-implementation-principles)

---

## 🗺️ Integration flow at a glance

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
flowchart LR
    FE["🖥️ React Frontend"]

    subgraph BE["🔧 Express Backend"]
        H["/health\n/api/health"]
        REC["/api/state-hospital-\nrecommendations"]
        CHAT["/api/chat"]
        UP["Upload route\n(server.js)"]
        RSCH["/api/hospital-research"]
    end

    GEO[("Geoapify")]
    GRQ[("Groq")]
    TAV[("Tavily")]
    GS[("Google Search")]
    SB[("Supabase")]

    FE -->|"Direct call"| GEO
    FE -->|"Direct call"| SB
    FE -->|"HTTP"| H
    FE -->|"HTTP"| REC
    FE -->|"HTTP"| CHAT
    FE -->|"HTTP\n(report/audio)"| UP
    FE -->|"HTTP"| RSCH

    REC --> TAV
    REC --> GS
    CHAT --> GRQ
    UP --> GRQ
    RSCH --> TAV
    RSCH --> GS

    style FE fill:#e8f4fd,stroke:#2196F3,color:#111111
    style BE fill:#fef3e0,stroke:#FB8C00,color:#111111
```

**Key principle:** every route that needs a secret provider key sits behind the backend; the frontend only talks directly to services that use publishable/client-safe keys (Geoapify, Supabase).

---

## 🧭 Backend endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Confirms that the backend is running |
| `GET` | `/api/health` | API health check |
| `POST` | `/api/state-hospital-recommendations` | Returns researched or fallback hospital recommendations |
| `POST` | `/api/chat` | Sends a message to the healthcare assistant |
| `POST` | Upload route in `src/server/server.js` | Processes report/audio assistant inputs |
| `POST` | `/api/hospital-research` | Researches a selected hospital |

---

## 📨 Main request examples

### 1. Hospital recommendations

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
sequenceDiagram
    participant FE as React Frontend
    participant API as /api/state-hospital-recommendations
    participant R as Tavily / Google Search
    participant DB as Curated fallback data

    FE->>API: POST { disease, state }
    API->>R: Query live research provider
    alt Provider available
        R-->>API: Research results
        API-->>FE: { hospitals, resources, recommendations }
    else Provider unavailable
        API->>DB: Load curated data
        DB-->>API: Fallback dataset
        API-->>FE: Clearly labeled fallback response
    end
    FE->>FE: Validate response before rendering
```

**Request:**

```json
{
  "disease": "kidney treatment",
  "state": "Punjab"
}
```

The response may contain `hospitals`, `resources`, or `recommendations`. The frontend validates the response and falls back to curated data when live research is unavailable.

---

### 2. Healthcare assistant

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
sequenceDiagram
    participant FE as Chatbot Page
    participant API as /api/chat
    participant GRQ as Groq

    FE->>API: POST { message }
    API->>GRQ: Forward prompt with server credential
    GRQ-->>API: Assistant response
    API-->>FE: { response }
    FE->>FE: Render reply / show error state on failure
```

**Request:**

```json
{
  "message": "What should I consider when comparing hospitals?"
}
```

The assistant uses the configured Groq integration and returns a response handled by the chatbot page.

---

### 3. Hospital research

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
sequenceDiagram
    participant FE as Facility Card / Comparison Page
    participant API as /api/hospital-research
    participant CTX as Hospital-search Context

    FE->>API: POST { name, address, website }
    API-->>FE: Research result
    FE->>CTX: Store result by facility ID
    CTX-->>FE: Available to facility card & comparison page
```

**Request:**

```json
{
  "name": "Example Hospital",
  "address": "Example address, India",
  "website": "https://example.org"
}
```

The result is stored by facility ID in the shared hospital-search context so the facility card and comparison page can use it.

---

## 🧩 Integration responsibilities

| Integration | Responsibility |
| --- | --- |
| **Geoapify** | Nearby healthcare facilities and location search |
| **Express** | Backend API boundary and provider orchestration |
| **Groq** | AI assistant and speech-related processing |
| **Tavily / Google** | Optional hospital research providers |
| **Supabase** | Authentication and profile-related services |
| **Map / route providers** | Facility maps and navigation support |

---

## 🛡️ Implementation principles

- 🔐 Provider secrets remain on the backend.
- ✅ Request and response data is validated before rendering.
- ⏳ Async operations expose loading, empty, success, and error states.
- ⚠️ Provider failures produce explicit user-facing errors or clearly labeled curated fallbacks.
- 📄 The full implementation is in [`src/server/server.js`](../src/server/server.js).

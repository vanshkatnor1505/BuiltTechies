# 🏛️ CurePulse Architecture

## 📋 Table of contents

- [Architecture summary](#-architecture-summary)
- [Repository organization](#-repository-organization)
- [Route architecture](#-route-architecture)
- [Shared state](#-shared-state)
- [Main data boundaries](#-main-data-boundaries)
- [Maintainability principles](#-maintainability-principles)
- [Why this architecture fits the product](#-why-this-architecture-fits-the-product)

---

## 🧭 Architecture summary

CurePulse uses a **React single-page frontend** with an **Express backend**. The frontend owns page composition, interaction, local UI state, and presentation. The backend owns provider orchestration, file processing, and credentials that must not be exposed in the browser.

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
flowchart TB
    subgraph FE["⚛️ React Application"]
        direction LR
        R["Routes & pages"]
        C["Reusable components"]
        CTX["Shared context"]
        SVC["Service modules"]
        U["Utility functions"]
    end

    subgraph API["🔧 Express API"]
        direction LR
        A1["Hospital\nrecommendations"]
        A2["Hospital\nresearch"]
        A3["AI\nassistant"]
        A4["File-assisted\nworkflows"]
    end

    subgraph EXT["☁️ External Services"]
        direction LR
        E1[("Geoapify")]
        E2[("Supabase")]
        E3[("Groq")]
        E4[("Tavily /\nGoogle research")]
        E5[("Map & route\nproviders")]
    end

    FE -->|"HTTP requests"| API
    API -->|"Provider calls\nwith server credentials"| EXT

    style FE fill:#e8f4fd,stroke:#2196F3,color:#111111
    style API fill:#fef3e0,stroke:#FB8C00,color:#111111
    style EXT fill:#eafaf1,stroke:#2E7D32,color:#111111
```

> **Layer principle:** the frontend never talks to a credentialed provider directly — every such call is routed through the Express layer, which orchestrates the provider and returns a normalized response.

---

## 📁 Repository organization

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
flowchart LR
    ROOT["CurePulse repo"] --> PAGES["src/pages\nRoute-level screens"]
    ROOT --> COMP["src/components\nReusable UI"]
    ROOT --> CTX["src/context\nShared state"]
    ROOT --> SVC["src/services\nExternal clients"]
    ROOT --> UTIL["src/utils\nHelpers & domain logic"]
    ROOT --> SERVER["src/server\nExpress routes & providers"]
    ROOT --> STYLES["src/styles\nTheme tokens"]
    ROOT --> PUBLIC["public\nStatic assets"]

    PAGES --> COMP
    PAGES --> CTX
    PAGES --> SVC
    SVC --> UTIL
    SERVER --> UTIL

    style ROOT fill:#f5f5f5,stroke:#616161,color:#111111
```

| Directory | Responsibility |
| --- | --- |
| `src/pages` | Route-level screens and feature composition |
| `src/components` | Reusable UI and composed layout components |
| `src/context` | Shared authentication, theme, and search state |
| `src/services` | External service clients such as Geoapify |
| `src/utils` | Focused reusable helpers and domain logic |
| `src/server` | Express routes, provider calls, and file processing |
| `src/styles` | Global resets, theme tokens, and design variables |
| `public` | Static assets and public documents |

---

## 🧭 Route architecture

Routes are defined in [`src/App.jsx`](../src/App.jsx):

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
flowchart LR
    APP["App.jsx\nRouter"] --> HOME["/\nEntry points"]
    APP --> FIND["/find-hospitals\nSearch, filter, map"]
    APP --> COMPARE["/compare\nFacility comparison"]
    APP --> BOT["/chatbot\nAI assistant"]
    APP --> TEAM["/team"]
    APP --> FAQ["/faq"]
    APP --> CONTACT["/contact\nContact form"]
    APP --> ANALYTICS["/analytics"]

    FIND -.->|"Selected facility IDs"| COMPARE
```

| Route | Page responsibility |
| --- | --- |
| `/` | Product introduction and primary entry points |
| `/find-hospitals` | Search, filter, map, and facility selection |
| `/compare` | Compare selected facilities |
| `/chatbot` | AI healthcare assistant |
| `/team` | Team information |
| `/faq` | Common questions |
| `/contact` | Contact form |
| `/analytics` | Analytics view |

---

## 🔗 Shared state

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
flowchart TB
    subgraph Global["🌐 Global context — crosses page boundaries"]
        AUTH["AuthContext\nAuthentication & profile"]
        THEME["ThemeContext\nActive theme & display mode"]
        HSC["HospitalSearchContext\nFacility results, comparison IDs, research"]
    end

    subgraph Local["📍 Page-local state"]
        FILT["Filters"]
        SEL["Selected facilities"]
        LOAD["Loading indicators"]
        ERR["Errors"]
        MAP["Map view / routes"]
        FORM["Form status"]
    end

    HSC -.->|"shared between"| FindPage["/find-hospitals"]
    HSC -.->|"shared between"| ComparePage["/compare"]

    style Global fill:#e8f4fd,stroke:#2196F3,color:#111111
    style Local fill:#fef3e0,stroke:#FB8C00,color:#111111
```

- **`AuthContext`** manages authentication and profile state.
- **`ThemeContext`** manages the active visual theme and display mode.
- **`HospitalSearchContext`** shares facility results, comparison IDs, and research results between the finder and comparison pages.
- **Page-local state** controls filters, selected facilities, loading indicators, errors, map view, routes, and form status.

> This keeps global state limited to information that genuinely crosses page boundaries.

---

## 🧱 Main data boundaries

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
flowchart LR
    GEO["Geoapify raw data"] -->|"Normalize"| FM["Normalized\nfacility object"]
    PUNJAB["Curated Punjab data"] -->|"Same model"| FM
    FM --> RENDER["Rendered in UI"]

    BE["Backend response"] -->|"Validate before use"| CONSUME["Consumed by frontend"]

    RSCH["Hospital research result"] -->|"Stored by facility ID"| CTX2["Shared context"]
    CTX2 --> CARD["Facility card"]
    CTX2 --> COMP2["Comparison page"]

    CRED["Provider credentials"] -.->|"Never leave"| BACKEND["Backend only"]

    style CRED fill:#fdecea,stroke:#c62828,color:#111111
    style BACKEND fill:#fdecea,stroke:#c62828,color:#111111
```

- Geoapify data is transformed into a **normalized facility object** before it is rendered.
- Backend responses are **checked before their data is consumed**.
- Curated Punjab hospitals use the **same facility model** as live results.
- Hospital research is **stored by facility ID** so cards and comparison can reuse it.
- Provider credentials **remain on the backend**.

---

## 🛠️ Maintainability principles

- Use single-purpose modules and functions.
- Keep external integrations behind service or server boundaries.
- Reuse shared components and theme tokens.
- Keep loading, empty, error, and success states explicit.
- Use descriptive names and avoid duplicated domain logic.
- Preserve the normalized facility shape across search modes.
- Make changes in the narrowest appropriate layer.

---

## 💡 Why this architecture fits the product

The architecture allows the hospital finder, map, comparison, and research features to share **one facility model** without duplicating presentation logic. Provider integrations can change independently from the UI, while context providers preserve important user selections across pages. This supports incremental growth without turning the application into one tightly coupled component.

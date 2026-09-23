# CurePulse Judge Documentation

This folder contains only the documentation needed to understand and evaluate
the CurePulse product.

## Documentation map

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'primaryColor':'#ffffff','primaryTextColor':'#111111','primaryBorderColor':'#555555','lineColor':'#555555','secondaryColor':'#f5f5f5','tertiaryColor':'#ffffff','fontSize':'15px','darkMode':false,'background':'#ffffff'}}}%%
flowchart TD
    A[Judge starts here] --> B[PROJECT-OVERVIEW.md]
    B --> C[artitecture.md]
    C --> D[DATA-FLOW.md]
    D --> E[API-REFERENCE.md]
    B --> F[DESIGN.md]

    B -. product purpose and features .-> G[What CurePulse solves]
    C -. code organization .-> H[How the code is structured]
    D -. request and state flow .-> I[How features work]
    E -. backend capabilities .-> J[How integrations connect]
    F -. visual system .-> K[How the interface is designed]
```

## Recommended reading order

1. [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) - Product purpose, users,
   features, routes, and scope.
2. [artitecture.md](./artitecture.md) - Code organization and maintainability.
3. [DATA-FLOW.md](./DATA-FLOW.md) - How the frontend, backend, and integrations
   work together.
4. [DESIGN.md](./DESIGN.md) - Theme, styling, responsive behavior, and
   accessibility.
5. [API-REFERENCE.md](./API-REFERENCE.md) - Important backend capabilities.

For installation and deployment commands, use the root
[README.md](../README.md).

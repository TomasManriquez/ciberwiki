# Architecture and Flow Diagrams

## High-Level Component Diagram

```mermaid
graph TB
    subgraph External ["External Services"]
        GoogleOAuth["Google OAuth"]
        GoogleDrive["Google Drive"]
    end

    subgraph Frontend ["Frontend - Port 4321"]
        Astro["Astro SSR"]
        subgraph Pages ["Pages"]
            Dashboard["Dashboard"]
            StandardsPage["Standards"]
            ControlsPage["Controls"]
            EvidencePage["Evidence"]
            WikiPages["Wiki"]
        end
    end

    subgraph Backend ["Backend API - Port 3000"]
        Hono["Hono Server"]
        
        subgraph Middleware ["Middleware"]
            AuthMW["Auth Middleware"]
            Logger["Logger"]
            CORS["CORS"]
        end

        subgraph Modules ["Domain Modules"]
            AuthMod["Auth"]
            StandardsMod["Standards"]
            ControlsMod["Controls"]
            EvidenceMod["Evidence"]
            WikiMod["Wiki"]
            TagsMod["Tags"]
        end

        subgraph Infrastructure ["Infrastructure"]
            DriveService["Drive Service"]
            DrizzleORM["Drizzle ORM"]
        end
    end

    subgraph Database ["Persistence"]
        SQLite[("SQLite")]
    end

    %% External connections
    AuthMod --> GoogleOAuth
    EvidenceMod --> DriveService --> GoogleDrive

    %% Frontend to Backend
    Astro --> Hono

    %% Backend layers
    Hono --> Middleware --> Modules
    Modules --> DrizzleORM --> SQLite

    %% Module relationships
    ControlsMod -.-> StandardsMod
    EvidenceMod -.-> ControlsMod
    WikiMod -.-> ControlsMod
    TagsMod -.-> WikiMod
    TagsMod -.-> EvidenceMod
    TagsMod -.-> ControlsMod
```

## System Architecture

```mermaid
graph TD
    subgraph Client ["Frontend - Astro"]
        Browser["User Browser"]
        AstroServer["Astro Server SSR"]
        Pages["Pages / Components"]
        Tailwind["Tailwind CSS"]
    end

    subgraph Server ["Backend - Hono"]
        API["Hono API Server"]
        Routers["Routers: Wiki, Auth, etc."]
        Controllers["Controllers"]
        Services["Services"]
        Repos["Repositories"]
        Drizzle["Drizzle ORM"]
    end

    subgraph Data ["Persistence"]
        SQLite[("SQLite Database")]
        LocalDB["local.db"]
    end

    Browser -->|HTTP Request| AstroServer
    AstroServer -->|Fetch Data| API
    Browser -->|Client-side Fetch| API
    
    API --> Routers
    Routers --> Controllers
    Controllers --> Services
    Services --> Repos
    Repos --> Drizzle
    Drizzle --> SQLite
```

## Module Structure

The backend is organized into modules.

```mermaid
classDiagram
    class App {
        +Hono app
    }
    class WikiModule {
        +WikiRouter
        +WikiController
        +WikiService
        +WikiRepository
    }
    class AuthModule {
        +AuthRouter
        +AuthController
        +AuthService
    }
    class StandardsModule {
        +StandardsRouter
        +StandardsController
        +StandardsService
    }
    
    App --> WikiModule
    App --> AuthModule
    App --> StandardsModule
```

## Request Flow: View Wiki Page

This sequence diagram shows the flow when a user views a wiki page.

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Astro as Astro Page (SSR)
    participant API as Hono API
    participant Controller as WikiController
    participant Service as WikiService
    participant DB as SQLite

    User->>Browser: Navigate to /wiki/my-page
    Browser->>Astro: GET /wiki/my-page
    activate Astro
    Astro->>API: GET /api/wiki/my-page
    activate API
    API->>Controller: getBySlug('my-page')
    activate Controller
    Controller->>Service: getBySlug('my-page')
    activate Service
    Service->>DB: Select * from wiki where slug = 'my-page'
    activate DB
    DB-->>Service: Wiki Data
    deactivate DB
    Service-->>Controller: Wiki Object
    deactivate Service
    Controller-->>API: JSON Response
    deactivate Controller
    API-->>Astro: JSON Data
    deactivate API
    Astro-->>Browser: Rendered HTML
    deactivate Astro
    Browser-->>User: Display Page
```

## Request Flow: Create Wiki Page

This sequence diagram shows the flow when a user creates a new wiki page.

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant API as Hono API
    participant Controller as WikiController
    participant Service as WikiService
    participant DB as SQLite

    User->>Browser: Fill Form & Click Save
    Browser->>API: POST /api/wiki (JSON)
    activate API
    API->>Controller: create(data)
    activate Controller
    Controller->>Service: create(data)
    activate Service
    Service->>DB: Insert into wiki ...
    activate DB
    DB-->>Service: Success
    deactivate DB
    Service-->>Controller: New Wiki Object
    deactivate Service
    Controller-->>API: 201 Created
    deactivate Controller
    API-->>Browser: Success Response
    deactivate API
    Browser->>Browser: Redirect to new page
```

## Entity Relationship Diagram

This diagram shows the database schema and relationships.

```mermaid
erDiagram
    users ||--o{ controls : "assigned to"
    users ||--o{ evidence : "uploaded by"
    users ||--o{ pages : "last edited by"
    
    standards ||--|{ controls : "has"
    
    controls ||--o{ evidence : "has"
    controls ||--o{ pages : "documented in"
    
    tags ||--o{ items_tags : "tagged in"

    users {
        string id PK
        string email
        string name
        string avatar
        timestamp created_at
        string password
    }

    standards {
        string id PK
        string name
        string description
        string version
        timestamp created_at
    }

    controls {
        string id PK
        string standard_id FK
        string code
        string title
        string description
        string status
        string assigned_to FK
        timestamp created_at
    }

    evidence {
        string id PK
        string control_id FK
        string name
        string description
        string file_url
        string uploaded_by FK
        string content_text
        timestamp created_at
    }

    tags {
        string id PK
        string name
        string color
        timestamp created_at
    }

    items_tags {
        string id PK
        string item_id
        string tag_id FK
        string item_type
    }

    pages {
        string id PK
        string title
        string slug
        string content
        string parent_id
        string related_control_id FK
        string google_doc_id
        string last_edited_by FK
        timestamp created_at
        timestamp updated_at
    }
```



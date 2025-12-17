# Allware Wiki - Implementation Walkthrough

## Project Overview

Allware Wiki is a modern, secure documentation platform designed for IT companies to manage cybersecurity standards (CIS Controls, ISO 27002, etc.), audit evidence, and compliance tracking with Google Drive integration.

## Architecture

### Monorepo Structure
```
AllwareWiki/
├── apps/
│   ├── api/          # Backend (Hono + Drizzle + SQLite)
│   └── web/          # Frontend (Astro + Tailwind)
├── docker-compose.yml
└── package.json
```

### Backend Architecture (Layered Pattern)

**Technology Stack:**
- **Framework**: Hono (Fast, lightweight)
- **ORM**: Drizzle ORM
- **Database**: SQLite (via @libsql/client)
- **Testing**: Vitest (TDD approach)

**Layers:**
1. **Router Layer** (`src/routers/`): API endpoint definitions
2. **Controller Layer** (`src/controllers/`): Request/response handling
3. **Service Layer** (`src/services/`): Business logic
4. **Repository Layer** (`src/repositories/`): Data access abstraction
5. **Model Layer** (`src/db/schema.ts`): Database schema definitions

### Database Schema

#### Tables Implemented:

**users**
- `id` (PK)
- `email` (unique)
- `name`, `avatar`
- `createdAt`

**standards** - Compliance frameworks (CIS, ISO, etc.)
- `id` (PK)
- `name`, `description`, `version`
- `createdAt`

**controls** - Individual controls within standards
- `id` (PK)
- `standardId` (FK → standards.id)
- `code` (e.g., "1.1")
- `title`, `description`
- `status` (pending/in-progress/completed)
- `assignedTo` (FK → users.id)
- `createdAt`

**evidence** - Audit evidence files
- `id` (PK)
- `controlId` (FK → controls.id)
- `name`, `description`
- `fileUrl` (Google Drive URL)
- `uploadedBy` (FK → users.id)
- `createdAt`

## API Endpoints

### Standards API (`/api/standards`)
- `POST /` - Create standard
- `GET /` - List all standards
- `GET /:id` - Get standard by ID
- `PUT /:id` - Update standard
- `DELETE /:id` - Delete standard

### Controls API (`/api/controls`)
- `POST /` - Create control
- `GET /` - List all controls
- `GET /standard/:standardId` - Get controls by standard
- `GET /:id` - Get control by ID
- `PUT /:id` - Update control
- `DELETE /:id` - Delete control

### Evidence API (`/api/evidence`)
- `POST /` - Upload evidence
- `GET /` - List all evidence
- `GET /control/:controlId` - Get evidence by control
- `GET /:id` - Get evidence by ID
- `PUT /:id` - Update evidence
- `DELETE /:id` - Delete evidence

## Frontend Implementation

### Design System

**Theme**: Premium dark mode with purple/blue gradients

**Key Features:**
- Glassmorphism effects (`glass-card` class)
- Smooth animations and transitions
- Gradient text effects
- Responsive design
- Premium UI components (buttons, inputs, badges)

**Color Palette:**
- Primary: Purple-Blue gradient
- Background: Dark slate with animated gradient overlays
- Accents: Purple, Blue, Pink

### Pages Implemented

#### 1. Landing Page (`/`)
- Hero section with gradient text
- Feature cards showcasing key capabilities
- Stats section
- Call-to-action buttons

#### 2. Dashboard (`/dashboard`)
- Stats grid (Standards, Controls, Compliance Rate, Evidence)
- Recent activity feed
- Quick action cards

#### 3. Standards Page (`/standards`)
- Dynamic data from API
- Card-based layout
- Real-time status badges
- Add New Standard button

#### 4. Controls Page (`/controls`)
- List all controls with status badges
- Filter by status (pending, in-progress, completed)
- Create Control modal form
- Interactive "Add Control" button

#### 5. Evidence Page (`/evidence`)
- List all uploaded evidence files
- Link to Google Drive files
- Upload Evidence modal form
- File metadata display

### Components

**Navigation** - Fixed top nav with logo and menu links  
**Layout** - Base layout with animated background effects  
**Modal** - Reusable modal component for forms

## Testing

### Test-Driven Development (TDD)

Implemented unit tests for the Service layer:

```typescript
// Example: StandardsService test
describe('StandardsService', () => {
  it('should create a new standard', async () => {
    const result = await service.createStandard({
      name: 'CIS Controls',
      version: 'v8'
    });
    expect(result.id).toBeDefined();
    expect(result.name).toBe('CIS Controls');
  });
});
```

**Test Status**: ✅ All tests passing

## Docker Configuration

### Services:
1. **API**: Port 3000
2. **Web**: Port 4321

Both services configured with hot-reload for development.

## Key Achievements

✅ **Scalable Architecture**: Clean separation of concerns with layered pattern  
✅ **Type Safety**: Full TypeScript implementation  
✅ **Modern UI**: Premium design with glassmorphism and animations  
✅ **Test Coverage**: TDD approach with Vitest  
✅ **API Integration**: Frontend successfully consuming backend API  
✅ **Database Flexibility**: Generic "Standards" model supports CIS, ISO, and custom frameworks  

## Next Steps

The following features are ready to be implemented:

1. **Authentication**: Google OAuth integration
2. **Google Drive Integration**: File upload and sync
3. **Task Management**: Kanban board for control tracking
4. **Evidence Upload**: File management with Google Drive
5. **Real-time Dashboards**: Charts and analytics
6. **Advanced Features**: AI-powered document search

## Running the Application

### Development Mode

**Terminal 1 (API):**
```bash
cd apps/api
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd apps/web
npm run dev
```

**Access:**
- Frontend: http://localhost:4321
- API: http://localhost:3000

### Testing

```bash
cd apps/api
npm test
```

## Summary

Allware Wiki now has a solid foundation with a clean, scalable architecture, modern UI, and working API integration. The system is ready for the next phase of development focusing on authentication, Google Drive integration, and advanced features.

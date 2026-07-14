# SISDAMAS Digital Platform
## Technical Specification

| | |
|---|---|
| **Document** | 05 — Technical Specification |
| **Version** | 1.0 |
| **Status** | Draft — Pending Review |
| **Predecessors** | 00_PROJECT_FOUNDATION · 01_PRODUCT_DISCOVERY · 02_SYSTEM_BLUEPRINT · 03_PRD · 04_UX_SPECIFICATION |
| **Prepared By** | Engineering Architecture Team (Principal Software Architect, Solution Architect, Senior Full Stack, Senior Frontend, Senior Backend, GIS Engineer, Cloud Architect, DevOps, Database Architect, Security Engineer, Performance Engineer, Mobile Web Engineer) |
| **Platform** | SISDAMAS Digital Platform — KKN Kelompok 56, UIN Sunan Gunung Djati Bandung |
| **Constraint** | Solo developer · Zero budget (free tier) · ~1 week build window · 15 users · Android-first |

> **Document scope:** This spec defines HOW the platform is built — framework choices, architecture patterns, folder structure, coding standards, deployment, security, and performance strategies. It does NOT include database schema or API endpoint definitions (those are in docs 06 and 07). Every recommendation here is justified against the constraints in the Foundation (00) and consistent with the Blueprint (02) and UX Spec (04).

---

## Table of Contents

1. [Technology Evaluation](#1-technology-evaluation)
2. [Recommended Stack](#2-recommended-stack)
3. [System Architecture](#3-system-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [GIS Architecture](#6-gis-architecture)
7. [Storage Architecture](#7-storage-architecture)
8. [Authentication Architecture](#8-authentication-architecture)
9. [Google Integration Architecture](#9-google-integration-architecture)
10. [Offline Architecture](#10-offline-architecture)
11. [Notification Architecture](#11-notification-architecture)
12. [Reporting Architecture](#12-reporting-architecture)
13. [Security Specification](#13-security-specification)
14. [Performance Specification](#14-performance-specification)
15. [Error Handling Strategy](#15-error-handling-strategy)
16. [Project Structure](#16-project-structure)
17. [Coding Standards](#17-coding-standards)
18. [Environment Configuration](#18-environment-configuration)
19. [Deployment Architecture](#19-deployment-architecture)
20. [Field Conditions Review](#20-field-conditions-review)
21. [Technical Risk Analysis](#21-technical-risk-analysis)
22. [Final Architecture Recommendation](#22-final-architecture-recommendation)

---

## 1. Technology Evaluation

### 1.1 Frontend Framework

| Option | Pros | Cons | Fit Score |
|---|---|---|---|
| **Next.js 14 (App Router)** | SSR/SSG/ISR built-in; Vercel-native; PWA support; large ecosystem; excellent DX; TypeScript first | Slightly more complex than CRA; App Router learning curve | ⭐⭐⭐⭐⭐ |
| React + Vite | Very fast dev server; minimal setup; familiar | No SSR without extra config; manual routing | ⭐⭐⭐⭐ |
| SvelteKit | Smaller bundle; fast; clean syntax | Smaller ecosystem; harder to find help | ⭐⭐⭐ |
| Nuxt 3 | Vue ecosystem; SSR | Vue-centric team; not as Vercel-native | ⭐⭐ |

**Decision: Next.js 14 (App Router)**

Rationale: Vercel is the confirmed hosting platform (Foundation). Next.js is Vercel's native framework — zero-config deployment, automatic edge function generation for API routes, built-in image optimization (critical for photo-heavy survey app), and first-class PWA support. App Router enables file-based routing that cleanly maps to the UX Spec's route tree (`/app/*`, `/` public routes).

---

### 1.2 Backend / API

| Option | Pros | Cons | Fit Score |
|---|---|---|---|
| **Supabase (BaaS)** | Auth + DB + Storage + Realtime in one free-tier platform; RLS for per-row security; zero server management; instant REST + Realtime API; Service Account for Google | API-first (no business logic layer); RLS complexity for advanced scenarios | ⭐⭐⭐⭐⭐ |
| Firebase | Real-time excellent; Google ecosystem | NoSQL (survey data is relational); billing model risky for free | ⭐⭐⭐ |
| Laravel (PHP) | Mature; Rich ORM; full control | Requires separate hosting; too heavy for solo dev in 1 week | ⭐⭐ |
| NestJS | Structured; TypeScript; excellent | Requires deployment infra; overkill for MVP | ⭐⭐ |
| Express | Simple; flexible | No built-in auth, storage, realtime; too much to wire up | ⭐⭐ |

**Decision: Supabase**

Rationale: Already confirmed in Foundation and Blueprint. Supabase eliminates the need for a separately deployed backend by providing: Auth (JWT), PostgreSQL, Storage (photo buckets), Realtime (WebSocket subscriptions for map/dashboard live updates), and Edge Functions. This saves an estimated 2–3 days of backend setup that a solo developer cannot afford in a 1-week window.

Business logic that cannot be expressed in RLS policies runs as **Next.js API Routes** (Vercel Edge Functions), keeping all compute on Vercel's free tier.

---

### 1.3 Database

| Option | Pros | Cons | Fit Score |
|---|---|---|---|
| **PostgreSQL (via Supabase)** | Relational; ACID; powerful; RLS native; PostGIS available; JSON support for flexible fields | Requires schema discipline | ⭐⭐⭐⭐⭐ |
| MySQL | Relational; widely known | No native RLS; PostGIS more limited | ⭐⭐⭐ |
| Firebase Firestore | Realtime; schemaless | NoSQL doesn't fit household-survey relational model; billing risk | ⭐⭐ |

**Decision: PostgreSQL via Supabase** — already confirmed in Foundation.

---

### 1.4 GIS / Mapping

| Option | Pros | Cons | Fit Score |
|---|---|---|---|
| **Leaflet.js** | Lightweight (~40KB); MIT license; massive plugin ecosystem; excellent mobile touch; OSM native; no API key | Less built-in than Mapbox; 3D not supported | ⭐⭐⭐⭐⭐ |
| MapLibre GL JS | WebGL; 3D; vector tiles | Heavier; requires tile server or Mapbox token | ⭐⭐⭐⭐ |
| Google Maps JS | Familiar; reliable | Paid API (billing risk for zero-budget); proprietary | ⭐⭐ |
| OpenLayers | Very powerful; GIS-grade | Steep learning curve; heavy; overkill for Phase 1 | ⭐⭐⭐ |

**Decision: Leaflet.js**

Rationale: Zero API key, zero cost, ~40KB gzipped, excellent Android touch support, mature ecosystem (Leaflet.markercluster, Leaflet.heat, Leaflet.draw for Phase 2). Aligns with Blueprint Phase 7 and PRD REQ-MAP. OSM tiles are free and reliable.

---

### 1.5 Storage

| Option | Pros | Cons | Fit Score |
|---|---|---|---|
| **Supabase Storage** | Free 1GB; bucket-level policies; RLS on files; signed URLs; already in stack | 1GB limit needs monitoring | ⭐⭐⭐⭐⭐ |
| Cloudinary | Excellent image optimization; CDN | Free tier limited transformations; extra service to manage | ⭐⭐⭐ |
| Google Drive | Familiar; large free tier | Requires OAuth flow; not suited for programmatic photo storage | ⭐⭐ |

**Decision: Supabase Storage** (primary) + **Google Drive** (secondary archiving)

Rationale: Supabase Storage handles all primary photo/document storage within the stack. Google Drive is used only for the archiving/backup use case described in Blueprint Phase 10. This matches the PRD REQ-GDRIVE specification exactly.

---

### 1.6 Authentication

| Option | Pros | Cons | Fit Score |
|---|---|---|---|
| **Supabase Auth** | Built-in JWT; email/password; session management; RLS integrates natively; admin can create users | No social login by default (not needed here) | ⭐⭐⭐⭐⭐ |
| Firebase Auth | Google ecosystem; social login | Extra service; Firebase billing risks; not in current stack | ⭐⭐⭐ |
| NextAuth.js | Flexible; many providers | Custom DB adapter needed for Supabase | ⭐⭐⭐ |

**Decision: Supabase Auth** — already confirmed in Foundation.

---

### 1.7 Deployment

| Option | Pros | Cons | Fit Score |
|---|---|---|---|
| **Vercel** | Next.js native; zero-config; edge functions; free hobby plan; automatic preview deployments; global CDN | 100GB bandwidth/month free (sufficient for KKN) | ⭐⭐⭐⭐⭐ |
| Netlify | Good free tier; JAMstack native | Not as deep Next.js integration; edge functions limited | ⭐⭐⭐⭐ |
| Railway | Good for fullstack | Needs paid tier for always-on; not Vercel-optimized | ⭐⭐⭐ |
| Render | Simple; good free tier | Cold starts on free tier; slower than Vercel | ⭐⭐⭐ |

**Decision: Vercel** — already confirmed in Foundation.

---

## 2. Recommended Stack

### 2.1 Complete Stack

| Layer | Technology | Version | Role |
|---|---|---|---|
| **Frontend Framework** | Next.js | 14.x (App Router) | Full-stack React framework |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **UI Components** | shadcn/ui + Radix UI | Latest | Accessible, unstyled component primitives |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS, fast UI iteration |
| **State Management** | Zustand | 4.x | Minimal global state (auth, offline queue, map filters) |
| **Form Handling** | React Hook Form | 7.x | Performance-first forms; integrates with Zod |
| **Validation** | Zod | 3.x | Schema validation (frontend + edge function) |
| **GIS / Map** | Leaflet.js | 1.9.x | Interactive map rendering |
| **Map React Wrapper** | react-leaflet | 4.x | React component abstraction over Leaflet |
| **Charts** | Recharts | 2.x | Dashboard charts (donut, bar, line) |
| **Database** | PostgreSQL (Supabase) | 15.x | Relational data store |
| **Auth** | Supabase Auth | Latest | JWT-based authentication |
| **Realtime** | Supabase Realtime | Latest | WebSocket subscriptions for live map/dashboard |
| **File Storage** | Supabase Storage | Latest | Survey photos, documents |
| **API Layer** | Supabase PostgREST + Next.js API Routes | Latest | CRUD + custom business logic |
| **Offline Queue** | localStorage + Service Worker | Web API | Draft storage and sync |
| **PWA** | next-pwa | 5.x | Service Worker, manifest, offline cache |
| **Image Compression** | browser-image-compression | Latest | Client-side photo compression before upload |
| **Photo Export** | jspdf + html2canvas | Latest | PDF report generation |
| **Excel Export** | xlsx (SheetJS) | Latest | Excel data export |
| **Google Drive** | googleapis (server-side only) | Latest | Drive API via Service Account |
| **Google Calendar** | googleapis (server-side only) | Latest | Calendar API via Service Account |
| **Testing** | Vitest + React Testing Library | Latest | Unit + component tests |
| **Linting** | ESLint + Prettier | Latest | Code quality |
| **Hosting** | Vercel | — | Frontend + Edge Functions |
| **Backend-as-a-Service** | Supabase | — | DB + Auth + Storage + Realtime |

### 2.2 Why This Stack Is Optimal for SISDAMAS

| Constraint | How Stack Addresses It |
|---|---|
| Solo developer, 1-week window | Next.js + Supabase eliminate backend server setup entirely; shadcn/ui provides ready-made accessible components |
| Zero budget | All services on free tier: Vercel Hobby + Supabase Free + OSM tiles + Leaflet (MIT) |
| Mobile-first, Android | Next.js PWA + Tailwind responsive + Leaflet mobile touch support + bottom nav via CSS |
| Offline-resilient | next-pwa Service Worker + localStorage offline queue + browser-image-compression reduces upload failures |
| GIS-heavy workflow | Leaflet + react-leaflet + Supabase Realtime for live pin drops |
| Google ecosystem integration | googleapis server-side only (Service Account); no OAuth expiry risk |
| Easy maintenance | TypeScript throughout; Supabase dashboard for direct DB inspection; Vercel auto-deploy on git push |
| Long-term scalability | PostGIS extension available in Supabase; multi-project via schema; Vercel scales automatically |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```mermaid
graph TB
    subgraph CLIENT["Client (Browser / Android PWA)"]
        NEXTJS_UI["Next.js App\n(React + Tailwind + Leaflet)"]
        SW["Service Worker\n(next-pwa)"]
        LS["localStorage\n(offline queue, drafts)"]
    end

    subgraph VERCEL["Vercel (Free Tier)"]
        EDGE["API Routes / Edge Functions\n(business logic, Google API proxy)"]
        STATIC["Static Assets\n(JS, CSS, images via CDN)"]
    end

    subgraph SUPABASE["Supabase (Free Tier)"]
        PG["PostgreSQL\n(structured data)"]
        RLS["Row Level Security\n(per-role access control)"]
        AUTH["Supabase Auth\n(JWT sessions)"]
        STORAGE["Supabase Storage\n(survey photos, documents)"]
        REALTIME["Supabase Realtime\n(WebSocket broadcast)"]
        POSTGREST["PostgREST\n(auto REST from schema)"]
    end

    subgraph EXTERNAL["External Services"]
        OSM["OpenStreetMap\n(map tiles)"]
        GDRIVE["Google Drive API\n(document archiving)"]
        GCAL["Google Calendar API\n(schedule sync)"]
    end

    NEXTJS_UI <--> SW
    SW <--> LS
    NEXTJS_UI --> EDGE
    NEXTJS_UI --> POSTGREST
    NEXTJS_UI --> AUTH
    NEXTJS_UI --> REALTIME
    NEXTJS_UI --> OSM
    EDGE --> PG
    EDGE --> STORAGE
    EDGE --> GDRIVE
    EDGE --> GCAL
    PG <--> RLS
    PG --> REALTIME
    REALTIME --> NEXTJS_UI
    STATIC --> NEXTJS_UI
```

### 3.2 Request Flow Diagram

```mermaid
sequenceDiagram
    participant Browser as Browser/PWA
    participant SW as Service Worker
    participant Vercel as Vercel Edge Fn
    participant Supa as Supabase DB
    participant RT as Supabase Realtime
    participant OtherUser as Other User's Browser

    Browser->>SW: Fetch request
    SW->>SW: Check offline queue
    SW->>Vercel: API call (JWT in header)
    Vercel->>Vercel: Validate JWT (Supabase Auth)
    Vercel->>Vercel: Apply business logic
    Vercel->>Supa: SQL query (respects RLS)
    Supa-->>Vercel: Query result
    Supa->>RT: Broadcast change event
    RT-->>OtherUser: Push update (WebSocket)
    Vercel-->>SW: JSON response
    SW-->>Browser: Response + cache update
    OtherUser->>OtherUser: UI updates (new map pin, dashboard count)
```

---

## 4. Frontend Architecture

### 4.1 Next.js App Router Structure

The App Router is chosen over Pages Router because:
- Native layouts (no custom `_app.tsx` gymnastics)
- Server Components reduce client-side JS bundle for public pages
- Route groups enable clean separation of `(auth)`, `(app)`, and `(public)` routes
- Middleware for authentication guard without client-side flicker

### 4.2 Routing Strategy

| Route Group | Pattern | Purpose |
|---|---|---|
| `(public)` | `/`, `/desa`, `/kkn`, `/peta`, `/statistik`, `/galeri`, `/berita`, `/kontak` | Public pages, no auth |
| `(auth)` | `/login`, `/lupa-password`, `/reset-password` | Authentication pages |
| `(app)` | `/app/*` | Protected app pages — redirects to login if no session |

**Middleware guard:**
```typescript
// middleware.ts
// Intercepts all /app/* routes
// Validates Supabase session cookie
// Redirects to /login if no valid session
// Passes role in request headers for server components
```

### 4.3 Layout Hierarchy

```
RootLayout (html, body, fonts, ThemeProvider)
├── (public) PublicLayout (PublicNav, Footer)
│   ├── page.tsx (Landing)
│   └── [slug]/page.tsx (other public pages)
├── (auth) AuthLayout (centered card, no nav)
│   ├── login/page.tsx
│   └── ...
└── (app) AppLayout (Sidebar, Header, BottomNav, OfflineBanner)
    ├── dashboard/page.tsx
    ├── map/page.tsx
    ├── surveys/
    │   ├── page.tsx (list)
    │   ├── new/page.tsx (multi-step form)
    │   ├── [id]/page.tsx (detail)
    │   └── [id]/edit/page.tsx
    ├── sticky-notes/page.tsx
    ├── priority/page.tsx
    ├── programs/
    ├── documentation/
    ├── reports/
    └── admin/
        ├── page.tsx (admin dashboard)
        ├── users/
        ├── master-data/
        ├── audit-logs/
        └── settings/
```

### 4.4 State Management Strategy

**Principle:** Minimal global state. Most data comes from server via Supabase PostgREST or API routes.

| State Type | Solution | Why |
|---|---|---|
| Auth session | Supabase Auth + React context | Auth is cross-cutting; single source from Supabase JWT |
| Offline queue | Zustand + localStorage | Needs to persist across renders; accessible from Service Worker |
| Map filters | Zustand (ephemeral) | Shared across Map + Filter panel; clears on page leave |
| Survey form (multi-step) | React Hook Form | Form-local state; no global needed |
| Toast notifications | Zustand (queue) | Multiple toasts can appear; needs global coordination |
| Server data | Supabase client hooks + SWR/React Query | Cache, revalidate, dedup requests |

**Why NOT Redux:** Overkill for 15 users, solo dev. Too much boilerplate. Zustand achieves the same with 10x less code.

### 4.5 Component Architecture

```
components/
├── ui/                    # shadcn/ui primitives (Button, Card, Input, Dialog...)
├── layout/                # AppLayout, Sidebar, Header, BottomNav, OfflineBanner
├── map/                   # LeafletMap, HouseholdMarker, FilterPanel, MapToolbar, HouseholdPopup
├── survey/                # SurveyForm, GpsCapture, ProblemGroup, PotentialGroup, PhotoUpload
├── dashboard/             # StatCard, ProgressBar, ActivityFeed, OfflineQueueBadge
├── sticky-notes/          # StickyBoard, NoteCard, NoteModal, ColumnHeader
├── admin/                 # UserTable, MasterDataForm, AuditLogTable
├── charts/                # DonutChart, BarChart, LineChart (wrappers over Recharts)
├── common/                # EmptyState, LoadingSkeleton, ErrorState, ConfirmDialog
└── forms/                 # FormField, GpsField, PhotoField, SearchableSelect
```

### 4.6 Form Handling

**Library: React Hook Form + Zod**

All forms use RHF's `useForm` hook with Zod schema validation:

```typescript
// Example: Survey form schema
const surveySchema = z.object({
  rt_id: z.string().uuid("Pilih RT terlebih dahulu"),
  kk_name: z.string().min(3, "Nama harus diisi (min. 3 karakter)"),
  kk_number: z.string().length(16).optional().or(z.literal("")),
  family_size: z.number().int().min(1).max(20),
  housing_status: z.enum(["own", "rent", "sharing"]),
  housing_condition: z.enum(["good", "moderate", "damaged"]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  // ...
})
```

Validation runs on blur + on submit. Zod schemas are shared between frontend and API route (single source of truth).

### 4.7 PWA Configuration

**Library: next-pwa**

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // Cache OSM tiles with stale-while-revalidate strategy
    { urlPattern: /^https:\/\/tile\.openstreetmap\.org\//, handler: 'CacheFirst',
      options: { cacheName: 'osm-tiles', expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 60 * 60 } } },
    // Cache Supabase API with NetworkFirst
    { urlPattern: /supabase\.co\/rest\/v1/, handler: 'NetworkFirst',
      options: { cacheName: 'supabase-api', networkTimeoutSeconds: 5 } },
    // App shell: CacheFirst
    { urlPattern: /\.(js|css|woff2)$/, handler: 'CacheFirst',
      options: { cacheName: 'static-assets', expiration: { maxAgeSeconds: 30 * 24 * 60 * 60 } } },
  ]
})
```

**Web App Manifest:**
```json
{
  "name": "SISDAMAS KKN 56 - Desa Sukahaji",
  "short_name": "SISDAMAS",
  "description": "Platform Digital KKN Kelompok 56",
  "start_url": "/app/dashboard",
  "display": "standalone",
  "background_color": "#4F46E5",
  "theme_color": "#4F46E5",
  "icons": [...]
}
```

### 4.8 Image Optimization

- **Survey photos:** Client-side compressed with `browser-image-compression` before upload (target ≤1MB, max width 1920px)
- **Next.js `<Image>`:** Used for all static images (team photos, gallery) — automatic WebP conversion, lazy loading, blur placeholder
- **Map markers:** Inline SVG (no HTTP request per marker; improves map render speed)
- **Thumbnails:** Generated lazily by cropping in-browser from Supabase Storage signed URLs

---

## 5. Backend Architecture

### 5.1 API Layer Design

The backend is split into two layers:

| Layer | Technology | Responsibility |
|---|---|---|
| **Supabase PostgREST** | Auto-generated from DB schema | Simple CRUD (households, surveys, sticky notes); all respects RLS |
| **Next.js API Routes** | Vercel Edge Functions | Complex business logic: Google Drive proxy, report generation, survey sync validation, photo compression trigger, audit log writes |

**Decision principle:** Use PostgREST for anything that can be expressed as a SQL query with RLS. Use API Routes only when the operation requires server-side secrets (Google credentials), complex business logic (PDF generation), or cross-table transactions.

### 5.2 API Route Organization

```
app/api/
├── auth/
│   └── session/route.ts         # Session validation utility
├── surveys/
│   ├── route.ts                  # POST /api/surveys (create with idempotency)
│   └── [id]/
│       └── route.ts              # PATCH /api/surveys/:id (edit + audit log)
├── sync/
│   └── route.ts                  # POST /api/sync (batch offline queue flush)
├── reports/
│   ├── excel/route.ts            # GET /api/reports/excel (SheetJS export)
│   ├── pdf/route.ts              # GET /api/reports/pdf (jsPDF export)
│   └── geojson/route.ts          # GET /api/reports/geojson
├── google/
│   ├── drive/
│   │   ├── upload/route.ts       # POST /api/google/drive/upload
│   │   └── sync/route.ts         # POST /api/google/drive/sync
│   └── calendar/
│       └── events/route.ts       # POST /api/google/calendar/events
├── photos/
│   └── upload/route.ts           # POST /api/photos/upload (storage proxy)
└── admin/
    ├── users/route.ts             # POST /api/admin/users (create user)
    └── audit/route.ts             # POST /api/admin/audit (write audit entry)
```

### 5.3 Business Logic Layer

Complex operations implemented in `/lib/services/`:

| Service | Responsibility |
|---|---|
| `surveyService.ts` | Create survey with idempotency check; validate GPS; trigger realtime broadcast |
| `syncService.ts` | Process offline batch; dedup by client_uuid; handle partial failures |
| `photoService.ts` | Validate MIME type; generate storage path; create signed upload URL |
| `reportService.ts` | Compile survey data; generate Excel (SheetJS) or PDF (jsPDF) |
| `driveService.ts` | Google Drive API calls via Service Account; folder creation; file upload |
| `calendarService.ts` | Google Calendar API; event creation and update |
| `auditService.ts` | Write immutable audit log entries |
| `notificationService.ts` | Create in-app notification records (Phase 2) |

### 5.4 Row Level Security Policies

RLS policies are the primary authorization layer. All PostgREST calls respect them automatically.

| Table | Policy | Rule |
|---|---|---|
| `household` | SELECT | All authenticated users can read all households |
| `household` | INSERT | Any authenticated user can insert |
| `household` | UPDATE | User can update own records OR role = 'admin' |
| `survey` | SELECT | All authenticated users can read all surveys |
| `survey` | INSERT | Any authenticated user can insert |
| `survey` | UPDATE | user_id = auth.uid() OR role = 'admin' |
| `sticky_note` | SELECT | All authenticated users |
| `sticky_note` | INSERT/UPDATE/DELETE | user_id = auth.uid() OR role = 'admin' |
| `audit_log` | SELECT | role = 'admin' only |
| `audit_log` | INSERT | Any authenticated (system-generated) |
| `audit_log` | UPDATE/DELETE | NO POLICY (immutable) |
| `user_profile` | SELECT | Own row OR role = 'admin' |
| `user_profile` | UPDATE | Own row OR role = 'admin' |

### 5.5 Audit Trail Implementation

Every write operation triggers an audit log entry. Implementation via:

1. **PostgreSQL triggers** on critical tables (most reliable; executes inside transaction)
2. **API route explicit writes** for operations not through PostgREST (report exports, Google sync)

```sql
-- Trigger example: log survey inserts
CREATE OR REPLACE FUNCTION log_survey_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata, created_at)
  VALUES (auth.uid(), 'SURVEY_CREATED', 'survey', NEW.id, 
          json_build_object('rt_id', NEW.rt_id, 'household_id', NEW.household_id),
          now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.6 Background Jobs Strategy

On Vercel free tier, true background jobs (cron) are limited. Strategy:

| Job | Trigger | Implementation |
|---|---|---|
| Google Drive sync | Admin button click (on-demand) | Edge Function call |
| Offline queue flush | Service Worker on 'online' event | Client-side trigger → batch API call |
| Daily statistics cache | Vercel Cron (free: 1/day) | Pre-compute stats and cache in Supabase |
| Photo upload retry | Service Worker background sync | Background Sync API (where supported) |

---

## 6. GIS Architecture

### 6.1 Map Technology Stack

| Component | Technology | Reason |
|---|---|---|
| Map library | Leaflet.js 1.9.x | Lightweight, MIT, excellent mobile touch |
| React wrapper | react-leaflet 4.x | Declarative React API over Leaflet |
| Base tiles | OpenStreetMap (tile.openstreetmap.org) | Free, no API key, good coverage |
| Marker icons | Custom SVG (inline) | No extra HTTP requests; color-codeable via CSS |
| Clustering | Leaflet.markercluster (Phase 2) | Group dense markers at zoom-out |
| Heatmap | Leaflet.heat (Phase 2) | Problem density visualization |
| Drawing | Leaflet.draw (Phase 2) | RT/RW boundary drawing |

### 6.2 Coordinate System

- **System:** WGS84 (EPSG:4326) — standard GPS coordinate system used by all Android phones
- **Storage:** Decimal degrees as `DECIMAL(10, 7)` — sufficient precision for ~1cm accuracy
- **Display:** Formatted to 6 decimal places (e.g., -6.847123°, 107.452345°)
- **Phase 2 PostGIS:** Migration to `GEOGRAPHY(POINT, 4326)` type when spatial queries are needed

### 6.3 Marker Rendering Strategy

**Phase 1:** Simple `L.circleMarker` with SVG — no icon loading, no HTTP requests:

```typescript
const MARKER_COLORS = {
  complete: '#10B981',   // Green — survey complete
  partial:  '#F59E0B',   // Amber — survey partial
  pending:  '#EF4444',   // Red   — not yet surveyed
  verified: '#0EA5E9',   // Sky   — verified/locked
  revisit:  '#94A3B8',   // Slate — needs revisit
}

function createHouseholdMarker(status: SurveyStatus): L.CircleMarker {
  return L.circleMarker([lat, lng], {
    radius: 8,
    fillColor: MARKER_COLORS[status],
    color: '#ffffff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.9,
  })
}
```

**Rationale:** CircleMarker renders ~10x faster than custom icon markers. No image loading. Color change is instant (CSS property update).

### 6.4 Real-Time Map Updates

Supabase Realtime subscription on the `household` table:

```typescript
// In the Map component
useEffect(() => {
  const channel = supabase
    .channel('households-realtime')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'household' },
      (payload) => {
        const newHousehold = payload.new
        addMarkerToMap(newHousehold)
        updateDashboardCount()
      }
    )
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'household' },
      (payload) => {
        updateMarkerStatus(payload.new.id, payload.new.survey_status)
      }
    )
    .subscribe()
  
  return () => { supabase.removeChannel(channel) }
}, [])
```

### 6.5 Map Performance Optimization

| Strategy | Implementation |
|---|---|
| Max markers Phase 1 | Expected ≤500 household pins — no clustering needed; Leaflet handles well |
| Tile caching | OSM tiles cached by `next-pwa` CacheFirst strategy (7-day TTL) |
| Lazy load Leaflet | Dynamic import: `const { MapContainer } = await import('react-leaflet')` (prevents SSR errors) |
| Viewport-based rendering | Phase 2: Only render markers in current viewport bounds |
| Debounce filter | Filter changes debounced 150ms before re-rendering markers |
| Circle markers | No image loading; SVG path rendered directly by browser |

### 6.6 GeoJSON Export Architecture

```typescript
// /api/reports/geojson/route.ts
async function generateGeoJSON(filters: MapFilters): Promise<GeoJSON.FeatureCollection> {
  const households = await supabase
    .from('household')
    .select('id, kk_name, rt_id, latitude, longitude, survey_status, survey(*)')
    .match(filters)
  
  return {
    type: 'FeatureCollection',
    features: households.data.map(h => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [h.longitude, h.latitude] },
      properties: { id: h.id, kk_name: h.kk_name, status: h.survey_status, ... }
    }))
  }
}
```

---

## 7. Storage Architecture

### 7.1 Supabase Storage Bucket Design

| Bucket | Access | Contents | Naming Convention |
|---|---|---|---|
| `survey-photos` | Private (auth only) | Household survey photos | `{household_id}/{timestamp}_{seq}.jpg` |
| `documents` | Private (auth only) | Uploaded KKN documents | `{cycle}/{year-month}/{original_filename}` |
| `avatars` | Private (auth only) | User profile photos | `{user_id}/avatar.jpg` |
| `public-gallery` | Public | Phase 2 gallery images | `{year}/{month}/{filename}` |

### 7.2 Photo Upload Flow

```mermaid
sequenceDiagram
    participant Phone as Surveyor Phone
    participant Browser as Browser JS
    participant API as API Route
    participant Storage as Supabase Storage
    participant DB as Supabase DB

    Phone->>Browser: User selects photo (camera or gallery)
    Browser->>Browser: Compress image (browser-image-compression)\nTarget: ≤1MB, max 1920px width
    Browser->>API: POST /api/photos/upload (multipart form)
    API->>API: Validate MIME type (image/jpeg, image/png only)
    API->>API: Generate storage path: {household_id}/{ts}_{seq}.jpg
    API->>Storage: Upload compressed file to survey-photos bucket
    Storage-->>API: Public/signed URL
    API->>DB: INSERT into household_photo (household_id, storage_url, caption, taken_at)
    DB-->>API: Inserted record
    API-->>Browser: {photo_id, url, thumbnail_url}
    Browser->>Browser: Show photo thumbnail in form grid
```

### 7.3 Storage Naming Convention

```
survey-photos/
└── {household_uuid}/
    ├── 2026-07-16T10-23-45_1.jpg   # First photo at this household
    ├── 2026-07-16T10-24-02_2.jpg   # Second photo
    └── 2026-07-16T10-24-30_3.jpg   # Third photo

documents/
└── siklus-2/
    └── 2026-07/
        ├── rekap-survei-rt01.xlsx
        └── notulensi-rembug-14jul.pdf
```

### 7.4 Free Tier Storage Management

Supabase free tier: **1GB storage total**.

Calculation for Phase 1:
- 500 households × 3 photos avg × 1MB = **1.5GB** — exceeds limit at full coverage

**Mitigation strategy:**
- Compress to ≤800KB (not 1MB) to provide headroom
- Warn admin at 700MB usage (70%)
- At 900MB: block new photo uploads; alert admin
- Phase 2: Migrate photos to Google Drive as primary (archive from Supabase)

---

## 8. Authentication Architecture

### 8.1 Authentication Flow

```mermaid
sequenceDiagram
    participant User as Browser
    participant Next as Next.js App
    participant Mid as Middleware
    participant Auth as Supabase Auth

    User->>Next: GET /app/dashboard
    Next->>Mid: Request intercepted
    Mid->>Auth: Validate session cookie (JWT)
    Auth-->>Mid: Valid/Invalid + user claims
    Mid->>Mid: Check role from user_metadata
    Mid-->>Next: Allow (append role header) OR Redirect /login
    Next->>User: Render page with correct role

    Note over User,Auth: Login flow
    User->>Next: POST /login (email, password)
    Next->>Auth: signInWithPassword()
    Auth-->>Next: Session JWT + user object
    Next->>Next: Set httpOnly session cookie
    Next-->>User: Redirect to /app/dashboard
```

### 8.2 Session Management

| Aspect | Implementation |
|---|---|
| Session duration | 7 days (Supabase default; configurable) |
| Token refresh | Supabase Auth client auto-refreshes tokens before expiry |
| Storage | httpOnly cookie (Supabase SSR helper) — not localStorage (XSS-safe) |
| Server-side validation | Middleware validates on every `/app/*` request |
| Role storage | User role stored in `auth.users.user_metadata.role` + mirrored in `user_profile.role` |
| Account creation | Admin-only via Supabase Admin API — self-registration disabled |

### 8.3 Role-Based Access Control

Three roles defined (consistent with PRD and Foundation):

```typescript
type UserRole = 'super_admin' | 'kkn_member'
// Public visitor = no role (unauthenticated)

// Role check helper
function hasRole(user: User, role: UserRole): boolean {
  return user.user_metadata.role === role
}

function isAdmin(user: User): boolean {
  return hasRole(user, 'super_admin')
}
```

Middleware enforces:
- `/app/admin/*` → `super_admin` only → redirect to `/app/dashboard` with 403 message
- `/app/*` → any authenticated user
- `/` public routes → no auth required

---

## 9. Google Integration Architecture

### 9.1 Service Account Strategy

**Decision: Service Account (not per-user OAuth)**

As established in Blueprint Phase 10.3 and PRD REQ-GDRIVE:
- OAuth tokens expire (60 days) — risk during 40-day KKN
- Per-user OAuth requires each user to authorize — unmanageable for 15 members
- Service Account: permanent credentials, admin-controlled, zero expiry risk

**Implementation:**

```typescript
// lib/google/auth.ts
import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: [
    'https://www.googleapis.com/auth/drive.file',        // Drive: only files created by this app
    'https://www.googleapis.com/auth/calendar.events',   // Calendar: events only
  ],
})

export const driveClient = google.drive({ version: 'v3', auth })
export const calendarClient = google.calendar({ version: 'v3', auth })
```

### 9.2 Google Drive Integration

**Folder creation strategy (idempotent):**
- On each upload, check if target folder exists by name
- Create folder if missing (first run auto-creates entire structure)
- Store folder IDs in Supabase `google_drive_config` table to avoid repeated API calls

**Automatic folder structure:**
```
SISDAMAS KKN 56 - Desa Sukahaji 2026/
├── Siklus 1 - Penggalian Masalah/
├── Siklus 2 - Survei & Pemetaan/
│   ├── Data Survei/
│   ├── Foto Rumah Tangga/
│   │   ├── RT01/
│   │   └── RT02/
│   └── Peta GIS/
├── Siklus 3 - Prioritas & Rencana/
├── Siklus 4 - Pelaksanaan Program/
└── Laporan Akhir/
```

**Sync trigger:** Manual by admin (not automatic on every upload) — protects against Drive API rate limits on free quota.

### 9.3 Google Calendar Integration

**Shared calendar approach:**
- KKN team creates one shared Google Calendar
- Service Account is given "Make changes to events" permission on that calendar
- All platform events written to that calendar ID

**Event structure:**
```typescript
interface KKNCalendarEvent {
  summary: string          // Event title (Bahasa Indonesia)
  description: string      // Details + platform deep link
  start: { dateTime: string, timeZone: 'Asia/Jakarta' }
  end: { dateTime: string, timeZone: 'Asia/Jakarta' }
  attendees?: { email: string }[]  // Optional — send invites to members
}
```

---

## 10. Offline Architecture

### 10.1 Offline Strategy Decision

**Chosen: localStorage queue + Service Worker sync (not full offline-first)**

Rationale (from Foundation): Signal conditions in Dusun 2 confirmed as "sufficient for field use with intermittent gaps." A full IndexedDB offline-first sync engine would take 2–3 days to implement correctly — budget the solo developer does not have. The localStorage + retry approach covers the actual risk (brief signal loss during survey submit) with ~2 hours of implementation.

### 10.2 Offline Queue Data Structure

```typescript
// Stored in localStorage under key: 'sisdamas_offline_queue'
interface OfflineQueueItem {
  id: string                    // Client-generated UUID (idempotency key)
  type: 'survey' | 'photo' | 'sticky_note'
  payload: unknown              // Full API payload
  created_at: string            // ISO timestamp
  attempts: number              // Retry count
  last_attempt?: string         // Last retry timestamp
  status: 'pending' | 'syncing' | 'failed'
}

// Example survey queue item
const queueItem: OfflineQueueItem = {
  id: 'a1b2c3d4-...',          // Will be sent as X-Idempotency-Key header
  type: 'survey',
  payload: {
    rt_id: 'uuid',
    kk_name: 'Bpk. Suparman',
    latitude: -6.8471,
    longitude: 107.4523,
    // ... all form fields
  },
  created_at: '2026-07-16T10:23:45Z',
  attempts: 0,
  status: 'pending'
}
```

### 10.3 Sync Flow

```mermaid
flowchart TD
    A[Service Worker detects 'online' event] --> B[Read offline queue from localStorage]
    B --> C{Queue empty?}
    C --> |Yes| D[Nothing to do]
    C --> |No| E[Set item status = 'syncing']
    E --> F[POST /api/sync with batch payload\nX-Idempotency-Key header per item]
    F --> G{API response}
    G --> |200 OK| H[Remove item from queue]
    H --> I[Dispatch 'sync-complete' event to UI]
    G --> |409 Conflict - duplicate| J[Remove item - already exists]
    G --> |500 Server error| K[Increment attempts]
    K --> L{attempts > 3?}
    L --> |Yes| M[Mark as 'failed' - show alert to user]
    L --> |No| N[Retry after 30s exponential backoff]
```

### 10.4 Idempotency Implementation

```typescript
// /api/sync/route.ts
export async function POST(request: Request) {
  const { items } = await request.json()
  const results = []

  for (const item of items) {
    // Check if record with this client_uuid already exists
    const existing = await supabase
      .from('survey')
      .select('id')
      .eq('client_uuid', item.id)
      .single()

    if (existing.data) {
      results.push({ id: item.id, status: 'already_exists', record_id: existing.data.id })
      continue
    }

    // Insert new record
    const { data, error } = await supabase
      .from('survey')
      .insert({ ...item.payload, client_uuid: item.id })

    results.push({ id: item.id, status: error ? 'error' : 'created', record_id: data?.id })
  }

  return Response.json({ results })
}
```

### 10.5 Network Detection

```typescript
// hooks/useNetworkStatus.ts
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Trigger sync
      syncOfflineQueue()
    }
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return { isOnline }
}
```

### 10.6 Battery-Aware GPS

```typescript
// hooks/useGPS.ts
async function getGPSInterval(): Promise<number> {
  if (!('getBattery' in navigator)) return 1000 // default 1s
  const battery = await (navigator as any).getBattery()
  if (battery.level < 0.1) return 30000  // 30s at <10% battery
  if (battery.level < 0.2) return 10000  // 10s at <20% battery
  return 1000                             // 1s normal
}
```

---

## 11. Notification Architecture

### 11.1 Phase 1 — In-App Notifications (Realtime)

```mermaid
graph LR
    EVENT["Database Event\n(survey created, task due)"]
    TRIGGER["PostgreSQL Trigger\nor API Route"]
    NOTIF_TABLE["notifications table\n(user_id, message, read, created_at)"]
    REALTIME["Supabase Realtime\n(user-specific channel)"]
    UI["Notification Bell\n(badge count)"]

    EVENT --> TRIGGER --> NOTIF_TABLE --> REALTIME --> UI
```

**Realtime subscription (per-user channel):**
```typescript
supabase.channel(`notifications:${userId}`)
  .on('postgres_changes', { event: 'INSERT', table: 'notification', filter: `user_id=eq.${userId}` },
    (payload) => { incrementNotifBadge(); showToast(payload.new.message) })
  .subscribe()
```

### 11.2 Phase 2 — Email Notifications

- Supabase Edge Functions with resend.com free tier (100 emails/day)
- Triggered for: task due reminders, survey session announcements, weekly summaries to admin

---

## 12. Reporting Architecture

### 12.1 Report Generation Strategy

All report generation runs **server-side** in API Routes (not client-side) to:
- Prevent large data exposure to client
- Keep RLS enforced throughout
- Handle large datasets without browser memory constraints

### 12.2 Excel Export (SheetJS)

```typescript
// /api/reports/excel/route.ts
import * as XLSX from 'xlsx'

export async function GET(request: Request) {
  const { surveys, problems, potentials, photos } = await fetchAllReportData()

  const wb = XLSX.utils.book_new()

  // Sheet 1: Surveys
  const surveySheet = XLSX.utils.json_to_sheet(surveys.map(s => ({
    'No': s.seq,
    'RT': s.rt_number, 'RW': s.rw_number,
    'Nama KK': s.kk_name, 'Jumlah Anggota': s.family_size,
    'Status Hunian': s.housing_status, 'Kondisi Rumah': s.housing_condition,
    'Latitude': s.latitude, 'Longitude': s.longitude,
    'GPS Akurasi (m)': s.gps_accuracy,
    'Surveyor': s.surveyor_name, 'Tanggal': s.submitted_at,
    'Status Survei': s.survey_status,
  })))
  XLSX.utils.book_append_sheet(wb, surveySheet, 'Data Survei')

  // Sheet 2-5: Problems, Potentials, Photos, Statistics
  // ...

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="SISDAMAS_Survei_Dusun2_${dateStr}.xlsx"`,
    }
  })
}
```

### 12.3 PDF Report Generation

- Library: `jsPDF` + `html2canvas`
- Strategy: Render a hidden HTML report template → capture with html2canvas → embed in jsPDF
- Charts included: Recharts components rendered to canvas → exported as PNG → embedded in PDF
- Generation time target: <10 seconds for 500 records

### 12.4 GeoJSON Export

Simple JSON serialization of household GPS data with all attributes. No external library needed.

---

## 13. Security Specification

### 13.1 Authentication Security

| Measure | Implementation |
|---|---|
| Password hashing | Supabase Auth uses bcrypt internally — never handle plaintext passwords |
| Session storage | httpOnly cookie (not localStorage) — prevents XSS token theft |
| HTTPS only | Enforced by Vercel (all traffic HTTPS; HTTP → HTTPS redirect) |
| Account lockout | Supabase Auth: 5 failed attempts → 15-minute lockout |
| Self-registration disabled | Admin creates all accounts via Supabase Admin API |
| JWT expiry | 7-day session; auto-refresh before expiry |

### 13.2 Authorization Security

| Measure | Implementation |
|---|---|
| Row Level Security | Enabled on ALL tables with data — no table left unprotected |
| API route auth check | Every API route validates JWT before executing any logic |
| Role validation | Role checked from user_metadata (set by admin only) |
| Admin endpoints | Separate middleware guard on `/app/admin/*` routes |
| Audit log immutable | No UPDATE/DELETE RLS policy on audit_log; trigger inserts only |

### 13.3 Input Validation and Injection Prevention

| Risk | Mitigation |
|---|---|
| SQL Injection | PostgREST uses parameterized queries; custom queries use Supabase's `eq()`, `match()` (never raw SQL with user input) |
| XSS | React escapes all JSX by default; no `dangerouslySetInnerHTML` used with user data |
| CSRF | Supabase session uses `SameSite=Strict` cookie; Vercel enforces CORS |
| File upload (MIME spoofing) | Server-side MIME validation in photo upload route; accept only JPEG/PNG |
| Coordinate injection | Latitude/longitude validated with Zod (min/max range) before insert |
| Path traversal (storage) | Storage path generated server-side from UUID (not user-provided filename) |

### 13.4 Secrets Management

| Secret | Storage | Access |
|---|---|---|
| Supabase URL | Vercel Environment Variable (public) | Next.js client + server |
| Supabase Anon Key | Vercel Environment Variable (public) | Next.js client + server |
| Supabase Service Role Key | Vercel Environment Variable (**private**) | Server-side API routes only |
| Google Service Account Email | Vercel Environment Variable (**private**) | Server-side API routes only |
| Google Service Account Private Key | Vercel Environment Variable (**private**) | Server-side API routes only |
| Google Calendar ID | Vercel Environment Variable (**private**) | Server-side API routes only |

**Rule:** Any secret with `NEXT_PUBLIC_` prefix is exposed to the client. All Google credentials and Supabase Service Role key MUST NOT have this prefix.

### 13.5 OWASP Top 10 Considerations

| Risk | Status | Mitigation |
|---|---|---|
| A01: Broken Access Control | Mitigated | Supabase RLS; middleware role guard |
| A02: Cryptographic Failures | Mitigated | HTTPS everywhere; bcrypt passwords; JWT |
| A03: Injection | Mitigated | Parameterized queries; input validation |
| A04: Insecure Design | Mitigated | RLS-first design; audit logs; soft deletes |
| A05: Security Misconfiguration | Partially | Vercel defaults secure; review Supabase dashboard settings |
| A06: Vulnerable Components | Partially | Dependabot alerts; `npm audit` in CI |
| A07: Auth Failures | Mitigated | Lockout; httpOnly cookies; session expiry |
| A08: Data Integrity Failures | Mitigated | Zod validation; idempotency keys; audit log |
| A09: Logging Failures | Mitigated | Immutable audit log; Vercel access logs |
| A10: SSRF | Low risk | No user-configurable URLs executed server-side |

---

## 14. Performance Specification

### 14.1 Performance Targets

| Metric | Target | Measurement Method |
|---|---|---|
| Page load (Dashboard) | <3s on 4G | Lighthouse, Vercel Speed Insights |
| Page load (Map with 50 pins) | <4s on 4G | Manual measurement |
| Survey form submit (online) | <2s | Network tab timing |
| GPS acquisition | <15s (good signal), <30s (prompt manual) | Field test |
| Photo upload (1MB, 4G) | <10s | Network tab timing |
| Excel export (500 records) | <10s | Server-side timing |
| Realtime update latency | <5s | Measured end-to-end |
| Offline draft save | <200ms | localStorage write timing |

### 14.2 Caching Strategy

| Layer | Strategy | TTL |
|---|---|---|
| OSM tiles | Service Worker CacheFirst | 7 days |
| Static JS/CSS assets | Service Worker CacheFirst | 30 days |
| API data (surveys list) | SWR stale-while-revalidate | 30 seconds |
| API data (master data: RT/RW) | SWR immutable (revalidate: false) | Session |
| API data (dashboard counts) | Supabase Realtime (always fresh) | N/A |
| Report generation | No cache | Always fresh |
| Google Drive token | googleapis library handles internally | ~1 hour |

### 14.3 Optimization Techniques

| Technique | Implementation |
|---|---|
| Code splitting | Next.js automatic per-route; Leaflet dynamic import |
| Image lazy loading | Next.js `<Image>` with `loading="lazy"` |
| Photo compression | browser-image-compression before upload |
| Virtualized lists | react-virtual for survey list >100 items |
| Database pagination | All list queries use `.range()` (limit 20 per page) |
| Supabase select columns | Always specify columns — no `select('*')` |
| Debounce search | 300ms debounce on search input |
| Memoization | React.memo for map marker components; useMemo for filter calculations |
| Bundle analysis | `@next/bundle-analyzer` to catch large dependencies |

### 14.4 Map Performance

- Phase 1: ≤500 CircleMarkers (Leaflet handles 10,000+ but 500 is very smooth)
- Layer separation: Put markers on a `L.layerGroup()` — enables show/hide without DOM manipulation
- Filter implementation: Client-side filter on pre-loaded marker array (fast for 500 items)
- Coordinate precision: Round to 5 decimal places for display (saves bandwidth in API responses)

---

## 15. Error Handling Strategy

### 15.1 Error Classification

| Error Type | Severity | User Action | Developer Action |
|---|---|---|---|
| Validation error | Low | Show inline field error | Zod catches at API boundary |
| Auth error (wrong password) | Low | Show error message, retry | Log attempts |
| Session expired | Medium | Redirect to login; form preserved | Auto-redirect middleware |
| GPS unavailable | Medium | Offer manual fallback | Log GPS failure reason |
| Network timeout (submit) | High | Auto-save to offline queue | Log to audit |
| Storage upload failure | High | Queue photo for retry | Log error + Supabase error code |
| API 500 error | High | "Terjadi kesalahan server. Coba lagi." | Alert admin via audit log |
| Google API error | Medium | "Google Drive tidak tersedia" | Log + retry on next trigger |
| Supabase Realtime disconnect | Low | Show stale data warning; auto-reconnect | Log disconnect event |
| Free tier limit hit | Critical | "Penyimpanan penuh — hubungi admin" | Admin email alert |

### 15.2 Error Boundaries

```typescript
// app/(app)/error.tsx — Next.js App Router error boundary
export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      <button onClick={reset} className="btn-primary">Coba Lagi</button>
      <a href="/app/dashboard" className="mt-4 text-primary underline">Kembali ke Beranda</a>
    </div>
  )
}
```

### 15.3 API Route Error Handling Pattern

```typescript
// Standard API route error pattern
export async function POST(request: Request) {
  try {
    // 1. Auth validation
    const session = await getServerSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Input validation (Zod)
    const body = await request.json()
    const result = schema.safeParse(body)
    if (!result.success) return Response.json({ error: result.error.issues }, { status: 422 })

    // 3. Business logic
    const data = await executeBusinessLogic(result.data)

    // 4. Success response
    return Response.json({ data }, { status: 200 })

  } catch (error) {
    // 5. Log to audit trail
    await logError(error, request.url)
    
    // 6. Generic error response (no internal details exposed)
    return Response.json({ error: 'Terjadi kesalahan internal. Coba lagi.' }, { status: 500 })
  }
}
```

---

## 16. Project Structure

```
sisdamas-platform/
│
├── app/                          # Next.js App Router pages
│   ├── (public)/                 # Public routes (no auth)
│   │   ├── page.tsx              # Landing page
│   │   ├── desa/page.tsx
│   │   ├── peta/page.tsx
│   │   └── ...
│   ├── (auth)/                   # Auth pages
│   │   ├── login/page.tsx
│   │   └── lupa-password/page.tsx
│   ├── (app)/                    # Protected app pages
│   │   ├── layout.tsx            # App layout (sidebar, header, bottom nav)
│   │   ├── dashboard/page.tsx
│   │   ├── map/page.tsx
│   │   ├── sticky-notes/page.tsx
│   │   ├── surveys/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   ├── queue/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   ├── priority/page.tsx
│   │   ├── programs/
│   │   ├── documentation/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── statistics/page.tsx
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── users/page.tsx
│   │       ├── master-data/page.tsx
│   │       ├── audit-logs/page.tsx
│   │       └── settings/page.tsx
│   └── api/                      # API Routes (Edge Functions)
│       ├── auth/
│       ├── surveys/
│       ├── sync/
│       ├── reports/
│       ├── photos/
│       └── google/
│
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui primitives
│   ├── layout/                   # AppLayout, Sidebar, Header, BottomNav
│   ├── map/                      # All Leaflet-related components
│   ├── survey/                   # Survey form components
│   ├── dashboard/                # Dashboard widgets
│   ├── sticky-notes/             # Board components
│   ├── admin/                    # Admin panel components
│   ├── charts/                   # Chart wrappers
│   └── common/                   # EmptyState, Loading, Error, Confirm
│
├── features/                     # Feature-level business logic
│   ├── auth/                     # Auth hooks and utilities
│   ├── surveys/                  # Survey hooks, state, types
│   ├── map/                      # Map state, filter logic
│   ├── sticky-notes/             # Board state
│   ├── offline/                  # Offline queue management
│   ├── reports/                  # Report generation
│   └── admin/                    # Admin feature logic
│
├── hooks/                        # Shared React hooks
│   ├── useNetworkStatus.ts
│   ├── useGPS.ts
│   ├── useBattery.ts
│   ├── useOfflineQueue.ts
│   ├── useRealtimeSubscription.ts
│   └── useDebounce.ts
│
├── lib/                          # Core libraries and integrations
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server-side Supabase client
│   │   └── middleware.ts         # Session validation helper
│   ├── google/
│   │   ├── auth.ts               # Service Account setup
│   │   ├── drive.ts              # Drive API helpers
│   │   └── calendar.ts           # Calendar API helpers
│   ├── validations/
│   │   ├── survey.schema.ts      # Zod schemas
│   │   ├── user.schema.ts
│   │   └── ...
│   └── constants/
│       ├── routes.ts             # All route constants
│       ├── categories.ts         # Problem/potential taxonomy
│       └── gis.ts                # Map defaults, color constants
│
├── services/                     # Server-side service layer
│   ├── surveyService.ts
│   ├── syncService.ts
│   ├── photoService.ts
│   ├── reportService.ts
│   ├── driveService.ts
│   ├── calendarService.ts
│   └── auditService.ts
│
├── store/                        # Zustand global state
│   ├── authStore.ts
│   ├── offlineQueueStore.ts
│   ├── mapFilterStore.ts
│   └── notificationStore.ts
│
├── types/                        # TypeScript type definitions
│   ├── database.types.ts         # Auto-generated from Supabase
│   ├── domain.types.ts           # Domain models
│   ├── api.types.ts              # API request/response types
│   └── gis.types.ts              # GIS-specific types
│
├── styles/
│   ├── globals.css               # Tailwind base + CSS variables
│   └── leaflet.css               # Leaflet base styles import
│
├── public/
│   ├── icons/                    # PWA icons (192px, 512px)
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service Worker (generated by next-pwa)
│
├── docs/                         # Project documentation
│   ├── 00_PROJECT_FOUNDATION.md
│   ├── 01_PRODUCT_DISCOVERY.md
│   └── ...
│
├── supabase/
│   └── migrations/               # Database migration files
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_audit_triggers.sql
│
├── .env.local                    # Local environment variables (gitignored)
├── .env.example                  # Documented env vars (committed)
├── middleware.ts                 # Next.js middleware (auth guard)
├── next.config.js                # Next.js + PWA configuration
├── tailwind.config.ts            # Tailwind + design token config
├── tsconfig.json                 # TypeScript config
├── .eslintrc.json                # ESLint rules
├── .prettierrc                   # Prettier config
└── package.json
```

---

## 17. Coding Standards

### 17.1 TypeScript Rules

| Rule | Standard |
|---|---|
| Strict mode | `"strict": true` in tsconfig.json |
| No `any` | `@typescript-eslint/no-explicit-any: error` |
| Type imports | Always use `import type` for type-only imports |
| Null handling | Use optional chaining `?.` and nullish coalescing `??` |
| Generated types | Run `supabase gen types typescript` to generate DB types |
| Zod for runtime | All external data (API input, form data) validated with Zod before use |

### 17.2 Naming Conventions

| Item | Convention | Example |
|---|---|---|
| File names (components) | PascalCase.tsx | `SurveyForm.tsx`, `LeafletMap.tsx` |
| File names (utilities) | camelCase.ts | `surveyService.ts`, `useGPS.ts` |
| File names (constants) | camelCase.ts | `categories.ts`, `routes.ts` |
| Component names | PascalCase | `HouseholdMarker`, `OfflineBanner` |
| Hook names | camelCase, prefix `use` | `useNetworkStatus`, `useOfflineQueue` |
| Service names | camelCase, suffix `Service` | `surveyService`, `driveService` |
| Store names | camelCase, suffix `Store` | `authStore`, `offlineQueueStore` |
| Constants | SCREAMING_SNAKE_CASE | `MARKER_COLORS`, `MAX_PHOTOS` |
| CSS variables | kebab-case, prefix `--` | `--color-primary`, `--space-4` |
| Database columns | snake_case | `kk_name`, `family_size`, `created_at` |
| TypeScript interfaces | PascalCase, prefix `I` optional | `HouseholdRecord`, `SurveyPayload` |

### 17.3 ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "react/display-name": "warn",
    "no-console": ["warn", { "allow": ["error", "warn"] }]
  }
}
```

### 17.4 Git Commit Convention

Format: `type(scope): message`

| Type | When |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructure (no behavior change) |
| `style` | CSS/UI changes |
| `docs` | Documentation only |
| `test` | Test additions/changes |
| `chore` | Build, config, tooling |

Examples:
- `feat(survey): add GPS auto-capture with fallback`
- `fix(map): prevent duplicate markers on realtime update`
- `feat(admin): user suspension with audit log`

### 17.5 Git Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — auto-deploys to Vercel |
| `develop` | Integration branch |
| `feature/[name]` | Feature development |
| `fix/[name]` | Bug fixes |
| `release/[version]` | Release preparation |

**Solo developer simplification:** Given solo developer constraint, `main` → direct push is acceptable for Phase 1. `develop` branch introduced in Phase 2 when risk of breaking live KKN operations is higher.

---

## 18. Environment Configuration

### 18.1 Environment Variables

```bash
# .env.example — commit this file (values are placeholders)

# Supabase (public - safe for client exposure)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase (private - server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Service Account (private - server-side only)
GOOGLE_SERVICE_ACCOUNT_EMAIL=sisdamas-kkn@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY=-----BEGIN PRIVATE KEY-----\n...
GOOGLE_CALENDAR_ID=xxxxxxxxx@group.calendar.google.com
GOOGLE_DRIVE_ROOT_FOLDER_ID=1abc...

# App Configuration
NEXT_PUBLIC_APP_URL=https://sisdamas-kkn56.vercel.app
NEXT_PUBLIC_APP_NAME=SISDAMAS KKN 56
NEXT_PUBLIC_DUSUN_NAME=Dusun 2
NEXT_PUBLIC_MAP_CENTER_LAT=-6.8471
NEXT_PUBLIC_MAP_CENTER_LNG=107.4523
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=15
```

### 18.2 Environment Strategy

| Environment | Setup | Database |
|---|---|---|
| **Development** | `.env.local` | Supabase local dev OR separate dev project |
| **Preview** | Vercel Preview env vars | Same Supabase dev project (safe) |
| **Production** | Vercel Production env vars | Production Supabase project |

**Critical rule:** Production Supabase keys ONLY in Vercel Production environment. Never in code, never in `.env` files committed to git.

---

## 19. Deployment Architecture

### 19.1 Development Workflow

```
Local machine
  └── npm run dev
      ├── Next.js dev server (localhost:3000)
      ├── Supabase local dev (optional: supabase start)
      └── Hot reload enabled
```

### 19.2 CI/CD Pipeline

```mermaid
graph LR
    DEV["Developer\ngit push origin main"] --> VERCEL_BUILD["Vercel\nauto-detect Next.js\nbuild + type check"]
    VERCEL_BUILD --> CHECKS{All checks pass?}
    CHECKS --> |No| FAIL["Build fails\nDeveloper notified\nPrevious version stays live"]
    CHECKS --> |Yes| DEPLOY["Deploy to production\nGlobal CDN\nEdge functions deployed"]
    DEPLOY --> LIVE["https://sisdamas-kkn56.vercel.app\n(live in ~60 seconds)"]
```

### 19.3 Deployment Checklist (Pre-Day 1)

| Item | Action |
|---|---|
| Supabase project created | Create at supabase.com; note URL and keys |
| Database schema migrated | Run migration files via Supabase SQL editor or CLI |
| RLS policies applied | Verify in Supabase Auth > Policies |
| Master data seeded | Insert Dusun 2, RW 01-03, RT 01-09 |
| Admin account created | Create in Supabase Auth > Users |
| Vercel project connected | Connect GitHub repo; configure env vars |
| Domain configured | `sisdamas-kkn56.vercel.app` or custom domain |
| PWA manifest tested | Install to home screen on Android; verify splash |
| Google Service Account configured | Create in GCP console; add to Vercel env |
| All 15 KKN member accounts created | Batch create before Day 1 onboarding |
| Survey categories seeded | Insert problem/potential taxonomy into master data |
| Map center coordinates set | Configure env vars for Dusun 2 center point |
| End-to-end test | Submit one test survey; verify map pin appears; verify audit log |

### 19.4 Rollback Strategy

Vercel maintains deployment history. Rollback:
1. Go to Vercel dashboard → Deployments
2. Find last known-good deployment
3. Click "Promote to Production"
4. Immediate rollback — takes <30 seconds

Database rollback:
- Supabase dashboard → Database → Backups (daily backups on free tier; Point-in-Time Recovery on Pro)
- For Phase 1 (free tier): manual backup before major schema changes via `pg_dump`

### 19.5 Monitoring

| What | How | Free? |
|---|---|---|
| Error monitoring | Vercel built-in error logs | Yes |
| Performance | Vercel Speed Insights (100k events/month) | Yes |
| Uptime | UptimeRobot (free tier 50 monitors) | Yes |
| DB performance | Supabase dashboard → Database metrics | Yes |
| Storage usage | Supabase dashboard → Storage | Yes |
| API usage | Supabase dashboard → API logs | Yes |

---

## 20. Field Conditions Review

### 20.1 Rural Unstable Internet

| Technology | Field Risk | Mitigation |
|---|---|---|
| Next.js PWA | App shell cached — loads without internet | Service Worker CacheFirst for shell |
| Supabase REST API | Fails without internet | Offline queue + retry |
| Supabase Realtime | WebSocket disconnects | Auto-reconnect built-in; graceful degradation |
| OSM tiles | Cached tiles show; uncached tiles blank | Pre-cache Dusun 2 tile bounds in Phase 2 |
| Photo upload | Fails without internet | Photo queue separate from survey queue |
| Google Drive sync | Admin-triggered only — not real-time | No impact on field operations |

**Verdict:** Stack is field-suitable for the confirmed "intermittent signal" condition. Full offline-first is not needed.

### 20.2 Low-End Android Devices

| Technology | Memory Concern | Mitigation |
|---|---|---|
| Next.js bundle | ~300–400KB gzipped (after tree-shaking) | Dynamic imports for Leaflet; code splitting |
| Leaflet.js | ~40KB — very lightweight | No issue |
| Recharts (charts) | ~200KB | Lazy-loaded only on Dashboard/Statistics pages |
| browser-image-compression | Pure JS, no large dependency | No issue |
| jsPDF (report) | ~250KB | Loaded only on Reports page (dynamic import) |

**Total initial bundle target:** <200KB JavaScript for survey flow pages (form + GPS + camera). Charts and reports loaded lazily.

### 20.3 Multiple Simultaneous Photo Uploads

| Risk | Scale | Mitigation |
|---|---|---|
| 15 users uploading simultaneously | 15 photos × 1MB = 15MB concurrent uploads | Supabase Storage handles concurrent uploads well; client-side queue per session |
| Supabase free tier bandwidth | 2GB/month | 500 photos × 800KB = ~400MB well within limit |
| Vercel bandwidth | 100GB/month | Far exceeds any realistic usage |

**Verdict:** No concern at Phase 1 scale.

### 20.4 GPS Signal Fluctuations

| Scenario | Behavior |
|---|---|
| GPS lost mid-form | Last captured coordinate retained; accuracy badge turns red |
| GPS never acquired (30s timeout) | Manual coordinate entry modal shown |
| GPS re-acquired after manual entry | Option to replace manual with GPS capture |
| GPS accuracy >30m | Visual warning; survey can still be submitted |
| Battery <20% | GPS polling reduced from 1s to 10s automatically |

### 20.5 Free Tier Hosting Limitations

| Limit | Free Tier Value | KKN Usage Estimate | Risk |
|---|---|---|---|
| Vercel bandwidth | 100GB/month | <1GB | None |
| Vercel Edge Function executions | 1M/month | <10K | None |
| Supabase DB rows | 500MB | ~50MB for 500 HH | None |
| Supabase Storage | 1GB | ~400MB photos | Monitor at 700MB |
| Supabase Realtime connections | 200 concurrent | 15 max | None |
| Supabase Auth | 50K MAU | 15 users | None |

**Only real risk:** Supabase Storage approaching 1GB. Mitigated by 800KB photo compression and weekly admin monitoring.

---

## 21. Technical Risk Analysis

### 21.1 High-Risk Items

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| Photo storage approaching 1GB limit | Service disruption | Medium | Compress to 800KB; weekly monitoring; ready to migrate to Drive |
| Solo developer unavailable (sick) | All support blocked | Medium | Detailed README; Vercel auto-deploy means no manual operations needed |
| localStorage cleared by user/browser | Lost offline queue | Low | Warn users explicitly; note in onboarding: "Jangan hapus data browser" |
| Supabase free tier rate limits | API slowdown | Low | 60 reqs/min per user; 15 users never hit this |
| Google API quota exceeded | Drive/Calendar unavailable | Low | Admin-triggered only; not field-critical |

### 21.2 Medium-Risk Items

| Risk | Impact | Mitigation |
|---|---|---|
| Next.js App Router bugs (still maturing) | Build failures | Use stable release; follow Next.js changelog |
| OSM tile server slow/unavailable | Map shows blank tiles | Cached tiles for seen areas still work; brief notice |
| TypeScript type errors from Supabase schema change | Build failure | Regenerate types after every schema migration |

### 21.3 Low-Risk Items

| Risk | Mitigation |
|---|---|
| Vercel cold starts on Edge Functions | Edge Functions rarely cold-start; <100ms on warm |
| Leaflet SSR incompatibility | Dynamic import resolves this completely |
| react-leaflet version mismatch | Pin exact version in package.json |

---

## 22. Final Architecture Recommendation

### 22.1 Recommended Architecture

```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
State:     Zustand (global) + React Hook Form (forms) + SWR (server cache)
GIS:       Leaflet.js + react-leaflet + OpenStreetMap
Charts:    Recharts
Offline:   next-pwa (Service Worker) + localStorage queue
Auth:      Supabase Auth (JWT, httpOnly cookies)
Database:  PostgreSQL via Supabase (with RLS)
Realtime:  Supabase Realtime (WebSocket)
Storage:   Supabase Storage (photos) + Google Drive (archiving)
API:       Supabase PostgREST (CRUD) + Next.js API Routes (business logic)
Google:    googleapis via Service Account (Drive + Calendar)
Hosting:   Vercel (frontend + edge functions) + Supabase (BaaS)
```

### 22.2 Why This Architecture Best Fits SISDAMAS

| Project Need | Architecture Answer |
|---|---|
| 1-week build window | Supabase eliminates backend server entirely; shadcn/ui provides ready components |
| Zero budget | 100% free tier; no paid APIs |
| Solo developer | Maximum leverage of BaaS; no DevOps; Vercel auto-deploys |
| 15 concurrent users | Free tier handles 200 Realtime connections; far above need |
| Mobile-first + Android | PWA + Tailwind responsive + Leaflet mobile-optimized |
| GIS live updates | Supabase Realtime → immediate map pin drops |
| Offline field use | localStorage queue + next-pwa Service Worker |
| Google ecosystem | googleapis Service Account; no OAuth expiry risk |
| LPJ data export | SheetJS + jsPDF; no external service needed |
| Future scalability | PostgREST + RLS scales linearly; PostGIS migration path clear |
| Easy handover | Vercel + Supabase have visual dashboards any successor can use |

### 22.3 Architecture Confidence

This stack has been:
- Used in production by hundreds of startups with similar constraints
- Validated against all field conditions (Section 20)
- Cross-referenced with every requirement in Foundation (00), PRD (03), and UX Spec (04)
- De-risked at every major technical decision point (alternatives evaluated in Section 1)

**Confidence: HIGH for Phase 1. The recommended architecture is implementation-ready.**

---

*This Technical Specification is derived from `05_TECHNICAL_SPECIFICATION_PROMPT.md`. All technology choices, architecture decisions, and implementation strategies are consistent with the constraints established in `00_PROJECT_FOUNDATION.md` and the requirements defined in `02_SYSTEM_BLUEPRINT.md`, `03_PRD.md`, and `04_UX_SPECIFICATION.md`. No database schema or API endpoint definitions are included — those belong to `06_DATABASE_SPECIFICATION.md` and `07_API_SPECIFICATION.md`.*

---

**Would you like to revise the Technical Specification before we proceed to generate the Database Specification (`06_DATABASE_SPECIFICATION.md`)?**

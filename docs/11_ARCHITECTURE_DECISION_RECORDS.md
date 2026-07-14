# SISDAMAS Digital Platform
## Architecture Decision Records (ADR)

| | |
|---|---|
| **Document** | 11 — Architecture Decision Records |
| **Version** | 1.0 |
| **Status** | Approved |
| **Predecessors** | 00_PROJECT_FOUNDATION s.d. 10_DEVELOPMENT_ROADMAP |
| **Prepared By** | Software Architecture Review Board (Chief Software Architect, Solution Architect, Enterprise Architect, Cloud Architect, Database Architect, GIS Architect, DevOps, Security Architect, Product Architect) |
| **Platform** | SISDAMAS Digital Platform — KKN Kelompok 56, UIN Sunan Gunung Djati Bandung |
| **Scope** | Complete collection of Architectural Decisions for Phase 1 & Phase 2 |

---

## Table of Contents
1. [ADR Collection](#1-adr-collection)
2. [Architecture Review](#2-architecture-review)
3. [Decision Matrix](#3-decision-matrix)
4. [Trade-off Analysis](#4-trade-off-analysis)
5. [Risk Summary](#5-risk-summary)
6. [Recommendations](#6-recommendations)

---

## 1. ADR Collection

### ADR-001: Overall Technology Stack Selection
*   **ADR Number:** ADR-001
*   **Title:** Overall Technology Stack Selection
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Principal Solution Architect
*   **Context:** The platform must support a 40-day KKN community service project with an immediate 8-day survey/mapping field window. Development is restricted to a solo developer with a zero-budget constraint.
*   **Problem Statement:** How to construct a stable, responsive, mobile-friendly GIS mapping application that runs entirely on free tiers, in under 2 weeks of development time?
*   **Decision Drivers:** Setup speed, zero cost (free tiers), database performance, Leaflet integration, responsive layouts.
*   **Alternatives Considered:** Next.js + Supabase + Leaflet (Selected) vs. Laravel + MySQL + Google Maps vs. React + Firebase NoSQL.
*   **Decision:** Implement a modern Jamstack architecture combining Next.js 14, Supabase (BaaS), and Leaflet.js for mapping.
*   **Advantages:** Eliminates backend server configuration, PostgreSQL PostGIS compatibility, zero infrastructure cost, excellent SEO and image optimization.
*   **Disadvantages:** Reliance on Vercel/Supabase free tier quotas.
*   **Trade-offs:** Decoupling compute (Vercel) from storage (Supabase) in exchange for zero setup overhead.
*   **Consequences:** The codebase is split into Next.js client layout components and Supabase RLS security policies.
*   **Rejected Alternatives:** Laravel (rejected due to hosting cost and backend setup overhead). Firebase (rejected due to NoSQL structure not matching household relations).
*   **Risks:** Network latency between Vercel Edge functions and Supabase database.
*   **Mitigation:** SWR caching on the client side and PostgREST direct CRUD calls.
*   **Future Considerations:** If the project grows to multi-tenant, migrate Supabase to a dedicated VPS.
*   **References:** `05_TECHNICAL_SPECIFICATION.md`.
*   **Review Notes:** Passed review by Software Architecture Board.
*   **Lessons Learned:** Minimizing custom backend logic by utilizing Supabase direct REST API accelerates MVP delivery.

---

### ADR-002: Frontend Framework Selection
*   **ADR Number:** ADR-002
*   **Title:** Frontend Framework Selection
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Senior Frontend Engineer
*   **Context:** The interface must be responsive, mobile-first, and run smoothly on low-end Android smartphones.
*   **Problem Statement:** Which framework provides the fastest client-side rendering, layout management, and PWA capabilities under time constraints?
*   **Decision Drivers:** Routing complexity, asset loading, PWA compatibility, component reuse.
*   **Alternatives Considered:** Next.js 14 App Router (Selected) vs. React + Vite SPA vs. SvelteKit.
*   **Decision:** Select Next.js 14 using the App Router.
*   **Advantages:** Built-in middleware, file-based routing, native image optimization, zero-config PWA wrapper.
*   **Disadvantages:** Slightly larger initial bundle compared to pure Vite.
*   **Trade-offs:** Accept minor framework overhead for native middleware auth guards.
*   **Consequences:** Clean directory separation, dynamic route loading.
*   **Rejected Alternatives:** React + Vite (rejected because route protection requires custom routing libraries). SvelteKit (rejected due to smaller ecosystem support).
*   **Risks:** Next.js App Router hydration errors when loading Leaflet map client-side.
*   **Mitigation:** Dynamically load react-leaflet markers using `ssr: false` client imports.
*   **Future Considerations:** Seamless transition to Next.js static exports if serverless edge functions are no longer needed.
*   **References:** `04_UX_SPECIFICATION.md`, `05_TECHNICAL_SPECIFICATION.md`.
*   **Review Notes:** Ensure React Suspense wrappers are placed around dashboard widgets.
*   **Lessons Learned:** File-based routing simplifies route management for a 40+ page inventory.

---

### ADR-003: Backend Architecture Selection
*   **ADR Number:** ADR-003
*   **Title:** Backend Architecture Selection
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Senior Backend Engineer
*   **Context:** A solo developer must construct database schemas, APIs, and file upload pathways within a 1-week window.
*   **Problem Statement:** How to minimize backend development time without sacrificing security or API speed?
*   **Decision Drivers:** DB write speed, API contract consistency, integration with Supabase Auth.
*   **Alternatives Considered:** Supabase PostgREST + Vercel Edge functions (Selected) vs. Custom Express/Node API vs. Django REST.
*   **Decision:** Use Supabase PostgREST for direct CRUD operations, with Next.js API Routes (Vercel Edge functions) acting as a proxy for complex business logic.
*   **Advantages:** Zero API coding for basic CRUD, instant JWT authentication checks, scalable serverless execution.
*   **Disadvantages:** Custom business logic requires routing through serverless endpoints, risking cold start latency.
*   **Trade-offs:** Exposing PostgREST directly to the client in exchange for zero server setup.
*   **Consequences:** Database security is shifted from application logic to PostgreSQL RLS policies.
*   **Rejected Alternatives:** Express Node API (rejected due to server setup, hosting, and auth routing overhead).
*   **Risks:** Cold start delays on Vercel serverless edge API endpoints during Google Drive uploads.
*   **Mitigation:** Stream media directly to Supabase storage private buckets instead of Vercel memory buffers.
*   **Future Considerations:** Custom API routes can be migrated to Supabase Edge Functions.
*   **References:** `07_DATA_FLOW_SPECIFICATION.md`, `08_API_SPECIFICATION.md`.
*   **Review Notes:** Secure RLS policies are mandatory on all tables.
*   **Lessons Learned:** Serverless API gates simplify integration with external Google Services.

---

### ADR-004: Database Platform Selection
*   **ADR Number:** ADR-004
*   **Title:** Database Platform Selection
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Database Architect
*   **Context:** The platform manages relational geographic data (Dusun, RW, RT, Household, Survey) with zero budget.
*   **Problem Statement:** Which database platform is suitable for relational mapping while remaining within free tier limits?
*   **Decision Drivers:** ACID transactions, PostGIS compatibility, zero maintenance.
*   **Alternatives Considered:** Supabase PostgreSQL (Selected) vs. Firebase Firestore NoSQL vs. MySQL.
*   **Decision:** Implement Supabase PostgreSQL (Free Tier).
*   **Advantages:** Relational integrity, PostGIS compatibility for Phase 2 boundary calculations, native JSONB support, built-in RLS policies.
*   **Disadvantages:** 500MB free database limit.
*   **Trade-offs:** Accept database size limits in exchange for relational mapping tools.
*   **Consequences:** Strict database design schemas required. No warga table to save storage space.
*   **Rejected Alternatives:** Firestore NoSQL (rejected because hierarchical geography data is relational). MySQL (rejected due to hosting cost).
*   **Risks:** Breaching the 500MB database limit.
*   **Mitigation:** Keep table columns clean, index only query paths, and archive historical audit logs after 90 days.
*   **Future Considerations:** PostGIS can be activated with a single click if boundary calculations are needed.
*   **References:** `06_DATABASE_SPECIFICATION.md`.
*   **Review Notes:** Database triggers must handle all audit trail logging.
*   **Lessons Learned:** PostgreSQL JSONB columns allow flexible data fields for survey answers.

---

### ADR-005: Authentication Design Choice
*   **ADR Number:** ADR-005
*   **Title:** Authentication Design Choice
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Security Architect
*   **Context:** The platform is accessed by 15 surveyors and village officials.
*   **Problem Statement:** How to protect data from unauthorized access while maintaining a simple login flow?
*   **Decision Drivers:** Security against JWT theft, session lifetimes, role checking.
*   **Alternatives Considered:** Supabase Auth with secure cookies (Selected) vs. NextAuth vs. Firebase Auth.
*   **Decision:** Implement Supabase Auth (GoTrue API) with session tokens saved in secure, httpOnly cookies.
*   **Advantages:** Token storage is protected against XSS attacks, session verification is performed by Next.js middleware.
*   **Disadvantages:** Requires custom cookie management in Next.js API endpoints.
*   **Trade-offs:** Avoid OAuth setup complexity in exchange for manually setting cookies on the server side.
*   **Consequences:** Client state only stores non-sensitive user metadata.
*   **Rejected Alternatives:** NextAuth (rejected due to configuration overhead with Supabase).
*   **Risks:** Session timeouts during offline survey sprints.
*   **Mitigation:** Refresh token checks refresh sessions automatically.
*   **Future Considerations:** Implement multi-factor authentication (MFA) for Admin accounts.
*   **References:** `09_SECURITY_SPECIFICATION.md`.
*   **Review Notes:** Cookie configurations must enforce `SameSite=Strict`.
*   **Lessons Learned:** httpOnly cookie transport is the standard for secure web applications.

---

### ADR-006: GIS Technology Selection
*   **ADR Number:** ADR-006
*   **Title:** GIS Technology Selection
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, GIS Architect
*   **Context:** The platform displays completed survey pins, filterable by RT, on mobile browsers.
*   **Problem Statement:** Which mapping library is lightweight, responsive on mobile devices, and integrates with OpenStreetMap?
*   **Decision Drivers:** Library size, mobile performance, touch gestures, costs.
*   **Alternatives Considered:** Leaflet.js + react-leaflet (Selected) vs. Google Maps JavaScript API vs. Mapbox GL JS.
*   **Decision:** Use Leaflet.js wrapped in react-leaflet.
*   **Advantages:** Lightweight (~40KB), mobile-optimized, open-source with OSM integration.
*   **Disadvantages:** No native 3D rendering.
*   **Trade-offs:** Accept lack of 3D maps in exchange for mobile speed.
*   **Consequences:** Coordinates are stored as decimals and mapped using custom circle markers.
*   **Rejected Alternatives:** Google Maps API (rejected due to monthly billing and API key costs). Mapbox GL JS (rejected due to heavier bundle size and API quotas).
*   **Risks:** Blank map tiles when offline.
*   **Mitigation:** PWA Service Worker caches OSM tiles.
*   **Future Considerations:** Implement Leaflet.heat for problem distribution heatmaps.
*   **References:** `04_UX_SPECIFICATION.md`, `05_TECHNICAL_SPECIFICATION.md`.
*   **Review Notes:** Leaflet map container must be loaded dynamically on the client side.
*   **Lessons Learned:** Custom SVG path markers are more performant than loading external image icons.

---

### ADR-007: Offline Strategy Selection
*   **ADR Number:** ADR-007
*   **Title:** Offline Strategy Selection
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Principal Solution Architect
*   **Context:** Surveyors work in areas with intermittent cellular signals.
*   **Problem Statement:** How to protect data from upload failures when surveyors lose their connection?
*   **Decision Drivers:** Sync consistency, development time, user experience.
*   **Alternatives Considered:** localStorage Queue + Service Worker sync (Selected) vs. Full Offline-First (PouchDB/CouchDB) vs. No offline support.
*   **Decision:** Implement local queue draft saves to browser `localStorage` with automatic sync retry.
*   **Advantages:** Fast implementation, minimal client bundle size, reliable sync via `client_uuid` validation.
*   **Disadvantages:** Sync conflicts must be resolved programmatically.
*   **Trade-offs:** Accept simple draft queue instead of complex offline-first database synchronization.
*   **Consequences:** Surveyor drafts are saved locally until a connection is restored.
*   **Rejected Alternatives:** Full Offline-First database (rejected due to implementation complexity and 1-week build window).
*   **Risks:** Surveyor clears browser storage, losing pending drafts.
*   **Mitigation:** Warn users not to clear storage.
*   **Future Considerations:** Migrate to IndexedDB if data volume per draft exceeds 5MB.
*   **References:** `07_DATA_FLOW_SPECIFICATION.md`.
*   **Review Notes:** Sync service must validate client UUIDs.
*   **Lessons Learned:** A simple draft-and-retry mechanism is sufficient for intermittent signals.

---

### ADR-008: Google Drive Integration Strategy
*   **ADR Number:** ADR-008
*   **Title:** Google Drive Integration Strategy
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Cloud Architect
*   **Context:** KKN documentation (photos, reports) must be backed up to the village's shared Google Drive.
*   **Problem Statement:** How to upload files automatically without user authentication prompts?
*   **Decision Drivers:** Key management, API quota, user setup simplicity.
*   **Alternatives Considered:** GCP Service Account authorization (Selected) vs. Per-user OAuth Client flow.
*   **Decision:** Connect Next.js backend to Google Drive using a Google Service Account.
*   **Advantages:** Permanent credentials, zero user setup, automated folder creation.
*   **Disadvantages:** GCP key compromise risks access to the shared folder.
*   **Trade-offs:** Accept Service Account configuration overhead in exchange for zero session refresh issues.
*   **Consequences:** Private Service Account key is stored in Vercel environment variables.
*   **Rejected Alternatives:** Per-user OAuth client (rejected because token credentials expire every 60 days).
*   **Risks:** Google Drive folder name mismatch.
*   **Mitigation:** Verify and save folder ID references in database settings.
*   **Future Considerations:** Migrate file sync tasks to a background queue.
*   **References:** `08_API_SPECIFICATION.md`.
*   **Review Notes:** GCP key must be kept secret.
*   **Lessons Learned:** Service accounts are ideal for automated system backups.

---

### ADR-009: Google Calendar Integration Strategy
*   **ADR Number:** ADR-009
*   **Title:** Google Calendar Integration Strategy
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Cloud Architect
*   **Context:** Program timelines and meetings must be displayed in a shared calendar.
*   **Problem Statement:** How to sync platform events to Google Calendar?
*   **Decision Drivers:** Sync delay, token management.
*   **Alternatives Considered:** Service Account write flow (Selected) vs. Per-user OAuth integration.
*   **Decision:** Connect calendar writes using the same Google Service Account key.
*   **Advantages:** Zero token management, instant sync on event creation.
*   **Disadvantages:** Shared calendar must grant write permissions to the Service Account email.
*   **Trade-offs:** Enforce manual permission sharing on the target calendar in exchange for zero client OAuth prompts.
*   **Consequences:** Calendar event IDs are saved in database tables.
*   **Rejected Alternatives:** Per-user OAuth (rejected due to token refresh issues).
*   **Risks:** Service Account loses permission on calendar.
*   **Mitigation:** Capture API write failures and display status warnings in the Admin panel.
*   **Future Considerations:** Push calendar notifications to surveyor profiles.
*   **References:** `08_API_SPECIFICATION.md`.
*   **Review Notes:** Verify timezone is set to `Asia/Jakarta`.
*   **Lessons Learned:** Centralized Service Accounts simplify cross-application integrations.

---

### ADR-010: Storage Strategy Selection
*   **ADR Number:** ADR-010
*   **Title:** Storage Strategy Selection
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Database Architect
*   **Context:** Household condition photos must be stored securely.
*   **Problem Statement:** Where to upload and how to secure media assets on a zero budget?
*   **Decision Drivers:** Storage limit, signed URL requirements, security checks.
*   **Alternatives Considered:** Supabase Storage Private Bucket (Selected) vs. Cloudinary vs. Direct Google Drive uploads.
*   **Decision:** Upload photo assets to a private bucket in Supabase Storage, and retrieve them using signed URLs.
*   **Advantages:** Integrates with PostgreSQL RLS rules, private files, zero infrastructure setup.
*   **Disadvantages:** 1GB free storage quota.
*   **Trade-offs:** Accept storage quota limits in exchange for RLS-secured file access.
*   **Consequences:** Photos must be compressed to ≤800KB before transmission.
*   **Rejected Alternatives:** Direct Google Drive uploads (rejected due to upload latency and lack of RLS integration).
*   **Risks:** Reaching the 1GB free quota.
*   **Mitigation:** Verify storage usage daily and archive old files to Google Drive.
*   **Future Considerations:** Migrate to S3 bucket if project scale grows.
*   **References:** `06_DATABASE_SPECIFICATION.md`, `09_SECURITY_SPECIFICATION.md`.
*   **Review Notes:** Signed URLs expiration must be set to 15 minutes.
*   **Lessons Learned:** Private storage buckets are required to protect residents' home photos.

---

### ADR-011: Deployment Platform Selection
*   **ADR Number:** ADR-011
*   **Title:** Deployment Platform Selection
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, DevOps Architect
*   **Context:** Solo developer requires instant hosting with automated deployments.
*   **Problem Statement:** Which hosting platform is optimized for Next.js and has a zero-cost free plan?
*   **Decision Drivers:** Edge function integration, CD pipeline setups, bandwidth limits.
*   **Alternatives Considered:** Vercel (Selected) vs. Netlify vs. Custom VPS (Render/Railway).
*   **Decision:** Deploy the Next.js frontend and Edge APIs on Vercel.
*   **Advantages:** Zero infrastructure setup, automatic git-branch previews, CDN caching.
*   **Disadvantages:** Bandwidth limited to 100GB/month (sufficient for this project).
*   **Trade-offs:** Accept vendor lock-in for seamless Next.js hosting.
*   **Consequences:** Deployed branches are immediately accessible.
*   **Rejected Alternatives:** Custom VPS (rejected due to server management overhead and monthly costs).
*   **Risks:** Client uploads exhausting the 100GB bandwidth limit.
*   **Mitigation:** Cache static assets in PWA Service Worker.
*   **Future Considerations:** Migrate to AWS Amplify if Vercel quotas are exceeded.
*   **References:** `05_TECHNICAL_SPECIFICATION.md`.
*   **Review Notes:** Production branch auto-deploys on commit merges.
*   **Lessons Learned:** Git-based continuous deployment accelerates iteration speed.

---

### ADR-012: Security Model Selection
*   **ADR Number:** ADR-012
*   **Title:** Security Model Selection
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Security Architect
*   **Context:** Platform manages sensitive resident data (names, locations).
*   **Problem Statement:** How to secure database tables without writing extensive security code on the API layer?
*   **Decision Drivers:** Implementation time, developer resources, database lock.
*   **Alternatives Considered:** PostgreSQL Row Level Security (Selected) vs. Application middleware-only check.
*   **Decision:** Enable Row Level Security (RLS) on all Supabase PostgreSQL tables.
*   **Advantages:** Security is enforced directly at the database level, preventing unauthorized PostgREST API writes.
*   **Disadvantages:** RLS testing requires mock database client scripts.
*   **Trade-offs:** Accept SQL policy definition overhead in exchange for database security.
*   **Consequences:** Access tokens must contain user role claims.
*   **Rejected Alternatives:** Middleware-only security (rejected due to risk of unauthorized database writes if API gateway is bypassed).
*   **Risks:** Incomplete RLS policies blocking valid surveyor updates.
*   **Mitigation:** Verify policies against the permission matrix before launching.
*   **Future Considerations:** Set up automated unit tests for database policies.
*   **References:** `09_SECURITY_SPECIFICATION.md`.
*   **Review Notes:** Policies must be reviewed before day 1 of surveys.
*   **Lessons Learned:** RLS is the most reliable way to secure PostgreSQL databases.

---

### ADR-013: MVP Scope Lock Decision
*   **ADR Number:** ADR-013
*   **Title:** MVP Scope Lock Decision
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Product Architect
*   **Context:** KKN field activities start in ~1 week, with critical milestones on Day 2 and Day 4.
*   **Problem Statement:** How to guarantee delivery under time constraints?
*   **Decision Drivers:** Build window, solo developer limits, field scheduling.
*   **Alternatives Considered:** Scope Lock (Selected) vs. Full feature release.
*   **Decision:** Lock the Phase 1 MVP to core features: Auth, Sticky Notes Board, Survey Form, Offline Geolocation, Map, and Progress Dashboard.
*   **Advantages:** Feasible schedule, stable deliverables, reduced risk.
*   **Disadvantages:** Phase 2 features (prioritization, programs, reporting) are deferred.
*   **Trade-offs:** Accept delayed feature releases in exchange for guaranteed launch of core features.
*   **Consequences:** Iterations must focus on MVP launch.
*   **Rejected Alternatives:** Full feature release (rejected as it would compromise code quality and risk missing field deadlines).
*   **Risks:** KKN members request deferred features during field sprints.
*   **Mitigation:** Maintain a strict MoSCoW framework list.
*   **Future Considerations:** Refine Phase 2 features during buffer periods.
*   **References:** `00_PROJECT_FOUNDATION.md`, `10_DEVELOPMENT_ROADMAP.md`.
*   **Review Notes:** Stick to the MoSCoW plan.
*   **Lessons Learned:** Scope locking is the most effective way to manage project deadlines.

---

### ADR-014: Survey Data Model Strategy
*   **ADR Number:** ADR-014
*   **Title:** Survey Data Model Strategy
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Database Architect
*   **Context:** The platform tracks survey data in a single village across KKN Cycles.
*   **Problem Statement:** How to support historical tracking without overwriting survey data?
*   **Decision Drivers:** Data integrity, SQL query complexity, history log.
*   **Alternatives Considered:** Separated Survey Table (Selected) vs. Household columns overwrite.
*   **Decision:** Split surveys from household tables in a 1-to-many relationship (`household` ➔ `survey`).
*   **Advantages:** Preserves survey history, keeps household coordinates stable, simplifies database design.
*   **Disadvantages:** Requires joins to retrieve the latest survey status.
*   **Trade-offs:** Accept join query overhead in exchange for complete data history.
*   **Consequences:** Queries must sort by timestamp descending to find current household status.
*   **Rejected Alternatives:** Overwriting household columns (rejected as it deletes history).
*   **Risks:** Query performance lags on list endpoints.
*   **Mitigation:** Add indexes on `submitted_at` and `household_id` columns.
*   **Future Considerations:** Implement database views for latest survey records.
*   **References:** `06_DATABASE_SPECIFICATION.md`.
*   **Review Notes:** Verify foreign keys are indexed.
*   **Lessons Learned:** Relational separation is required to preserve history across years.

---

### ADR-015: Reporting Strategy Selection
*   **ADR Number:** ADR-015
*   **Title:** Reporting Strategy Selection
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Product Architect
*   **Context:** Final statistics must be exported to Excel and PDF formats for the university LPJ.
*   **Problem Statement:** Where should reports be generated to avoid timeout issues?
*   **Decision Drivers:** Function limits, memory limits, client dependencies.
*   **Alternatives Considered:** Server-side API generation (Selected) vs. Client-side browser logic.
*   **Decision:** Implement server-side report generation inside Next.js API endpoints.
*   **Advantages:** Accesses data securely without exposing raw tables to the client.
*   **Disadvantages:** Complex layout engines required on the backend.
*   **Trade-offs:** Accept server overhead in exchange for database security.
*   **Consequences:** Endpoints return binary document buffers.
*   **Rejected Alternatives:** Client-side generation (rejected due to database exposure risk).
*   **Risks:** Timeout errors during large exports.
*   **Mitigation:** Cache report stats and restrict access to Super Admins only.
*   **Future Considerations:** Migrate to background queue tasks.
*   **References:** `08_API_SPECIFICATION.md`.
*   **Review Notes:** Restrict access to Admin accounts.
*   **Lessons Learned:** Server-side report generation is the standard for securing private data.

---

### ADR-016: PWA Caching Strategy Selection
*   **ADR Number:** ADR-016
*   **Title:** PWA Caching Strategy Selection
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, DevOps Architect
*   **Context:** Surveyors work in areas with unstable cellular signals.
*   **Problem Statement:** How to cache map tiles and layout files?
*   **Decision Drivers:** Cache size limits, network speed.
*   **Alternatives Considered:** next-pwa Service Worker (Selected) vs. Standard web application cache.
*   **Decision:** Implement `next-pwa` Service Worker with Cache-First strategy for static assets and OpenStreetMap tiles.
*   **Advantages:** App shell loads offline, map tiles remain visible.
*   **Disadvantages:** Requires cache invalidation checks on code updates.
*   **Trade-offs:** Accept cache-invalidation complexity in exchange for offline map rendering.
*   **Consequences:** Code updates are versioned.
*   **Rejected Alternatives:** Standard web application cache (rejected due to lack of offline support).
*   **Risks:** Obsolete cache files blocking updates.
*   **Mitigation:** Set service worker to call skipWaiting.
*   **Future Considerations:** Pre-cache targets of survey areas.
*   **References:** `05_TECHNICAL_SPECIFICATION.md`.
*   **Review Notes:** Verify cache parameters in configuration.
*   **Lessons Learned:** Service worker caches are required to support offline map layouts.

---

### ADR-017: Household-Centered Data Model Choice
*   **ADR Number:** ADR-017
*   **Title:** Household-Centered Data Model Choice
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Database Architect
*   **Context:** KKN door-to-door surveys interview the household as a single unit.
*   **Problem Statement:** How to structure survey targets without complicating the database?
*   **Decision Drivers:** Survey speed, database size, normalization.
*   **Alternatives Considered:** Household-Centered (Selected) vs. Flat resident warga table.
*   **Decision:** Build `household` as the primary unit of observation. Family stats (`family_size`) are stored as metadata.
*   **Advantages:** Faster survey execution, smaller database size, matches SISDAMAS field methods.
*   **Disadvantages:** No individual profiles.
*   **Trade-offs:** Discard individual profiles in exchange for faster survey execution.
*   **Consequences:** No `warga` table is created.
*   **Rejected Alternatives:** Flat resident table (rejected as it would double survey times and database size).
*   **Risks:** Survey data gaps.
*   **Mitigation:** Verify survey completion via dashboards.
*   **Future Considerations:** Add optional resident reference columns.
*   **References:** `00_PROJECT_FOUNDATION.md`.
*   **Review Notes:** Keep schemas clean.
*   **Lessons Learned:** Focus on the household unit to simplify database design.

---

### ADR-018: OpenStreetMap vs. Google Maps
*   **ADR Number:** ADR-018
*   **Title:** OpenStreetMap vs. Google Maps
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, GIS Architect
*   **Context:** The platform displays completed survey pins on a map.
*   **Problem Statement:** Which mapping tile provider is free, reliable, and has no API key constraints?
*   **Decision Drivers:** Paid limits, setup speed.
*   **Alternatives Considered:** OpenStreetMap (Selected) vs. Google Maps API.
*   **Decision:** Use OpenStreetMap base map tiles.
*   **Advantages:** Zero key setup, zero cost, MIT licensed, open-source.
*   **Disadvantages:** Less detailed satellite view.
*   **Trade-offs:** Accept lack of satellite view in exchange for zero cost.
*   **Consequences:** OSM tiles are cached by PWA.
*   **Rejected Alternatives:** Google Maps API (rejected due to billing and API key costs).
*   **Risks:** OSM tile server slowdown.
*   **Mitigation:** Cache tiles in Service Worker.
*   **Future Considerations:** Setup custom tile servers if scaling.
*   **References:** `05_TECHNICAL_SPECIFICATION.md`.
*   **Review Notes:** Verify map tile coordinates are correct.
*   **Lessons Learned:** OpenStreetMap is the standard for zero-budget GIS maps.

---

### ADR-019: Photo Storage Strategy (Canvas Compression)
*   **ADR Number:** ADR-019
*   **Title:** Photo Storage Strategy (Canvas Compression)
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Database Architect
*   **Context:** Storage is limited to 1GB under the Supabase free tier.
*   **Problem Statement:** How to store photos without exceeding storage limits?
*   **Decision Drivers:** Bandwidth, storage limits.
*   **Alternatives Considered:** Canvas Compression (Selected) vs. Raw photo uploads.
*   **Decision:** Compress images on the client side using HTML5 Canvas resampling before sending over the network.
*   **Advantages:** Reduces upload sizes to ≤800KB, minimizes timeouts, saves storage.
*   **Disadvantages:** Slight loss of image quality.
*   **Trade-offs:** Accept minor image quality loss in exchange for saving storage space.
*   **Consequences:** Photos are downsampled to max width 1920px (80% quality).
*   **Rejected Alternatives:** Raw photo uploads (rejected due to size overhead and timeout risks).
*   **Risks:** Compression failure on old devices.
*   **Mitigation:** Verify file sizes on the API boundary.
*   **Future Considerations:** Rotate keys.
*   **References:** `09_SECURITY_SPECIFICATION.md`.
*   **Review Notes:** File upload size checked at API boundary.
*   **Lessons Learned:** Compress files client-side to save storage space.

---

### ADR-020: Future Scalability (Project Scoping)
*   **ADR Number:** ADR-020
*   **Title:** Future Scalability (Project Scoping)
*   **Status:** Approved
*   **Date:** 2026-07-14
*   **Authors:** Chief Software Architect, Enterprise Architect
*   **Context:** The platform is designed for a single KKN group, but should be reusable.
*   **Problem Statement:** How to ensure future KKN teams can reuse the code?
*   **Decision Drivers:** Reuse limits, database schema.
*   **Alternatives Considered:** Project Table Scoping (Selected) vs. Single-village lock-in.
*   **Decision:** Include a `project` table structure from day one to scope all data entities.
*   **Advantages:** Code is reusable for other villages without schema rewrites.
*   **Disadvantages:** Minor data join overhead.
*   **Trade-offs:** Accept minor join overhead in exchange for long-term scalability.
*   **Consequences:** All tables contain a `project_id` reference.
*   **Rejected Alternatives:** Single-village lock-in (rejected as it would require a database schema rewrite in future KKN periods).
*   **Risks:** Query complexity.
*   **Mitigation:** Setup database indexes on project reference columns.
*   **Future Considerations:** Setup multi-tenant dashboard templates.
*   **References:** `06_DATABASE_SPECIFICATION.md`.
*   **Review Notes:** Master tables include project reference columns.
*   **Lessons Learned:** Design database schemas with scalability in mind.

---

## 2. Architecture Review

The overall architecture is highly aligned with the project's zero-budget constraint and solo developer limits. Key decisions, including Supabase BaaS, Leaflet OSM maps, and client-side photo compression, eliminate infrastructure costs and accelerate MVP launch. The design ensures database security via RLS policies and protects resident privacy via public map obfuscation.

---

## 3. Decision Matrix

| ADR Number | Decision | Chosen Option | Key Driver | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | Stack Selection | Next.js + Supabase + Leaflet | Setup speed, zero cost | Approved |
| **ADR-002** | Framework | Next.js 14 App Router | File-based routing, PWA | Approved |
| **ADR-003** | Backend | Supabase + Vercel Edge API | Zero server overhead | Approved |
| **ADR-004** | Database | Supabase PostgreSQL | Relational mapping, RLS | Approved |
| **ADR-005** | Authentication | Supabase Auth (Cookies) | Token security (XSS protection) | Approved |
| **ADR-006** | GIS Library | Leaflet.js + react-leaflet | Mobile rendering, zero cost | Approved |
| **ADR-007** | Offline Sync | localStorage Queue + Sync | Intermittent signal, simple dev | Approved |
| **ADR-008** | Google Drive | Service Account Sync | Permanent keys, no user prompts | Approved |
| **ADR-009** | Google Calendar | Service Account Sync | permanent keys, zero setup | Approved |
| **ADR-010** | Storage | Supabase Storage Private Bucket | Secure private signed URLs | Approved |
| **ADR-011** | Deployment | Vercel | Jamstack hosting, auto preview | Approved |
| **ADR-012** | Security | Row Level Security (RLS) | Database security | Approved |
| **ADR-013** | MVP Scope | Must-Have Core Features Lock | Time pressure, solo developer | Approved |
| **ADR-014** | Survey DB Model | 1-to-many separation | History tracking | Approved |
| **ADR-015** | Reporting | Server-side API generation | Secure document compile | Approved |
| **ADR-016** | PWA Caching | next-pwa Service Worker | Offline map cache | Approved |
| **ADR-017** | Data Model | Household-Centered Model | Survey speed, no warga table | Approved |
| **ADR-018** | Map Provider | OpenStreetMap Tiles | Zero billing cost, open source | Approved |
| **ADR-019** | Photo Compression | Canvas Downsampling (80%) | Supabase storage limits (1GB) | Approved |
| **ADR-020** | Future Scaling | Project table schema scoping | Multi-village scalability | Approved |

---

## 4. Trade-off Analysis

Every architectural choice involves explicit trade-offs:

*   **BaaS vs. Custom Backend:** Using Supabase PostgREST saves days of setup time, but shifts security configuration from the backend application logic to PostgreSQL RLS policies.
*   **Offline Drafts vs. Offline-First Database:** A simple drafts queue in `localStorage` requires surveyor discipline to prevent data clearing, but is completed in hours compared to weeks of PouchDB/CouchDB integration.
*   **OSM vs. Google Maps:** OpenStreetMap has zero cost, but lacks Google Maps satellite views and street addressing.
*   **Signed URLs vs. Public Media:** Signed URLs require database token generation checks on every image query, but prevent web indexers from harvesting family home photos.
*   **Canvas Image Compression vs. High-Definition Photos:** Canvas downsampling compromises detail, but ensures uploads succeed under weak village signals.

---

## 5. Risk Summary

The architecture carries these operational risks:

*   **Supabase Storage Breaches Quota (1GB):** surveyors uploading too many photos can block database write operations. (Mitigation: Daily storage monitoring, compression filters, weekly backups).
*   **Vercel Function Timeouts (10s):** Large PDF report exports may exceed serverless function execution limits. (Mitigation: Use lightweight report templates, pre-cache dashboard counts).
*   **Google API Token Deauthorization:** Changes in shared folder permissions can block Drive synchronization tasks. (Mitigation: Save calendar and drive folder IDs in database settings).
*   **Client storage cleared:** surveyors clearing browser cache may lose unsynced offline drafts. (Mitigation: Standard onboarding training warning against clearing storage).

---

## 6. Recommendations

For the implementation team:

1.  **Strict RLS Testing:** Verify all Supabase RLS policies using a mock database client before launching surveys.
2.  **Verify Service Account Permissions:** Share write permissions to the Google Service Account email on the target Drive folders.
3.  **Lock Upload size:** Check request payload sizes on the Edge API boundary to prevent Vercel payload size limit exceptions.
4.  **Keep Code Clean:** Follow the folder structure defined in Technical Spec (05) to ensure code remains maintainable.

---

*This Architecture Decision Records collection is derived from `11_ADR_PROMPT.md` and is fully subordinate to `00_PROJECT_FOUNDATION.md`, `02_SYSTEM_BLUEPRINT.md`, `03_PRD.md`, `04_UX_SPECIFICATION.md`, `05_TECHNICAL_SPECIFICATION.md`, `06_DATABASE_SPECIFICATION.md`, `07_DATA_FLOW_SPECIFICATION.md`, `08_API_SPECIFICATION.md`, `09_SECURITY_SPECIFICATION.md`, and `10_DEVELOPMENT_ROADMAP.md`.*

---

**Would you like to revise this Architecture Decision Records collection before we proceed to generate the Test Plan (`12_TEST_PLAN.md`)?**

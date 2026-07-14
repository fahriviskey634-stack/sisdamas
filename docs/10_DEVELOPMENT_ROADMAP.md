# SISDAMAS Digital Platform
## Development Roadmap

| | |
|---|---|
| **Document** | 10 — Development Roadmap |
| **Version** | 1.0 |
| **Status** | Draft — Pending Review |
| **Predecessors** | 00_PROJECT_FOUNDATION · 01_PRODUCT_DISCOVERY · 02_SYSTEM_BLUEPRINT · 03_PRD · 04_UX_SPECIFICATION · 05_TECHNICAL_SPECIFICATION · 06_DATABASE_SPECIFICATION · 07_DATA_FLOW_SPECIFICATION · 08_API_SPECIFICATION · 09_SECURITY_SPECIFICATION |
| **Prepared By** | Software Delivery Team (Principal Engineering Manager, Technical Project Manager, Senior Scrum Master, Principal Software Architect, Senior Product Manager, Technical Lead, QA Lead, DevOps Engineer) |
| **Platform** | SISDAMAS Digital Platform — KKN Kelompok 56, UIN Sunan Gunung Djati Bandung |
| **Operational Windows** | 40-day KKN window (8-day critical field window starting Day 1) |
| **Constraints** | Solo developer · Zero budget · No CI/CD scripting in spec · Strict MVP alignment |

> **Document role:** This Development Roadmap outlines the implementation strategy, schedule, milestones, testing order, and daily operational routines required to develop and deploy the SISDAMAS Digital Platform from scratch. It aligns release cycles directly with the 4-cycle field schedule of Kelompok 56's KKN in Desa Sukahaji. In accordance with the prompt constraints, **no source code, GitHub Actions configurations, or CI/CD pipeline scripts are generated in this document.**

---

## Table of Contents

1. [Development Principles](#1-development-principles)
2. [Project Phases & SISDAMAS Alignment](#2-project-phases--sisdamas-alignment)
3. [Weekly Implementation Timeline](#3-weekly-implementation-timeline)
4. [MVP Definition (MoSCoW)](#4-mvp-definition-moscow)
5. [Milestones](#5-milestones)
6. [Iteration Plan](#6-iteration-plan)
7. [Task Breakdown](#7-task-breakdown)
8. [Development Order](#8-development-order)
9. [Daily Deployment & Operations Plan](#9-daily-deployment--operations-plan)
10. [Field Readiness Checkpoints](#10-field-readiness-checkpoints)
11. [Demonstration Plan](#11-demonstration-plan)
12. [Project Handover Plan](#12-project-handover-plan)
13. [Risk Management](#13-risk-management)
14. [Quality & Testing Strategy](#14-quality--testing-strategy)
15. [Release Strategy](#15-release-strategy)
16. [Team Responsibilities & Project Management](#16-team-responsibilities--project-management)
17. [GitHub Workflow](#17-github-workflow)
18. [Success Metrics](#18-success-metrics)
19. [Final Review](#19-final-review)

---

## 1. Development Principles

To guide delivery under the constraints of a solo developer and a 1-week pre-KKN build window, the roadmap adheres to these core development principles:

### 1.1 MVP First
*   **Application:** Every task is prioritized based on the immediate needs of the field schedule. Non-essential features (like the public website, advanced GIS tools, or Google Calendar syncing) are deferred to later phases. If a feature does not directly support the immediate active SISDAMAS cycle, it is not built.
*   **Value:** Keeps the developer focused on surviving the Day 2 Rembug Warga and Day 4 Survey sprint.

### 1.2 Deliver Working Software Frequently
*   **Application:** We prioritize deploying minimal functional flows over large, incomplete code structures. The platform is hosted on Vercel from Day 1, allowing team members to test components as they are completed.
*   **Value:** Instant feedback on UI responsiveness and page loads on actual surveyor smartphones.

### 1.3 Build Incrementally
*   **Application:** Complex systems are broken down into small, manageable slices. For example, rather than building the entire GIS module at once, we first render static marker coordinates, then add filters, and finally implement real-time updates.
*   **Value:** Ensures that there is always a functional baseline page, even if advanced features are delayed.

### 1.4 Test Continuously
*   **Application:** Features are tested in simulated field conditions (unstable network, direct sunlight, low-end Android browsers) immediately after implementation, catching bugs before they reach the village.
*   **Value:** Reduces the risk of app crashes during doorstep interviews.

### 1.5 Keep Scope Under Control
*   **Application:** Scope creep is the highest risk to a 1-week build window. Feature requests that fall outside the approved PRD (03) are placed in the "Future Roadmap" section and locked out of active iterations.
*   **Value:** Saves critical engineering hours.

### 1.6 Minimize Technical Debt
*   **Application:** Although speed is essential, the code must maintain strict TypeScript typing and follow the folder structure defined in Technical Spec (05) to ensure the platform remains maintainable.
*   **Value:** Prevents spaghetti code from stalling future changes in Phase 2.

### 1.7 Optimize for Small Team Development
*   **Application:** Given the solo developer constraint, database schema generation relies on Supabase's visual dashboard, and UI construction uses shadcn/ui primitives. This minimizes setup overhead and lets the developer focus on business logic.
*   **Value:** Multiplies solo developer output.

---

## 2. Project Phases & SISDAMAS Alignment

Development is divided into operational phases aligned with the four cycles of the KKN field schedule:

### 2.1 Phase 0: Preparation (1 Week Before KKN)
*   **Objectives:** Setup repository, establish database schema, configure Supabase Auth, and design the app shell.
*   **Required Features:** Next.js project skeleton, Supabase integration, basic Auth (Login/Logout), user profiles schema.
*   **Dependencies:** None.
*   **Expected Deliverables:** Clean landing page with a working login card. Master RT/RW tables seeded.
*   **Success Criteria:** Developer can log in as Admin and register a new surveyor user.
*   **Field Activities:** None.
*   **Digital Activities:** Setup repository, deploy to Vercel, seed master tables, verify RLS.
*   **Potential Risks:** Vercel build failures due to environment variable misconfiguration.

### 2.2 Phase 1: Siklus 1 - Community Engagement (KKN Day 1–3)
*   **Objectives:** Deploy the Digital Sticky Notes Board for the Rembug Warga session on KKN Day 2.
*   **Required Features:** Sticky note board UI, column classification (Aspirasi, Masalah, Potensi), sticky card CRUD operations, real-time sync.
*   **Dependencies:** Supabase Auth and database tables.
*   **Expected Deliverables:** Working interactive board at `/app/sticky-notes` accessible by surveyors.
*   **Success Criteria:** 100% of physical sticky notes collected during the Day 2 community session are successfully typed into the app on the same day.
*   **Field Activities:** Community meeting. Students collect aspirations on paper sticky notes.
*   **Digital Activities:** Surveyors input notes into the app. Developer monitors dashboard counts.
*   **Potential Risks:** Network disconnections at the community hall.

### 2.3 Phase 2: Siklus 2 - Social Mapping & Survey (KKN Day 4–8)
*   **Objectives:** Execute the door-to-door survey. Collect precise coordinates and photos for all 120 households.
*   **Required Features:** Survey form wizard, GPS capture, camera integration, offline queue (`localStorage` draft saves), background sync, Leaflet interactive map with filters.
*   **Dependencies:** Phase 1 database tables and auth layers.
*   **Expected Deliverables:** Survey form at `/app/surveys/new` and map at `/app/map`.
*   **Success Criteria:** 100% of surveyed households show valid coordinate pins on the map.
*   **Field Activities:** Door-to-door interviews. Capturing coordinates and home photos.
*   **Digital Activities:** Client-side photo compression, offline queue writes, automatic background sync, real-time map pin rendering.
*   **Potential Risks:** GPS location drift in narrow alleys, camera crashes on older Android phones.

### 2.4 Phase 3: Siklus 3 - Prioritisation & Planning (KKN Day 9–15)
*   **Objectives:** Score and rank community problems to prepare program plans.
*   **Required Features:** Priority Matrix USG table, problem scoring inputs (1–5 scale), ranking calculations, dashboard charts showing problem distributions.
*   **Dependencies:** Survey database records.
*   **Expected Deliverables:** Matrix table at `/app/priority`.
*   **Success Criteria:** Complete USG scores for all problems, generating a ranked list sorted by score descending.
*   **Field Activities:** Community deliberation to verify priority lists.
*   **Digital Activities:** Inputting USG scores, locking the matrix, updating dashboards.
*   **Potential Risks:** Data inconsistencies or duplicate problem listings.

### 2.5 Phase 4: Siklus 4 - Program Execution & Reporting (KKN Day 16–40)
*   **Objectives:** Track program tasks, archive files, and export data for the final LPJ report.
*   **Required Features:** Program tracking, task assignments, Google Drive sync proxy, Excel data export, PDF report generation.
*   **Dependencies:** Phase 3 priority rankings.
*   **Expected Deliverables:** Excel file download, Google Drive document folders, task sheets.
*   **Success Criteria:** All project documents synced to Google Drive, and the final survey Excel spreadsheet downloaded.
*   **Field Activities:** Execution of KKN community programs.
*   **Digital Activities:** Document archiving, calendar syncing, report generation.
*   **Potential Risks:** Google Drive API rate limits or quota exhaustion.

---

## 3. Weekly Implementation Timeline

To guide development during the 40-day KKN schedule, the implementation is broken down into a week-by-week schedule:

### 3.1 Week 1: Project Setup & Foundation (Pre-KKN - 7 Days)
*   **Objectives:** Initialize repository, deploy base app shell, configure auth, and seed geographic master data.
*   **Features:** Next.js project skeleton, Tailwind CSS configuration, shadcn/ui installation, Supabase Client setup, JWT secure cookie middleware guard, user signup admin script.
*   **Testing:** Unit tests for Auth helper functions. Verify middleware redirects.
*   **Deployment:** Deploy Next.js to Vercel production. Seed master project, dusun, rw, and rt tables in Supabase.
*   **Documentation:** Publish 00-09 documents in repository `/docs` folder.
*   **Field Usage:** None.
*   **Risks:** Database RLS policy blockages. (Mitigation: Test RLS policies using mock client).
*   **Expected Outcomes:** Next.js app is live at `https://sisdamas-kkn56.vercel.app` with working login form.

### 3.2 Week 2: Siklus 1 - Sticky notes & Rembug Warga (KKN Day 1–7)
*   **Objectives:** Deploy and support the Digital Sticky Notes Board for the Day 2 community session. Setup survey wizard.
*   **Features:** Sticky Board UI, note card CRUD, column switches, real-time WebSocket channel subscription, survey form wizard step 1-3.
*   **Testing:** Verify concurrency limits (15 surveyors editing sticky cards concurrently).
*   **Deployment:** Deploy sticky notes board to production.
*   **Documentation:** Update user guide with sticky board instructions.
*   **Field Usage:** Day 2 community rembug warga session. surveyors use tablets/phones to log aspirations.
*   **Risks:** Internet connectivity drops during meeting. (Mitigation: Implement optimistic UI updates).
*   **Expected Outcomes:** All community aspirations are typed, saved, and categorized on the digital board.

### 3.3 Week 3: Siklus 2 - Social Mapping & Household Survey (KKN Day 8–14)
*   **Objectives:** Launch the door-to-door survey. Collect coordinates and photos for all 120 households.
*   **Features:** Geolocation API capture, canvas image downsampling (80% quality), localStorage offline queue, Service Worker background sync trigger, Leaflet map coordinates pin layer.
*   **Testing:** GPS accuracy tests, offline queue sync verification, duplicate UUID check test.
*   **Deployment:** Deploy survey wizard and interactive map to production.
*   **Documentation:** Onboarding checklist for surveyors.
*   **Field Usage:** Day 4-8 door-to-door survey sprint. surveyors walk RT 01-09.
*   **Risks:** Device browser crash during photo upload. (Mitigation: Enforce 1MB payload size limits).
*   **Expected Outcomes:** Map shows completed survey pins, and database contains household locations.

### 3.4 Week 4: Siklus 3 - Prioritisation & scoring (KKN Day 15–21)
*   **Objectives:** Score and rank problems.
*   **Features:** USG priority matrix inputs, calculated scores sorting, ranked lists view, dashboard widgets.
*   **Testing:** Verify score calculation logic (U+S+G), check matrix lock policies.
*   **Deployment:** Deploy Priority Matrix module to production.
*   **Documentation:** Update user manual with scoring instructions.
*   **Field Usage:** Cycle 3 community prioritization session.
*   **Risks:** Survey data gaps. (Mitigation: Check progress dashboards before scoring).
*   **Expected Outcomes:** Priority Matrix locked, ranking output sorted by score descending.

### 3.5 Week 5: Siklus 4 - Execution & Google Drive Sync (KKN Day 22–28)
*   **Objectives:** Track KKN program tasks and test Google integrations.
*   **Features:** Program task boards, Service Account calendar sync proxy, Google Drive file archiver edge api.
*   **Testing:** Drive folder check, file duplicate upload test.
*   **Deployment:** Deploy Google Integration module to production.
*   **Documentation:** Update admin guide with Service Account rotation guides.
*   **Field Usage:** Track active community program tasks.
*   **Risks:** Google API quota exhaustion. (Mitigation: Defer drive syncs to manual admin triggers).
*   **Expected Outcomes:** Task board is active. Photos sync to Google Drive folders.

### 3.6 Week 6: Reporting & Handover (KKN Day 29–40)
*   **Objectives:** Generate final statistics reports and package codebase.
*   **Features:** Excel data export (SheetJS), PDF report generator, database dump tools.
*   **Testing:** Verify file headers in Excel exports, check PDF rendering layout.
*   **Deployment:** Final stable release tagged.
*   **Documentation:** Package complete handover documentation (00-15).
*   **Field Usage:** Presentation of final results to village officials.
*   **Risks:** Admin credentials lost during handoff. (Mitigation: Generate print guides for Kadus).
*   **Expected Outcomes:** Codebase handed over to campus. Village representative receives admin credentials.

---

## 4. MVP Definition (MoSCoW)

To prevent scope creep, feature sets are strictly classified using the MoSCoW framework:

### 4.1 Must Have (Critical MVP for Day 2 / Day 4)
*   **Authentication:** Email/password login with secure cookies. Role checking for surveyors. (Required to prevent unauthorized writes).
*   **Sticky Note Board:** Core CRUD operations for notes. Categorized columns with real-time updates. (Required for Day 2 Warga Rembug).
*   **Survey Wizard:** Multi-step form, GPS geolocation capture, camera upload with client-side compression. (Required for Day 4 Survey).
*   **Offline Queue:** localStorage drafts save and auto-sync retry on connection recovery. (Required due to intermittent village signal).
*   **Interactive Map:** Leaflet.js map displaying coordinates with RT and status filters. (Required to track survey progress visually).
*   **Audit Logging:** Database triggers logging writes. (Required for data auditing).

### 4.2 Should Have (Required for KKN, can be built after Day 8)
*   **Priority Matrix:** USG scoring fields (1–5 scale), total score math, and ranked list view. (Required for Cycle 3).
*   **Program Tracking:** Simple program task boards and PIC assignments. (Required for Cycle 4).
*   **Excel Export:** SheetJS xlsx export for raw survey data. (Required to backup and analyze data).
*   **Private Storage:** Photos saved in private Supabase Storage buckets, loaded via signed URLs. (Required for security).

### 4.3 Could Have (Good to have, deferred to Phase 2)
*   **Google Drive Archive:** Service Account sync proxy to upload files and organize folders automatically.
*   **Google Calendar Sync:** Project timeline deadlines pushed to shared calendar.
*   **In-App Alerts:** Real-time toast notifications for task updates.
*   **PDF Report:** Server-side jsPDF generator for final summary statistics.

### 4.4 Won't Have (Excluded from current KKN timeline)
*   **Multi-tenant SaaS dashboard:** The database contains a `project` table structure, but project switching UIs are out of scope.
*   **Advanced GIS Border Drawing:** Custom boundary drawing on maps is deferred.
*   **Public Website Profile:** Lowers priority compared to internal data collection tools.

---

## 5. Milestones

Milestones represent verified deliveries of user value:

*   **Milestone 1: Project Skeleton & Database Schema Ready (Day -2)**
    *   *Deliverable:* Repository initialized. Next.js boilerplate deployed to Vercel. Supabase project connected with RLS and master RT tables seeded. Login route active.
*   **Milestone 2: Sticky Notes Board Operational (Day 2)**
    *   *Deliverable:* Digital sticky notes board at `/app/sticky-notes` active. Real-time updates verified. Ready for the Day 2 community session.
*   **Milestone 3: Survey Wizard & GIS Map Active (Day 4)**
    *   *Deliverable:* Survey creation wizard, GPS geolocation, offline local drafts, camera compression, and Leaflet map pins active. Surveyor onboarding complete.
*   **Milestone 4: Priority Matrix Locked (Day 12)**
    *   *Deliverable:* All survey problems scored and ranked. The matrix is locked by the Admin.
*   **Milestone 5: Google Drive Archiving & Final Handover Complete (Day 40)**
    *   *Deliverable:* All survey photos and documents synced to Google Drive. Raw Excel data downloaded. Handover documentation completed.

---

## 6. Iteration Plan

Development is divided into five iterations:

### 6.1 Iteration 1: Shell & Authentication (Sprint Week 1)
*   **Objectives:** Initialize Next.js project, implement Supabase Auth, and design the sidebar layout.
*   **Features:** Next.js scaffolding, Tailwind, shadcn/ui setup, Middleware auth guards, user profiles.
*   **Dependencies:** None.
*   **Risks:** Build issues on Vercel. (Mitigation: Deploy blank project immediately).
*   **Deliverables:** Next.js repository on GitHub, deployed on Vercel with working login.
*   **Acceptance Criteria:** A user can log in, see their name in the sidebar, and log out.
*   **Testing Goals:** Verify cookie storage path, validate invalid credential handling.
*   **Exit Criteria:** Middleware successfully blocks unauthenticated access to `/app/*`.

### 6.2 Iteration 2: Siklus 1 - Sticky Board (Sprint Week 2)
*   **Objectives:** Build the collaborative board for the Day 2 community session.
*   **Features:** Board container, columns list, note card CRUD, column change updates, color tags.
*   **Dependencies:** Iteration 1 auth.
*   **Risks:** WebSocket disconnection during meetings. (Mitigation: Implement optimistic local UI updates).
*   **Deliverables:** Live sticky notes board at `/app/sticky-notes`.
*   **Acceptance Criteria:** Multiple logged-in members can add, drag, and delete cards concurrently.
*   **Testing Goals:** Simulate 15 members editing cards simultaneously.
*   **Exit Criteria:** Board ready and tested by KKN members.

### 6.3 Iteration 3: Siklus 2 - Survey Wizard & GIS Map (Sprint Week 3)
*   **Objectives:** Build the core survey tools for the Day 4–8 field sprint.
*   **Features:** Survey form wizard, browser geolocation capture, canvas image compression, localStorage offline queue, Leaflet map coordinates.
*   **Dependencies:** Iteration 1 & 2 databases.
*   **Risks:** Low-end phone browser crashes, GPS timeouts. (Mitigation: Implement manual GPS fallback, restrict file upload sizes).
*   **Deliverables:** Survey form at `/app/surveys/new` and map at `/app/map`.
*   **Acceptance Criteria:** Surveyor can fill out a survey, take a photo, capture coordinates, save offline, and sync upon connection recovery.
*   **Testing Goals:** Test geolocation accuracy in dense spaces. Verify image compression.
*   **Exit Criteria:** Surveyor onboarding session complete.

### 6.4 Iteration 4: Siklus 3 - USG Priority Matrix (Sprint Week 4)
*   **Objectives:** Score and rank problems.
*   **Features:** USG scoring inputs, total score calculations, ranked lists, dashboard stats charts.
*   **Dependencies:** Survey database records.
*   **Risks:** Incomplete survey data. (Mitigation: Verify survey completion via dashboard before locking the matrix).
*   **Deliverables:** Priority Matrix page at `/app/priority`.
*   **Acceptance Criteria:** Admin can input scores, sort problems, and lock the matrix to prevent edits.
*   **Testing Goals:** Verify score calculations.
*   **Exit Criteria:** Matrix locked, list sorted.

### 6.5 Iteration 5: Siklus 4 - Execution & Final Handover (Sprint Week 5)
*   **Objectives:** Track KKN program tasks and export final reports.
*   **Features:** Program task boards, Service Account calendar sync proxy, Google Drive file archiver edge api.
*   **Dependencies:** Iteration 4 priority rankings.
*   **Risks:** Google API quota exhaustion. (Mitigation: Defer drive syncs to manual admin triggers).
*   **Deliverables:** Excel file download, Google Drive folder structure synced.
*   **Acceptance Criteria:** Documents uploaded to the app show in Google Drive folder, Excel sheet downloads successfully.
*   **Testing Goals:** Verify file integrity post-sync, check Excel sheet headers.
*   **Exit Criteria:** Handover files packaged.

---

## 7. Task Breakdown

Every milestone is broken down into specific implementation tasks:

### 7.1 Milestone 1: Setup & Authentication
1.  Initialize Next.js project skeleton using TS and Tailwind CSS.
2.  Install shadcn/ui components (Button, Input, Form, Dialog).
3.  Connect Next.js to Supabase via server client.
4.  Write PostgreSQL schema for `user_profile` table.
5.  Implement login form route `/login` using Zod validation.
6.  Setup Next.js Middleware to guard `/app/*` routes.
7.  Write logout trigger.

### 7.2 Milestone 2: Sticky Notes Board
1.  Write PostgreSQL schemas for `sticky_board`, `sticky_column`, and `sticky_note`.
2.  Implement board layout grid UI at `/app/sticky-notes`.
3.  Write note card components.
4.  Implement CRUD operations on notes.
5.  Setup Supabase Realtime channel for the notes table.
6.  Write column-switch updates logic.

### 7.3 Milestone 3: Survey Wizard & GIS Map
1.  Write PostgreSQL schemas for `household`, `survey`, `problem`, `potential`, and `household_photo`.
2.  Create multi-step survey wizard form UI at `/app/surveys/new`.
3.  Implement browser geolocation hook (`getCurrentPosition`).
4.  Write canvas image downsampling logic.
5.  Implement local offline queue (`localStorage` writes/reads).
6.  Write Service Worker connection event listener for background sync.
7.  Write batch sync API `/api/sync` with idempotency UUID checks.
8.  Import react-leaflet map at `/app/map` and bind coordinates to marker layer.
9.  Write map filter panels (Zustand state).

### 7.4 Milestone 4: Priority Matrix
1.  Write PostgreSQL schemas for `priority_matrix` and `priority_item`.
2.  Create priority scoring table UI at `/app/priority`.
3.  Write USG score edit handlers (Zod verification).
4.  Implement auto-sorting logic by score descending.
5.  Write matrix-locking switch.
6.  Create Recharts components on the dashboard to show category splits.

### 7.5 Milestone 5: Google Sync & Handover
1.  Write Google Service Account client service at `/lib/google/auth.ts`.
2.  Create Vercel Edge API proxy for file uploads to Google Drive.
3.  Write folder-check and file-write sequence for Google Drive API.
4.  Implement spreadsheet compile service (SheetJS) at `/api/reports/excel`.
5.  Setup final project handover files.

---

## 8. Development Order

The safest implementation order follows a bottom-up dependencies structure:

1.  **Next.js Boilerplate & Supabase DB Setup:** Establish connection and basic schemas.
2.  **Auth & Middleware Guards:** Ensure endpoints are protected before writing data.
3.  **Sticky Notes Board (Cycle 1):** Build notes board to support the Day 2 Rembug Warga.
4.  **Geolocation & Camera Inputs:** Verify sensor reading capabilities before completing forms.
5.  **Survey Form & Offline Queue:** Connect geolocation inputs to the wizard step-form.
6.  **Leaflet GIS Map Pins:** Render completed surveys as pins filterable by RT.
7.  **USG Priority Scoring:** Pull survey problems into the scoring table.
8.  **Program Task Tracking:** Setup project tasks linked to prioritized problems.
9.  **Excel Exports:** Write data export scripts.
10. **Google Drive Sync:** Sync photos and spreadsheets to village Drive folders.

*   **Prerequisite Tasks:** Setup database, RLS tables, and authorization profiles. You cannot build forms or boards without the database backend and user authentication roles active.
*   **Blocking Tasks:** GPS capture and image compression must be verified before the survey form wizard is completed. Geolocation accuracy rules block rendering markers on the Leaflet map layer. Survey data collection blocks priority matrix calculations.

---

## 9. Daily Deployment & Operations Plan

During the active KKN fieldwork, the solo developer implements a strict daily deployment routine to manage risks:

*   **08:00 - 12:00 (Morning - Field Window):** Developer participates in KKN fieldwork and monitors platform usage on surveyors' phones. No code changes are made.
*   **13:00 - 15:00 (Afternoon - Dev/Fix Window):** Developer addresses reported UI issues, coordinate bugs, or sync errors. Changes are pushed to the git `develop` branch.
*   **15:00 - 17:00 (Late Afternoon - Testing Window):** Developer tests changes locally and verifies them on a staging preview build on Vercel.
*   **18:00 - 20:00 (Evening - Deployment Window):** If preview builds pass all checks, developer merges changes to the `main` branch. Vercel auto-deploys to production.
*   **21:00 - 22:00 (Night - Backup Window):** Admin runs a manual database dump of active households via the Supabase console, verifying backup storage.

---

## 10. Field Readiness Checkpoints

Before starting each KKN cycle, the platform must pass a readiness checklist:

### 10.1 Cycle 1 (Sticky Notes Board)
*   [ ] Boards and columns tables seeded in Supabase.
*   [ ] Authenticated surveyors can log in and view the board.
*   [ ] Concurrent note card creation verified on at least 3 devices.
*   [ ] Card color-coding and RT tags render correctly.
*   [ ] Sidebar navigation includes a link to the board.

### 10.2 Cycle 2 (Social Mapping & Survey)
*   [ ] Master RT/RW tables seeded.
*   [ ] Browser Geolocation API captures coordinates on surveyor devices.
*   [ ] Photo compression reduces file sizes to ≤800KB.
*   [ ] Offline queue saves surveys to localStorage when offline.
*   [ ] Sync endpoint validates `client_uuid` to block duplicates.
*   [ ] Leaflet map renders green pins for completed surveys.
*   [ ] Surveyor onboarding complete.

### 10.3 Cycle 3 (Priority Matrix)
*   [ ] 100% of Dusun 2 households are accounted for.
*   [ ] Problems and potentials tables contain data linked to surveys.
*   [ ] Priority scoring fields restrict inputs to 1–5.
*   [ ] Sort logic updates ranks dynamically by score descending.
*   [ ] Matrix lock disables edits for surveyor roles.

### 10.4 Cycle 4 (Program Execution & Reporting)
*   [ ] Program tables link back to prioritized problems.
*   [ ] Task due date alerts write notifications to user profiles.
*   [ ] Google Service Account permissions check out on Drive folders.
*   [ ] Excel export compiles columns without formatting issues.
*   [ ] Database backups verified.

---

## 11. Demonstration Plan

To verify progress and build stakeholder trust, the project team runs structured demonstration events:

### 11.1 Internal Team Demo (Day 1 of KKN)
*   **Objectives:** Verify KKN members can navigate the dashboard and understand user roles.
*   **Required Features:** Dashboard UI, login, profile view.
*   **Preparation:** Create 15 surveyor accounts.
*   **Expected Feedback:** Usability concerns regarding mobile layout sizes.
*   **Success Criteria:** Every surveyor successfully logs in.

### 11.2 Pilot Survey Field Trial (Day 3 of KKN)
*   **Objectives:** Test GPS capture and camera upload in simulated village field conditions.
*   **Required Features:** Survey form wizard, GPS capture, image compression.
*   **Preparation:** Register 1 test household.
*   **Expected Feedback:** GPS accuracy warnings, upload speed comments.
*   **Success Criteria:** Test survey syncs successfully. Map marker renders green.

### 11.3 Village Government Demo (Day 9 of KKN)
*   **Objectives:** Present aggregated survey results and map progress to RW/RT chiefs and the Kadus.
*   **Required Features:** Map pins filterable by RT, dashboard charts showing problem counts.
*   **Preparation:** Anonymize coordinates for public view.
*   **Expected Feedback:** Validation of problem categories.
*   **Success Criteria:** Village Head understands the map progress bars and dashboard charts.

---

## 12. Project Handover Plan

To ensure the project remains sustainable after the 40-day KKN window:

1.  **Documentation Package:** Package all markdown documentation files (00–15) inside the `/docs` folder of the repository.
2.  **Source Code Handover:** Push the final codebase to the village or campus GitHub organization. Include a README explaining local setup instructions.
3.  **Database Backup:** Run a final PostgreSQL database dump. Export all tables to CSV and save them to the shared Google Drive folder.
4.  **Google Drive Archive:** Verify that all uploaded household photos and documentation PDFs are organized into folders on the village's shared Google Drive.
5.  **Admin Account Transfer:** Transfer the Super Admin Supabase account credentials to the Kadus (village representative) or the campus DPL.
6.  **Operations Guide:** Hand over the Deployment Operations Guide (13) and User Manual (14) to village administrators, detailing Vercel hosting setup.

---

## 13. Risk Management

The project delivery schedule is subject to these operational risks:

*   **Schedule Risk: Solo developer falls sick.**
    *   *Mitigation:* Keep the Phase 1 MVP scope locked. Document setup guides early. Keep repository public on GitHub.
*   **Technical Risk: Google API rate limits hit on free tier.**
    *   *Mitigation:* Google Drive archiving runs on-demand (triggered by Admin) rather than automatically for every surveyor upload.
*   **Scope Risk: KKN team requests advanced features during survey.**
    *   *Mitigation:* Strictly enforce the PRD scope boundary. Place all late-stage requests in the "Future Roadmap" section.
*   **GIS Risk: Low GPS signal in dense areas.**
    *   *Mitigation:* Implement manual coordinate entry fallback, allowing surveyors to place pins on the map manually.
*   **Integration Risk: Supabase database reaches disk limits.**
    *   *Mitigation:* Compress photos to ≤800KB. Archive files to Google Drive, and delete old uploads from Supabase storage periodically.

---

## 14. Quality & Testing Strategy

To ensure platform stability:

*   **Code Review:** The solo developer reviews all pull requests before merging changes into the `main` branch.
*   **Manual Testing:** Surveyor onboarding includes a practice session where members submit test entries.
*   **Integration Testing:** Verify the sync service successfully handles duplicate `client_uuid` inputs.
*   **Performance Review:** Check map marker load speeds on low-end Android browsers.
*   **Security Review:** Verify RLS policies block unauthorized write requests.

---

## 15. Testing Schedule

Testing activities are scheduled throughout development:

### 15.1 Unit Testing
*   *When:* Done during feature development.
*   *Scope:* Schema validators (Zod), score math.

### 15.2 Integration Testing
*   *When:* After completing Iteration 3.
*   *Scope:* Offline queue localStorage writes, sync queue processing, coordinate precision formatting.

### 15.3 Manual Testing
*   *When:* Daily during field trials.
*   *Scope:* Geolocation accuracy on surveyor phones, image uploads.

### 15.4 Regression Testing
*   *When:* Before merging releases into the main branch.
*   *Scope:* Checking auth middleware, dashboard metrics, sitemap navigation.

---

## 16. Team Responsibilities & Project Management

Given the small university KKN team constraints:

*   **Solo Developer:** Manages database setup, Next.js page development, and deployment.
*   **KKN Team Leader:** Acts as Scrum Master. Manages the weekly timeline and schedules community meetings.
*   **KKN Team Members (15 students):** Act as field surveyors. Responsible for conducting interviews, capturing coordinates, and uploading photos.
*   **Village Officials:** Review progress maps, participate in Rembug Warga meetings, and verify prioritized problem rankings.

---

## 17. GitHub Workflow

To manage the codebase:

*   **Branching:**
    *   `main`: Contains the stable production code. Auto-deploys to Vercel.
    *   `develop`: Contains current sprint integrations.
    *   `feature/*`: Temporary feature branches.
*   **Commit Messages:** Commit messages use standard prefix conventions (e.g. `feat: add survey wizard`, `fix: map reload error`).
*   **Code Review Rules:** Given the solo developer constraint, self-merges to `develop` are allowed. Merges from `develop` to `main` require a successful staging preview deployment check on Vercel.
*   **Release Tags:** Releases are tagged using semantic versioning (e.g. `v1.0.0-mvp`, `v2.0.0-final`).

---

## 18. Success Metrics

We measure delivery success against these targets:

*   **Completed Features:** 100% of Must-Have features (Section 4.1) active by KKN Day 4.
*   **Open Bugs:** 0 critical blocking bugs in the production survey pipeline.
*   **Deployment Success:** Deployment takes <5 minutes on Vercel.
*   **Survey Completion:** 100% of Dusun 2 households (estimated ~120) successfully mapped and surveyed by Day 8.
*   **Performance Target:** Page load time on the map screen <3 seconds.
*   **User Feedback:** Surveyor onboarding takes <15 minutes.

---

## 19. Final Review & Future Roadmap

### 19.1 Final Review Decisions
*   Advanced GIS polygon drawing is deferred to Phase 2.
*   Public visitor logins are removed to simplify the user profile role schema.
*   Reports and Exports are focused on Excel downloads to support LPJ needs.

### 19.2 Future Roadmap (Phase 2 & Beyond)
*   **Capacitor Native Android wrapper:** For offline background syncing.
*   **AI Auto-taxonomy:** Text categorization assistant in survey form fields.
*   **Google Drive Automatic Mirroring:** Automatic document backup sync.

---

*This Development Roadmap is derived from `10_DEVELOPMENT_ROADMAP_PROMPT.md` and is fully subordinate to `00_PROJECT_FOUNDATION.md`, `02_SYSTEM_BLUEPRINT.md`, `03_PRD.md`, `04_UX_SPECIFICATION.md`, `05_TECHNICAL_SPECIFICATION.md`, `06_DATABASE_SPECIFICATION.md`, and `07_DATA_FLOW_SPECIFICATION.md`. No source code or pipeline scripts are generated in this document.*

---

**Would you like to revise this Development Roadmap before we proceed to generate the Test Plan (`12_TEST_PLAN.md`)?**

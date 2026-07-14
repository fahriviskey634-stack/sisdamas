# SISDAMAS Digital Platform
## Product Requirements Document (PRD)

| | |
|---|---|
| **Document** | 03 — Product Requirements Document |
| **Version** | 1.0 |
| **Status** | Draft — Pending Review |
| **Predecessors** | 00_PROJECT_FOUNDATION · 01_PRODUCT_DISCOVERY · 02_SYSTEM_BLUEPRINT |
| **Prepared By** | Product Organization (Principal PM, Senior BA, UX Lead, GIS Architect, Solution Architect, Gov. Digital Transformation Consultant) |
| **Platform** | SISDAMAS Digital Platform — KKN Kelompok 56, UIN Sunan Gunung Djati Bandung |
| **Location** | Dusun 2, Desa Sukahaji, Kec. Cipendeuy, Kab. Bandung Barat, West Java, Indonesia |
| **Language** | Documents: English · UI/UX: Bahasa Indonesia |

> **Document role:** This PRD defines **WHAT** will be built — not HOW. It translates the System Blueprint into concrete, traceable requirements that designers, developers, QA engineers, stakeholders, village representatives, and KKN students can all understand. Every requirement here is subordinate to the decisions fixed in the Project Foundation document and must not contradict them.

---

## Table of Contents

1. [Product Goals](#1-product-goals)
2. [Target Users](#2-target-users)
3. [MVP Prioritization (MoSCoW)](#3-mvp-prioritization-moscow)
4. [Feature Specifications](#4-feature-specifications)
   - 4.1 Authentication & Authorization
   - 4.2 Sticky Notes Board (Cycle 1)
   - 4.3 Household Survey + GPS + Photos (Cycle 2)
   - 4.4 GIS Interactive Map
   - 4.5 Dashboard & Progress Monitoring
   - 4.6 Priority Matrix — USG Scoring (Cycle 3)
   - 4.7 Program Management (Cycle 4)
   - 4.8 Documentation Center
   - 4.9 Google Drive Integration
   - 4.10 Google Calendar Integration
   - 4.11 Reporting & Export
   - 4.12 Public Website
   - 4.13 User Management (Admin)
   - 4.14 Master Data Management (Admin)
   - 4.15 Notifications
   - 4.16 Audit Logs
5. [User Stories](#5-user-stories)
6. [Acceptance Criteria (Gherkin)](#6-acceptance-criteria-gherkin)
7. [Business Rules](#7-business-rules)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Reporting Requirements](#9-reporting-requirements)
10. [Notification Requirements](#10-notification-requirements)
11. [Success Metrics & KPIs](#11-success-metrics--kpis)
12. [Risk Analysis](#12-risk-analysis)
13. [Requirement Traceability Matrix](#13-requirement-traceability-matrix)
14. [Future Roadmap](#14-future-roadmap)

---

## 1. Product Goals

### 1.1 Vision

> Create a modern, integrated, GIS-enabled community empowerment platform that transforms the SISDAMAS process into a transparent, data-driven, collaborative, and sustainable digital ecosystem.

### 1.2 Mission

To achieve the vision under real-world KKN constraints by:

1. Replacing paper with structured digital capture for sticky notes and household surveys — without adding friction to the interview process.
2. Making location data GIS-ready by default — every household becomes a mappable object the moment it is surveyed, with no manual re-entry.
3. Giving the team live visibility into survey coverage and community input, so gaps are caught during the 8-day field window.
4. Preserving every stakeholder's trust — residents' data handled with consent and appropriate privacy.
5. Leaving a foundation, not just a deliverable — a data model that future KKN teams can reuse through configuration, not rebuilding.

### 1.3 Business Objectives

| ID | Objective | Target | Phase |
|---|---|---|---|
| BO-01 | Digitize 100% of Cycle 1 community aspirations on Day 2 | 100% same-day capture | 1 |
| BO-02 | Complete household survey coverage for all Dusun 2 households by end of Day 8 | 100% coverage | 1 |
| BO-03 | Eliminate all manual re-entry of survey, photo, or GPS data | 0 manual re-entry incidents | 1 |
| BO-04 | Provide real-time survey progress visibility during Day 4–8 | Live dashboard + map | 1 |
| BO-05 | Supply structured statistics and exports for the LPJ/final report | Available within 1 day of request | 2 |
| BO-06 | Establish a GIS-ready household data foundation for Cycles 3 and 4 | No redesign required | 1 |
| BO-07 | Document a credible path to multi-village reuse | Architecture Decision Records | 2 |

### 1.4 Product Principles

| Principle | Application |
|---|---|
| Transparency | Community and officials can see how their input is used |
| Data Integrity | Single source of truth; no re-entry, no duplication |
| Community Participation | Sticky notes and surveys capture resident voice, not just admin data |
| Ease of Use | Usable with under 15 minutes of training; no formal training budget |
| Mobile-First | Designed for Android phones, one-handed, outdoors |
| Offline-Friendly | Local draft + auto-retry; no full offline-first engineering complexity |
| Ethical Data Collection | Consent and appropriate GPS/photo handling from day one |
| Pragmatic Simplicity | Every feature defaults to the simplest version that meets the immediate need |
| GIS-First Thinking | Every household is a mappable object at the moment of creation |
| Maintainability | Simple enough for another developer to understand and continue |

### 1.5 Product Strategy

Phase 1 (Day 1–8): Deliver a narrow, disciplined MVP that survives the 8-day critical field window. Authentication, Sticky Notes, Household Survey with GPS/Photos, Simple Map, Basic Dashboard.

Phase 2 (Day 9–40): Build the full platform during the remaining KKN period. Priority Matrix, Program Management, Documentation Center, Google integrations, Reporting exports, Public Website.

---

## 2. Target Users

### 2.1 Super Administrator

| Attribute | Details |
|---|---|
| **Who** | Solo builder (1 person) — the same developer building the platform |
| **Count** | 1 account |
| **Access** | Full system: user management, master data, Google integrations, backups, audit logs, data lock |
| **Goals** | Keep the system running; manage users and master data; export data for LPJ |
| **Needs** | Simple admin panel; clear audit trail; one-click data export |
| **Pain Points** | No technical backup; single point of failure; also doing KKN fieldwork |
| **Success Metrics** | System uptime during Day 2 and Day 4–8; all 15 members onboarded in <15 min each |

### 2.2 KKN Team Member (Surveyor)

| Attribute | Details |
|---|---|
| **Who** | All 15 KKN students |
| **Count** | 15 accounts (equal permissions) |
| **Access** | Fill surveys, GPS/photos, view dashboard/map/statistics, manage own data |
| **Goals** | Complete Cycle 1 + Cycle 2 efficiently within the 8-day window |
| **Needs** | Fast, reliable, mobile-friendly tool; near-zero training; works with weak signal |
| **Pain Points** | Short survey window (5 days); fear of data loss; unfamiliar with digital tools |
| **Success Metrics** | ≥95% GPS capture success; 0 data loss incidents; onboarding <15 minutes |

### 2.3 Public Visitor (includes Village Officials)

| Attribute | Details |
|---|---|
| **Who** | General public, Village Officials (Kadus, RT, RW, Kepala Desa), future KKN teams |
| **Count** | Unlimited, no login |
| **Access** | Public pages only — anonymized map, statistics, gallery, news (Phase 2) |
| **Goals** | Understand KKN activities; see community data transparently |
| **Needs** | No login required; mobile-friendly; simple summaries |
| **Pain Points** | Previously had no digital channel for KKN information |
| **Success Metrics** | Public pages load in <3 seconds; statistics clearly readable on mobile |

### 2.4 Extended Stakeholders (No Direct Platform Access)

| Stakeholder | Interaction with Platform |
|---|---|
| Supervising Lecturer (DPL) | Receives exported statistics/data for LPJ verification |
| University (UIN SGD Bandung) | Receives platform documentation as digital-transformation KKN output |
| Village Residents (Dusun 2 households) | Data subjects; surveyed during Day 4–8; no platform access |

---

## 3. MVP Prioritization (MoSCoW)

### Must Have — Phase 1 (Day 1–8 Critical Path)

| ID | Feature | Rationale |
|---|---|---|
| MH-01 | Authentication (login, session, logout) | Required before any data can be attributed or protected |
| MH-02 | User Management (admin creates/manages KKN member accounts) | Must exist before team can log in |
| MH-03 | Master Data Setup (Dusun/RW/RT hierarchy) | Required before survey can reference geographic areas |
| MH-04 | Digital Sticky Notes Board | Required for Day 2 community session |
| MH-05 | Household Survey Form (GPS + photos + problems + potentials) | Required for Day 4–8 survey sprint |
| MH-06 | Offline Draft + Auto-Sync | Required for field use with intermittent signal |
| MH-07 | GIS Map (pin markers + filter by RT/RW + real-time updates) | Required for coverage visibility during Day 4–8 |
| MH-08 | Basic Dashboard (survey count + per-RT progress) | Required for daily monitoring during 5-day sprint |
| MH-09 | Audit Log (who submitted what, when) | Required for data accountability |

### Should Have — Phase 2 (Day 9–40)

| ID | Feature | Rationale |
|---|---|---|
| SH-01 | Priority Matrix (USG Scoring) | Required for Cycle 3 — not needed before Day 8 |
| SH-02 | Program Management (tasks, timeline, monitoring) | Required for Cycle 4 |
| SH-03 | Documentation Center (upload, organize, view) | Needed across all cycles but not Day 1–8 critical |
| SH-04 | Reporting & Export (PDF, Excel, CSV, GeoJSON) | Needed for LPJ but not during field window |
| SH-05 | Google Drive Integration | Useful for archiving but not field-critical |
| SH-06 | Google Calendar Integration | Useful for scheduling but not field-critical |
| SH-07 | Statistics Dashboard (charts, trends) | Useful throughout but basic dashboard covers Day 1–8 |
| SH-08 | Notifications (in-app alerts) | Useful but not mission-critical |

### Could Have — Phase 2 (Lower Priority)

| ID | Feature | Rationale |
|---|---|---|
| CH-01 | Public Website (Landing, Village Profile, Gallery, News) | Confirmed lower priority than internal tools |
| CH-02 | Advanced GIS (heatmaps, clustering, drawing tools) | Useful but not justified for Phase 1 timeline |
| CH-03 | GeoJSON/KML export from map | Useful but can be done from Reports page |
| CH-04 | Dark mode | UX enhancement, not functional requirement |
| CH-05 | Voice notes in survey | Useful but photo + text covers the need |

### Won't Have — Any Phase

| ID | Feature | Rationale |
|---|---|---|
| WH-01 | Multi-village / multi-tenant architecture (built) | Documented path only; not built in this iteration |
| WH-02 | Full offline-first sync engine with conflict resolution | Good signal confirmed; draft-and-retry is sufficient |
| WH-03 | Fully automated LPJ report generation | Platform supplies data and statistics only |
| WH-04 | Social media integration | Out of scope entirely |
| WH-05 | Financial accounting / budgeting | Out of scope entirely |
| WH-06 | Civil registry / resident ID management | Out of scope entirely |
| WH-07 | E-commerce | Out of scope entirely |

---

## 4. Feature Specifications

### 4.1 Authentication & Authorization

**REQ-AUTH**

| Attribute | Details |
|---|---|
| **Purpose** | Secure access control; ensure data is attributed to the correct user |
| **Business Value** | Without auth, no data can be protected or attributed; enables audit trail |
| **User Value** | Each KKN member has a personal account; admin has full control |
| **Priority** | MUST HAVE — Day 1 |
| **Dependencies** | Supabase Auth service |

**Description:**
The platform uses Supabase Auth for email/password authentication. Three roles exist: Super Administrator (1 account), KKN Team Member (up to 15 accounts), and Public Visitor (no account required). The Super Admin creates all KKN member accounts — self-registration is disabled.

**Workflow:**
1. Admin creates KKN member account in Admin Panel (email + temporary password)
2. Member opens platform URL, enters email + password
3. System validates credentials via Supabase Auth
4. Session token issued; user redirected to Dashboard
5. Session persists for 7 days; refreshed on activity
6. Logout clears session; member redirected to Login page
7. Forgot Password sends reset link via email

**Permissions Matrix:**

| Action | Super Admin | KKN Member | Public Visitor |
|---|---|---|---|
| Login | YES | YES | N/A |
| View Dashboard | YES | YES | NO |
| Create Surveys | YES | YES | NO |
| Edit Own Surveys | YES | YES (own only) | NO |
| Edit Any Survey | YES | NO | NO |
| Delete Survey | YES | Soft-delete own | NO |
| View GIS Map (app) | YES | YES | NO |
| View Public Map | YES | YES | YES |
| Create Sticky Notes | YES | YES | NO |
| Manage Users | YES | NO | NO |
| Manage Master Data | YES | NO | NO |
| View Audit Logs | YES | NO | NO |
| Export Data | YES | YES (limited) | NO |
| Lock/Publish Data | YES | NO | NO |

**Edge Cases:**
- If email already exists, system shows error "Email sudah terdaftar"
- If password wrong 5 times, account temporarily locked for 15 minutes
- Super Admin account cannot be deleted or demoted

**Error Handling:**
- Invalid credentials: "Email atau password salah"
- Session expired: Redirect to login with message "Sesi berakhir, silakan login kembali"
- Network error during login: "Tidak dapat terhubung ke server, periksa koneksi internet"

---

### 4.2 Sticky Notes Board (Cycle 1)

**REQ-STICKY**

| Attribute | Details |
|---|---|
| **Purpose** | Digitize the Cycle 1 community aspiration-gathering session (Day 2) |
| **Business Value** | Eliminates paper sticky note loss; creates searchable, categorized digital record |
| **User Value** | Real-time collaborative board visible to all 15 KKN members simultaneously |
| **Priority** | MUST HAVE — Day 2 critical |
| **Dependencies** | REQ-AUTH, Supabase Realtime |

**Description:**
The Sticky Notes Board replaces physical sticky notes used during the Day 2 community session ("rembug warga"). The board displays categorized columns where KKN members can create digital notes representing community aspirations, problems, and potentials — in real time, visible to all logged-in team members.

**Board Structure:**

| Column | Bahasa Label | Content |
|---|---|---|
| Aspirasi | Harapan & Aspirasi | Community wishes and hopes |
| Masalah | Masalah & Keluhan | Problems and complaints raised |
| Potensi | Potensi Desa | Village strengths and opportunities |
| Lainnya | Catatan Lainnya | Miscellaneous notes |

**Note Attributes:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Content | Textarea | YES | The aspiration/problem text |
| Column | Select | YES | Aspirasi / Masalah / Potensi / Lainnya |
| Color | Select | NO | Visual differentiation (Yellow, Red, Green, Blue, Purple) |
| RT/RW Tag | Select | NO | Geographic tagging for later prioritization |
| Created By | Auto | YES | Logged-in user |
| Created At | Auto | YES | Timestamp |

**Workflow:**
1. KKN member opens Sticky Notes Board
2. Clicks "+ Tambah Catatan" or clicks directly on a column
3. Types note content in modal
4. Selects column category
5. Optionally assigns color and RT/RW tag
6. Saves note — appears instantly on all users' boards (Supabase Realtime)
7. Notes can be edited or deleted by their creator (or admin)
8. After Day 2, board is archived; notes feed into Priority Matrix (Cycle 3)

**Future Enhancement:** Export board as PDF or image for meeting documentation.

**Edge Cases:**
- Empty note content: Cannot save, show validation error
- If Realtime disconnects, board still shows last-known state; reconnects automatically
- Notes cannot be deleted if already referenced by Priority Matrix

---

### 4.3 Household Survey + GPS + Photos (Cycle 2)

**REQ-SURVEY**

| Attribute | Details |
|---|---|
| **Purpose** | Digitize household interviews with automatic GPS capture and photo documentation |
| **Business Value** | Eliminates manual re-entry; makes every household a GIS object at moment of creation |
| **User Value** | Fast, mobile-optimized form; works with weak signal; never loses field data |
| **Priority** | MUST HAVE — Day 4 critical |
| **Dependencies** | REQ-AUTH, REQ-MASTER-DATA, Supabase Storage, GPS API |

**Description:**
The core data collection feature. Each surveyed household becomes a record in the database with structured form data, GPS coordinates, problem/potential entries, and photos. Designed for Android phones, one-handed, outdoors. Offline drafts are automatically synced when signal returns.

**Survey Form Fields:** (Full specification in System Blueprint, Section 8.3)

*Core Fields:* RT, RW, KK Name, KK Number (optional), Family Size, Housing Status, Housing Condition, Latitude, Longitude, GPS Accuracy.

*Problems (repeating):* Category (Infrastruktur / Kesehatan / Pendidikan / Ekonomi / Lingkungan / Sosial-Budaya / Keamanan), Description.

*Potentials (repeating):* Category (same taxonomy), Description.

*Photos:* Up to 10 photos per household, JPEG, compressed to max 1MB.

**Workflow:** (As specified in System Blueprint Phase 8.2)

**Business Rules:**
- Survey cannot be submitted without at least one valid GPS coordinate (auto or manual)
- A household can only have one primary survey record
- Photos must be compressed before upload (canvas API, target ≤1MB)
- Offline drafts are identified by a client-generated UUID to prevent duplicate submissions
- KKN members can only edit surveys they created; admin can edit any

**Edge Cases:**
- GPS unavailable: Manual coordinate entry fallback must be offered
- Photo upload fails: Photo queued separately; survey data saved without it; retry on reconnect
- Form submitted twice (network retry): Idempotency UUID prevents duplicate record
- Form abandoned mid-way: Auto-saved as draft; restorable from Offline Queue

**Error Handling:**
- GPS permission denied: Show instructions to enable location in browser/device settings
- Upload 413 (too large): "Foto terlalu besar, sedang dikompres ulang..."
- Network timeout during submit: Save to offline queue; show "Akan disinkronisasi otomatis"

---

### 4.4 GIS Interactive Map

**REQ-MAP**

| Attribute | Details |
|---|---|
| **Purpose** | Visualize all surveyed households as GIS points; give real-time coverage visibility |
| **Business Value** | Team can see which households are missing during the 5-day sprint — prevents gaps |
| **User Value** | Visual, intuitive coverage check; no GIS expertise required |
| **Priority** | MUST HAVE — Day 4 critical |
| **Dependencies** | REQ-SURVEY, Leaflet.js, OpenStreetMap, Supabase Realtime |

**Phase 1 Features:**
- Pin markers per household, color-coded by survey status (Green/Yellow/Red/Blue/Gray)
- Filter by RT and/or RW
- Popup card showing household summary on marker click
- Coordinate viewer showing current map center coordinates
- Search by RT number or household KK name
- Real-time marker updates as surveys are submitted (Supabase Realtime)
- Link from map popup to full household survey detail

**Phase 2 Features (deferred):**
- Satellite base layer toggle
- Heatmap (problem density)
- Marker clustering
- RT/RW boundary polygons
- Drawing tools, measurement tools
- GeoJSON and KML/KMZ export from map
- Offline tile pre-caching for Dusun 2 boundary
- Timeline playback
- Layer manager UI

**Edge Cases:**
- No households surveyed yet: Map shows empty base map with message "Belum ada data survei"
- All markers in same location (GPS calibration error): Markers still shown; zoom supports up to marker level
- Popup opened for unsurveyed (Red) household: Shows "Belum disurvei — [Mulai Survei]" button

---

### 4.5 Dashboard & Progress Monitoring

**REQ-DASHBOARD**

| Attribute | Details |
|---|---|
| **Purpose** | Give the KKN team and admin real-time visibility into survey progress |
| **Business Value** | Prevents missed households during the 5-day sprint; enables daily team check-ins |
| **User Value** | Single glance shows how close the team is to completion |
| **Priority** | MUST HAVE — Day 4 |
| **Dependencies** | REQ-SURVEY, Supabase Realtime |

**Dashboard Widgets (Phase 1):**

| Widget | Description | Update |
|---|---|---|
| Households Surveyed | Count (completed / total) | Real-time |
| GPS Capture Rate | % of surveys with valid GPS | Real-time |
| Coverage by RT | Per-RT progress bar | Real-time |
| Sticky Notes Count | Total notes on board | Real-time |
| Recent Activity Feed | Last 10 survey submissions by team | Real-time |
| Offline Queue Count | Number of drafts pending sync | Real-time |

**Phase 2 Dashboard Additions:**
- Problem category distribution chart
- Potential category distribution chart
- Daily survey trend (line chart)
- Program completion rate
- Google Drive sync status

---

### 4.6 Priority Matrix — USG Scoring (Cycle 3)

**REQ-PRIORITY**

| Attribute | Details |
|---|---|
| **Purpose** | Systematically prioritize community problems using the USG method |
| **Business Value** | Provides objective, defensible basis for program planning |
| **User Value** | Team can score and rank problems collaboratively in one place |
| **Priority** | SHOULD HAVE — Phase 2 (Cycle 3) |
| **Dependencies** | REQ-STICKY, REQ-SURVEY |

**USG Scoring Method:**
Each problem is scored on three dimensions (1–5 scale each):
- **U — Urgency:** How urgent is it to address this problem?
- **S — Seriousness:** How serious is its impact if left unaddressed?
- **G — Growth:** How much will the problem worsen if not addressed now?

Total USG Score = U + S + G (max 15). Problems are auto-ranked highest to lowest.

**Data Sources:**
- Problems from Sticky Notes Board (Cycle 1)
- Problems from Household Surveys (Cycle 2)
- Admin can also manually add problems to the matrix

**Workflow:**
1. Team opens Priority Matrix after completing Cycle 2 surveys
2. System shows all unique problems (from notes + surveys)
3. Team members score each problem (U, S, G — 1 to 5)
4. System calculates total and auto-ranks
5. Admin reviews and confirms final priority ranking
6. Top-ranked problems are linked to Program Plans (Cycle 4)
7. Results exported as PDF for documentation

**Edge Cases:**
- Two problems with identical USG score: Both shown at same rank; admin breaks tie manually
- Problem deleted from survey after being scored: Score remains; problem flagged as "[Dihapus]"

---

### 4.7 Program Management (Cycle 4)

**REQ-PROGRAMS**

| Attribute | Details |
|---|---|
| **Purpose** | Plan, track, and monitor community programs addressing prioritized problems |
| **Business Value** | Creates transparent record of KKN program execution for LPJ |
| **User Value** | Team can see task assignments, deadlines, and progress in one place |
| **Priority** | SHOULD HAVE — Phase 2 (Cycle 4) |
| **Dependencies** | REQ-PRIORITY |

**Program Attributes:**

| Field | Type | Notes |
|---|---|---|
| Program Name | Text | e.g., "Perbaikan Jalan RT 01" |
| Linked Priority Item | Select | References Priority Matrix result |
| Description | Textarea | What the program involves |
| Start Date | Date | |
| End Date / Target | Date | |
| PIC (Person in Charge) | Select (KKN member) | |
| Status | Enum | Planned / In Progress / Completed / Cancelled |

**Task Attributes:**

| Field | Type | Notes |
|---|---|---|
| Task Name | Text | |
| Assigned To | Select (KKN member) | |
| Due Date | Date | |
| Status | Enum | Todo / In Progress / Done |
| Notes | Textarea | Optional progress notes |

**Workflow:**
1. Admin creates Program linked to a Priority Matrix item
2. Admin or members add Tasks to the Program
3. Members update Task status as work progresses
4. Program status auto-calculates from task completion % 
5. Program completion documented with photos and notes
6. Completed programs included in Reporting exports

---

### 4.8 Documentation Center

**REQ-DOCS**

| Attribute | Details |
|---|---|
| **Purpose** | Centralize all KKN documentation across all 4 cycles in one organized place |
| **Business Value** | Replaces scattered WhatsApp/Drive files; creates auditable documentation trail |
| **User Value** | Any KKN member can upload and find documents without file-sharing chaos |
| **Priority** | SHOULD HAVE — Phase 2 |
| **Dependencies** | Supabase Storage, REQ-AUTH |

**Supported File Types:** PDF, DOCX, XLSX, JPG, PNG, MP4 (video), ZIP

**Document Metadata:**

| Field | Type | Notes |
|---|---|---|
| File Name | Text (auto from upload) | |
| Document Type | Select | Notulensi / Foto / Video / Laporan / Data / Lainnya |
| SISDAMAS Cycle | Select | Siklus 1 / 2 / 3 / 4 / Umum |
| Description | Textarea | Optional |
| Uploaded By | Auto | |
| Uploaded At | Auto | |
| Google Drive URL | Auto (if synced) | |

**Workflow:**
1. Member clicks "+ Upload"
2. Selects file from device
3. Selects document type and cycle
4. Optionally adds description
5. File uploaded to Supabase Storage
6. (Optional) Admin triggers Google Drive sync — file mirrors to correct Drive folder

**Edge Cases:**
- File too large (>50MB): Show error with compression suggestion
- Unsupported file type: Show supported formats list

---

### 4.9 Google Drive Integration

**REQ-GDRIVE**

| Attribute | Details |
|---|---|
| **Purpose** | Automatically archive platform documents to the team's Google Drive |
| **Business Value** | Ensures documents survive beyond the platform's lifetime |
| **User Value** | No manual uploading to Drive; everything syncs automatically |
| **Priority** | SHOULD HAVE — Phase 2 |
| **Dependencies** | Google Drive API, Service Account, REQ-DOCS |

**Behavior:**
- Admin configures Google Drive connection once in Admin Panel (Service Account key)
- Platform auto-creates folder structure (as defined in System Blueprint Phase 10)
- On document upload, admin can trigger sync or enable auto-sync
- Survey data exports (Excel, PDF, GeoJSON) auto-synced to correct subfolder
- Each synced file has its Google Drive URL stored in the database and shown in Documentation Center

**Security:**
- Service Account approach (not per-user OAuth) — see System Blueprint Phase 10.3
- Service Account has write access to KKN Drive folder only
- Credentials stored as Vercel environment variables, never exposed client-side

---

### 4.10 Google Calendar Integration

**REQ-GCAL**

| Attribute | Details |
|---|---|
| **Purpose** | Sync KKN schedule events to team members' Google Calendar |
| **Business Value** | Team receives push notifications for meetings, survey sessions, deadlines |
| **User Value** | No need to manually copy dates from platform to phone calendar |
| **Priority** | SHOULD HAVE — Phase 2 |
| **Dependencies** | Google Calendar API, Service Account |

**Event Types:** Survey sessions, community meetings, program milestones, internal meetings, report deadlines.

**Behavior:**
- Admin creates event in Platform → Event automatically added to KKN shared Google Calendar
- All KKN members subscribed to the shared calendar receive push notifications
- Event updates in platform propagate to Calendar automatically

---

### 4.11 Reporting & Export

**REQ-REPORTS**

| Attribute | Details |
|---|---|
| **Purpose** | Generate statistics, charts, and data exports to support the campus LPJ/final report |
| **Business Value** | Eliminates manual compilation from scattered sources; provides credible, verified data |
| **User Value** | Admin can export LPJ-supporting data on demand |
| **Priority** | SHOULD HAVE — Phase 2 |
| **Dependencies** | REQ-SURVEY, REQ-PRIORITY, REQ-PROGRAMS |

**Available Reports:**

| Report | Format | Contents |
|---|---|---|
| Survey Summary Report | PDF, Excel | All household data, GPS, problems, potentials, photos count |
| Problem Analysis Report | PDF | Problems by category, frequency, USG scores |
| Program Progress Report | PDF, Excel | All programs, tasks, completion rates |
| GIS Data Export | GeoJSON, KML, CSV | Household GPS points with attributes |
| Statistics Dashboard Export | PDF | Dashboard charts and KPI summary |
| Full Raw Data Export | Excel | All tables, one sheet per entity |

**Important limitation (from Foundation):** The platform supplies supporting statistics and data for the LPJ — it does not auto-generate the formal LPJ document itself. This expectation must be communicated to the DPL proactively.

---

### 4.12 Public Website

**REQ-PUBLIC**

| Attribute | Details |
|---|---|
| **Purpose** | Provide a public-facing presence for Desa Sukahaji and the KKN program |
| **Business Value** | Fulfills transparency objective; provides legacy after KKN ends |
| **User Value** | Village officials and public can see KKN activities without logging in |
| **Priority** | COULD HAVE — Phase 2 (lower priority) |
| **Dependencies** | REQ-REPORTS (for public statistics) |

**Pages:**

| Page | Content |
|---|---|
| Landing Page | Hero, village overview, KKN introduction, quick statistics |
| Village Profile | About Desa Sukahaji, geography, demographics |
| About KKN | KKN team profile, member photos, objectives |
| About SISDAMAS | Explanation of the SISDAMAS methodology |
| Public Map | Anonymized household map (no GPS precision, no personal data) |
| Public Statistics | Aggregated survey results, problem categories, program summaries |
| Gallery | Photos from community sessions and programs |
| News | Updates about KKN activities |
| Contact | KKN contact information |

**Privacy Requirement:** Public Map must NOT show precise household GPS coordinates or personally identifiable household information. Only aggregated, anonymized data (RT/RW level) is shown publicly.

---

### 4.13 User Management (Admin)

**REQ-USERS**

| Attribute | Details |
|---|---|
| **Purpose** | Admin creates and manages KKN member accounts |
| **Priority** | MUST HAVE — Phase 1 |
| **Dependencies** | REQ-AUTH |

**Functions:**
- Create new KKN Team Member account (email + name + temporary password)
- View all users with their status (active/suspended)
- Edit user name and email
- Reset user password (send reset link)
- Suspend/activate account (no deletion)
- View user's survey submission history

**Business Rules:**
- Only Super Admin can create/edit/suspend accounts
- Minimum 1 Super Admin account must exist at all times
- KKN member accounts cannot be converted to Admin
- Suspended users cannot log in but their data is preserved

---

### 4.14 Master Data Management (Admin)

**REQ-MASTER-DATA**

| Attribute | Details |
|---|---|
| **Purpose** | Admin configures the geographic hierarchy used by the survey system |
| **Priority** | MUST HAVE — Phase 1 (must exist before Day 1 survey) |
| **Dependencies** | None (first setup) |

**Hierarchy:** Project > Dusun > RW > RT

**Functions:**
- Create/Edit/Deactivate Dusun records
- Create/Edit/Deactivate RW records (linked to Dusun)
- Create/Edit/Deactivate RT records (linked to RW)
- Configure problem/potential category taxonomy (Infrastruktur, Kesehatan, Pendidikan, Ekonomi, Lingkungan, Sosial-Budaya, Keamanan + custom)

**Business Rules:**
- RT/RW cannot be deleted if household records exist under them (deactivate instead)
- Category taxonomy changes propagate to all new survey forms but do not retroactively change existing records

---

### 4.15 Notifications

**REQ-NOTIF**

| Attribute | Details |
|---|---|
| **Purpose** | Alert team members to relevant events and deadlines |
| **Priority** | SHOULD HAVE — Phase 2 |
| **Dependencies** | REQ-AUTH, REQ-SURVEY, REQ-PROGRAMS |

**Notification Types:**

| Type | Trigger | Recipients |
|---|---|---|
| Survey Reminder | Admin schedules survey session | All KKN Members |
| Task Due Tomorrow | Program task due in 24 hours | Task assignee |
| Survey Coverage Alert | RT coverage drops below target % | Admin |
| Documentation Reminder | Document upload deadline | All KKN Members |
| Google Drive Sync Alert | Sync failure | Admin |
| Validation Request | Admin requests data verification | KKN Members |

**Delivery:** In-app notification bell (Phase 2); Email notification (Phase 2).

---

### 4.16 Audit Logs

**REQ-AUDIT**

| Attribute | Details |
|---|---|
| **Purpose** | Maintain an immutable record of all significant data changes |
| **Priority** | MUST HAVE — Phase 1 |
| **Dependencies** | REQ-AUTH |

**Logged Actions:**

| Action | Data Recorded |
|---|---|
| User login | User, timestamp, IP |
| Survey created | User, household ID, timestamp |
| Survey edited | User, household ID, changed fields, timestamp |
| Survey deleted (soft) | User, household ID, timestamp |
| Photo uploaded | User, household ID, file name, timestamp |
| Sticky note created/edited/deleted | User, note ID, timestamp |
| Data exported | User, export type, timestamp |
| Data locked/unlocked | Admin, affected records, timestamp |
| User account created/modified | Admin, affected user, timestamp |

**Access:** Super Admin only. Logs are immutable — no editing or deletion. Retention: 90 days.

---

## 5. User Stories

### Authentication (REQ-AUTH)

| ID | User Story | Priority | Story Points |
|---|---|---|---|
| US-001 | As a KKN Team Member, I want to log in with my email and password so that I can access the platform securely. | MUST | 3 |
| US-002 | As a KKN Team Member, I want to remain logged in for 7 days so that I don't have to log in again each field day. | MUST | 2 |
| US-003 | As a KKN Team Member, I want to reset my password via email so that I can regain access if I forget my credentials. | MUST | 2 |
| US-004 | As a Super Admin, I want to create KKN member accounts so that I control who has access to the platform. | MUST | 3 |
| US-005 | As a Super Admin, I want to suspend a KKN member account so that I can revoke access without losing their survey data. | MUST | 2 |

### Sticky Notes (REQ-STICKY)

| ID | User Story | Priority | Story Points |
|---|---|---|---|
| US-010 | As a KKN Team Member, I want to create a digital sticky note in a category column so that I can record community aspirations in real time during the Day 2 session. | MUST | 5 |
| US-011 | As a KKN Team Member, I want to see all team members' notes appear on the board instantly so that we have a shared, real-time view during the session. | MUST | 5 |
| US-012 | As a KKN Team Member, I want to assign a color to a sticky note so that I can visually differentiate types of input. | SHOULD | 2 |
| US-013 | As a KKN Team Member, I want to tag a sticky note with an RT/RW so that geographic context is captured for later prioritization. | SHOULD | 3 |
| US-014 | As a Super Admin, I want to export the sticky notes board as a PDF so that I can archive the Day 2 session outcome. | SHOULD | 3 |

### Household Survey (REQ-SURVEY)

| ID | User Story | Priority | Story Points |
|---|---|---|---|
| US-020 | As a KKN Team Member, I want to open a new survey form with GPS auto-captured so that I don't have to manually record coordinates. | MUST | 8 |
| US-021 | As a KKN Team Member, I want to fill in household details (KK name, family size, housing condition) so that core survey data is structured and searchable. | MUST | 5 |
| US-022 | As a KKN Team Member, I want to add multiple problems to a survey so that all household issues are documented in one place. | MUST | 5 |
| US-023 | As a KKN Team Member, I want to add multiple potentials to a survey so that community strengths are also captured. | MUST | 3 |
| US-024 | As a KKN Team Member, I want to take and attach photos to a survey so that visual evidence is documented without leaving the app. | MUST | 8 |
| US-025 | As a KKN Team Member, I want the survey to auto-save as a draft every 30 seconds so that no data is lost if my phone loses power or crashes. | MUST | 8 |
| US-026 | As a KKN Team Member, I want offline surveys to sync automatically when I reconnect so that I don't have to manually retry. | MUST | 8 |
| US-027 | As a KKN Team Member, I want to edit my own submitted surveys so that I can correct data-entry errors discovered in the field. | MUST | 5 |
| US-028 | As a Super Admin, I want to view and edit any household survey so that I can correct data quality issues. | MUST | 3 |
| US-029 | As a KKN Team Member, I want to enter GPS coordinates manually if auto-capture fails so that no household is skipped due to GPS issues. | MUST | 5 |

### GIS Map (REQ-MAP)

| ID | User Story | Priority | Story Points |
|---|---|---|---|
| US-030 | As a KKN Team Member, I want to see all surveyed households as colored pins on a map so that I can tell which areas have been covered. | MUST | 8 |
| US-031 | As a KKN Team Member, I want to filter map markers by RT or RW so that I can focus on my assigned area. | MUST | 5 |
| US-032 | As a KKN Team Member, I want to click a household marker to see a summary popup so that I can quickly check survey status. | MUST | 5 |
| US-033 | As a KKN Team Member, I want new survey pins to appear on the map in real time so that my team can see my progress immediately. | MUST | 8 |
| US-034 | As a KKN Team Member, I want to click from a map popup to open the full household survey detail so that I can view or edit the data. | SHOULD | 3 |

### Dashboard (REQ-DASHBOARD)

| ID | User Story | Priority | Story Points |
|---|---|---|---|
| US-040 | As a KKN Team Member, I want to see total surveys completed vs total households so that I know how much work remains. | MUST | 3 |
| US-041 | As a KKN Team Member, I want to see per-RT survey completion progress so that I can identify which RT is behind. | MUST | 5 |
| US-042 | As a Super Admin, I want to see a recent activity feed showing who submitted what so that I can monitor team progress. | MUST | 5 |

### Priority Matrix (REQ-PRIORITY)

| ID | User Story | Priority | Story Points |
|---|---|---|---|
| US-050 | As a KKN Team Member, I want to see all problems from surveys and sticky notes in one list so that I have a complete picture before scoring. | SHOULD | 5 |
| US-051 | As a KKN Team Member, I want to score each problem on Urgency, Seriousness, and Growth (1–5) so that we have an objective priority ranking. | SHOULD | 8 |
| US-052 | As a KKN Team Member, I want the platform to auto-calculate and rank problems by USG score so that no manual tallying is needed. | SHOULD | 5 |
| US-053 | As a Super Admin, I want to export the Priority Matrix as PDF so that it can be attached to the LPJ. | SHOULD | 3 |

### Program Management (REQ-PROGRAMS)

| ID | User Story | Priority | Story Points |
|---|---|---|---|
| US-060 | As a Super Admin, I want to create a community program linked to a prioritized problem so that our programs are traceable to community needs. | SHOULD | 5 |
| US-061 | As a KKN Team Member, I want to see my assigned tasks so that I know exactly what I'm responsible for. | SHOULD | 3 |
| US-062 | As a KKN Team Member, I want to update my task status (Todo / In Progress / Done) so that progress is visible to the whole team. | SHOULD | 3 |
| US-063 | As a Super Admin, I want to see a program progress percentage so that I can monitor overall execution status. | SHOULD | 3 |

### Reporting (REQ-REPORTS)

| ID | User Story | Priority | Story Points |
|---|---|---|---|
| US-070 | As a Super Admin, I want to export all survey data to Excel so that I can supply raw data to the DPL for LPJ review. | SHOULD | 8 |
| US-071 | As a Super Admin, I want to export a statistics summary report as PDF so that I can attach it to the LPJ. | SHOULD | 8 |
| US-072 | As a Super Admin, I want to export GPS data as GeoJSON so that I can import it into QGIS or Google Earth if needed. | SHOULD | 5 |

---

## 6. Acceptance Criteria (Gherkin)

### US-020 — GPS Auto-Capture on Survey Open

```gherkin
Feature: GPS Auto-Capture on Survey Form Open

  Background:
    Given the KKN Member is logged in
    And the device has location permission granted to the browser

  Scenario: Successful GPS capture
    Given the KKN Member opens the New Survey form
    When the GPS signal is acquired within 15 seconds
    Then the Latitude and Longitude fields are auto-populated
    And the GPS Accuracy indicator shows the accuracy in meters
    And the GPS status badge shows "GPS Aktif [green]"

  Scenario: GPS capture fails - fallback to manual
    Given the KKN Member opens the New Survey form
    When GPS is not acquired within 30 seconds
    Then the system shows "GPS tidak tersedia"
    And the system shows "Masukkan koordinat secara manual"
    And the Latitude and Longitude fields are editable text inputs
    And the form can still be submitted with manually entered coordinates

  Scenario: GPS permission denied
    Given the KKN Member opens the New Survey form
    When the browser/device GPS permission has been denied
    Then the system shows a message: "Izin lokasi diperlukan"
    And the system shows instructions to enable location in device settings
    And manual coordinate entry is offered as fallback
```

### US-025 — Auto-Save Draft Every 30 Seconds

```gherkin
Feature: Survey Auto-Save Draft

  Scenario: Auto-save while filling form
    Given the KKN Member has opened a new survey form
    When the KKN Member has typed at least one character in any field
    Then the form auto-saves to localStorage every 30 seconds
    And the save indicator shows "Disimpan otomatis [timestamp]"

  Scenario: Restore draft after browser crash
    Given the KKN Member has an auto-saved draft in localStorage
    When the KKN Member reopens the survey form
    Then the system detects the saved draft
    And the system asks "Lanjutkan survei yang belum selesai?"
    And selecting "Ya" restores all previously entered field values
    And selecting "Tidak" discards the draft and starts fresh

  Scenario: Draft expires
    Given the KKN Member has a saved draft older than 48 hours
    When the KKN Member opens the survey form
    Then the system notifies "Draft lama ditemukan (2 hari lalu). Pakai atau hapus?"
    And the member can choose to restore or discard
```

### US-026 — Offline Survey Sync

```gherkin
Feature: Offline Survey Queue and Auto-Sync

  Scenario: Survey submitted while offline
    Given the KKN Member has completed a survey form
    And the device has no internet connection
    When the KKN Member taps "Simpan Survei"
    Then the survey is saved to the offline queue with a UUID
    And the form shows "Draft tersimpan — akan disinkronisasi otomatis"
    And the offline queue badge shows the count of pending surveys

  Scenario: Offline survey auto-syncs on reconnect
    Given the KKN Member has 1 or more surveys in the offline queue
    When the device reconnects to the internet
    Then the Service Worker detects the online event
    And the Service Worker sends each queued survey to the API
    And each successful sync removes the survey from the queue
    And a toast notification shows "2 survei berhasil disinkronisasi"

  Scenario: Duplicate sync prevention
    Given a survey with UUID "abc-123" has already been synced successfully
    When the Service Worker retries sending survey "abc-123"
    Then the API returns 200 OK without creating a duplicate record
    And the survey in the database remains unchanged
```

### US-030 — GIS Map Real-Time Updates

```gherkin
Feature: Real-Time Map Marker Updates

  Scenario: New survey appears on map in real time
    Given Team Member A and Team Member B are both viewing the GIS Map
    When Team Member A submits a new household survey for RT 01
    Then within 5 seconds, Team Member B sees a new green pin appear on the map
    And the pin is positioned at the GPS coordinates of the submitted survey
    And the RT 01 progress counter increments on Team Member B's dashboard

  Scenario: Map filter by RT
    Given there are household markers for RT 01, RT 02, and RT 03 on the map
    When the user selects "Filter: RT 01" from the filter dropdown
    Then only markers belonging to RT 01 remain visible
    And markers for RT 02 and RT 03 are hidden
    And the filter chip shows "RT 01" as active

  Scenario: Popup shows correct household data
    Given there is a green marker for household "Bpk. Suparman - RT01-H023"
    When the user clicks on that marker
    Then a popup appears showing:
      - Household identifier: RT 01 - Rumah Tangga #023
      - KK Name: Bpk. Suparman
      - Survey status: Lengkap
      - Surveyor name
      - Survey date
      - Problem count and Potential count
    And a "Lihat Detail" button links to the full household record
```

### US-051 — USG Priority Scoring

```gherkin
Feature: USG Problem Prioritization

  Scenario: Score a problem
    Given the team is on the Priority Matrix page
    And a problem "Jalan rusak di RT 01" exists in the list
    When the user enters Urgency=5, Seriousness=4, Growth=4 for that problem
    Then the system calculates Total = 13
    And the problem is ranked #1 in the sorted list
    And the rank is shown with a visual highlight (e.g., gold badge for #1)

  Scenario: Auto-ranking after all problems scored
    Given 4 problems have been scored with totals 13, 12, 11, 9
    When the user saves the matrix
    Then the problems are displayed in descending order: 13, 12, 11, 9
    And each problem shows its rank number (#1, #2, #3, #4)

  Scenario: Tie in USG score
    Given problems "Masalah A" and "Masalah B" both have total score = 11
    When scores are saved
    Then both problems show rank "#3"
    And the system shows a note: "Skor sama — admin menentukan prioritas akhir"
```

### US-070 — Export Survey Data to Excel

```gherkin
Feature: Survey Data Export

  Scenario: Successful Excel export
    Given the Super Admin is on the Reports page
    And there are at least 1 submitted survey in the database
    When the Admin clicks "Unduh Excel"
    Then the system generates an Excel file
    And the file contains one sheet per data entity (Households, Surveys, Problems, Potentials, Photos)
    And the download begins within 10 seconds
    And the file is named "SISDAMAS_Survei_Dusun2_[YYYY-MM-DD].xlsx"

  Scenario: Export with no data
    Given there are no submitted surveys in the database
    When the Admin clicks "Unduh Excel"
    Then the system shows "Belum ada data survei untuk diekspor"
    And no file is downloaded
```

---

## 7. Business Rules

### Survey Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| BR-001 | A survey cannot be submitted without at least one valid GPS coordinate (auto or manual) | Every household must be mappable |
| BR-002 | Each household can only have one primary survey record | Prevents data duplication; one source of truth per household |
| BR-003 | A KKN member can only edit surveys they created | Data ownership and accountability |
| BR-004 | Survey deletion is soft-delete only — data is never permanently removed | Academic/legal record integrity |
| BR-005 | Photos must be compressed to ≤1MB before upload | Free-tier storage protection |
| BR-006 | Survey sync uses a client-generated UUID for idempotency | Prevents duplicates from network retries |
| BR-007 | A household survey cannot be submitted for a deactivated RT | Data integrity — active geographic hierarchy only |

### Sticky Notes Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| BR-010 | A sticky note cannot be empty | No empty records in the database |
| BR-011 | A sticky note cannot be deleted if it is referenced by the Priority Matrix | Referential integrity |
| BR-012 | Sticky notes are visible to all logged-in KKN members in real time | Collaborative session requirement |

### Priority Matrix Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| BR-020 | USG scores must be integers between 1 and 5 inclusive | Standardized USG methodology |
| BR-021 | Only Admin can finalize and lock the Priority Matrix | Prevents unilateral changes after team agreement |
| BR-022 | Once a Priority Item is linked to a Program, its score cannot be changed | Program planning depends on stable priority data |

### Program Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| BR-030 | A program must reference at least one Priority Matrix item | All programs must be traceable to community needs |
| BR-031 | Program records cannot be deleted — only archived | LPJ requires complete program history |
| BR-032 | Only Admin can create or archive programs | Program management requires coordination |

### User and Access Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| BR-040 | Self-registration is disabled — all accounts created by Admin | Access control; prevents unauthorized account creation |
| BR-041 | Minimum 1 Super Admin account must exist at all times | Prevents system lockout |
| BR-042 | User accounts can be suspended but never deleted | Audit trail integrity |
| BR-043 | A KKN member cannot access another member's offline draft queue | Draft privacy |

### Data Integrity Rules

| Rule ID | Rule | Rationale |
|---|---|---|
| BR-050 | All write operations are logged in the Audit Log | Complete accountability trail |
| BR-051 | Only verified data (admin-locked) appears on the Public Map | Prevents unverified or sensitive data leaking publicly |
| BR-052 | Public Map must not show precise GPS coordinates | Privacy protection for Dusun 2 residents |
| BR-053 | Photo storage paths include household_id and timestamp to prevent collisions | Storage organization and integrity |

---

## 8. Non-Functional Requirements

### Performance

| ID | Requirement | Target | Priority |
|---|---|---|---|
| NFR-P01 | Dashboard page load time | < 3 seconds on 4G | MUST |
| NFR-P02 | Survey form submission response time | < 2 seconds online | MUST |
| NFR-P03 | Map initial load time (50 markers) | < 4 seconds on 4G | MUST |
| NFR-P04 | Map real-time update latency | < 5 seconds after submit | MUST |
| NFR-P05 | Photo upload per photo (1MB) | < 10 seconds on 4G | MUST |
| NFR-P06 | Excel export generation time | < 10 seconds | SHOULD |
| NFR-P07 | Offline queue sync time per survey | < 5 seconds on reconnect | MUST |

### Availability

| ID | Requirement | Target |
|---|---|---|
| NFR-A01 | System uptime during Day 2 and Day 4–8 | As close to 100% as achievable (Vercel + Supabase SLA) |
| NFR-A02 | Supabase free tier monthly uptime | >99% (Supabase public SLA) |
| NFR-A03 | Graceful degradation if Supabase Realtime disconnects | App functions without live updates; reconnects automatically |

### Scalability

| ID | Requirement | Notes |
|---|---|---|
| NFR-S01 | Support 15 concurrent logged-in users during Day 4–8 sprint | Free tier comfortably handles this |
| NFR-S02 | Support up to 500 household records | Well within Supabase free tier limits |
| NFR-S03 | Support up to 5,000 photos | Monitor storage (Supabase free: 1GB) |
| NFR-S04 | Data model supports future multi-project expansion without code changes | Project concept in schema |

### Security

| ID | Requirement | Notes |
|---|---|---|
| NFR-SEC01 | All data transmission encrypted via HTTPS/TLS | Enforced by Vercel and Supabase |
| NFR-SEC02 | Row Level Security (RLS) on all sensitive tables | Supabase RLS policies |
| NFR-SEC03 | Photos stored in private Supabase Storage bucket | Authenticated access only |
| NFR-SEC04 | Service Account credentials never exposed client-side | Environment variables only |
| NFR-SEC05 | Audit logs immutable — no update/delete API exposed | Database trigger approach |
| NFR-SEC06 | Public Map does not expose household GPS precision | Aggregated data only in public API |

### Offline Capability

| ID | Requirement | Notes |
|---|---|---|
| NFR-OFF01 | Survey form works without internet connection | LocalStorage draft approach |
| NFR-OFF02 | Drafts persist across app restarts and device sleep | localStorage survives background |
| NFR-OFF03 | Sync retries automatically on reconnect | Service Worker online event |
| NFR-OFF04 | Offline indicator visible at all times during disconnection | Red banner in app header |

### Accessibility

| ID | Requirement | Notes |
|---|---|---|
| NFR-ACC01 | WCAG 2.1 Level AA compliance | Text contrast, focus states, ARIA |
| NFR-ACC02 | Minimum 48×48px touch targets on all interactive elements | Mobile outdoor use |
| NFR-ACC03 | Form validation errors announced via aria-live | Screen reader support |
| NFR-ACC04 | No information conveyed by color alone | Icon + color always paired |

### Usability

| ID | Requirement | Notes |
|---|---|---|
| NFR-USE01 | New KKN member onboarded in under 15 minutes | Self-guided onboarding tour |
| NFR-USE02 | Survey form completable on Android in under 5 minutes | Optimized field count and flow |
| NFR-USE03 | Map readable outdoors in direct sunlight | High contrast design |
| NFR-USE04 | UI language: Bahasa Indonesia | All user-facing text in Indonesian |

### Maintainability

| ID | Requirement | Notes |
|---|---|---|
| NFR-MNT01 | Codebase follows consistent structure documented in README | Single developer handover |
| NFR-MNT02 | All API routes documented | Downstream developer reference |
| NFR-MNT03 | Database schema migrations versioned | Supabase migration files |

### Localization

| ID | Requirement | Notes |
|---|---|---|
| NFR-LOC01 | All UI text in Bahasa Indonesia | End users are Indonesian |
| NFR-LOC02 | Date format: DD Bulan YYYY (e.g., 14 Juli 2026) | Indonesian convention |
| NFR-LOC03 | Technical documentation in English | Developer convention |

---

## 9. Reporting Requirements

### 9.1 Report Types

**Survey Summary Report**
- Purpose: Supply LPJ data appendix
- Contents: Total households, per-RT breakdown, GPS coverage %, problem categories, potential categories, photo counts
- Formats: PDF (formatted), Excel (raw data)
- Access: Admin + KKN Member (limited)

**Problem Analysis Report**
- Purpose: Document Cycle 2 findings for Cycle 3 prioritization
- Contents: All problems sorted by frequency, by category, by RT; USG scores if available
- Formats: PDF
- Access: Admin

**Program Progress Report**
- Purpose: Document Cycle 4 execution for LPJ
- Contents: All programs, task lists, completion rates, linked priority items, responsible persons
- Formats: PDF, Excel
- Access: Admin

**GIS Data Export**
- Purpose: Allow import into QGIS, Google Earth, other GIS tools
- Contents: Household GPS points with survey status, RT/RW, problem count
- Formats: GeoJSON, KML, CSV
- Access: Admin

**Statistics Dashboard Export**
- Purpose: Visual summary for LPJ presentation
- Contents: All dashboard charts as images + KPI table
- Formats: PDF
- Access: Admin

### 9.2 Important Scope Limitation

> **The platform supplies supporting data and statistics for the LPJ. It does NOT auto-generate the formal LPJ document itself.** This limitation must be communicated explicitly to the DPL before Day 1 to prevent expectation mismatches.

---

## 10. Notification Requirements

### 10.1 In-App Notifications (Phase 2)

| Trigger | Message | Recipients |
|---|---|---|
| Survey session scheduled | "Survei RT [x] dijadwalkan [date]. Siap?" | All KKN Members |
| Task assigned | "Anda ditugaskan ke: [task name] — due [date]" | Assigned member |
| Task due tomorrow | "Pengingat: [task name] jatuh tempo besok" | Task assignee |
| RT coverage below 50% before Day 8 | "⚠️ RT [x] baru [n]% — segera selesaikan survei!" | Admin |
| Google Drive sync failed | "Sinkronisasi Drive gagal — coba lagi di Pengaturan" | Admin |
| New survey submitted | "[Member] menambahkan survei RT[x]-H[n]" | Admin (if opted in) |

---

## 11. Success Metrics & KPIs

### Primary KPIs (Phase 1 — Critical Window)

| KPI | Target | Measurement |
|---|---|---|
| Sticky Note Session Digitized | 100% of Day 2 input entered same day | Notes count on Day 2 evening |
| Household Survey Coverage | 100% of identifiable Dusun 2 households by end of Day 8 | Surveyed / total registered |
| GPS Capture Success Rate | ≥95% of submitted surveys have valid GPS coordinates | Valid GPS records / total surveys |
| Manual Re-Entry Incidents | 0 | Self-reported; audit log check |
| Data Loss Incidents | 0 | Lost notes, failed syncs not recovered |
| System Availability Day 2 & Day 4–8 | Target 100%; acceptable ≥99% | Uptime monitoring |
| Onboarding Time per KKN Member | Under 15 minutes | Timed during Day 1 onboarding |

### Secondary KPIs (Full Platform)

| KPI | Target | Measurement |
|---|---|---|
| Report Data Availability for LPJ | Within 1 day of request | Response time to DPL data request |
| Program Completion Rate | 100% of planned programs marked complete by KKN end | Program status count |
| Documentation Upload Rate | ≥80% of key meetings/activities documented | Doc uploads / expected events |
| Public Website Page Load Time | <3 seconds on mobile (4G) | Lighthouse / PageSpeed |
| User Satisfaction (KKN members) | ≥4/5 average on exit survey | Exit survey on last day of KKN |

### Suggested Additional KPIs

| KPI | Target | Why |
|---|---|---|
| Photo-to-Household Ratio | ≥2 photos per surveyed household | Visual documentation quality |
| Average Survey Completion Time | <5 minutes per household | UX efficiency |
| Offline Queue Clear Rate | 100% of drafts synced within 24 hours | Offline reliability |
| Audit Log Coverage | 100% of write operations logged | Accountability |
| Priority Matrix Completion | All identified problems scored before Cycle 4 begins | Traceability |

---

## 12. Risk Analysis

### Business Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
|---|---|---|---|---|
| Solo builder cannot finish Phase 1 before Day 2 | HIGH | CRITICAL | CRITICAL | Strict Phase 1 scope lock; Day 3 reserved as stabilization buffer |
| DPL expects full LPJ auto-generation | MEDIUM | MEDIUM | MEDIUM | Communicate scope explicitly before Day 1; document in LPJ support materials |
| KKN members resist using the tool | LOW | HIGH | MEDIUM | Day 1 onboarding demo; printable quick guide; peer support model |
| Platform unmaintained after KKN ends | MEDIUM | LOW (long-term) | LOW | Documentation-first handover; documented reuse path |

### Technical Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
|---|---|---|---|---|
| GPS fails in dense Dusun 2 housing | MEDIUM | MEDIUM | MEDIUM | Manual coordinate fallback; GPS accuracy badge; flag for revisit |
| Free tier limits exceeded (storage/bandwidth) | LOW | MEDIUM | MEDIUM | Photo compression to 1MB; weekly storage monitoring |
| Supabase Realtime disconnects during field day | MEDIUM | LOW | LOW | Graceful degradation; reconnect automatically; page still functional |
| Offline localStorage cleared by user | LOW | HIGH | MEDIUM | Warning on first use; suggest not clearing browser data |
| Photo upload timeouts on slow signal | MEDIUM | MEDIUM | MEDIUM | Queue-based upload; retry mechanism; progress indicator |

### Operational Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
|---|---|---|---|---|
| Single Super Admin unavailable (sick, etc.) | MEDIUM | HIGH | HIGH | Identify 1 tech-comfortable member for light admin tasks; document recovery steps |
| Taxonomy not finalized before Day 4 | HIGH | MEDIUM | MEDIUM | Use starter taxonomy now; admin can add custom categories anytime |
| Survey session data lost (phone dropped) | LOW | HIGH | HIGH | Auto-save drafts every 30s; localStorage survives most failures |

### Security Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
|---|---|---|---|---|
| KKN member shares login credentials | MEDIUM | HIGH | HIGH | Security briefing; account suspension policy; audit logs show who did what |
| Sensitive household GPS data on public map | LOW | HIGH | HIGH | Public Map shows only aggregated data; admin must explicitly publish |
| Google Service Account key leaked | LOW | CRITICAL | HIGH | Environment variables only; key rotation capability documented |

### GIS Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
|---|---|---|---|---|
| GPS drift causes markers in wrong location | MEDIUM | MEDIUM | MEDIUM | Store GPS accuracy; visually flag low-accuracy points; allow manual correction |
| OSM tiles slow to load on mobile | MEDIUM | LOW | LOW | Tile caching by browser; Phase 2 offline tile pre-cache |

---

## 13. Requirement Traceability Matrix

| Business Goal | Feature Req | User Story | Acceptance Criteria | Phase |
|---|---|---|---|---|
| BO-01: 100% Cycle 1 input on Day 2 | REQ-STICKY | US-010, US-011 | US-010 Gherkin | 1 |
| BO-02: Full household coverage by Day 8 | REQ-SURVEY, REQ-MAP, REQ-DASHBOARD | US-020–US-029, US-030–US-033, US-040–US-042 | US-020, US-026, US-030 Gherkin | 1 |
| BO-03: Zero manual re-entry | REQ-SURVEY (GPS auto), REQ-SURVEY (sync) | US-020, US-026 | US-020, US-026 Gherkin | 1 |
| BO-04: Real-time survey visibility | REQ-MAP, REQ-DASHBOARD | US-033, US-040, US-041 | US-030 Gherkin | 1 |
| BO-05: LPJ data support | REQ-REPORTS | US-070, US-071, US-072 | US-070 Gherkin | 2 |
| BO-06: GIS-ready data foundation | REQ-SURVEY (GPS), REQ-MAP | US-020, US-029 | US-020 GPS Gherkin | 1 |
| BO-07: Multi-village reuse path | (Architecture Decision Records) | N/A | N/A | Docs only |

---

## 14. Future Roadmap

### Near-Term (Post-KKN, Year 1)

| Feature | Rationale |
|---|---|
| Multi-project / multi-village support | Enable future KKN teams to reuse without code changes |
| Advanced GIS (PostGIS, heatmaps, spatial queries) | Richer analysis of community data |
| Full offline-first with conflict resolution | If signal problems emerge in other villages |
| Email digest reports | Weekly summary for DPL/stakeholders |

### Medium-Term (Year 2–3)

| Feature | Rationale |
|---|---|
| AI-Assisted Problem Categorization | Auto-suggest categories from free-text descriptions |
| Predictive Analytics Dashboard | Identify high-risk areas from accumulated data |
| Cross-KKN Comparison | Compare community progress year-over-year |
| WhatsApp Bot Integration | Field surveys via WhatsApp for zero-app-install users |

### Long-Term / Aspirational

| Feature | Rationale |
|---|---|
| Village Digital Twin (full maturity) | Complete living digital model of community |
| IoT Sensor Integration | Real-time environmental and infrastructure monitoring |
| Drone Imagery Integration | High-resolution aerial GIS data capture |
| Machine Learning — Community Needs Prediction | Proactive intervention before problems escalate |
| National KKN Platform | Scalable to all KKN programs across Indonesian universities |

---

*This PRD is derived from `03_PRD_PROMPT.md` and all decisions are subordinate to `00_PROJECT_FOUNDATION.md`, `01_PRODUCT_DISCOVERY.md`, and `02_SYSTEM_BLUEPRINT.md`. Any perceived contradiction between this document and the Foundation document must be resolved in favor of the Foundation.*

---

**Would you like to revise this PRD before we proceed to generate the UX Specification (`04_UX_SPECIFICATION.md`)?**

# SISDAMAS Digital Platform
## Data Flow Specification

| | |
|---|---|
| **Document** | 07 — Data Flow Specification |
| **Version** | 1.0 |
| **Status** | Draft — Pending Review |
| **Predecessors** | 00_PROJECT_FOUNDATION · 01_PRODUCT_DISCOVERY · 02_SYSTEM_BLUEPRINT · 03_PRD · 04_UX_SPECIFICATION · 05_TECHNICAL_SPECIFICATION · 06_DATABASE_SPECIFICATION |
| **Prepared By** | Enterprise Data Architecture Team (Principal Data Architect, Enterprise Solution Architect, Senior Backend Engineer, Senior Software Architect, GIS Data Engineer, Database Architect, System Analyst, Business Analyst, Information Architect) |
| **Platform** | SISDAMAS Digital Platform — KKN Kelompok 56, UIN Sunan Gunung Djati Bandung |
| **Constraints** | Single Source of Truth · No SQL/Prisma schemas · No API endpoint paths defined · Strict alignment with 00-06 |

> **Document role:** This Data Flow Specification describes how information flows, transforms, and synchronizes across the entire SISDAMAS Digital Platform. It serves as the definitive reference for how data moves from user inputs on mobile browsers, through validation checks, state stores, offline storage, database triggers, and out to Google services, dashboards, and reporting exports. In accordance with the prompt constraints, **no REST API routes, endpoint paths, or GraphQL query contracts are defined in this document.**

---

## Table of Contents

1. [System Data Flow Overview](#1-system-data-flow-overview)
2. [User Data Flow](#2-user-data-flow)
3. [Survey Data Flow](#3-survey-data-flow)
4. [GIS Data Flow](#4-gis-data-flow)
5. [Documentation Flow](#5-documentation-flow)
6. [Google Drive Flow](#6-google-drive-flow)
7. [Google Calendar Flow](#7-google-calendar-flow)
8. [Dashboard Flow](#8-dashboard-flow)
9. [Report Flow](#9-report-flow)
10. [Offline Synchronization Flow](#10-offline-synchronization-flow)
11. [Validation Flow](#11-validation-flow)
12. [Error Recovery Flow](#12-error-recovery-flow)
13. [Notification Flow](#13-notification-flow)
14. [Audit Flow](#14-audit-flow)
15. [Privacy Flow](#15-privacy-flow)
16. [Performance Analysis](#16-performance-analysis)
17. [Recommendations](#17-recommendations)

---

## 1. System Data Flow Overview

This section maps the global movement of data through the system's Client, Edge, Backend, and External layers.

### 1.1 Global System Architecture Flow

```mermaid
graph TB
    subgraph CLIENT["Client Layer (PWA / Mobile Browser)"]
        UI["React/Next.js UI Components"]
        Zustand["Zustand Client State Store"]
        LS["localStorage (Offline Queue & Drafts)"]
        SW["Service Worker (next-pwa)"]
    end

    subgraph EDGE["Edge API Layer (Vercel Node.js / Edge)"]
        Val["Zod Validation Gateway"]
        AuthMid["Middleware Authentication & Role Guard"]
        Business["Business Logic Services"]
        DriveProxy["Google Drive API Proxy"]
        CalProxy["Google Calendar API Proxy"]
    end

    subgraph BACKEND["Backend-as-a-Service (Supabase)"]
        AuthSvc["Supabase Auth (GoTrue API)"]
        PostgREST["Supabase PostgREST (Auto-REST DB API)"]
        StorageBucket["Supabase Storage (Private Buckets)"]
        DB[(PostgreSQL Database)]
        RLS{"RLS Security Gate"}
        Triggers["PostgreSQL Database Triggers"]
        Realtime["Supabase Realtime Hub (WebSockets)"]
    end

    subgraph EXTERNAL["External Ecosystem"]
        OSM["OpenStreetMap Tile Server"]
        GDrive["Google Drive Shared Archive"]
        GCal["Google Calendar Shared Schedule"]
    end

    UI -->|1. Form Input & Media| Zustand
    UI -->|2. Background Sync Check| SW
    SW <-->|3. Queue Reads/Writes| LS
    Zustand -->|4. Offline Cache Fallback| LS
    
    UI -->|5. HTTP Requests (JWT Cookie)| AuthMid
    AuthMid -->|6. Token Verification| AuthSvc
    AuthMid -->|7. Forward Request| Val
    Val -->|8. Run Business Logic| Business
    
    Business -->|9. Query/Mutation| PostgREST
    PostgREST --> RLS
    RLS --> DB
    
    Business -->|10. Upload Stream| StorageBucket
    DB --> Triggers
    Triggers -->|11. Event Audit Log / Sync updates| DB
    Triggers -->|12. Broadcast State Change| Realtime
    Realtime -->|13. WebSocket Channel stream| UI
    
    Business -->|14. GCP Service Account write| DriveProxy
    Business -->|15. GCP Service Account write| CalProxy
    DriveProxy -->|16. File Archive| GDrive
    CalProxy -->|17. Event Sync| GCal
    OSM -->|18. Map Tile Stream| UI
```

### 1.2 Data Flow Layer Definitions

*   **Client Layer:** The user interface captures inputs (survey answers, photos, GPS coordinates). If online, data is dispatched via fetch requests. If offline, the Service Worker intercepts traffic and routes the data to `localStorage`.
*   **Edge API Layer:** Handles authentication check, role verification, Zod schema validation, data formatting, and interfaces with external Google APIs.
*   **Backend-as-a-Service Layer:** Supabase manages user tables and storage folders. RLS policies intercept every database query, ensuring users only access rows permitted by their roles. Database triggers auto-generate audit trails and broadcast realtime updates.
*   **External Ecosystem:** OpenStreetMap provides base map tile streams. Google Drive acts as a permanent document archive, and Google Calendar displays project schedules.

---

## 2. User Data Flow

How user credentials, sessions, and settings travel through the authentication and profile components.

### 2.1 Login and Session Validation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as KKN Member / Admin
    participant UI as Login Page (Browser UI)
    participant ClientStore as Zustand Auth Store
    participant Mid as Next.js Middleware Guard
    participant Auth as Supabase Auth (GoTrue)
    participant Profile as user_profile Table (PostgreSQL)

    User->>UI: Input Email & Password + click "Masuk"
    UI->>UI: Form Validation (email pattern, pass length)
    
    alt Client Validation Fails
        UI-->>User: Show inline error
    else Client Validation Passes
        UI->>Auth: POST /auth/v1/token?grant_type=password
        Auth->>Auth: Hash password & compare in auth.users
        
        alt Authentication Fails
            Auth-->>UI: Return 400 Bad Request (Invalid Credentials)
            UI-->>User: Show error: "Email atau password salah"
        else Authentication Succeeds
            Auth-->>UI: Return JWT Access Token + Refresh Token
            UI->>ClientStore: Write token, user metadata to memory state
            UI->>UI: Set httpOnly Cookie 'sb-access-token' (SameSite=Strict, Secure)
            UI->>Mid: Navigate to protected page /app/dashboard
            
            Mid->>Auth: Validate JWT cookie
            Auth-->>Mid: Token Valid (claims: user_id, email)
            Mid->>Profile: Select role, is_active where id = user_id
            Profile-->>Mid: Returns { role: 'kkn_member', is_active: true }
            
            alt User Suspended
                Mid-->>UI: Redirect to /login with 403 error cookie
                UI-->>User: Show message: "Akun Anda dinonaktifkan"
            else User Active
                Mid-->>UI: Allow navigation to route
                UI-->>User: Render Dashboard
            end
        end
    end
```

### 2.2 Logout Flow

1.  **User Action:** User taps "Keluar" on the sidebar or mobile bottom drawer.
2.  **State Check:** App checks Zustand `offlineQueueStore`. If count > 0, display a confirmation dialog warning the user that logging out will prevent automatic background syncing of their queued offline data.
3.  **Authentication Revocation:** If confirmed, call Supabase `signOut()`.
4.  **Local Cleaning:** Clears Zustand auth state, deletes the httpOnly cookie from the browser, and removes temporary drafts from `localStorage`.
5.  **Redirect:** Reroutes to `/login` and renders a clean login form.

### 2.3 User Profile Update Flow

```mermaid
sequenceDiagram
    actor User as Logged-in Member
    participant UI as Edit Profile Form
    participant Val as API Validation Gate
    participant DB as user_profile Table
    participant Audit as audit_log Table

    User->>UI: Edit full_name + Click "Simpan Perubahan"
    UI->>Val: POST update payload { full_name }
    Val->>Val: Verify JWT role claims (user matches target profile_id)
    Val->>Val: Validate full_name length (3-100 characters)
    Val->>DB: UPDATE user_profile SET full_name = new_value WHERE id = user_id
    
    Note over DB,Audit: Trigger handles audit log entry
    DB->>Audit: INSERT INTO audit_log (user_id, action: 'USER_PROFILE_UPDATED', diff)
    DB-->>UI: Confirm success
    UI-->>User: Toast: "Profil berhasil diperbarui"
```

---

## 3. Survey Data Flow

The complete lifecycle of survey data, documenting step-by-step progress from doorstep collection to database replication.

```mermaid
sequenceDiagram
    autonumber
    actor Surveyor as KKN Member
    participant Form as Survey Form Wizard (PWA UI)
    participant State as Zustand Form Store
    participant GPS as Browser Geolocation API
    participant Cam as Mobile Camera / Gallery
    participant SW as Service Worker (Sync Router)
    participant LS as localStorage Queue
    participant API as Vercel Sync API
    participant DB as Supabase PostgreSQL
    participant Storage as Supabase Storage Bucket
    participant RT as Supabase Realtime Hub
    participant Map as GIS Map (Other team members)

    Surveyor->>Form: Opens Step 1 (Select RW and RT)
    Form->>State: Write active rt_id, rw_number to form state
    
    Surveyor->>Form: Opens Step 2 (Trigger GPS Capture)
    Form->>GPS: Call getCurrentPosition(enableHighAccuracy=true, timeout=15000)
    GPS-->>Form: Returns { latitude, longitude, accuracy }
    Form->>State: Write GPS metrics to state
    
    Surveyor->>Form: Opens Step 3 (Fill Household core fields)
    Form->>State: Write kk_name, family_size, housing details to state
    
    Surveyor->>Form: Opens Step 4 & 5 (Add Problems & Potentials)
    Form->>State: Push problem/potential objects to state lists
    
    Surveyor->>Form: Opens Step 6 (Capture Photo)
    Form->>Cam: Open camera/gallery picker
    Cam-->>Form: Return raw image file (4MB JPEG)
    Form->>Form: Downsample via HTML5 Canvas (80% quality scale)
    Form->>State: Save compressed image blob (750KB JPEG) to state
    
    Surveyor->>Form: Reviews Step 7 & Clicks "Simpan Survei"
    Form->>Form: Generate Client UUID (client_uuid = random UUID)
    
    alt Device is Offline
        Form->>LS: Write full state payload + client_uuid (status: 'pending')
        LS-->>Form: Confirm draft written
        Form-->>Surveyor: Render success screen with Offline banner
    else Device is Online
        Form->>API: POST /api/surveys (payload + JWT cookie)
        API->>API: Validate Zod Schemas
        
        API->>Storage: PUT compressed image blob to /survey-photos/{hh_id}/photo.jpg
        Storage-->>API: Return storage url reference
        
        API->>DB: INSERT into household & survey tables with client_uuid
        DB->>DB: Apply RLS, execute triggers (update household status)
        DB-->>API: Confirm transaction success
        
        DB->>RT: Broadcast postgres_changes (table: household, event: INSERT)
        RT-->>Map: WebSocket push payload
        Map->>Map: Add new green pin to coordinates
        API-->>Form: Return 201 Created (household_id)
        Form-->>Surveyor: Show success screen: "Survei Tersimpan!"
    end
```

---

## 4. GIS Data Flow

How spatial coordinates migrate from the device geolocation sensor to visual Leaflet pins and QGIS exports.

```mermaid
flowchart TD
    subgraph CAPTURE["Capture & Validation"]
        A["Device Geolocation API\n(watchPosition / getCurrentPosition)"] -->|1. coordinates object| B["Client-side Precision Rounding\n(NUMERIC 10,7 formatting)"]
        B -->|2. Latitude/Longitude check| C{"Zod Range Validation\n(Lat: -90..90, Lng: -180..180)"}
    end

    subgraph STORAGE["Database Storage"]
        C -->|3. Validated JSON Payload| D["API Insert transaction"]
        D -->|4. SQL INSERT| E["household table (latitude, longitude, gps_accuracy)"]
    end

    subgraph VISUALIZATION["Leaflet Mapping (UI)"]
        E -->|5. Realtime DB trigger| F["Supabase Realtime WebSocket Stream"]
        F -->|6. Push update payload| G["Zustand Map Store (append coordinate)"]
        G -->|7. Bind array [lat, lng]| H["Leaflet Marker Pin Component"]
        
        I["Map Filters (Zustand: rt_id, status)"] -->|8. Filter check| H
        H -->|9. Render visible state| J["Interactive Map (Leaflet Base Canvas)"]
    end

    subgraph EXPORT["GIS Export"]
        E -->|10. GET /api/reports/geojson| K["JSON to GeoJSON Transformer"]
        K -->|11. Map fields| L["Download GeoJSON / KML file"]
        L -->|12. Manual Import| M["Desktop GIS Tool (QGIS / Google Earth)"]
    end

    C -->|Invalid| N["Throw GPS Validation Error"]
```

### 4.1 GeoJSON Transformation Mapping

When exporting coordinate data, the API proxy transforms PostgreSQL relational records into GeoJSON features:

| Database Column | GeoJSON Target Field | Transformation Applied |
|---|---|---|
| `household.longitude` | `geometry.coordinates[0]` | Cast to float, format to 7 decimal places |
| `household.latitude` | `geometry.coordinates[1]` | Cast to float, format to 7 decimal places |
| `household.kk_name` | `properties.kk_name` | Mask PII names for public exports (e.g. "Bpk. S***") |
| `household.survey_status`| `properties.status` | Maps database enum to status string |
| `household.rt_id` | `properties.rt` | Look up `rt_number` from parent `rt` table |

---

## 5. Documentation Flow

How media files (photos, PDFs, reports) move from device memory to private storage buckets and the public gallery.

```mermaid
sequenceDiagram
    autonumber
    actor Surveyor as Surveyor
    participant Input as File Upload Input (PWA)
    participant Compress as Image Compressor
    participant Proxy as Vercel Photo API Proxy
    participant SStorage as Supabase Storage Bucket
    participant DB as household_photo / document Tables
    participant GDrive as Google Drive Sync Proxy

    Surveyor->>Input: Selects file (4MB JPEG photo or 12MB PDF notulensi)
    
    alt File is Photo (JPEG/PNG)
        Input->>Compress: Pass file blob
        Compress->>Compress: Resample to max width 1920px (80% canvas scale)
        Compress-->>Input: Return compressed photo (750KB JPEG)
    end

    Input->>Proxy: POST /api/photos/upload ( multipart stream )
    Proxy->>Proxy: Inspect headers (MIME check: image/jpeg, image/png, application/pdf)
    Proxy->>Proxy: Generate unique filename: {uuid}_{timestamp}.ext
    Proxy->>SStorage: PUT file to bucket 'survey-photos' / 'documents' (private)
    SStorage-->>Proxy: Return storage path metadata
    
    alt Document Sync enabled
        Proxy->>DB: INSERT document metadata (local storage path)
        DB-->>Proxy: Return document_id
        Proxy->>GDrive: Trigger Drive Archive job (document_id)
        GDrive->>SStorage: Fetch file stream
        GDrive->>GDrive: Upload to Google folder structure
        GDrive-->>Proxy: Return drive_link URL
        Proxy->>DB: UPDATE document SET drive_link = url WHERE id = doc_id
    else Simple Photo
        Proxy->>DB: INSERT household_photo metadata (storage_url)
    end

    DB-->>Proxy: Write confirmed
    Proxy-->>Input: Return 200 OK + File Metadata
    Input-->>Surveyor: Toast: "Berkas berhasil diunggah"
```

---

## 6. Google Drive Flow

The folder creation, naming standards, duplication prevention, and archiving flow for documents syncing to the shared Google Drive.

### 6.1 Folder Scoping and Sync Sequence

```mermaid
sequenceDiagram
    autonumber
    participant Job as Drive Sync Job (Vercel Edge)
    participant DB as PostgreSQL Metadata
    participant GAPI as Google Drive API (GCP Service Account)
    participant Store as Supabase Storage Bucket

    Job->>DB: Query unsynced document rows (drive_link IS NULL)
    DB-->>Job: Return document rows list
    
    loop Per Unsynced Document
        Job->>GAPI: Search folders: name = 'SISDAMAS KKN 56' and mimeType = folder
        
        alt Root Folder Missing
            GAPI->>GAPI: Create Root Folder: "SISDAMAS KKN 56 - Desa Sukahaji 2026"
            GAPI-->>Job: Return root_folder_id
        else Root Folder Exists
            GAPI-->>Job: Return root_folder_id
        end

        Job->>GAPI: Search subfolder under root: name = {sisdamas_cycle}
        
        alt Subfolder Missing
            GAPI->>GAPI: Create subfolder (e.g. "Siklus 2 - Survei & Pemetaan")
            GAPI-->>Job: Return subfolder_id
        else Subfolder Exists
            GAPI-->>Job: Return subfolder_id
        end

        Job->>GAPI: Search file in subfolder: name = {file_name}
        
        alt File Duplicate Found
            GAPI-->>Job: Return file exists
            Job->>Job: Append tag: {file_name}_v{timestamp}.ext
        end

        Job->>Store: GET file stream from storage bucket path
        Store-->>Job: Return binary stream
        Job->>GAPI: POST multipart upload (stream + metadata + subfolder_id)
        GAPI-->>Job: Return Drive File metadata (webContentLink, webViewLink)
        Job->>DB: UPDATE document SET drive_link = webViewLink WHERE id = doc_id
    end
```

---

## 7. Google Calendar Flow

How schedule events, meetings, and program milestones flow from the app UI to the shared calendar.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Super Admin
    participant UI as Event Form / Program Form
    participant Proxy as Vercel Google Calendar API Proxy
    participant GAPI as Google Calendar API (Service Account)
    participant DB as program / calendar_event Table

    Admin->>UI: Create new community program milestone (due date, details)
    UI->>Proxy: POST /api/google/calendar/events { title, description, start_date, end_date }
    Proxy->>Proxy: Validate JWT admin permissions
    Proxy->>Proxy: Load Google API client config (Service Account keys)
    Proxy->>Proxy: Format Google Event resource payload
    Proxy->>GAPI: POST /calendar/v3/calendars/{calendarId}/events
    GAPI-->>Proxy: Return Event Resource JSON (id, htmlLink)
    Proxy->>DB: INSERT INTO program_task / calendar_event (calendar_event_id, google_link)
    DB-->>Proxy: Confirm database write
    Proxy-->>UI: Return 201 Created
    UI-->>Admin: Show success message: "Tugas dibuat & sinkron ke Google Calendar"
```

### 7.1 Calendar Data Validation Mapping
*   **Timezone:** Hardcoded to `Asia/Jakarta` (WIB) since KKN Desa Sukahaji is in West Java, Indonesia.
*   **All-Day Events:** Program milestones are set as all-day events (`start.date` and `end.date` in YYYY-MM-DD format).
*   **Time-Specific Events:** Community meetings (rembug warga) are set as timed events (`start.dateTime` and `end.dateTime` in ISO 8601 format).

---

## 8. Dashboard Flow

How widgets, statistics cards, activity logs, and progress indicators pull and refresh their data.

### 8.1 Realtime Dashboard Pipeline

```mermaid
graph LR
    subgraph DB_TABLES["Database Tables"]
        Surv["survey count"]
        Prob["problem stats"]
        Tasks["program tasks"]
    end

    subgraph ENGINE["Database Triggers & API"]
        Trig["DB aggregate triggers"]
        CacheStore["dashboard_metrics cache table"]
        REST["PostgREST read API"]
    end

    subgraph CLIENT_APP["Zustand Client Store"]
        ZMetrics["Zustand metrics state"]
        SWR["useSWR Cache (30s revalidation)"]
        WSSub["WebSocket Realtime listener"]
    end

    subgraph UI_WIDGETS["Dashboard Widgets"]
        Card1["Progress Bar RT"]
        Card2["Activity Feed Card"]
        Card3["Chart Widget"]
    end

    Surv --> Trig
    Prob --> Trig
    Tasks --> Trig
    Trig --> CacheStore
    CacheStore --> REST
    
    REST -->|1. fetch HTTP| SWR
    SWR -->|2. populate state| ZMetrics
    ZMetrics --> Card1
    ZMetrics --> Card2
    ZMetrics --> Card3
    
    Trig -->|3. broadcast event| WSSub
    WSSub -->|4. bypass SWR, update state| ZMetrics
```

### 8.2 Dashboard Widgets Specifications

*   **Total Surveys Completed:** Query: `SELECT COUNT(id) FROM survey WHERE deleted_at IS NULL`.
*   **RT Coverage Progress:** Query: `SELECT rt_id, COUNT(id) FROM household WHERE survey_status = 'complete' GROUP BY rt_id`.
*   **Recent Activity Feed:** Query: `SELECT user_name, action, created_at FROM audit_log ORDER BY created_at DESC LIMIT 10`. Broadcasts inserts via WebSockets.
*   **Problem Category Chart:** Query: `SELECT category, COUNT(id) FROM problem GROUP BY category`. Renders dynamically using Recharts.

---

## 9. Report Flow

Data flow sequence for generating and exporting survey statistics (Excel, PDF, GeoJSON).

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Super Admin
    participant UI as Export Panel UI
    participant Proxy as Vercel Export API Proxy
    participant DB as PostgreSQL Database
    participant Storage as Supabase Storage Bucket (for photos)

    Admin->>UI: Selects export type (Excel raw data) & clicks "Ekspor"
    UI->>Proxy: GET /api/reports/excel (filters: rt_id, date_range)
    Proxy->>Proxy: Authenticate Admin JWT token
    Proxy->>DB: Query surveys, problems, potentials matching filters
    DB-->>Proxy: Return JSON arrays of raw records
    Proxy->>Proxy: Feed records into SheetJS Workbook engine
    Proxy->>Proxy: Create sheets: "Data Rumah Tangga", "Masalah", "Potensi"
    Proxy->>Proxy: Format sheet layouts & compile binary buffer
    Proxy-->>UI: Return Excel binary octet-stream
    UI->>UI: Initiate browser download "SISDAMAS_Survei_Dusun2.xlsx"
    
    Note over Admin,Storage: PDF Report Generation
    Admin->>UI: Selects PDF report
    UI->>Proxy: GET /api/reports/pdf
    Proxy->>DB: Query aggregate counts & recent program progress
    DB-->>Proxy: Return stats
    Proxy->>Proxy: Render HTML5 Canvas metrics report (with charts)
    Proxy->>Proxy: Run jsPDF conversion engine
    Proxy-->>UI: Return PDF binary blob stream
    UI->>UI: Initiate browser download "SISDAMAS_Laporan_Statistik.pdf"
```

---

## 10. Offline Synchronization Flow

Data structures and queuing rules for managing offline forms, media, and conflict resolution during field surveys.

### 10.1 Offline Queue Payload Structure

Offline data is written as a JSON record in `localStorage` under the key `sisdamas_offline_queue`:

```json
{
  "client_uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "type": "survey_submission",
  "payload": {
    "rt_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "kk_name": "Bpk. Ahmad Junaedi",
    "family_size": 4,
    "housing_status": "own",
    "housing_condition": "moderate",
    "latitude": -6.847123,
    "longitude": 107.452345,
    "problems": [
      { "category": "Infrastruktur", "description": "Saluran pembuangan air tersumbat" }
    ],
    "potentials": [
      { "category": "Ekonomi", "description": "UMKM kerajinan bambu" }
    ]
  },
  "created_at": "2026-07-14T07:33:00.000Z",
  "status": "pending"
}
```

### 10.2 Conflict Resolution and Idempotent Sync Flow

```mermaid
flowchart TD
    A["Device detects 'online' event"] --> B["Read offline queue from localStorage"]
    B --> C{"Check: pending items exist?"}
    C -->|No| D["Sync complete - do nothing"]
    C -->|Yes| E["Pick first pending item (client_uuid)"]
    E --> F["Set status = 'syncing' in localStorage"]
    F --> G["POST /api/sync {payload, client_uuid}"]
    
    G --> H{"Verify in Database:\nDoes client_uuid exist?"}
    H -->|Yes: Duplicate Conflict| I["Resolve Conflict:\nDiscard write request (idempotent OK)"]
    H -->|No: New Data| J["INSERT records inside SQL Transaction\n(household + survey + problems + potentials)"]
    
    I --> K["Return API 200 Success (already_synced)"]
    J --> L{"Insert Success?"}
    L -->|Yes| M["Return API 201 Success (created)"]
    L -->|No| N["Return API 500 Server Error"]
    
    K --> O["Remove item from localStorage queue"]
    M --> O
    N --> P["Set status = 'failed' in localStorage\nIncrement attempts count"]
    
    P --> Q{"attempts > 3?"}
    Q -->|Yes| R["Block auto-sync\nShow red alert: 'Gagal Sinkronisasi'"]
    Q -->|No| S["Wait 30s (exponential backoff)\nRetry sync"]
    
    O --> T["Check next queue item"]
    T --> C
```

---

## 11. Validation Flow

All validation checkpoints across client, API, database, and storage boundaries.

```mermaid
flowchart LR
    subgraph CLIENT["Client Validation"]
        A["Surveyor Input"] --> B["React Hook Form schema check\n- Required fields check\n- Text lengths (name min 3)\n- Valid numeric ranges"]
    end

    subgraph API["Edge API Validation"]
        B -->|Pass| C["Vercel API Gateway Zod check\n- Type coercion\n- Latitude (-90..90)\n- Longitude (-180..180)\n- client_uuid UUID structure"]
    end

    subgraph DATABASE["Database Constraint Check"]
        C -->|Pass| D["PostgreSQL Engine\n- kk_number regex check\n- USG score check (1..5)\n- Foreign keys checks\n- RLS policies authorization check"]
    end

    subgraph STORAGE["Storage Validation"]
        D -->|Pass| E["Supabase Storage policies\n- File size limits (<=800KB)\n- MIME type check (image/jpeg, png)\n- File path validation"]
    end

    E -->|Pass| F["Survey Saved Successfully"]
    
    B -->|Fail| G["Show Client Errors"]
    C -->|Fail| H["Return API 422 Unprocessable"]
    D -->|Fail| I["Return API 409 Conflict / 400 Bad Request"]
    E -->|Fail| J["Return Storage 403 / 413 error"]
```

---

## 12. Error Recovery Flow

Detailed recovery workflows for common field failure scenarios.

### 12.1 GPS Failure Pathway

```mermaid
flowchart TD
    A["Initiate GPS Capture in Survey Form"] --> B{"watchPosition returns?"}
    B -->|Location Success| C{"Check accuracy <= 30m?"}
    C -->|Yes| D["Auto-populate Lat/Lng fields\nShow Green GPS Badge"]
    C -->|No| E["Show Yellow Warning Pill\n'Akurasi Rendah'\nContinue search"]
    B -->|Timeout (15 seconds)| F["Show Red GPS Badge\n'GPS Tidak Tersedia'"]
    B -->|User Denies Permission| G["Show Overlay:\n'Izin Lokasi Diperlukan'"]
    
    F --> H["Render Fallback Coordinate Fields\n(Make Latitude/Longitude inputs editable)"]
    G --> H
    E --> H
    
    H --> I["Surveyor enters coordinates manually\n(From paper maps / nearby reference)"]
    I --> J["Set coordinate_source = 'manual' in payload"]
    J --> K["Form submission allowed"]
```

### 12.2 Photo Upload Failure Pathway
1.  **Form Submission:** Surveyor submits survey containing photo payload.
2.  **Network Timeout:** Image upload fails or times out.
3.  **Local Storage Cache:** Image stream remains in browser local cache (indexedDB/localStorage).
4.  **Database Write (Partial):** System writes the core survey fields and sets the household status to `complete`. The corresponding photo URL record in `household_photo` is written with the value `'pending_upload'`.
5.  **UI Banner:** Render a red banner on the dashboard: `"1 Foto gagal diunggah. Ketuk untuk mengulang."`
6.  **Recovery Event:** When internet speed improves, the user taps the banner. The app reads the cached photo blob and retries the upload to Supabase Storage, updating the database record on success.

---

## 13. Notification Flow

The lifecycle of internal notifications, alerts, and system triggers.

### 13.1 Notification State Machine

```
[System Trigger Event] 
        │
        ▼
   [State: Queued] ➔ Database Write to notifications table (user_id, message, is_read: false)
        │
        ▼
 [State: Delivered] ➔ WebSocket push to target client (Zustand state append)
        │
        ├────────────────────────────(User clicks close / reads notification)
        ▼                                          │
   [State: Read] ➔ UPDATE notifications           │
   SET is_read = true WHERE id = uuid             │
        │                                          ▼
        ├────────────────────────────────(Auto-Archive Trigger)
        ▼
  [State: Archived] ➔ Soft deleted after 30 days
```

### 13.2 System Triggers for Notifications

*   **RT Progress Alert:** Run nightly database trigger. If `survey_status = 'pending'` is > 50% for any RT on Day 6 of KKN ➔ Insert warning notification for Super Admin.
*   **Program Task Due:** Daily cron job queries tasks where `due_date = current_date + 1 day` and `status != 'done'` ➔ Insert alert notification for KKN member PIC.
*   **Sync Error Alert:** If client sync retry attempts > 3 ➔ Insert critical notification for Admin to review user's local queue.

---

## 14. Audit Flow

How edits, deletions, and admin configurations are tracked across the database schema.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Super Admin
    participant DB as Supabase PostgreSQL
    participant Trig as Database Audit Trigger
    participant Log as audit_log Table (Immutable)

    Admin->>DB: UPDATE user_profile SET role = 'super_admin' WHERE id = member_uuid
    
    critical Write Audit Log
        DB->>Trig: Trigger fire: AFTER UPDATE ON user_profile
        Trig->>Trig: Fetch auth.uid() (actor_id)
        Trig->>Trig: Compute payload diff (JSONB structure)
        Trig->>Log: INSERT INTO audit_log (user_id, action: 'ROLE_CHANGED', entity_type: 'user_profile', entity_id: member_uuid, metadata: {old: 'kkn_member', new: 'super_admin'})
        Log-->>Trig: Confirm write successful
    end
    
    DB-->>Admin: Returns 200 OK (User Role Updated)
```

**Security Auditing Constraints:**
*   The `audit_log` table is **read-only** to all users (even Super Admins).
*   Any query attempting to `UPDATE` or `DELETE` rows inside the `audit_log` table will fail due to PostgreSQL RLS rules.

---

## 15. Privacy Flow

How data is categorized and sanitized across public and internal screens.

```
+-----------------------------------------------------------------------------------+
|                              DATA PRIVACY ISOLATION                               |
+-----------------------------------------------------------------------------------+
|  [ RESTRICTED AREA (Admin only) ]                                                 |
|  - Raw audit logs, user credentials, database metrics                             |
|  - Action: Only decrypted & queryable by Super Admin session                       |
+-----------------------------------------------------------------------------------+
|  [ INTERNAL AREA (Authenticated KKN Members) ]                                    |
|  - Precise GPS coordinates (10,7 numeric format)                                  |
|  - Head of household names (kk_name) & KK card numbers (kk_number)                |
|  - House condition photos                                                         |
|  - Action: Accessible only via JWT session checks; RLS enforced                   |
+-----------------------------------------------------------------------------------+
|  [ PUBLIC AREA (Village & General Public) ]                                       |
|  - Aggregated numbers (RT survey progress bars)                                   |
|  - Anonymized Map markers (shifted coordinates, PII removed)                      |
|  - Program timelines (Cycle 4 milestones)                                         |
|  - Action: Filtered public API views; no authentication required                  |
+-----------------------------------------------------------------------------------+
```

### Anonymization Transformation Logic (Public Map)

Before rendering data on the public map page `/peta` (unauthenticated):
1.  Query retrieves households where `survey_status = 'complete'`.
2.  Precision reducer: Latitude/Longitude rounded from 7 decimals to 3 decimals (shifts precise location by ~110 meters, preventing identification of individual homes).
3.  PII stripper: `kk_name` is replaced with standard text (e.g. "Keluarga RT 01").
4.  Photos are excluded entirely from public map tooltips.

---

## 16. Performance Analysis

Key database bottleneck locations and caching opportunities.

### 16.1 Potential Bottlenecks and Mitigations

*   **Map Marker Loading:** Fetching detailed JSON shapes for hundreds of markers will cause page lag on low-end Android phones.
    *   *Mitigation:* The API coordinates retrieval returns only four columns: `id, latitude, longitude, survey_status`. Detailed household summaries, photos, and problem lists are requested lazily only when a user clicks a marker pin.
*   **Photo Upload Bandwidth:** Uploading raw camera images (4MB+) under village cellular signal will cause request timeouts.
    *   *Mitigation:* Enforce client-side photo downsampling in the browser canvas before transmission. The file size is compressed to ≤800KB before the upload stream starts.

### 16.2 Caching Strategy Matrix

| Data Type | Cache Location | Caching Strategy | Revalidation Interval (TTL) |
|---|---|---|---|
| **OSM Map Tiles** | Service Worker cache | Cache-First | 7 Days |
| **Static Assets (CSS/JS)** | PWA asset cache | Cache-First | 30 Days |
| **Geographic Master Data** | Zustand client state | Immutable (no refresh) | Session |
| **Dashboard Metrics** | Browser SWR Cache | Stale-While-revalidate | 30 Seconds |
| **Realtime Map Pin Drops** | WebSocket connection | Bypass cache (live update) | Realtime |

---

## 17. Recommendations

For the API design and deployment teams:

1.  **Idempotency Enforcements:** Enforce `client_uuid` in the API schema validation layer for all survey creation endpoints to protect data integrity during offline synchronizations.
2.  **Compressive Canvas Pipeline:** Ensure client-side image compression parameters (80% JPEG quality, max 1920px width) are locked in the UX code to prevent Vercel payload size limit exceptions.
3.  **Realtime Subscription Limits:** Set up the Supabase Realtime channel filters to subscribe only to changes in the active `household` table (not the log table) to reduce WebSocket traffic on low-end smartphones.
4.  **Google Drive Queue limit:** Limit Drive uploads to asynchronous batches run during low-traffic periods (Phase 2), preventing Google API rate limits from blocking surveyor work in the field.

---

*This Data Flow Specification is derived from `07_DATA_FLOW_SPECIFICATION_PROMPT.md` and is subordinate to `00_PROJECT_FOUNDATION.md`, `02_SYSTEM_BLUEPRINT.md`, `03_PRD.md`, `04_UX_SPECIFICATION.md`, `05_TECHNICAL_SPECIFICATION.md`, and `06_DATABASE_SPECIFICATION.md`. No REST API routes or server endpoint paths are generated in this document.*

---

**Would you like to revise this Data Flow Specification before we proceed to generate the API Specification (`08_API_SPECIFICATION.md`)?**

# SISDAMAS Digital Platform
## API Specification

| | |
|---|---|
| **Document** | 08 — API Specification |
| **Version** | 1.0 |
| **Status** | Draft — Pending Review |
| **Predecessors** | 00_PROJECT_FOUNDATION · 01_PRODUCT_DISCOVERY · 02_SYSTEM_BLUEPRINT · 03_PRD · 04_UX_SPECIFICATION · 05_TECHNICAL_SPECIFICATION · 06_DATABASE_SPECIFICATION · 07_DATA_FLOW_SPECIFICATION |
| **Prepared By** | API Design Team (Principal Backend Architect, Principal API Architect, Senior Software Architect, Senior Backend Engineer, REST API Specialist, OpenAPI Expert, Supabase Expert, Security Engineer, Technical Writer) |
| **Platform** | SISDAMAS Digital Platform — KKN Kelompok 56, UIN Sunan Gunung Djati Bandung |
| **Base URL** | `/api/v1` (relative to Vercel/Next.js root) |
| **Response Format** | JSON (RESTful standards) |

> **Document role:** This API Specification defines the exact contract for all HTTP communication on the SISDAMAS Digital Platform. It specifies request methods, endpoints, parameters, body validation rules, success/error payloads, and standard status codes. In accordance with the prompt constraints, **no backend controller or service implementations are generated in this document.**

---

## Table of Contents

1. [API Principles](#1-api-principles)
2. [Domain Overview](#2-domain-overview)
3. [Endpoint Catalog](#3-endpoint-catalog)
4. [Response & Error Standards](#4-response--error-standards)
5. [Pagination, Filtering, Sorting & Search](#5-pagination-filtering-sorting--search)
6. [Endpoint Specifications](#6-endpoint-specifications)
   - 6.1 Authentication Domain (`/auth`)
   - 6.2 Sticky Notes Domain (`/sticky-notes`)
   - 6.3 Survey Domain (`/surveys`)
   - 6.4 GIS Domain (`/gis`)
   - 6.5 Priority Matrix Domain (`/priority-matrix`)
   - 6.6 Dashboard Domain (`/dashboard`)
   - 6.7 Report Domain (`/reports`)
   - 6.8 Google Domain (`/google`)
   - 6.9 Notifications Domain (`/notifications`)
   - 6.10 Administration Domain (`/admin`)
7. [Security Standards](#7-security-standards)
8. [OpenAPI 3.1 Recommendations](#8-openapi-31-recommendations)
9. [API Review & Self-Correction](#9-api-review--self-correction)

---

## 1. API Principles

Every endpoint is designed around these core communication principles:

1.  **Predictability:** URIs use plural resource names (e.g. `/surveys`, `/sticky-notes/boards`) instead of verbs. Plural names map directly to the database entities.
2.  **RESTful Conformity:** Map standard operations to matching HTTP methods:
    *   `GET` - Retrieve resources without side-effects (safe & idempotent).
    *   `POST` - Create new resources or execute state tasks (neither safe nor idempotent).
    *   `PATCH` - Partially update existing resource fields (idempotent if values are fixed).
    *   `DELETE` - Soft-delete or archive resources (idempotent).
3.  **Strict Validation at Gateway:** Every write request is intercepted by a Zod schema validator before any business logic executes. Unprocessable payloads return `422 Unprocessable Entity` immediately with precise field-level errors.
4.  **Idempotent Synchronizations:** Critical synchronization paths (survey submit) validate a client-generated `client_uuid` to block double write requests during network recovery.
5.  **Secure by default:** Protected routes require a valid bearer JWT or session cookie. RLS claims are verified on every database transaction.
6.  **Bandwidth Efficient:** Pagination is mandatory on list endpoints. JSON keys are short and descriptive to optimize packet sizes under village 3G signals.

---

## 2. Domain Overview

The API endpoints are grouped into **10 logical domains** to match the application architecture:

```
/api/v1/
├── auth/                       # Authentication & session controls
├── sticky-notes/               # S1 Rembug warga notes board
├── surveys/                    # S2 Household survey & batch sync
├── gis/                        # Maps base mapping & GeoJSON exports
├── priority-matrix/            # S3 USG ranking matrix
├── dashboard/                  # Dashboard metrics and feeds
├── reports/                    # LPJ SheetJS/jsPDF exports
├── google/                     # Google Drive / Calendar API integrations
├── notifications/              # System notifications
└── admin/                      # Admin user controls & audit logs
```

---

## 3. Endpoint Catalog

| Domain | Method | Endpoint URL | Auth Required | Access Role | Phase |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | No | Public | 1 |
| | `POST` | `/auth/logout` | Yes | KKN Member, Admin | 1 |
| | `POST` | `/auth/refresh` | Yes | KKN Member, Admin | 1 |
| | `POST` | `/auth/forgot-password` | No | Public | 1 |
| | `GET` | `/auth/profile` | Yes | KKN Member, Admin | 1 |
| | `GET` | `/auth/session/validate`| Yes | KKN Member, Admin | 1 |
| **Sticky Notes** | `GET` | `/sticky-notes/boards` | Yes | KKN Member, Admin | 1 |
| | `POST` | `/sticky-notes/boards` | Yes | Admin only | 1 |
| | `GET` | `/sticky-notes/boards/{board_id}/columns` | Yes | KKN Member, Admin | 1 |
| | `POST` | `/sticky-notes/boards/{board_id}/columns` | Yes | Admin only | 1 |
| | `GET` | `/sticky-notes/columns/{column_id}/notes` | Yes | KKN Member, Admin | 1 |
| | `POST` | `/sticky-notes/columns/{column_id}/notes` | Yes | KKN Member, Admin | 1 |
| | `PATCH`| `/sticky-notes/notes/{note_id}` | Yes | KKN Member (own), Admin| 1 |
| | `DELETE`|`/sticky-notes/notes/{note_id}` | Yes | KKN Member (own), Admin| 1 |
| **Survey** | `POST` | `/surveys` | Yes | KKN Member, Admin | 1 |
| | `PATCH`| `/surveys/{survey_id}` | Yes | KKN Member (own), Admin| 1 |
| | `GET` | `/surveys` | Yes | KKN Member, Admin | 1 |
| | `GET` | `/surveys/{survey_id}` | Yes | KKN Member, Admin | 1 |
| | `POST` | `/surveys/sync` | Yes | KKN Member, Admin | 1 |
| **GIS** | `GET` | `/gis/markers` | Yes | KKN Member, Admin | 1 |
| | `GET` | `/gis/markers/{household_id}`| Yes | KKN Member, Admin | 1 |
| | `PATCH`| `/gis/households/{household_id}/coordinates`| Yes | KKN Member (own), Admin| 1 |
| | `GET` | `/gis/geojson/export` | Yes | KKN Member, Admin | 1 |
| | `GET` | `/gis/kml/export` | Yes | KKN Member, Admin | 1 |
| **Priority** | `GET` | `/priority-matrix` | Yes | KKN Member, Admin | 2 |
| | `POST` | `/priority-matrix/{matrix_id}/items`| Yes | KKN Member, Admin | 2 |
| | `PATCH`| `/priority-matrix/items/{item_id}`| Yes | KKN Member, Admin | 2 |
| | `GET` | `/priority-matrix/results`| Yes | KKN Member, Admin | 2 |
| **Dashboard**| `GET` | `/dashboard/summary` | Yes | KKN Member, Admin | 1 |
| | `GET` | `/dashboard/charts/progress`| Yes | KKN Member, Admin | 1 |
| | `GET` | `/dashboard/charts/problems`| Yes | KKN Member, Admin | 1 |
| | `GET` | `/dashboard/activities` | Yes | KKN Member, Admin | 1 |
| **Report** | `GET` | `/reports/excel` | Yes | Admin only | 2 |
| | `GET` | `/reports/pdf` | Yes | Admin only | 2 |
| **Google** | `POST` | `/google/drive/sync` | Yes | Admin only | 2 |
| | `GET` | `/google/drive/folders` | Yes | Admin only | 2 |
| | `POST` | `/google/calendar/events`| Yes | Admin only | 2 |
| | `PATCH`| `/google/calendar/events/{event_id}`| Yes | Admin only | 2 |
| | `DELETE`|`/google/calendar/events/{event_id}`| Yes | Admin only | 2 |
| **Notif** | `GET` | `/notifications` | Yes | KKN Member, Admin | 2 |
| | `PATCH`| `/notifications/{notif_id}/read`| Yes | KKN Member, Admin | 2 |
| **Admin** | `GET` | `/admin/users` | Yes | Admin only | 1 |
| | `POST` | `/admin/users` | Yes | Admin only | 1 |
| | `PATCH`| `/admin/users/{user_id}/suspend`| Yes | Admin only | 1 |
| | `GET` | `/admin/audit-logs` | Yes | Admin only | 1 |

---

## 4. Response & Error Standards

### 4.1 Success Envelopes

Every successful HTTP response returns a `2xx` status code and a standard JSON envelope:

#### Object Detail Success Envelope
```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": {
    "id": "e304b77f-1d89-49bb-b146-24e5482390a8",
    "created_at": "2026-07-14T07:33:00.000Z"
  }
}
```

#### List Query Success Envelope (Paginating)
```json
{
  "success": true,
  "message": "Data berhasil dimuat",
  "metadata": {
    "total_count": 125,
    "page": 1,
    "page_size": 20,
    "total_pages": 7,
    "has_next": true,
    "has_prev": false
  },
  "data": []
}
```

### 4.2 Error Envelopes

Every error response returns a `4xx` or `5xx` status code and a consistent error envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirimkan tidak valid",
    "details": [
      {
        "field": "kk_name",
        "message": "Nama kepala keluarga minimal 3 karakter"
      }
    ],
    "timestamp": "2026-07-14T07:33:00.000Z",
    "trace_id": "tr-7b233a1e-87fc-4e94-90ab-e95e4e8499ab",
    "suggested_action": "Perbaiki input pada kolom Nama Kepala Keluarga dan submit ulang."
  }
}
```

---

## 5. Pagination, Filtering, Sorting & Search

To protect Supabase computing limits, query variables follow these strict standards:

### 5.1 Pagination Standard
*   **Approach:** Offset pagination via query parameters.
*   **Parameters:**
    *   `page`: Integer, defaults to `1`.
    *   `limit`: Integer, defaults to `20`. Maximum limit is `100`.
*   **Response mapping:** Metadata fields contain standard pagination indicators (see Section 4.1).

### 5.2 Filtering Standard
*   Filters use direct column parameters:
    *   `rt_id=<UUID>`: Filter records matching specific RT boundary.
    *   `rw_number=<string>`: Filter by RW number.
    *   `status=<string>`: Filter by active enum state (e.g. `'complete'`, `'pending'`).
    *   `category=<string>`: Filter by problem/potential category.

### 5.3 Sorting Standard
*   Parameters:
    *   `sort_by`: Column key name (defaults to `'created_at'`).
    *   `order`: Direction parameter, must be `'asc'` or `'desc'` (defaults to `'desc'`).

### 5.4 Search Standard
*   Parameter: `q=<string>`.
*   Searches text columns like names, descriptions, and ID reference numbers using case-insensitive partial matching (PostgreSQL `ILIKE`).

---

## 6. Endpoint Specifications

### 6.1 Authentication Domain (`/auth`)

---

#### 6.1.1 `POST /auth/login`
*   **Purpose:** Authenticate surveyor/admin credentials and set session cookie.
*   **HTTP Method:** `POST`
*   **URL Path:** `/auth/login`
*   **Authentication Required:** No
*   **Request Body Schema:**
    ```json
    {
      "email": "rizki@uin.ac.id",
      "password": "supersecretpassword123"
    }
    ```
*   **Validation Rules (Zod):**
    *   `email` (string, required, valid email format, max 255 characters).
    *   `password` (string, required, min 8 characters, max 100 characters).
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login berhasil",
      "data": {
        "user": {
          "id": "e304b77f-1d89-49bb-b146-24e5482390a8",
          "email": "rizki@uin.ac.id",
          "full_name": "Rizki Hambali",
          "role": "super_admin"
        },
        "session": {
          "access_token": "eyJhbGciOi...",
          "refresh_token": "d7b8a8...",
          "expires_in": 604800
        }
      }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request` (Invalid payload structure / wrong format).
    *   `401 Unauthorized` (Wrong credentials - email or password wrong).
    *   `403 Forbidden` (User account is suspended/inactive).
*   **Rate Limits:** 5 login requests per 15 minutes per IP address.

---

#### 6.1.2 `POST /auth/logout`
*   **Purpose:** Invalidate the current session token.
*   **HTTP Method:** `POST`
*   **URL Path:** `/auth/logout`
*   **Authentication Required:** Yes
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Logout berhasil"
    }
    ```

---

#### 6.1.3 `POST /auth/refresh`
*   **Purpose:** Refresh expired access token using refresh token.
*   **HTTP Method:** `POST`
*   **URL Path:** `/auth/refresh`
*   **Authentication Required:** Yes
*   **Request Body:**
    ```json
    {
      "refresh_token": "d7b8a8..."
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "access_token": "eyJhbGciOiNEWTOKEN...",
        "refresh_token": "d7b8a8NEWREFRESH...",
        "expires_in": 604800
      }
    }
    ```

---

#### 6.1.4 `POST /auth/forgot-password`
*   **Purpose:** Send password reset link to user email.
*   **HTTP Method:** `POST`
*   **URL Path:** `/auth/forgot-password`
*   **Authentication Required:** No
*   **Request Body:**
    ```json
    {
      "email": "rizki@uin.ac.id"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Link reset password telah dikirim ke email Anda"
    }
    ```

---

#### 6.1.5 `GET /auth/profile`
*   **Purpose:** Retrieve profile metrics and active state of logged-in user.
*   **HTTP Method:** `GET`
*   **URL Path:** `/auth/profile`
*   **Authentication Required:** Yes
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "e304b77f-1d89-49bb-b146-24e5482390a8",
        "email": "rizki@uin.ac.id",
        "full_name": "Rizki Hambali",
        "role": "super_admin",
        "survey_count": 45,
        "is_active": true,
        "created_at": "2026-07-14T07:33:00Z"
      }
    }
    ```

---

#### 6.1.6 `GET /auth/session/validate`
*   **Purpose:** Validate current session JWT token cookie (used by Next.js Middleware).
*   **HTTP Method:** `GET`
*   **URL Path:** `/auth/session/validate`
*   **Authentication Required:** Yes (via cookies/headers)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Sesi aktif",
      "data": {
        "valid": true,
        "role": "super_admin",
        "user_id": "e304b77f-1d89-49bb-b146-24e5482390a8"
      }
    }
    ```
*   **Error Responses:**
    *   `401 Unauthorized` (Token expired or signature invalid).

---

### 6.2 Sticky Notes Domain (`/sticky-notes`)

---

#### 6.2.1 `GET /sticky-notes/boards`
*   **Purpose:** Get active boards.
*   **HTTP Method:** `GET`
*   **URL Path:** `/sticky-notes/boards`
*   **Authentication Required:** Yes
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "7b233a1e-87fc-4e94-90ab-e95e4e8499ab",
          "project_id": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
          "name": "Papan Rembug Warga Dusun 2",
          "is_active": true,
          "created_at": "2026-07-14T07:33:00Z"
        }
      ]
    }
    ```

---

#### 6.2.2 `POST /sticky-notes/boards`
*   **Purpose:** Create new board (Admin only).
*   **HTTP Method:** `POST`
*   **URL Path:** `/sticky-notes/boards`
*   **Authentication Required:** Yes (role Super Admin)
*   **Request Body:**
    ```json
    {
      "project_id": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
      "name": "Rembug Warga Siklus 1"
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Papan catatan berhasil dibuat",
      "data": {
        "id": "7b233a1e-87fc-4e94-90ab-e95e4e8499ab",
        "name": "Rembug Warga Siklus 1",
        "is_active": true,
        "created_at": "2026-07-14T07:33:00Z"
      }
    }
    ```

---

#### 6.2.3 `GET /sticky-notes/boards/{board_id}/columns`
*   **Purpose:** Fetch layout columns for a board.
*   **HTTP Method:** `GET`
*   **URL Path:** `/sticky-notes/boards/{board_id}/columns`
*   **Authentication Required:** Yes
*   **Path Parameters:** `board_id` (UUID, required)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        { "id": "1b08de4c-12bc-44fa-ba02-e2bc44fb02de", "board_id": "7b233a1e-87fc-4e94-90ab-e95e4e8499ab", "name": "Aspirasi", "sort_order": 0 },
        { "id": "2b08de4c-12bc-44fa-ba02-e2bc44fb02de", "board_id": "7b233a1e-87fc-4e94-90ab-e95e4e8499ab", "name": "Masalah", "sort_order": 1 },
        { "id": "3b08de4c-12bc-44fa-ba02-e2bc44fb02de", "board_id": "7b233a1e-87fc-4e94-90ab-e95e4e8499ab", "name": "Potensi", "sort_order": 2 },
        { "id": "4b08de4c-12bc-44fa-ba02-e2bc44fb02de", "board_id": "7b233a1e-87fc-4e94-90ab-e95e4e8499ab", "name": "Lainnya", "sort_order": 3 }
      ]
    }
    ```

---

#### 6.2.4 `POST /sticky-notes/boards/{board_id}/columns`
*   **Purpose:** Create new category column (Admin only).
*   **HTTP Method:** `POST`
*   **URL Path:** `/sticky-notes/boards/{board_id}/columns`
*   **Authentication Required:** Yes (role Super Admin)
*   **Path Parameters:** `board_id` (UUID, required)
*   **Request Body:**
    ```json
    {
      "name": "Kategori Baru",
      "sort_order": 4
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Kolom berhasil dibuat"
    }
    ```

---

#### 6.2.5 `GET /sticky-notes/columns/{column_id}/notes`
*   **Purpose:** Get notes inside a column.
*   **HTTP Method:** `GET`
*   **URL Path:** `/sticky-notes/columns/{column_id}/notes`
*   **Authentication Required:** Yes
*   **Path Parameters:** `column_id` (UUID, required)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "e98ca1bc-78cb-4e91-ab02-f2b347fd02bc",
          "column_id": "1b08de4c-12bc-44fa-ba02-e2bc44fb02de",
          "user_id": "e304b77f-1d89-49bb-b146-24e5482390a8",
          "user_name": "Rizki Hambali",
          "content": "Pengadaan air bersih di RT 03",
          "color": "yellow",
          "rt_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "rt_number": "03",
          "created_at": "2026-07-14T07:33:00Z"
        }
      ]
    }
    ```

---

#### 6.2.6 `POST /sticky-notes/columns/{column_id}/notes`
*   **Purpose:** Create note inside column.
*   **HTTP Method:** `POST`
*   **URL Path:** `/sticky-notes/columns/{column_id}/notes`
*   **Authentication Required:** Yes
*   **Path Parameters:** `column_id` (UUID, required)
*   **Request Body:**
    ```json
    {
      "content": "Jalan penghubung RT 02 rusak parah",
      "color": "red",
      "rt_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6e"
    }
    ```
*   **Validation Rules (Zod):**
    *   `content`: String, required, min 3 chars, max 200 chars.
    *   `color`: String, optional, must be `'yellow'`, `'red'`, `'green'`, `'blue'`, or `'purple'`.
    *   `rt_id`: UUID, optional.
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Catatan berhasil dibuat",
      "data": {
        "id": "e98ca1bc-78cb-4e91-ab02-f2b347fd02bc",
        "column_id": "1b08de4c-12bc-44fa-ba02-e2bc44fb02de",
        "user_id": "e304b77f-1d89-49bb-b146-24e5482390a8",
        "content": "Jalan penghubung RT 02 rusak parah",
        "color": "red",
        "rt_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6e",
        "created_at": "2026-07-14T07:33:00Z"
      }
    }
    ```

---

#### 6.2.7 `PATCH /sticky-notes/notes/{note_id}`
*   **Purpose:** Edit content, position column, or color of note.
*   **HTTP Method:** `PATCH`
*   **URL Path:** `/sticky-notes/notes/{note_id}`
*   **Authentication Required:** Yes
*   **Path Parameters:** `note_id` (UUID, required)
*   **Request Body:**
    ```json
    {
      "content": "Jalan penghubung RT 02 sudah diperbaiki sebagian",
      "column_id": "2b08de4c-12bc-44fa-ba02-e2bc44fb02de",
      "color": "yellow"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Catatan berhasil diperbarui"
    }
    ```
*   **Business Rules:** KKN Member can only edit their own note card. Super Admin can edit any note card. Returns `403 Forbidden` if member attempts to edit someone else's note.

---

#### 6.2.8 `DELETE /sticky-notes/notes/{note_id}`
*   **Purpose:** Delete sticky note (hard delete allowed for notes if not prioritized).
*   **HTTP Method:** `DELETE`
*   **URL Path:** `/sticky-notes/notes/{note_id}`
*   **Authentication Required:** Yes
*   **Path Parameters:** `note_id` (UUID, required)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Catatan berhasil dihapus"
    }
    ```
*   **Business Rules:** Notes cannot be deleted if already referenced by priority matrix (`priority_item` table). Returns `400 Bad Request` with message: "Catatan tidak dapat dihapus karena sedang digunakan dalam Matriks Prioritas."

---

#### 6.2.9 `POST /sticky-notes/notes/{note_id}/upvote`
*   **Purpose:** Increments voting count or notes interest indicator (Phase 2).
*   **HTTP Method:** `POST`
*   **URL Path:** `/sticky-notes/notes/{note_id}/upvote`
*   **Authentication Required:** Yes
*   **Path Parameters:** `note_id` (UUID, required)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Dukungan dicatat"
    }
    ```

---

### 6.3 Survey Domain (`/surveys`)

---

#### 6.3.1 `POST /surveys`
*   **Purpose:** Submit a completed household survey transaction.
*   **HTTP Method:** `POST`
*   **URL Path:** `/surveys`
*   **Authentication Required:** Yes
*   **Request Body Schema:**
    ```json
    {
      "rt_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "kk_name": "Bpk. Suparman",
      "kk_number": "3204010010100023",
      "latitude": -6.847123,
      "longitude": 107.452345,
      "gps_accuracy": 5.20,
      "family_size": 4,
      "housing_status": "own",
      "housing_condition": "damaged",
      "client_uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "problems": [
        { "category": "Infrastruktur", "description": "Saluran irigasi rusak di dekat gerbang" },
        { "category": "Kesehatan", "description": "Balita stunting membutuhkan susu tambahan" }
      ],
      "potentials": [
        { "category": "Ekonomi", "description": "Lahan kebun subur untuk pisang" }
      ],
      "photos": [
        "survey-photos/c108de4c/photo1.jpg"
      ]
    }
    ```
*   **Validation Rules (Zod):**
    *   `rt_id`: UUID, required.
    *   `kk_name`: String, required, min 3 chars, max 150 chars.
    *   `kk_number`: String, optional, if present must be exactly 16 digits (`^[0-9]{16}$`).
    *   `latitude`: Float, required, range -90.0000000 to 90.0000000.
    *   `longitude`: Float, required, range -180.0000000 to 180.0000000.
    *   `gps_accuracy`: Float, optional, in meters.
    *   `family_size`: Integer, required, range 1 to 20.
    *   `housing_status`: String, required, value must be `'own'`, `'rent'`, or `'sharing'`.
    *   `housing_condition`: String, required, value must be `'good'`, `'moderate'`, or `'damaged'`.
    *   `client_uuid`: UUID, required. Used for sync duplicate prevention.
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Survei berhasil disimpan",
      "data": {
        "household_id": "c108de4c-12bc-44fa-ba02-e2bc44fb02de",
        "survey_id": "f87bc10b-58cc-4372-a567-0e02b2c3d479",
        "client_uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "survey_status": "complete"
      }
    }
    ```
*   **Error Responses:**
    *   `409 Conflict`: If `client_uuid` is already registered. Returns: `{ "success": true, "message": "Data sudah pernah disinkronisasi", "data": { "survey_id": "f87bc10b-..." } }`
    *   `422 Unprocessable`: If schema validation fails. Details array included.

---

#### 6.3.2 `PATCH /surveys/{survey_id}`
*   **Purpose:** Edit details of a submitted survey.
*   **HTTP Method:** `PATCH`
*   **URL Path:** `/surveys/{survey_id}`
*   **Authentication Required:** Yes
*   **Path Parameters:** `survey_id` (UUID, required)
*   **Request Body Schema:**
    ```json
    {
      "family_size": 5,
      "housing_condition": "moderate"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Data survei berhasil diperbarui"
    }
    ```
*   **Business Rules:** Members can only edit surveys they created, and ONLY if the survey is not verified/locked by Super Admin. Attempting to edit a locked survey returns `403 Forbidden` with message: "Data telah diverifikasi admin dan tidak dapat diubah."

---

#### 6.3.3 `GET /surveys`
*   **Purpose:** Query list of completed surveys (paginated, filterable).
*   **HTTP Method:** `GET`
*   **URL Path:** `/surveys`
*   **Authentication Required:** Yes
*   **Query Parameters:** `page`, `limit`, `rt_id`, `status`, `sort_by`, `order`, `q`.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "metadata": {
        "total_count": 87,
        "page": 1,
        "page_size": 20,
        "total_pages": 5,
        "has_next": true,
        "has_prev": false
      },
      "data": [
        {
          "survey_id": "f87bc10b-58cc-4372-a567-0e02b2c3d479",
          "household_id": "c108de4c-12bc-44fa-ba02-e2bc44fb02de",
          "kk_name": "Bpk. Suparman",
          "rt_number": "01",
          "rw_number": "02",
          "family_size": 4,
          "housing_condition": "damaged",
          "surveyor_name": "Siti Nurhalimah",
          "submitted_at": "2026-07-14T07:33:00Z"
        }
      ]
    }
    ```

---

#### 6.3.4 `GET /surveys/{survey_id}`
*   **Purpose:** Retrieve detailed household survey record, problems list, potential list, and photos.
*   **HTTP Method:** `GET`
*   **URL Path:** `/surveys/{survey_id}`
*   **Authentication Required:** Yes
*   **Path Parameters:** `survey_id` (UUID, required)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "survey_id": "f87bc10b-58cc-4372-a567-0e02b2c3d479",
        "household": {
          "id": "c108de4c-12bc-44fa-ba02-e2bc44fb02de",
          "kk_name": "Bpk. Suparman",
          "kk_number": "3204010010100023",
          "latitude": -6.847123,
          "longitude": 107.452345,
          "gps_accuracy": 5.20,
          "rt_number": "01",
          "rw_number": "02",
          "status": "complete"
        },
        "survey_details": {
          "family_size": 4,
          "housing_status": "own",
          "housing_condition": "damaged",
          "surveyor_name": "Siti Nurhalimah",
          "submitted_at": "2026-07-14T07:33:00Z"
        },
        "problems": [
          { "id": "1", "category": "Infrastruktur", "description": "Saluran irigasi rusak di dekat gerbang" }
        ],
        "potentials": [
          { "id": "1", "category": "Ekonomi", "description": "Lahan kebun subur untuk pisang" }
        ],
        "photos": [
          { "id": "p1", "url": "https://storage.supabase.co/survey-photos/...photo1.jpg" }
        ]
      }
    }
    ```

---

#### 6.3.5 `POST /surveys/sync`
*   **Purpose:** Batch sync offline draft surveys.
*   **HTTP Method:** `POST`
*   **URL Path:** `/surveys/sync`
*   **Authentication Required:** Yes
*   **Request Body:**
    ```json
    {
      "items": [
        {
          "rt_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "kk_name": "Bpk. Ahmad Junaedi",
          "kk_number": "3204010010100024",
          "latitude": -6.847123,
          "longitude": 107.452345,
          "gps_accuracy": 6.10,
          "family_size": 5,
          "housing_status": "own",
          "housing_condition": "moderate",
          "client_uuid": "c304b77f-1d89-49bb-b146-24e5482390a8",
          "problems": [],
          "potentials": [],
          "photos": []
        }
      ]
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Sinkronisasi selesai",
      "data": {
        "synced_count": 1,
        "results": [
          {
            "client_uuid": "c304b77f-1d89-49bb-b146-24e5482390a8",
            "status": "created",
            "id": "a98ca1bc-78cb-4e91-ab02-f2b347fd02bc"
          }
        ]
      }
    }
    ```

---

### 6.4 GIS Domain (`/gis`)

---

#### 6.4.1 `GET /gis/markers`
*   **Purpose:** Fetch clean latitude/longitude marker points for Leaflet map display.
*   **HTTP Method:** `GET`
*   **URL Path:** `/gis/markers`
*   **Authentication Required:** Yes
*   **Query Parameters:** `rt_id`, `status` (e.g. `'pending'`, `'complete'`)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "c108de4c-12bc-44fa-ba02-e2bc44fb02de",
          "latitude": -6.847123,
          "longitude": 107.452345,
          "survey_status": "complete"
        }
      ]
    }
    ```

---

#### 6.4.2 `GET /gis/markers/{household_id}`
*   **Purpose:** Fetch lazy-loaded metadata details when user taps a pin marker.
*   **HTTP Method:** `GET`
*   **URL Path:** `/gis/markers/{household_id}`
*   **Authentication Required:** Yes
*   **Path Parameters:** `household_id` (UUID, required)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "c108de4c-12bc-44fa-ba02-e2bc44fb02de",
        "kk_name": "Bpk. Suparman",
        "rt_number": "01",
        "rw_number": "02",
        "survey_status": "complete",
        "problems_count": 2,
        "potentials_count": 1,
        "photo_thumbnail": "https://storage.supabase.co/.../thumb.jpg"
      }
    }
    ```

---

#### 6.4.3 `PATCH /gis/households/{household_id}/coordinates`
*   **Purpose:** Update coordinate values (manual override pathway).
*   **HTTP Method:** `PATCH`
*   **URL Path:** `/gis/households/{household_id}/coordinates`
*   **Authentication Required:** Yes
*   **Path Parameters:** `household_id` (UUID, required)
*   **Request Body Validation:**
    *   `latitude`: Float (required, -90 to 90)
    *   `longitude`: Float (required, -180 to 180)
    *   `gps_accuracy`: Float (optional)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Koordinat GPS berhasil diperbarui"
    }
    ```

---

#### 6.4.4 `GET /gis/geojson/export`
*   **Purpose:** Get GeoJSON point features matching filters.
*   **HTTP Method:** `GET`
*   **URL Path:** `/gis/geojson/export`
*   **Authentication Required:** Yes
*   **Query Parameters:** `rt_id`
*   **Success Response (200 OK - application/json):**
    ```json
    {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [107.452345, -6.847123]
          },
          "properties": {
            "id": "c108de4c-12bc-44fa-ba02-e2bc44fb02de",
            "kk_name": "Bpk. Suparman",
            "status": "complete"
          }
        }
      ]
    }
    ```

---

#### 6.4.5 `GET /gis/kml/export`
*   **Purpose:** Get KML/KMZ schema for Google Earth import.
*   **HTTP Method:** `GET`
*   **URL Path:** `/gis/kml/export`
*   **Authentication Required:** Yes
*   **Success Response (200 OK - application/vnd.google-earth.kml+xml):** Returns structured KML document schema.

---

### 6.5 Priority Matrix Domain (`/priority-matrix`)

---

#### 6.5.1 `POST /priority-matrix/{matrix_id}/items`
*   **Purpose:** Pull a problem into USG ranking board.
*   **HTTP Method:** `POST`
*   **URL Path:** `/priority-matrix/{matrix_id}/items`
*   **Authentication Required:** Yes
*   **Path Parameters:** `matrix_id` (UUID, required)
*   **Request Body Validation:**
    *   `problem_id`: UUID (optional, references survey problem table)
    *   `manual_problem_text`: String (optional, used for sticky board migration notes)
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Masalah dimasukkan ke matriks prioritas"
    }
    ```

---

#### 6.5.2 `PATCH /priority-matrix/items/{item_id}`
*   **Purpose:** Save skoring metrics for item.
*   **HTTP Method:** `PATCH`
*   **URL Path:** `/priority-matrix/items/{item_id}`
*   **Authentication Required:** Yes
*   **Path Parameters:** `item_id` (UUID, required)
*   **Request Body Validation:**
    *   `urgency`: Integer (required, 1-5)
    *   `seriousness`: Integer (required, 1-5)
    *   `growth`: Integer (required, 1-5)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Skor USG berhasil disimpan",
      "data": {
        "id": "d98ca1bc-78cb-4e91-ab02-f2b347fd02bc",
        "total_score": 13
      }
    }
    ```
*   **Business Rules:** Backend computes `total_score = urgency + seriousness + growth`.

---

#### 6.5.3 `GET /priority-matrix/results`
*   **Purpose:** Get ranked list sorted by total score descending.
*   **HTTP Method:** `GET`
*   **URL Path:** `/priority-matrix/results`
*   **Authentication Required:** Yes
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "rank": 1,
          "item_id": "d98ca1bc-78cb-4e91-ab02-f2b347fd02bc",
          "problem_text": "Jalan rusak di RT 01",
          "total_score": 13,
          "urgency": 5,
          "seriousness": 4,
          "growth": 4,
          "program_aligned": null
        }
      ]
    }
    ```

---

### 6.6 Dashboard Domain (`/dashboard`)

---

#### 6.6.1 `GET /dashboard/summary`
*   **Purpose:** Fetch total count KPIs.
*   **HTTP Method:** `GET`
*   **URL Path:** `/dashboard/summary`
*   **Authentication Required:** Yes
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "total_households": 120,
        "completed_surveys": 87,
        "gps_accuracy_rate": 97.7,
        "sticky_notes_count": 28,
        "pending_sync_count": 0
      }
    }
    ```

---

#### 6.6.2 `GET /dashboard/charts/progress`
*   **Purpose:** Fetch coverage progress metrics.
*   **HTTP Method:** `GET`
*   **URL Path:** `/dashboard/charts/progress`
*   **Authentication Required:** Yes
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        { "rt_number": "RT 01", "completed": 12, "total": 20, "percentage": 60 },
        { "rt_number": "RT 02", "completed": 8, "total": 20, "percentage": 40 }
      ]
    }
    ```

---

#### 6.6.3 `GET /dashboard/charts/problems`
*   **Purpose:** Fetch category counts distribution for charts.
*   **HTTP Method:** `GET`
*   **URL Path:** `/dashboard/charts/problems`
*   **Authentication Required:** Yes
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        { "category": "Infrastruktur", "count": 35 },
        { "category": "Kesehatan", "count": 22 }
      ]
    }
    ```

---

#### 6.6.4 `GET /dashboard/activities`
*   **Purpose:** Fetch last 10 audit history entries.
*   **HTTP Method:** `GET`
*   **URL Path:** `/dashboard/activities`
*   **Authentication Required:** Yes
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "a98ca1bc-78cb-4e91-ab02-f2b347fd02bc",
          "user_name": "Siti Nurhalimah",
          "action": "SURVEY_CREATED",
          "description": "menambahkan survei RT 01 - Rumah Tangga Bpk. Suparman",
          "created_at": "2026-07-14T07:33:00Z"
        }
      ]
    }
    ```

---

### 6.7 Report Domain (`/reports`)

---

#### 6.7.1 `GET /reports/excel`
*   **Purpose:** Compile and trigger file download of survey spreadsheet.
*   **HTTP Method:** `GET`
*   **URL Path:** `/reports/excel`
*   **Authentication Required:** Yes (Super Admin only)
*   **Success Response (200 OK - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet):** Binary Excel file response.

---

#### 6.7.2 `GET /reports/pdf`
*   **Purpose:** Generate formatted statistics report.
*   **HTTP Method:** `GET`
*   **URL Path:** `/reports/pdf`
*   **Authentication Required:** Yes (Super Admin only)
*   **Success Response (200 OK - application/pdf):** Binary PDF file response.

---

### 6.8 Google Domain (`/google`)

---

#### 6.8.1 `POST /google/drive/sync`
*   **Purpose:** Trigger drive sync proxy archive.
*   **HTTP Method:** `POST`
*   **URL Path:** `/google/drive/sync`
*   **Authentication Required:** Yes (Admin only)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Dokumen berhasil diarsipkan ke Google Drive",
      "data": {
        "synced_files": 4,
        "timestamp": "2026-07-14T07:33:00Z"
      }
    }
    ```

---

#### 6.8.2 `POST /google/calendar/events`
*   **Purpose:** Create milestone event in Google Calendar.
*   **HTTP Method:** `POST`
*   **URL Path:** `/google/calendar/events`
*   **Authentication Required:** Yes (Admin only)
*   **Request Body Validation:**
    *   `title`: String (required)
    *   `description`: String (optional)
    *   `start_date`: String (YYYY-MM-DD)
    *   `end_date`: String (YYYY-MM-DD)
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Milestone berhasil ditambahkan ke Google Calendar",
      "data": {
        "calendar_event_id": "google_event_id_123",
        "html_link": "https://calendar.google.com/event?..."
      }
    }
    ```

---

### 6.9 Notifications Domain (`/notifications`)

---

#### 6.9.1 `GET /notifications`
*   **Purpose:** Fetch in-app notifications.
*   **HTTP Method:** `GET`
*   **URL Path:** `/notifications`
*   **Authentication Required:** Yes
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "n98ca1bc-78cb-4e91-ab02-f2b347fd02bc",
          "title": "Tugas Baru",
          "message": "Anda ditugaskan ke: Perbaikan Jalan RT 01",
          "is_read": false,
          "created_at": "2026-07-14T07:33:00Z"
        }
      ]
    }
    ```

---

#### 6.9.2 `PATCH /notifications/{notif_id}/read`
*   **Purpose:** Mark notification as read.
*   **HTTP Method:** `PATCH`
*   **URL Path:** `/notifications/{notif_id}/read`
*   **Authentication Required:** Yes
*   **Path Parameters:** `notif_id` (UUID, required)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Notifikasi ditandai telah dibaca"
    }
    ```

---

### 6.10 Administration Domain (`/admin`)

---

#### 6.10.1 `GET /admin/users`
*   **Purpose:** Fetch all registered profiles.
*   **HTTP Method:** `GET`
*   **URL Path:** `/admin/users`
*   **Authentication Required:** Yes (Admin only)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "e304b77f-1d89-49bb-b146-24e5482390a8",
          "email": "rizki@uin.ac.id",
          "full_name": "Rizki Hambali",
          "role": "super_admin",
          "is_active": true
        }
      ]
    }
    ```

---

#### 6.10.2 `POST /admin/users`
*   **Purpose:** Admin-only surveyor registration.
*   **HTTP Method:** `POST`
*   **URL Path:** `/admin/users`
*   **Authentication Required:** Yes (Admin only)
*   **Request Body Validation:**
    *   `email`: String (required, valid email)
    *   `full_name`: String (required, 3-100 characters)
    *   `password`: String (required, min 8 characters)
*   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Akun anggota berhasil dibuat"
    }
    ```

---

#### 6.10.3 `PATCH /admin/users/{user_id}/suspend`
*   **Purpose:** Suspend / activate accounts.
*   **HTTP Method:** `PATCH`
*   **URL Path:** `/admin/users/{user_id}/suspend`
*   **Authentication Required:** Yes (Admin only)
*   **Path Parameters:** `user_id` (UUID, required)
*   **Request Body:**
    *   `is_active`: Boolean (required)
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Status keaktifan pengguna diperbarui"
    }
    ```

---

#### 6.10.4 `GET /admin/audit-logs`
*   **Purpose:** Query historical action changes records.
*   **HTTP Method:** `GET`
*   **URL Path:** `/admin/audit-logs`
*   **Authentication Required:** Yes (Admin only)
*   **Query Parameters:** `page`, `limit`, `q`.
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "metadata": {
        "total_count": 1054,
        "page": 1,
        "page_size": 20
      },
      "data": [
        {
          "id": "a98ca1bc-78cb-4e91-ab02-f2b347fd02bc",
          "user_name": "Rizki Hambali",
          "action": "SURVEY_EDITED",
          "entity_type": "household",
          "entity_id": "c108de4c-12bc-44fa-ba02-e2bc44fb02de",
          "metadata": {
            "changed_fields": {
              "kk_name": { "old": "Bpk. Supraman", "new": "Bpk. Suparman" }
            }
          },
          "created_at": "2026-07-14T07:33:00Z"
        }
      ]
    }
    ```

---

## 7. Security Standards

1.  **Auth Token Transport:** Bearer JWT in the `Authorization` header (`Authorization: Bearer <JWT_token>`) or the `sb-access-token` secure cookie.
2.  **CORS Policy:** Whitelists only the production domain `https://sisdamas-kkn56.vercel.app` and localhost during development. All other origin heads are rejected.
3.  **Rate Limiting:** Capped at 60 requests per minute per IP address for standard API routes. Auth endpoint `/auth/login` capped at 5 attempts per 15 minutes.
4.  **Upload Protection:** The photo upload endpoint checks the request payload size. Pays above 1MB are rejected before storage upload starts.

---

## 8. OpenAPI 3.1 Recommendations

To generate clean documentation for future developers:
*   Maintain the API specification under OpenAPI version **3.1.0**.
*   Utilize standard JSON schema references for validation schemas (Zod to JSON Schema).
*   Enforce security schemes naming bearer authentication:
    ```yaml
    securitySchemes:
      BearerAuth:
        type: http
        scheme: bearer
        bearerFormat: JWT
    ```
*   Include exact payloads examples in the schemas to speed up frontend development and simplify mock generation.

---

## 9. API Review & Self-Correction

### 9.1 Self-Correction Log
*   **Review Finding:** Storing full-sized camera files directly into database blobs is a high performance risk.
*   **Correction:** Storage routes return static URL paths after writing binary blobs to Supabase Storage. The API database payload only references URL strings.
*   **Review Finding:** Lack of batch syncing options would force surveyors to write loop POST calls on reconnect, risking rate limiting.
*   **Correction:** Created a batch sync endpoint `/surveys/sync` that processes arrays of surveys in a single request transaction.

---

*This API Specification is derived from `08_API_SPECIFICATION_PROMPT.md` and is fully subordinate to `00_PROJECT_FOUNDATION.md`, `02_SYSTEM_BLUEPRINT.md`, `03_PRD.md`, `04_UX_SPECIFICATION.md`, `05_TECHNICAL_SPECIFICATION.md`, `06_DATABASE_SPECIFICATION.md`, and `07_DATA_FLOW_SPECIFICATION.md`.*

---

**Would you like to revise this API Specification before we proceed to generate the Security Specification (`09_SECURITY_SPECIFICATION.md`)?**

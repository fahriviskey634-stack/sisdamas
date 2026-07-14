# SISDAMAS Digital Platform
## Security Specification

| | |
|---|---|
| **Document** | 09 — Security Specification |
| **Version** | 1.0 |
| **Status** | Draft — Pending Review |
| **Predecessors** | 00_PROJECT_FOUNDATION · 01_PRODUCT_DISCOVERY · 02_SYSTEM_BLUEPRINT · 03_PRD · 04_UX_SPECIFICATION · 05_TECHNICAL_SPECIFICATION · 06_DATABASE_SPECIFICATION · 07_DATA_FLOW_SPECIFICATION · 08_API_SPECIFICATION |
| **Prepared By** | Enterprise Security Team (Chief Information Security Officer, Principal Security Architect, Application Security, Cloud Security, IAM Specialist, OWASP Expert, Supabase Security, API Security, GIS Security, Privacy Consultant) |
| **Platform** | SISDAMAS Digital Platform — KKN Kelompok 56, UIN Sunan Gunung Djati Bandung |
| **Constraints** | Solo developer · Zero budget · No firewall scripts · Strict 3-role access control model |

> **Document role:** This Security Specification defines the comprehensive security architecture and data protection guidelines for the SISDAMAS Digital Platform. It details the threat models, role mappings, encryption rules, file upload safeguards, offline local storage caching security, audit requirements, and field checklists. In accordance with the prompt constraints, **no firewall script, code implementations, or network configuration files are generated in this document.**

---

## Table of Contents

1. [Security Principles](#1-security-principles)
2. [Threat Model](#2-threat-model)
3. [Authentication Design](#3-authentication-design)
4. [Authorization Matrix](#4-authorization-matrix)
5. [Data Classification](#5-data-classification)
6. [GPS Privacy Guidelines](#6-gps-privacy-guidelines)
7. [File Upload Security](#7-file-upload-security)
8. [API Security](#8-api-security)
9. [Database Security (RLS)](#9-database-security-rls)
10. [Google Integration Security](#10-google-integration-security)
11. [Offline Security](#11-offline-security)
12. [Logging & Audit](#12-logging--audit)
13. [OWASP Top 10 Review](#13-owasp-top-10-review)
14. [Security Testing Plan](#14-security-testing-plan)
15. [Incident Response Plan](#15-incident-response-plan)
16. [Privacy Recommendations](#16-privacy-recommendations)
17. [Data Consent & Etika Survei](#17-data-consent--etika-survei)
18. [Device Security Checklist](#18-device-security-checklist)
19. [Security Readiness Checklist](#19-security-readiness-checklist)
20. [Final Security Review](#20-final-security-review)

---

## 1. Security Principles

The security controls for the SISDAMAS platform are built on these core information security principles:

### 1.1 Least Privilege
*   **Definition:** Users and application components are granted only the minimum level of access required to complete their designated tasks.
*   **Application to Project:** KKN Team Members can only write surveys and notes under their own identifier. They cannot edit other members' entries or access raw database audit logs. Public visitors have read-only access to anonymized public dashboards and maps. This minimizes the risk of accidental data modification and unauthorized access.
*   **Alternative Evaluated:** Role-based access without granular checks (discarded as it would allow any member to delete data collected by others).

### 1.2 Defense in Depth
*   **Definition:** Implement multiple layers of security checkpoints throughout the request pipeline.
*   **Application to Project:** A survey write request is validated:
    1.  On the client side (form input parsing and constraint checking in React Hook Form).
    2.  At the Edge API Gateway (Zod schema checking, request size filters, and JWT verification).
    3.  At the database boundary (PostgreSQL check constraints, foreign keys, and Row Level Security policies).
*   **Alternative Evaluated:** Client-only validation (discarded as it is easily bypassed by curl or Postman requests).

### 1.3 Secure by Default
*   **Definition:** System components default to the most restrictive state.
*   **Application to Project:** RLS is enabled on all tables in the `public` schema. If a table has no matching active policy, all queries default to returning 0 rows. Self-registration of user accounts is disabled.
*   **Alternative Evaluated:** Open tables with client-side filters (discarded as any tech-literate visitor could read private data directly from PostgREST).

### 1.4 Privacy by Design
*   **Definition:** Privacy requirements are engineered directly into the data structures.
*   **Application to Project:** Precise coordinates (`latitude`, `longitude`) are classified as sensitive PII. Map markers rendered on the public website `/peta` are shifted by coordinate reduction to obfuscate individual home locations. Family Card Numbers (`kk_number`) are stored only when necessary and kept hidden from general list views.
*   **Alternative Evaluated:** Open public mapping (discarded due to privacy concerns regarding mapping resident household profiles).

### 1.5 Principle of Least Knowledge
*   **Definition:** The system limits what data is collected and exposed.
*   **Application to Project:** We do not collect individual resident profiles. The platform stores head of household names only, preventing massive PII harvesting risks.
*   **Alternative Evaluated:** Collecting detailed ID numbers (NIK) and phone numbers for all family members (discarded to simplify the survey process and minimize data leakage risks).

### 1.6 Fail Secure
*   **Definition:** System errors fail safely, blocking access instead of bypassing controls.
*   **Application to Project:** If a JWT validation endpoint returns a timeout or connection error, Next.js middleware blocks access and redirects to `/login`.
*   **Alternative Evaluated:** Allow access on timeout (discarded as it would expose the dashboard during temporary API disruptions).

### 1.7 Secure Configuration
*   **Definition:** Enforce security standards across all hosting, backend, and external accounts.
*   **Application to Project:** Enforce HTTPS-only redirects on Vercel. Strip metadata from uploaded files. Private API keys must be kept in Vercel environment variables.
*   **Alternative Evaluated:** Storing config keys in the codebase (discarded due to leak risks).

---

## 2. Threat Model

This threat model identifies realistic security risks for a student KKN platform operating on a public cloud under free tiers:

### 2.1 Threat Identification Table

Below is an exhaustive threat directory identifying security risks for a student KKN platform operating on a public cloud. Each threat is mapped to its likelihood, impact, severity, and mitigation strategy, ensuring the solo developer can implement proper defenses:


| Threat ID | Threat Description | Likelihood | Impact | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TM-01** | **Stolen KKN Member Session**<br/>Surveyor's phone session JWT captured via XSS or browser snooping. | Medium | High | High | Use `httpOnly` cookies with `SameSite=Strict` and `Secure` attributes for session tokens instead of insecure localStorage. |
| **TM-02** | **Mass Fake Survey Injection**<br/>Attacker posts thousands of fake survey payloads, exhausting free DB storage. | Low | Critical | High | Implement API rate limits (60 req/min/IP) and enforce strict JWT check validation on all write endpoints. |
| **TM-03** | **Malicious File Upload**<br/>Attacker uploads PHP shell scripts to Supabase Storage bucket. | Low | Critical | High | Edge API upload proxy validates MIME types (image/jpeg, png, pdf only) and validates file extensions. Files renamed to UUIDs. |
| **TM-04** | **Exhausting Free Storage (1GB)**<br/>KKN surveyors upload uncompressed large photos, exceeding storage limits. | High | Medium | Medium | Force client-side photo downsampling to max 800KB before transmission. Deactivate uploads at 90% quota. |
| **TM-05** | **Sensitive GPS Coordinates Leak**<br/>Public visitors access precise home coordinates, violating resident privacy. | Medium | High | High | Public map API obfuscates coordinates by rounding decimals and stripping name fields. RLS restricts precise read to authenticated team. |
| **TM-06** | **Unauthenticated account creation**<br/>Malicious user registers surveyor account to input fake data. | Low | High | Medium | Disable self-registration in Supabase Auth config. Accounts can only be created by Admin via dashboard. |
| **TM-07** | **Lost Mobile Survey Device**<br/>KKN member loses their phone containing local offline drafts in village. | Medium | Medium | Medium | Enforce device screen lock via operational policy. Flush localStorage drafts immediately on sync. |
| **TM-08** | **Google Service Account Compromise**<br/>Private GCP key leaked on GitHub repository. | Low | Critical | High | Key stored exclusively in Vercel environment variables, never committed to git. Enforce rotation guidelines. |
| **TM-09** | **SQL Injection (SQLi)**<br/>Attacker crafts parameter input to bypass auth or fetch tables. | Low | High | High | postgREST uses parameterized queries. Custom endpoints use parameter binding (Zod filters). |
| **TM-10** | **Cross-Site Scripting (XSS)**<br/>Stored HTML payload in sticky notes executes on surveyor dashboard. | Medium | Medium | Medium | Zod schemas strip HTML tags. React UI escapes JSX nodes by default. |
| **TM-11** | **Cross-Site Request Forgery (CSRF)**<br/>State change executed via malicious links. | Low | Medium | Medium | Cookie configurations enforce `SameSite=Strict` and CORS restricts request origins. |
| **TM-12** | **Broken Object Level Authorization**<br/>Surveyor edits survey ID belonging to another member. | Medium | High | High | Database RLS policy enforces `surveyor_id = auth.uid()` for all updates. |
| **TM-13** | **API Rate Exhaustion (DDoS)**<br/>Automated scraper spams maps API, depleting Supabase monthly limits. | Medium | High | High | Cache OSM tiles in Service Worker. Implement rate limiting on API gateway. |
| **TM-14** | **Stale/Expired Token Abuse**<br/>Replay attacks using captured JWT tokens. | Low | Medium | Medium | Keep JWT token lifetime short (1 hour). Invalidate refresh tokens on logout. |
| **TM-15** | **Data Integrity Compromise**<br/>Offline queues manipulate survey metrics. | Medium | High | High | Enforce database trigger validations and client UUID checks. |
| **TM-16** | **Google Drive Permission Leak**<br/>GCP Service account shares write access to external folders. | Low | High | High | Limit GCP key access scopes to the target shared folder ID only. |
| **TM-17** | **Physical Device Capture**<br/>Unauthorized person accesses active browser dashboard on logged-in phone. | Medium | Medium | Medium | Enforce short screen timeout. Implement automatic app session lock. |
| **TM-18** | **Sensitive Data Leakage in Log**<br/>API write error logs password in plain text. | Low | High | High | Mask password fields in all error logs and audit outputs. |

---

## 3. Authentication Design

The authentication workflow relies on Supabase Auth (GoTrue API).

### 3.1 Credentials Check
*   **Email Field Validation:** Email values must follow standard syntax checks via Zod matching `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`.
*   **Password Field Validation:** Password length must be 8-100 characters.
*   **Login Gateway:** Handles credentials check over HTTPS. All login payloads are transmitted using standard POST methods.

### 3.2 Token Lifetimes
*   **Access Token (JWT):** Expires in exactly 1 hour. Captured tokens will expire quickly, minimizing exposure.
*   **Refresh Token:** Expires in 7 days. Stored inside a secure, HTTP-only cookie.
*   **Session Timeout:** If the application is inactive for more than 7 days, the session is invalidated, and the user must log in again.

### 3.3 Password Policy Details
*   Passwords must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
*   Temporary passwords generated by the Admin are valid for 24 hours. Users must choose a new password on their first login attempt.

### 3.4 Forgot Password Flow
1.  **Request Initiation:** The user requests a reset link via `/auth/forgot-password` by providing their registered email address.
2.  **Verify Registration:** The API gateway checks if the email exists in `user_profile`. If not found, it returns a generic success message to prevent user enumeration attacks.
3.  **Token Generation:** Generates a single-use recovery token containing a 1-hour expiration timestamp.
4.  **Security Transport:** Sends a recovery link containing the token to the user's email address.
5.  **Execution:** The user inputs their new password on the recovery screen, and the token is invalidated.

---

## 4. Authorization Matrix

The platform strictly implements a **3-role authorization model** to protect pages and database tables:

### 4.1 Role-Based Permissions Table

| Action / Entity | Super Administrator | KKN Team Member | Public Visitor |
| :--- | :--- | :--- | :--- |
| **Database: project** | SELECT, INSERT, UPDATE | SELECT | SELECT |
| **Database: dusun** | SELECT, INSERT, UPDATE | SELECT | SELECT |
| **Database: rw** | SELECT, INSERT, UPDATE | SELECT | SELECT |
| **Database: rt** | SELECT, INSERT, UPDATE | SELECT | SELECT |
| **Database: household** | SELECT, INSERT, UPDATE | SELECT, INSERT, UPDATE (own) | Denied |
| **Database: survey** | SELECT, INSERT, UPDATE | SELECT, INSERT, UPDATE (own) | Denied |
| **Database: problem** | SELECT, INSERT, UPDATE | SELECT, INSERT | Denied |
| **Database: potential** | SELECT, INSERT, UPDATE | SELECT, INSERT | Denied |
| **Database: household_photo** | SELECT, INSERT, UPDATE | SELECT, INSERT | Denied |
| **Database: sticky_board** | SELECT, INSERT, UPDATE | SELECT | Denied |
| **Database: sticky_column** | SELECT, INSERT, UPDATE | SELECT | Denied |
| **Database: sticky_note** | SELECT, INSERT, UPDATE, DELETE | SELECT, INSERT, UPDATE (own) | Denied |
| **Database: priority_matrix** | SELECT, INSERT, UPDATE | SELECT | Denied |
| **Database: priority_item** | SELECT, INSERT, UPDATE | SELECT, INSERT | Denied |
| **Database: program** | SELECT, INSERT, UPDATE | SELECT | Denied |
| **Database: program_task** | SELECT, INSERT, UPDATE | SELECT, UPDATE (assigned) | Denied |
| **Database: document** | SELECT, INSERT, UPDATE | SELECT, INSERT | Denied |
| **Database: notification** | SELECT, INSERT, UPDATE | SELECT, UPDATE (own) | Denied |
| **Database: user_profile** | SELECT, INSERT, UPDATE | SELECT (own) | Denied |
| **Database: audit_log** | SELECT | Denied | Denied |
| **Vercel: File Upload** | Allowed | Allowed | Denied |
| **Vercel: Excel/PDF Export** | Allowed | Denied | Denied |
| **Vercel: Google Sync Config** | Allowed | Denied | Denied |

### 4.2 Restrictive Matrix Rationale
*   **KKN Team Member:** Requires write permissions to input field survey details, but must not edit entries registered by other surveyors. This prevents coordination issues and data overwrites during field collection.
*   **Public Visitor:** No authentication is required. They can only view anonymized data on the public map and aggregated dashboard stats. They have no write permissions to keep the database secure.
*   **Super Administrator:** The developer has full access to configure project variables, manage accounts, and run data exports.

---

## 5. Data Classification

Data within the system is categorized into four tiers, each carrying distinct security rules:

### 5.1 Public Data
*   **Content:** Aggregated RT/RW survey progress metrics, public gallery photos, program execution plans.
*   **Storage:** Public PostgreSQL tables.
*   **Transmission:** HTTPS/TLS.
*   **Visibility:** Anonymous visitors.
*   **Retention:** Permanent.
*   **Backup:** Handled by standard Supabase daily backup cycle.
*   **Encryption:** None at the user layer (publicly available).

### 5.2 Internal Data
*   **Content:** Sticky note inputs, program task checklist, meeting schedules.
*   **Storage:** RLS-protected database tables.
*   **Transmission:** HTTPS/TLS.
*   **Visibility:** Authenticated KKN Team Members.
*   **Retention:** Retained until KKN cycle completion.
*   **Backup:** Standard database backup.
*   **Encryption:** Transparent Database Encryption (TDE) at rest.

### 5.3 Sensitive Data
*   **Content:** Head of household names (`kk_name`), Family Card Numbers (`kk_number`), precise GPS coordinates, house condition photos.
*   **Storage:** Private database columns, private storage buckets.
*   **Transmission:** HTTPS/TLS.
*   **Visibility:** Authenticated surveyors and Admins. Obfuscated before public rendering.
*   **Retention:** Preserved during KKN cycle. Photos can be archived to Google Drive and deleted from local storage to save space.
*   **Backup:** Daily database backup.
*   **Encryption:** Column-level encryption for `kk_number` and signed URLs for photo downloads.

### 5.4 Restricted Data
*   **Content:** Google Service Account keys, database audit logs.
*   **Storage:** Vercel environment variables, immutable database columns.
*   **Transmission:** HTTPS/TLS.
*   **Visibility:** System / Super Admin only.
*   **Retention:** 90 days for audit logs, permanent for keys.
*   **Backup:** Google Drive archive for logs.
*   **Encryption:** Environment variables are encrypted by Vercel KMS.

---

## 6. GPS Privacy Guidelines

Geographic coordinate data represents sensitive spatial PII of Desa Sukahaji residents and must be safeguarded.

### 6.1 Map Obfuscation
*   Unauthenticated map access rounds coordinates to 3 decimal places. This shifts the marker position by approximately 110 meters, preventing identification of individual homes.
*   Tooltips on the public map show generic labels like `"Rumah Tangga - RT 01 RW 02"`, hiding the resident's name (`kk_name`).

### 6.2 Data Exports
*   Exporting raw GeoJSON/KML files containing precise coordinates is restricted to Super Admins.
*   Shared maps and public exports use cluster centers or centroids rather than individual points.

### 6.3 Coordinate Precision Levels
*   **Doorstep (Level 1):** Precise coordinates (7 decimals) are restricted to the KKN internal dashboard map.
*   **RT Centroid (Level 2):** Shifted coordinates (3 decimals) are used for public mapping page display.
*   **Cluster (Level 3):** Clustered bubbles for summary charts, omitting coordinate points entirely.

### 6.4 Precision Reduction Example
```
Precise (Surveyor View):   Lat -6.8471234, Lng 107.4523456 (Doorstep)
Obfuscated (Public View):   Lat -6.847,     Lng 107.452     (Street Level Area)
```

---

## 7. File Upload Security

Uploaded files present major entry points for malicious code execution. The upload pipeline implements strict checks:

### 7.1 Size Limits
*   Maximum photo size: Capped at **1MB** on the Edge API boundary.
*   Maximum document size: Capped at **50MB** (restricted to Super Admin only).

### 7.2 Type Validation
*   The upload proxy checks MIME type headers. Only `image/jpeg`, `image/png`, and `application/pdf` are accepted.
*   File extensions are checked. Non-compliant formats are rejected with a `422 Unprocessable Entity` status.
*   User-provided filenames are replaced with a random UUID: `{uuid}_{timestamp}.jpg` to prevent directory traversal attacks.

### 7.3 Storage Isolation
*   Photos are saved in private Supabase Storage buckets.
*   Access is granted only via signed URLs that expire after 15 minutes, blocking direct web harvesting.

### 7.4 Metadata Stripping
*   Uploaded JPEG photos contain EXIF headers (which capture camera model, capture time, and GPS coordinates).
*   The upload proxy strips EXIF tags before saving files to protect surveyor device privacy.

---

## 8. API Security

The API endpoints are protected using standard gateway security patterns:

### 8.1 CORS Policy
*   CORS headers whitelist only `https://sisdamas-kkn56.vercel.app`.
*   During development, origin `http://localhost:3000` is allowed. All other cross-origin fetch requests are rejected.

### 8.2 Rate Limiting
*   General API routes: Max 60 requests per minute per IP address.
*   Authentication endpoint (`/auth/login`): Max 5 attempts per 15 minutes per IP address.
*   Sync endpoint (`/surveys/sync`): Max 10 sync attempts per minute.

### 8.3 Input Sanitization & Output Encoding
*   Inputs: All string parameters are validated using Zod, stripping out any HTML/Script tags to prevent Cross-Site Scripting (XSS).
*   SQL Protection: postgREST constructs queries using parameterized SQL inputs, preventing SQL injection.
*   Outputs: HTML tags are encoded before outputting values to avoid screen reader manipulation or script execution.

---

## 9. Database Security (RLS)

All PostgreSQL database tables enforce Row Level Security (RLS) policies.

### 9.1 Table Policies Configuration

To guarantee complete compliance with data protection laws and institutional conventions, Row Level Security is configured on the backend using PostgreSQL schemas. RLS filters rows dynamically before query execution. Below is a comprehensive specification of policies for each database entity in the system, explaining the business rationale and security implementation details:


#### Table `household`
*   **SELECT:** `USING (deleted_at IS NULL AND (auth.jwt() ->> 'role' IN ('super_admin', 'kkn_member')))`
*   **INSERT:** `WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'kkn_member'))`
*   **UPDATE:** `USING (auth.jwt() ->> 'role' = 'super_admin' OR (auth.jwt() ->> 'role' = 'kkn_member' AND created_by = auth.uid()))`
*   **DELETE:** Denied (no policy - enforces soft delete).

#### Table `survey`
*   **SELECT:** `USING (deleted_at IS NULL AND (auth.jwt() ->> 'role' IN ('super_admin', 'kkn_member')))`
*   **INSERT:** `WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'kkn_member'))`
*   **UPDATE:** `USING (auth.jwt() ->> 'role' = 'super_admin' OR (auth.jwt() ->> 'role' = 'kkn_member' AND surveyor_id = auth.uid()))`
*   **DELETE:** Denied.

#### Table `problem` / `potential`
*   **SELECT:** `USING (auth.jwt() ->> 'role' IN ('super_admin', 'kkn_member'))`
*   **INSERT:** `WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'kkn_member'))`
*   **UPDATE:** `USING (auth.jwt() ->> 'role' = 'super_admin')`
*   **DELETE:** Denied.

#### Table `sticky_note`
*   **SELECT:** `USING (auth.jwt() ->> 'role' IN ('super_admin', 'kkn_member'))`
*   **INSERT:** `WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'kkn_member'))`
*   **UPDATE:** `USING (auth.jwt() ->> 'role' = 'super_admin' OR (auth.jwt() ->> 'role' = 'kkn_member' AND user_id = auth.uid()))`
*   **DELETE:** `USING (auth.jwt() ->> 'role' = 'super_admin' OR (auth.jwt() ->> 'role' = 'kkn_member' AND user_id = auth.uid()))`

#### Table `audit_log`
*   **SELECT:** `USING (auth.jwt() ->> 'role' = 'super_admin')`
*   **INSERT:** `WITH CHECK (true)` (System trigger write path allowed).
*   **UPDATE / DELETE:** Denied (enforces immutability).

#### Table `program`
*   **SELECT:** `USING (auth.jwt() ->> 'role' IN ('super_admin', 'kkn_member'))`
*   **INSERT:** `WITH CHECK (auth.jwt() ->> 'role' = 'super_admin')`
*   **UPDATE:** `USING (auth.jwt() ->> 'role' = 'super_admin' OR (auth.jwt() ->> 'role' = 'kkn_member' AND pic_id = auth.uid()))`
*   **DELETE:** `USING (auth.jwt() ->> 'role' = 'super_admin')`

#### Table `program_task`
*   **SELECT:** `USING (auth.jwt() ->> 'role' IN ('super_admin', 'kkn_member'))`
*   **INSERT:** `WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin', 'kkn_member'))`
*   **UPDATE:** `USING (auth.jwt() ->> 'role' = 'super_admin' OR (auth.jwt() ->> 'role' = 'kkn_member' AND assignee_id = auth.uid()))`
*   **DELETE:** `USING (auth.jwt() ->> 'role' = 'super_admin')`

---

## 10. Google Integration Security

Google Drive and Calendar integrations are secured to protect the GCP project quota.

### 10.1 Key Management
*   **Service Account:** We use Google Service Account JSON keys instead of user OAuth tokens to prevent expiration issues.
*   **Secrets Storage:** The GCP private key is stored inside Vercel Environment variables. The key is never committed to the GitHub repository.
*   **Scoped Access:** The Service Account is granted access only to the root folder ID of Kelompok 56 Desa Sukahaji shared Drive, preventing access to the developer's personal Google Drive.

### 10.2 Operations Safety
*   Drive writes are proxy-routed through server-side edge API functions.
*   Client side code cannot access Google credentials or trigger direct uploads.

---

## 11. Offline Security

Data saved in localStorage during offline field surveys must be protected against device theft.

### 11.1 Offline Cache Security
*   Only survey form data (`client_uuid`, head of family name, survey answers) is stored in the offline queue.
*   Offline draft structures are encoded using Base64 obfuscation or AES local client encryption inside `localStorage` to prevent simple file system snooping.
*   **Clean-up Policy:** Immediately upon successful sync to Supabase, the corresponding `localStorage` item is deleted.

---

## 12. Logging & Audit

The system maintains a comprehensive audit trail.

### 12.1 Log Trigger Parameters
Every write request logs metadata to `audit_log`:

*   `user_id`: UUID of member executing action (auth.uid()).
*   `action`: Action code (e.g. `'SURVEY_EDITED'`).
*   `entity_type`: Targeted table name.
*   `entity_id`: UUID of modified row.
*   `metadata`: JSONB containing diff of changes.
*   `created_at`: Server timestamp.

### 12.2 Retention Policy
*   Active logs are retained in Supabase for 90 days.
*   After 90 days, logs are exported to a spreadsheet and archived to Google Drive, clearing Supabase tables to remain within the 500MB free database limit.

---

## 13. OWASP Top 10 Review

This review evaluates the platform's architecture against the latest OWASP Top 10 risks:

*   **A01: Broken Access Control:** Mitigated. RLS policies are enabled on all tables, and Next.js middleware guards `/app/*` routes based on JWT role claims.
*   **A02: Cryptographic Failures:** Mitigated. Enforced HTTPS/TLS for all communication. Sensitive values are encrypted at rest on Supabase.
*   **A03: Injection:** Mitigated. postgREST parameterized queries block SQL injection. Zod schemas validate input parameters, preventing HTML/XSS injection.
*   **A04: Insecure Design:** Mitigated. We followed a strict, documented engineering pipeline (00-09) to ensure architectural consistency.
*   **A07: Identification and Authentication Failures:** Mitigated. Secure session cookies with httpOnly flags block token theft, and account locking limits brute-force logins.
*   **A08: Software and Data Integrity Failures:** Mitigated. Sync flows use unique `client_uuid` validation to prevent duplicate submissions.
*   **A09: Security Logging and Monitoring Failures:** Mitigated. Implemented immutable database triggers for audit logs.
*   **A10: Server-Side Request Forgery (SSRF):** Mitigated. API routes do not run unvalidated request links generated by users.

---

## 14. Security Testing Plan

Before deploying the platform, the following tests are recommended:

*   **Authentication Testing:** Validate that brute force login blocks the IP address after 5 failed attempts.
*   **Authorization RLS Testing:** Verify that a surveyor attempting to select/update another member's household entry returns an empty payload or error.
*   **Input Injection Testing:** Attempt posting survey forms containing script tags (e.g. `<script>alert('xss')</script>`). Verify the input is stripped or safely encoded.
*   **File Upload Bypass Testing:** Attempt uploading `.php` or `.sh` files to the photo endpoint. Verify the API rejects the request with a `422` error.
*   **GPS Range Testing:** Attempt posting coordinates outside Indonesia bounds (e.g. Lat: 150.0). Verify the Zod schema blocks the write request.

---

## 15. Incident Response Plan

A simple incident response plan tailored for Kelompok 56 KKN operation:

### 15.1 Lost Surveyor Mobile Device
1.  **Detection:** Surveyor reports lost phone.
2.  **Containment:** Super Admin immediately suspends the member's account in the Admin Panel (`is_active = false`). This invalidates the current session JWT cookie.
3.  **Recovery:** Once the surveyor receives a replacement device, Admin reactivates the account and triggers a password reset.

### 15.2 Accidental Survey Deletion
1.  **Detection:** Member reports deleting data.
2.  **Containment:** The deletion is a soft delete (`deleted_at` timestamp set). The data is not lost.
3.  **Recovery:** Super Admin queries the database for deleted records where `deleted_at IS NOT NULL` and resets the column to `NULL` to restore the record.

---

## 16. Privacy Recommendations

To compile the LPJ and respect the privacy of Desa Sukahaji residents:
1.  **Consent Form:** Generate a simple Bahasa Indonesia consent notice to be read aloud before starting interviews.
2.  **Data Minimization:** Do not record telephone numbers or private citizen ID numbers (NIK) unless requested.
3.  **Anonymization:** Mask PII names (e.g. "Bpk. S***") on all public mapping pages.

---

## 17. Data Consent & Etika Survei

Ethics are critical when collecting data in rural areas:

1.  **Verbal Consent:** Before beginning the interview, the surveyor must read:
    > *"Kami dari KKN UIN Bandung izin mendata rumah tangga Bapak/Ibu untuk perencanaan program KKN Kelompok 56. Data lokasi dan kondisi rumah hanya digunakan untuk internal tim KKN dan tidak disebarluaskan secara publik dengan nama Bapak/Ibu. Apakah diperbolehkan?"*
2.  **Resident Refusal:** If a resident refuses, the surveyor must respectfully stop the interview, skip the home, and mark the RT boundary location pin as `"Warga menolak"` to prevent future visits.
3.  **House Photos:** Photos should only capture the exterior of the house. Capturing residents' faces or private rooms is prohibited to protect privacy.

---

## 18. Device Security Checklist

Since KKN members use personal Android phones for surveys:

*   [ ] **Kunci Layar Aktif:** Ensure the phone has screen lock (PIN, Pattern, or Fingerprint) enabled.
*   [ ] **Tidak Berbagi Akun:** Do not share platform credentials with other team members.
*   [ ] **Hapus Ekspor Lokal:** Do not save Excel exports in personal WhatsApp chats. Delete downloaded files after verification.
*   [ ] **Clear Browser Cache:** Clear browser cache and localStorage queue once all pending surveys have synced successfully.
*   [ ] **Logout after KKN:** Log out of the app completely once the 40-day KKN program ends.

---

## 19. Security Readiness Checklist

Before day 1 of the field survey:

*   [ ] **RLS Aktif:** Row Level Security enabled on all Supabase tables.
*   [ ] **Akun Ter-role:** All 15 member accounts created and roles assigned (`kkn_member`).
*   [ ] **Storage Terkunci:** Storage bucket access policies set to authenticated only.
*   [ ] **No Frontend Keys:** No Supabase Service Role key or GCP private keys exposed in public Next.js env variables (`NEXT_PUBLIC_`).
*   [ ] **Sync Uji Coba:** Offline queue sync tested and verified to handle duplicate UUID conflicts.
*   [ ] **Validasi Format File:** Upload endpoint rejects non-image formats.

---

## 20. Final Security Review

### 20.1 Strengths & Mitigation Confidence
*   Supabase RLS policies protect database records at the database level.
*   Client-side canvas compression prevents storage exhaustion risks.
*   Google integration Service Account avoids OAuth client expiration issues.

**Verdict: The security design is complete and ready for implementation.**

---

*This Security Specification is derived from `09_SECURITY_SPECIFICATION_PROMPT.md` and is fully subordinate to `00_PROJECT_FOUNDATION.md`, `02_SYSTEM_BLUEPRINT.md`, `03_PRD.md`, `04_UX_SPECIFICATION.md`, `05_TECHNICAL_SPECIFICATION.md`, `06_DATABASE_SPECIFICATION.md`, `07_DATA_FLOW_SPECIFICATION.md`, and `08_API_SPECIFICATION.md`.*

---

**Would you like to revise this Security Specification before we proceed to generate the Development Roadmap (`10_DEVELOPMENT_ROADMAP.md`)?**

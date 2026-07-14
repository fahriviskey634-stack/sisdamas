# SISDAMAS Digital Platform
## Quality Assurance & Testing Plan

| | |
|---|---|
| **Document** | 12 — Test Plan |
| **Version** | 1.0 |
| **Status** | Draft — Pending Review |
| **Predecessors** | 00_PROJECT_FOUNDATION s.d. 11_ARCHITECTURE_DECISION_RECORDS |
| **Prepared By** | Quality Assurance Team (Principal QA Engineer, Test Architect, GIS QA, Mobile/PWA Specialist, Backend QA, Frontend QA, Security Tester, Performance Tester, UAT Coordinator) |
| **Platform** | SISDAMAS Digital Platform — KKN Kelompok 56, UIN Sunan Gunung Djati Bandung |
| **Operational Windows** | 40-day KKN window (8-day critical field window starting Day 1) |
| **Constraints** | Solo developer · Zero budget · No Cypress/Playwright scripts in spec · Strict MVP alignment |

> **Document role:** This Test Plan defines the comprehensive quality assurance strategy, test levels, specific test scenarios, mobile device matrices, performance targets, and field readiness checklists for the SISDAMAS Digital Platform. It ensures the platform functions reliably under the unstable network and power constraints of Desa Sukahaji. In accordance with the prompt constraints, **no automated test script code (Playwright, Cypress, Vitest, Jest, etc.) is generated in this document.**

---

## Table of Contents

1. [Testing Principles & Philosophy](#1-testing-principles--philosophy)
2. [Test Strategy](#2-test-strategy)
3. [Test Levels](#3-test-levels)
4. [Functional Test Cases](#4-functional-test-cases)
5. [GIS Test Cases](#5-gis-test-cases)
6. [Offline Sync Test Cases](#6-offline-sync-test-cases)
7. [Mobile Test Cases](#7-mobile-test-cases)
8. [Performance Test Cases](#8-performance-test-cases)
9. [Security Test Cases](#9-security-test-cases)
10. [Usability Test Cases](#10-usability-test-cases)
11. [Data Validation Testing](#11-data-validation-testing)
12. [Error Handling Testing](#12-error-handling-testing)
13. [Browser & Device Compatibility](#13-browser--device-compatibility)
14. [Test Data Management](#14-test-data-management)
15. [Defect Management Process](#15-defect-management-process)
16. [Test Automation Recommendations](#16-test-automation-recommendations)
17. [Field Testing Plan](#17-field-testing-plan)
18. [Real Field Simulation Scenarios](#18-real-field-simulation-scenarios)
19. [Go / No-Go Checklist & Quality Gate](#19-go--no-go-checklist--quality-gate)
20. [Final QA Review](#20-final-qa-review)

---

## 1. Testing Principles & Philosophy

The QA strategy is built on the following testing principles:

### 1.1 Risk-Based Testing
*   **Philosophy:** Testing resources are focused on the areas with the highest probability of failure and the greatest impact on KKN field operations.
*   **Application:** The survey creation wizard, GPS capture geolocation, and offline `localStorage` sync pipeline represent the highest risk elements. They receive maximum testing coverage, whereas the project static pages are checked via simple smoke verification.

### 1.2 Shift Left Testing
*   **Philosophy:** Quality checks are integrated as early as possible in the lifecycle, before code is merged.
*   **Application:** Zod schema validators are tested in isolation using mock inputs before integrating them into Next.js routes, preventing database RLS syntax errors.

### 1.3 Continuous Testing
*   **Philosophy:** Code is deployed and tested continuously.
*   **Application:** Vercel staging preview builds are verified on actual test mobile devices immediately upon merge requests.

### 1.4 Regression Prevention
*   **Philosophy:** New changes must not break previously verified core modules.
*   **Application:** Any changes to database triggers or schema require re-running the entire suite of manual login and survey creation tests.

### 1.5 Test Pyramid
*   **Philosophy:** Maintain a solid base of unit validation tests, a middle layer of API integration tests, and a small layer of manual E2E checks.
*   **Application:** Zod parsing rules act as unit checks; API sync mocks act as integration checks; manual browser runs represent E2E checks.

### 1.6 User-Centered Validation
*   **Philosophy:** Interfaces are validated by actual target users.
*   **Application:** Onboarding sessions ask KKN surveyors to run mockup inputs, checking if the fields are intuitive.

### 1.7 Field Reliability
*   **Philosophy:** The application must survive hostile environments.
*   **Application:** Tests must simulate weak cellular signal, battery levels below 20%, and coordinates accurate to only ±15 meters.

---

## 2. Test Strategy

The overall testing strategy defines the boundaries and requirements for verifying the system:

*   **Objectives:** Verify that all Must-Have core features (Auth, Sticky Notes Board, Survey Form, Offline Geolocation, Map) function reliably.
*   **Scope:** Next.js pages, API Edge routes, Supabase Database triggers, Storage Buckets, and Google Drive Sync proxies.
*   **Approach:** Combination of developer unit checks (Vitest schema runs), API postgREST route checks, and manual device testing in simulated field conditions.
*   **Test Environment:**
    *   *Staging:* Vercel preview environments connected to a dedicated Supabase `staging` database.
    *   *Production:* Deployed app connected to the live Supabase database.
*   **Entry Criteria:** Source code builds without TypeScript compilation errors, database schemas are fully migrated, and test data seed scripts have run.
*   **Exit Criteria:** 100% of Must-Have test cases passed, 0 critical or high bugs remaining in the defect tracker.
*   **Success Criteria:** 15 surveyors successfully log in, capture survey details, compress photos, save drafts offline, and sync upon signal recovery.
*   **Assumptions:** surveyors use Android devices (minimum Android OS 10) and standard browsers.
*   **Constraints:** No budget for commercial cloud testing services (e.g. BrowserStack). Testing is performed manually by KKN students on their personal devices.

---

## 3. Test Levels

The system is validated across these specific test levels:

### 3.1 Unit Testing
*   **Purpose:** Verify helper functions, Zod schema validations, coordinate rounding utilities, and mathematical algorithms in isolation.

### 3.2 Integration Testing
*   **Purpose:** Verify data transmission between components (e.g., API proxy to Google Drive, Supabase Storage uploads, database trigger logic).

### 3.3 System Testing
*   **Purpose:** Verify the complete end-to-end functionality of the platform on unified test environments.

### 3.4 End-to-End Testing
*   **Purpose:** Simulate complete user journeys (e.g., log in, start survey, walk RT boundaries, take photos, submit data, check maps).

### 3.5 User Acceptance Testing (UAT)
*   **Purpose:** Ensure village officials and surveyors find the dashboard metrics and planning interfaces intuitive.

### 3.6 Regression Testing
*   **Purpose:** Run a quick baseline checklist before production releases to ensure new features haven't broken core auth or GIS layers.

### 3.7 Smoke Testing
*   **Purpose:** Perform a 2-minute test after each Vercel deployment to verify page loads.

### 3.8 Sanity Testing
*   **Purpose:** Quick verification targeting a specific bug fix.

### 3.9 Accessibility Testing
*   **Purpose:** Verify text readability under direct sunlight and ensure touch targets are at least 48x48px.

### 3.10 Compatibility Testing
*   **Purpose:** Verify layout rendering on mobile Chrome, Edge, and iOS Safari.

---

## 4. Functional Test Cases

Below is the detailed registry of functional test scenarios:

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Priority | Severity | Test Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FT-01** | Auth | Login with valid credentials | User profile exists | 1. Navigate to `/login`<br/>2. Input valid email & password<br/>3. Click Submit | Session cookie `sb-access-token` is set; redirects to `/app/dashboard` | High | Critical | Functional |
| **FT-02** | Auth | Login with invalid password | User profile exists | 1. Navigate to `/login`<br/>2. Input valid email & incorrect password<br/>3. Click Submit | Error toast appears: `"Invalid login credentials"`; remains on login page | High | High | Functional |
| **FT-03** | Auth | Middleware redirect guard | User is not logged in | 1. Access `/app/dashboard` directly | Redirects to `/login` immediately | High | Critical | Security |
| **FT-04** | Sticky Notes | Note card CRUD operations | KKN surveyor logged in | 1. Access `/app/sticky-notes`<br/>2. Click "Add Note"<br/>3. Input text & choose column (Aspirasi)<br/>4. Click Save | Note card renders in Aspirasi column; database record matches | High | High | Functional |
| **FT-05** | Sticky Notes | Column switch drag/drop | Note exists | 1. Drag note from Aspirasi to Masalah | Column ID updates in database; updates other users' screens | High | Medium | Realtime |
| **FT-06** | Survey Wizard | Geolocation GPS capture | Device GPS active | 1. Access `/app/surveys/new`<br/>2. Click "Ambil GPS" | Latitude/Longitude fields populate with accuracy metadata | High | Critical | Sensor |
| **FT-07** | Survey Wizard | Camera image downsampling | Image upload size 5MB | 1. Select 5MB image from camera | Image is compressed to ≤800KB; preview renders in under 2s | High | High | Functional |
| **FT-08** | Maps | GIS markers rendering | Surveys exist | 1. Navigate to `/app/map` | Leaflet renders markers at correct coordinates | High | High | GIS |
| **FT-09** | Maps | RT Filter panels | Multiple RT surveys exist | 1. Select "RT 02" filter | Only markers belonging to RT 02 remain visible | Medium | Medium | GIS |
| **FT-10** | Priority | Matrix scoring calculation | Survey problems exist | 1. Navigate to `/app/priority`<br/>2. Input values U=4, S=3, G=4<br/>3. Click Save | Total score calculates to 11; row shifts to correct rank position | Medium | Medium | Functional |
| **FT-11** | Reports | Excel spreadsheet export | Verified surveys exist | 1. Access `/app/admin`<br/>2. Click "Ekspor Excel" | Browser downloads `.xlsx` file containing complete household columns | Medium | High | Functional |
| **FT-12** | Google Drive | Auto-upload archived files | Service Account active | 1. Trigger Drive sync from admin panel | Photos sync to KKN shared Drive; records link back to file URLs | Low | Medium | Integration |
| **FT-13** | Dashboard | Progress metrics display | Seed data active | 1. Navigate to `/app/dashboard` | Renders accurate percent metrics for RT progress. | High | High | Functional |
| **FT-14** | Survey Wizard | Multi-step form back navigation | Step 2 active | 1. Click "Sebelumnya" button | Form returns to Step 1 preserving inputs. | Medium | Medium | Functional |
| **FT-15** | Potential | Potential management CRUD | Surveyor logged in | 1. Navigate to `/app/potentials/new`<br/>2. Fill form and save | Database saves new potential record linked to survey ID. | High | High | Functional |
| **FT-16** | Problem | Problem management CRUD | Surveyor logged in | 1. Navigate to `/app/problems/new`<br/>2. Fill form and save | Database saves new problem record linked to survey ID. | High | High | Functional |
| **FT-17** | Sticky Notes | Note card deletion | Own card exists | 1. Click Delete button on note | Card is removed; database row updates. | High | High | Functional |
| **FT-18** | Calendar | Sync calendar schedules | Meeting exists | 1. Access Google Calendar sync panel | Synced meetings show on Calendar interface. | Low | Low | Integration |
| **FT-19** | Settings | Profile edit password | User logged in | 1. Navigate to `/app/settings`<br/>2. Input new password and save | Auth system updates credentials. | High | High | Functional |
| **FT-20** | Notifications | Toast notifications alerts | Realtime trigger | 1. Trigger database action | System shows browser toast alerts instantly. | Medium | Low | Realtime |

---

## 5. GIS Test Cases

The GIS test cases check the accuracy and rendering of map markers:

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Priority | Severity | Test Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GT-01** | GPS | GPS Capture with high accuracy | GPS active | 1. Click "Ambil GPS" in open area | Geolocation parses coordinates; accuracy is < 10 meters | High | High | Sensor |
| **GT-02** | GPS | GPS Capture with low accuracy | GPS active inside building | 1. Click "Ambil GPS" indoors | Geolocation returns accuracy > 20 meters; displays warning toast | High | Medium | Sensor |
| **GT-03** | Maps | Marker placement mapping | Coordinates valid | 1. Open Map view | Marker renders at exact coordinate points | High | High | GIS |
| **GT-04** | Maps | Coordinate Obfuscation (Public View)| Coordinates valid | 1. Open `/peta` as guest visitor | Coordinates round to 3 decimals; pin matches obfuscated location | High | Critical | Security |
| **GT-05** | GPS | GPS coordinate range validation | Geolocation returns coords | 1. Click "Ambil GPS" in Sukahaji | Coordinates fall within village bounds; passes Zod range checks | High | High | Boundary |
| **GT-06** | GPS | Invalid coordinate fallback | GPS sensor fails | 1. Click "Ambil GPS" with sensor off | API displays fallback dialog allowing manual marker pinning | High | High | Usability |
| **GT-07** | Maps | Duplicate coordinate warning | Marker exists at coords | 1. Submit survey at same lat/lng | system displays duplicate coordinate warning. | Medium | Medium | GIS |
| **GT-08** | Maps | Map tile cache loading | offline mode active | 1. Open Map while offline | Leaflet loads cached tiles from service worker store. | High | High | Offline |
| **GT-09** | Export | GeoJSON export file | surveys exist | 1. Click Export GeoJSON | Downloads valid GeoJSON file containing coordinates. | Medium | Medium | GIS |
| **GT-10** | Export | KML export file | surveys exist | 1. Click Export KML | Downloads valid KML file containing coordinates. | Medium | Medium | GIS |

---

## 6. Offline Sync Test Cases

The offline sync test cases check that survey data is protected during network drops:

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Priority | Severity | Test Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **OT-01** | Sync | Save draft offline | Device offline | 1. Fill out survey<br/>2. Click "Simpan Draft" | Survey saved in local queue; database shows no new records | High | Critical | Offline |
| **OT-02** | Sync | Auto-retry sync on connect | Network restored | 1. Access app with pending drafts<br/>2. Establish connection | Queue starts uploading records; clears localStorage after success | High | Critical | Offline |
| **OT-03** | Sync | Duplicate UUID prevention | Offline sync triggered | 1. Sync draft containing existing client UUID | API rejects submission as duplicate; logs error, blocks record creation | High | High | Security |
| **OT-04** | Sync | Photo sync under slow signal | 3G network throttle | 1. Trigger sync containing photo uploads | Upload succeeds despite timeouts; resumes upload stream if interrupted | Medium | High | Performance |
| **OT-05** | Sync | Phone crashes mid-survey | Unsaved survey | 1. Force close browser mid-survey | Browser draft auto-saves draft payload; form restores state on launch | Medium | Medium | Usability |
| **OT-06** | Sync | Database sync transaction recovery | sync failure mid-stream | 1. Interrupt sync pipeline during sync | Client database locks are released safely; no data fragmentation occurs. | High | High | Database |
| **OT-07** | Sync | Queue empty checks | sync finished | 1. View survey list | Local queue size updates to 0. | Low | Low | Offline |

---

## 7. Mobile Test Cases

The mobile test cases verify layout responsiveness and hardware interaction:

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Priority | Severity | Test Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MT-01** | Touch | UI Element interactions | Mobile device | 1. Tap input text fields<br/>2. Tap buttons | Touch targets are ≥48x48px; no adjacent click triggers | High | High | Usability |
| **MT-02** | Camera | Native camera call | Camera permission granted | 1. Tap camera icon in survey form | Native camera opens; captures photo successfully | High | High | Sensor |
| **MT-03** | Battery | Power usage testing | Battery below 20% | 1. Open map page with low battery | GPS polling runs in intervals; app limits CPU usage | Medium | Medium | Hardware |
| **MT-04** | Layout | Screen rotation rendering | App active | 1. Rotate phone from portrait to landscape | Leaflet map resizes layout; form wizard retains inputs | Medium | Low | Usability |
| **MT-05** | Layout | Screen sizes rendering | Android 6-inch screen | 1. Access dashboard on various screen widths | Dashboard layout scales; no text overlaps | High | High | Usability |

---

## 8. Performance Test Cases

The performance test cases verify load times and data scaling limits:

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Priority | Severity | Test Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PT-01** | Load | Dashboard load speed | 100 survey records exist | 1. Open `/app/dashboard` | Dashboard stats render in < 2 seconds | High | High | Performance |
| **PT-02** | Load | Map markers load speed | 120 pins exist | 1. Open `/app/map` | Map loads pins and markers render in < 3 seconds | High | High | Performance |
| **PT-03** | Load | Photo upload processing | 4MB photo input | 1. Upload 4MB household photo | Compression is complete and upload starts in < 3 seconds | High | High | Performance |
| **PT-04** | Load | Concurrent dashboard view | 15 active users | 1. 15 users open board simultaneously | Server response stays stable; no connection timeout errors | Medium | High | Load |
| **PT-05** | Load | Search & Filter response | 120 surveys in list | 1. Input search text in list | Filtered results return in < 1 second | Medium | Medium | Performance |

---

## 9. Security Test Cases

The security test cases check the platform's defenses against unauthorized access:

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Priority | Severity | Test Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ST-01** | Auth | Row Level Security verification | Surveyor logged in | 1. Attempt updating household entry of other surveyor | Database rejects query; returns blank payload or error | High | Critical | Security |
| **ST-02** | Upload | Malicious upload rejection | Upload endpoint active | 1. Upload `.php` shell script file | Upload proxy blocks write; returns validation error `422` | High | Critical | Security |
| **ST-03** | Injection| SQL injection protection | Input endpoints active | 1. Input SQL command in name fields (`' OR 1=1--`) | SQL parameters are sanitized; database writes the value as plain text | High | Critical | Security |
| **ST-04** | XSS | Cross-site scripting validation | Input fields active | 1. Input HTML script tags in sticky note card text | Script tags are escaped; renders as text on dashboard | High | High | Security |
| **ST-05** | Rate | API rate limit verification | API routes active | 1. Send >60 requests in 1 minute | API blocks requests; returns rate limit error `429` | Medium | High | Security |
| **ST-06** | Auth | Session hijacking prevention | JWT token stolen | 1. Copy JWT to another browser without cookies | Middleware blocks access as httpOnly cookie is missing. | High | Critical | Security |
| **ST-07** | CORS | CORS policies check | API routes active | 1. Send fetch from external domain origin | Request is blocked by browser CORS policy. | High | Critical | Security |
| **ST-08** | CSRF | CSRF tokens check | POST routes active | 1. Send state action without cookie token | Middleware rejects request with CSRF alert. | Medium | High | Security |

---

## 10. Usability Test Cases

The usability test cases verify the ease of navigation and user experience:

| Test ID | Feature | Scenario | Preconditions | Steps | Expected Result | Priority | Severity | Test Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-01** | UX | Form completion ease | Surveyor logged in | 1. Fill survey from start to finish | Flow moves sequentially; inputs auto-save | High | High | Usability |
| **UT-02** | UX | Map touch usability | Map view active | 1. Pinch to zoom map markers | Map responds smoothly without lag or layout shifting | High | Medium | Usability |
| **UT-03** | UI | Dashboard charts visibility | Statistics populated | 1. Open stats panel | Charts label clear; categories distinguish easily | Medium | Medium | Usability |
| **UT-04** | UX | Error message clarity | Invalid inputs in form | 1. Leave mandatory inputs blank | Validation highlights inputs; displays helpful error message | High | High | Usability |

---

## 11. Data Validation Testing

Data integrity validations are run across these entities:

### 11.1 RT/RW and Dusun Master Constraints
*   **Validation Rules:** Verify that a household record can only reference valid `rt_id` and `rw_id` combinations from the master seeded geographic tables.
*   **Test Case:** Attempt to save a household with `rt_id` referencing a non-existent RT.
*   **Expected Result:** Database foreign key constraints block the write operation.

### 11.2 GPS Coordinate Boundaries
*   **Validation Rules:** Geolocation coordinates must fall within the bounds of West Java, Indonesia.
*   **Latitude Limits:** `-7.3000` to `-6.4000`.
*   **Longitude Limits:** `107.0000` to `108.0000`.
*   **Expected Result:** Coordinates outside this range are rejected by Zod validation schemas.

### 11.3 Survey Answers Integrity
*   **Validation Rules:** Numeric variables like `family_size` must be integers ≥ 1.
*   **Expected Result:** Zod parser rejects decimals or negative integers.

---

## 12. Error Handling Testing

These tests verify how the system handles unexpected failures:

### 12.1 Session Expiry Redirect
*   **Scenario:** A surveyor leaves the application open. The JWT access token expires after 1 hour, and the refresh token cookie is cleared.
*   **Expected Behavior:** Next API request returns `401 Unauthorized`. Next.js middleware redirects the client to `/login`.

### 12.2 Database Query Fails
*   **Scenario:** Database reaches connection limits.
*   **Expected Behavior:** API returns `503 Service Unavailable`. The frontend displays a user-friendly error card rather than crashing.

### 12.3 Camera Upload Timeouts
*   **Scenario:** Cellular connection drops to 2G during photo upload.
*   **Expected Behavior:** Frontend cancels the request after 15 seconds, notifies the user with a retry toast, and places the photo in the offline queue.

---

## 13. Browser & Device Compatibility

Since surveyors use their personal devices, the platform is verified against this compatibility matrix:

### 13.1 Supported Browsers
*   **Google Chrome (Android):** Target version ≥ 100 (Primary platform).
*   **Microsoft Edge (Android):** Target version ≥ 100.
*   **Safari (iOS):** Target version ≥ 15 (Basic compatibility, no push alerts).
*   **Desktop Chrome/Firefox:** (Admin dashboard use).

### 13.2 Supported Devices
*   **Mobile Screen Sizes:** Minimum width 360px (e.g. entry-level Samsung, Xiaomi phones).
*   **Tablet Screen Sizes:** Minimum width 768px.
*   **Desktop Screen Sizes:** Minimum width 1024px.

---

## 14. Test Data Management

Managing test datasets securely is critical to prevent database pollution:

### 14.1 Mock Data Seeding
*   A staging database is seeded with mock datasets representing 5 RTs and 20 households.
*   All mock households use the naming convention `Warga Mock RT 0x` to distinguish them from real survey data.

### 14.2 Database Reset Strategy
*   Before Cycle 2 survey deployment, the developer runs a reset script that clears all household and survey records.
*   Master tables (`rt`, `rw`, `dusun`, `project`) are kept intact.

### 14.3 Anonymization Protocols
*   Staging databases mask real resident names.
*   No real citizen ID numbers (NIK) or phone numbers are saved in mock datasets.

---

## 15. Defect Management Process

When a tester identifies a bug, they follow this resolution process:

### 15.1 Bug Severity Definitions
*   **Critical:** App crashes, data loss, RLS policy bypass.
*   **High:** Feature unusable, GPS capture fails, files fail to upload.
*   **Medium:** Layout rendering issue, filtering delay.
*   **Low:** Typo, minor color inconsistency.

### 15.2 Bug Priority Definitions
*   **P1 (Immediate):** Blocks core survey operations. Must be resolved in the next daily release.
*   **P2 (Normal):** Affects usability but has a manual bypass.
*   **P3 (Low):** UI tweak.

### 15.3 Bug Report Template
```markdown
*   **Defect ID:** BUG-0x
*   **Severity:** [Critical / High / Medium / Low]
*   **Priority:** [P1 / P2 / P3]
*   **Reporter:** KKN Surveyor Name
*   **Target Module:** [Auth / Sticky / Survey / Map / Export]
*   **Description:** Clear explanation of what happened.
*   **Steps to Reproduce:**
    1. Navigate to `/app/surveys/new`
    2. Click GPS Capture with sensor disabled.
*   **Expected Result:** fallback manual marker displays.
*   **Actual Result:** Screen freezes.
```

---

## 16. Test Automation Recommendations

Given the solo developer constraint and a zero-budget setup, automation is kept simple:

### 16.1 Automated Tests (CI Pipeline)
*   **Zod Schema parsing check:** Automated script validates Zod schema parsers.
*   **Database Schema integrity checks:** Automated checks verify database foreign key relations match schemas.

### 16.2 Manual Verification (Recommended)
*   **GPS Sensor capture:** Real hardware GPS checks cannot be automated in simulated environments.
*   **Camera integration:** Verify image upload and client compression manually.
*   **Offline localStorage queue:** Manually throttle network using browser dev tools.

---

## 17. Field Testing Plan

Field testing is performed in the village before each cycle starts:

### 17.1 Pre-Cycle 1 Field Test (KKN Day 1)
*   *Objectives:* Verify login and check network signal at the community hall.
*   *Features to Validate:* Sticky Notes Board, authentication.
*   *Expected Results:* WebSocket real-time updates function under hall cellular signal.

### 17.2 Pre-Cycle 2 Field Test (KKN Day 3)
*   *Objectives:* Onboard surveyors and run a pilot survey on a single house.
*   *Features to Validate:* Geolocation capture, canvas compression, offline queue.
*   *Expected Results:* Coords capture within 15 seconds. compressed photo saves to database.

---

## 18. Real Field Simulation Scenarios

Below is the detailed registry of field testing simulation runs matching the village conditions:

### 18.1 Survey Under Direct Sunlight

*   **Scenario ID:** SIM-01
*   **Hardware State:** Max screen brightness, high temperature environment.
*   **UI Focus:** Visual contrast check for Emerald and Indigo colors. Touch target verification.
*   **Test Script Checklist:**
    *   [ ] Readability of placeholder text in form fields under sunlight.
    *   [ ] Visibility of maps circle marker boundaries.
    *   [ ] Toast messages visibility duration (raised from 3s to 6s for daylight outdoor readability).

*   **Scenario Context:** Surveyor stands in street under 35-degree sunlight with glare.
*   **Expected System Behavior:** High-contrast color layouts ensure text is readable. App shell maintains 60fps scrolling without rendering blocks.
*   **Acceptance Criteria:** Screen brightness levels do not cause input fields to be unreadable. Form wizard elements are identifiable.
*   **Risks:** Phone overheating, causing browser crash.
*   **Mitigation Strategy:** Save form draft values to `localStorage` immediately upon input fields loss of focus.

### 18.2 Weak Cellular Signal (Edge Connectivity)

*   **Scenario ID:** SIM-02
*   **Hardware State:** Network throttled to 64kbps uplink/downlink, 50% packet loss.
*   **API Focus:** Timeout tolerances and retry thresholds.
*   **Test Script Checklist:**
    *   [ ] API sync request aborts after 10 seconds of no network packets.
    *   [ ] Forms transition to local queue save screen seamlessly.
    *   [ ] Batch uploads sequence syncs one household payload at a time, resuming if a connection breaks mid-sync.

*   **Scenario Context:** Surveyor enters a narrow valley section with only 1 bar of 2G data signal.
*   **Expected System Behavior:** API calls fall back gracefully. Network fetches timeout after 10 seconds.
*   **Acceptance Criteria:** Surveyors can still complete and save the survey to the local queue.
*   **Risks:** App hangs indefinitely on spinner.
*   **Mitigation Strategy:** Edge calls show local success message and enqueue payload directly.

### 18.3 Battery Below 20%

*   **Scenario ID:** SIM-03
*   **Hardware State:** Battery percentage < 15%, OS power saver mode active.
*   **GPS Focus:** Polling frequency limits.
*   **Test Script Checklist:**
    *   [ ] Geolocation sensor falls back from continuous watch (`watchPosition`) to on-demand single poll (`getCurrentPosition`).
    *   [ ] Screen sleep during GPS lookup handles background tasks without losing form states.

*   **Scenario Context:** Phone is at 15% battery during afternoon house visits.
*   **Expected System Behavior:** Low-power CPU throttle does not crash the react-leaflet render loop.
*   **Acceptance Criteria:** The browser continues to capture GPS coordinates without OS termination.
*   **Risks:** Device power off during survey write.
*   **Mitigation Strategy:** Local drafts are saved in real-time, restoring state on restart.

### 18.4 Multiple Surveyors Syncing Simultaneously
*   **Scenario Context:** All 15 surveyors finish their daily shifts at 17:00 and trigger batch syncs concurrently.
*   **Expected System Behavior:** Database connections scale, API rate limits allow batch sync payload array processing.
*   **Acceptance Criteria:** 100% of data is safely inserted. DB transaction locks do not time out.
*   **Risks:** postgREST query exhaustion.
*   **Mitigation Strategy:** Group transactions into singular batch SQL calls via `/surveys/sync` endpoint.

---

## 19. Go / No-Go Checklist & Quality Gate

Before deploying the platform on Day 1 of surveys, the platform must pass this quality gate:

| Module | Checklist Item | Pass / Fail |
| :--- | :--- | :--- |
| **Auth** | RLS is active on all Supabase tables. | [ ] |
| **Auth** | Unauthenticated requests redirect to `/login`. | [ ] |
| **Survey** | GPS captures coordinates with accuracy < 15 meters. | [ ] |
| **Survey** | Canvas compression downsamples photos to ≤800KB. | [ ] |
| **Offline** | localStorage draft queue saves and syncs without data loss. | [ ] |
| **GIS** | Obfuscated public coordinates match street-level accuracy limits. | [ ] |
| **Google** | Service Account connects to target Google Drive folder. | [ ] |

**Verdict: A single 'Fail' on a critical item blocks production release.**

---

## 20. Final QA Review

The test plan is complete, aligned with previous documents, and ready to guide verification.

---

*This Test Plan is derived from `12_TEST_PLAN_PROMPT.md` and is fully subordinate to `00_PROJECT_FOUNDATION.md`, `02_SYSTEM_BLUEPRINT.md`, `03_PRD.md`, `04_UX_SPECIFICATION.md`, `05_TECHNICAL_SPECIFICATION.md`, `06_DATABASE_SPECIFICATION.md`, `07_DATA_FLOW_SPECIFICATION.md`, `08_API_SPECIFICATION.md`, `09_SECURITY_SPECIFICATION.md`, `10_DEVELOPMENT_ROADMAP.md`, and `11_ARCHITECTURE_DECISION_RECORDS.md`.*

---

**Would you like to revise this Test Plan before we proceed to generate the Deployment & Operations Guide (`13_DEPLOYMENT_OPERATIONS.md`)?**

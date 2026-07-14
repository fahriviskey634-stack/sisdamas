# ROLE

You are acting as an Enterprise Data Architecture Team composed of:

- Principal Data Architect
- Enterprise Solution Architect
- Senior Backend Engineer
- Senior Software Architect
- GIS Data Engineer
- Database Architect
- System Analyst
- Business Analyst
- Information Architect

You have already completed:

✔ Project Foundation

✔ Product Discovery

✔ System Blueprint

✔ Product Requirements Document

✔ UX Specification

✔ Technical Specification

✔ Database Specification

Never redesign previous documents.

Instead,

describe how data moves across the entire system.

The objective is to make every future API and database interaction predictable, maintainable, and easy to understand.

---

# OBJECTIVE

Create the complete Data Flow Specification for the SISDAMAS Digital Platform.

Describe how information travels:

User

↓

Frontend

↓

Validation

↓

Business Logic

↓

Database

↓

Storage

↓

Dashboard

↓

GIS

↓

Reports

↓

Google Drive

↓

Google Calendar

↓

Users

Every important data movement should be documented.

---

# DATA FLOW PRINCIPLES

The platform should prioritize:

Single Source of Truth

No duplicate data

Minimal manual work

Automatic synchronization

Offline-first mindset

Auditability

Reliability

Consistency

Scalability

---

# SYSTEM OVERVIEW

Provide a high-level overview of how data moves across the application.

Identify:

Sources

Destinations

External systems

Storage locations

Synchronization points

Validation points

Transformation points

Visualization points

Use Mermaid diagrams.

---

# USER DATA FLOW

Describe data flow for:

Authentication

User Profile

Roles

Permissions

Login

Logout

Session

Profile Updates

Explain every step.

---

# SURVEY DATA FLOW

Describe the complete lifecycle of survey data.

Example:

KKN Team Member

↓

Select Dusun

↓

Select RW

↓

Select RT

↓

Select Household

↓

GPS Capture

↓

Photo Capture

↓

Problem Input

↓

Potential Input

↓

Validation

↓

Draft Save

↓

Offline Queue

↓

Synchronization

↓

Supabase

↓

Statistics

↓

GIS Layer

↓

Reports

↓

Google Drive (Documentation)

Create a detailed flow.

---

# GIS DATA FLOW

Explain how GIS data moves.

GPS

↓

Coordinate Validation

↓

Database

↓

Leaflet

↓

Marker

↓

Popup

↓

Filtering

↓

Statistics

↓

Export

↓

Google Earth

↓

QGIS

Explain each transformation.

---

# DOCUMENTATION DATA FLOW

Describe how photos, videos and documents move.

Camera

↓

Compression

↓

Temporary Storage

↓

Upload

↓

Supabase Storage

↓

Google Drive Archive

↓

Documentation Module

↓

Reports

↓

Gallery

↓

Public Website

Explain synchronization.

---

# GOOGLE DRIVE DATA FLOW

Explain:

Folder Creation

Naming Convention

Synchronization

Duplicate Prevention

Versioning

Archiving

Recovery

Manual Upload

Automatic Upload

---

# GOOGLE CALENDAR DATA FLOW

Explain:

Event Creation

Task Creation

Schedule Update

Reminder

Notification

Calendar Synchronization

Meeting Updates

---

# DASHBOARD DATA FLOW

Explain how dashboard widgets obtain their data.

Statistics

Charts

Progress

Maps

Survey Counts

Task Completion

Problem Categories

Potential Categories

Real-time Updates

Caching Strategy

---

# REPORT DATA FLOW

Explain how reports are generated.

Survey

↓

Database

↓

Aggregation

↓

Charts

↓

Statistics

↓

Maps

↓

PDF

↓

Word

↓

Excel

↓

Presentation

---

# OFFLINE SYNCHRONIZATION

Describe:

Offline Save

Conflict Detection

Conflict Resolution

Retry Queue

Failed Upload

Photo Queue

GPS Queue

Network Recovery

Synchronization Order

---

# VALIDATION FLOW

Identify validation points.

Client Validation

↓

Business Validation

↓

Database Validation

↓

Storage Validation

↓

GIS Validation

↓

Final Approval

---

# ERROR FLOW

Design recovery flows.

GPS Failure

Upload Failure

Photo Failure

Database Failure

Storage Failure

Network Failure

Authentication Failure

Permission Failure

Synchronization Failure

Explain recovery mechanisms.

---

# NOTIFICATION FLOW

Describe notification lifecycle.

Created

↓

Queued

↓

Delivered

↓

Read

↓

Archived

Explain notification triggers.

---

# AUDIT FLOW

Track:

Who created data

Who modified data

Who deleted data

When

Why

Approval History

Version History

Explain audit strategy.

---

# DATA PRIVACY FLOW

Classify data movement.

Public

Internal

Sensitive

Restricted

Explain how each category moves through the system.

---

# PERFORMANCE FLOW

Identify:

Heavy Queries

Heavy Uploads

Map Rendering

Dashboard Loading

Caching Opportunities

Lazy Loading Opportunities

Background Processing

---

# DATA FLOW REVIEW

Review the entire data flow.

Identify:

Unnecessary steps

Duplicate storage

Missing validations

Performance bottlenecks

Synchronization risks

Offline risks

Security risks

Suggest improvements.

---

# DELIVERABLES

Generate:

1. System Data Flow Overview

2. User Data Flow

3. Survey Data Flow

4. GIS Data Flow

5. Documentation Flow

6. Google Drive Flow

7. Google Calendar Flow

8. Dashboard Flow

9. Report Flow

10. Offline Synchronization Flow

11. Validation Flow

12. Error Recovery Flow

13. Notification Flow

14. Audit Flow

15. Privacy Flow

16. Performance Analysis

17. Recommendations

Use Mermaid diagrams extensively.

Use sequence diagrams whenever appropriate.

Everything should be implementation-ready.

---

# IMPORTANT

Do NOT define REST APIs.

Do NOT define GraphQL.

Do NOT generate endpoint names.

Wait for approval before moving to API Specification.
# ROLE

You are acting as an elite Database Architecture Team consisting of:

- Principal Database Architect
- PostgreSQL Expert
- Supabase Expert
- Data Architect
- GIS Data Engineer
- Software Architect
- Backend Engineer
- Information Architect

You have already completed:

✔ Project Foundation

✔ Product Discovery

✔ System Blueprint

✔ Product Requirements Document

✔ UX Specification

✔ Technical Specification

Never contradict previous documents.

Your responsibility is to design a scalable, maintainable, normalized database for the SISDAMAS Digital Platform.

---

# OBJECTIVE

Design the complete database architecture.

Do NOT write SQL immediately.

Design first.

Explain every decision.

The implementation will use:

Supabase PostgreSQL (Free Tier)

Consider:

Free storage limits

Free bandwidth

Performance

Scalability

Maintainability

GIS compatibility

Offline synchronization

Google integrations

---

# DATABASE DESIGN PRINCIPLES

The database should follow:

Normalization (up to 3NF unless justified)

Minimal redundancy

Referential integrity

Auditability

Future scalability

Simple queries

Efficient indexing

Easy maintenance

Never optimize prematurely.

---

# BUSINESS DOMAIN ANALYSIS

Identify every business entity from the previous documents.

Examples:

Users

Roles

RT

RW

Households

Surveys

Survey Sessions

Problems

Potentials

Photos

Documents

Programs

Tasks

Meetings

Documentation

Calendar Events

Notifications

Village Profile

KKN Team

Social Media

Gallery

Settings

Audit Logs

Identify additional entities if necessary.

Explain why each entity exists.

---

# ENTITY ANALYSIS

For every entity define:

Purpose

Description

Owner

Lifecycle

Relationships

Dependencies

Soft Delete or Hard Delete

Audit Requirements

Expected Volume

Growth Rate

---

# RELATIONSHIP DESIGN

Design relationships.

One-to-One

One-to-Many

Many-to-Many

Identify bridge tables when necessary.

Explain why.

---

# ERD

Create a complete Entity Relationship Diagram.

Use Mermaid ER Diagram.

Explain every relationship.

---

# TABLE SPECIFICATIONS

For every table define:

Purpose

Columns

Primary Key

Foreign Keys

Unique Constraints

Nullable Fields

Default Values

Indexes

Created At

Updated At

Deleted At

Status Fields

Audit Fields

Explain every column.

Do NOT write SQL.

---

# DATA DICTIONARY

Create a complete Data Dictionary for every table.

For every column include:

- Column Name
- Business Meaning
- Technical Purpose
- Data Type Recommendation
- Nullable
- Default Value
- Validation Rules
- Example Value
- Source of Data
- Used By
- Display Name
- Editable
- Searchable
- Filterable
- Required
- Notes

Do not skip any column.

The Data Dictionary should be understandable by both developers and non-technical stakeholders.

Explain business terminology whenever necessary.

# GIS DATA DESIGN

Design GIS storage.

Store:

Latitude

Longitude

RT

RW

Dusun

Address

Coordinate Accuracy

Coordinate Source

Survey Location

Photo Location

Explain why.

Do NOT use PostGIS unless justified.

Assume standard Supabase PostgreSQL Free Tier.

---

# SURVEY DATA MODEL

Design how survey data should be stored.

Household

↓

Survey Session

↓

Problems

↓

Potentials

↓

Photos

↓

GPS

↓

Validation

↓

History

Support multiple surveys over time.

Never overwrite historical data.

---

# DOCUMENTATION MODEL

Design storage for:

Photos

Videos

Documents

Meeting Minutes

Reports

LPJ

Proposal

Presentation

Google Drive Links

Explain ownership.

---

# USER MODEL

Design users.

Roles

Permissions

Profile

Activity

Assignments

Survey Statistics

Login History

Audit Logs

---

# TASK MODEL

Design:

Program

↓

Task

↓

PIC

↓

Checklist

↓

Progress

↓

Completion

↓

Evaluation

---

# STICKY NOTES MODEL

Design:

Sticky Note Boards

↓

Sticky Note Columns

↓

Sticky Notes (Content, Owner, Position, Upvotes)

---

# PRIORITY MATRIX MODEL

Design:

USG Scores (Urgency, Seriousness, Growth)

↓

Priority Ranking

↓

Action Alignment

---

# AUDIT MODEL

Track:

Created By

Updated By

Deleted By

Timestamp

Changes

Reason

Approval

History

---

# DATA LIFECYCLE

Describe the lifecycle of every important entity.

Example:

Household

Created

↓

Survey Started

↓

Survey Completed

↓

Validated

↓

Used in Priority Analysis

↓

Program Assigned

↓

Monitoring

↓

Archived

Do this for:

Survey

Household

Problem

Potential

Documentation

Task

Program

Notification

User

Calendar Event

Explain every transition.

Identify invalid transitions.
# DATA OWNERSHIP

For every entity define:

Business Owner

Created By

Updated By

Validated By

Deleted By

Visible To

Editable By

Approval Required

Retention Policy

Explain responsibilities.

Identify ownership conflicts.

# DATA QUALITY

For every important entity define:

Completeness Rules

Validation Rules

Duplicate Detection

GPS Validation

Photo Validation

Required Fields

Optional Fields

Consistency Rules

Conflict Resolution

Data Cleaning Strategy

Suggest automatic validation whenever possible.

# DATA CLASSIFICATION

Separate all entities into:

Master Data

Reference Data

Transaction Data

Historical Data

Temporary Data

System Data

Audit Data

Explain why each entity belongs to that category.

# INDEXING STRATEGY

Recommend indexes.

Explain why.

Consider:

Search

GIS filtering

RT filtering

RW filtering

Survey lookup

Statistics

Dashboard

---

# RELATIONSHIP VALIDATION

Review the ERD.

For every relationship explain:

Why it exists.

Whether it is mandatory.

Whether it should cascade.

Whether soft delete is allowed.

Whether orphan records can exist.

Identify redundant relationships.

Suggest simplifications.

# DATA RETENTION

Define:

Archiving

Soft Delete

Recovery

Backups

History

Versioning

---

# QUERY ANALYSIS

Predict the most common database queries.

Examples:

Dashboard

Interactive Map

Survey List

Household Details

Problem Statistics

RT Statistics

RW Statistics

Photo Gallery

Task Progress

Documentation

Notifications

Calendar

Recommend indexes based on these queries.

Explain expected performance.

# SUPABASE FREE TIER REVIEW

Evaluate whether the proposed database design fits within the Supabase Free Tier.

Estimate:

Storage

Bandwidth

Database Size

Photo Storage

Expected Queries

Monthly Active Users

Daily Survey Volume

Explain any limitations.

Suggest optimizations to remain within the free plan.
# NAMING CONVENTION

Tables

Columns

Foreign Keys

Indexes

Constraints

Consistent naming rules.

---

# SECURITY

Recommend:

Row Level Security

Access Rules

Ownership

Public Data

Private Data

Sensitive Data

Explain recommendations.

---

# PERFORMANCE

Estimate:

Number of households

Number of surveys

Number of photos

Number of documents

Growth over one KKN period.

Explain whether Supabase Free Tier is sufficient.

---

# DATABASE REVIEW

Critically review your design.

Find:

Redundant tables

Missing relations

Circular references

Normalization issues

Performance bottlenecks

Maintenance risks

Improve the design.

---

# DELIVERABLES

Generate:

1. Database Principles

2. Entity Analysis

3. Relationship Analysis

4. ER Diagram

5. Table Specifications

6. GIS Data Model

7. Survey Data Model

8. Documentation Data Model

9. User Model

10. Task Model

11. Audit Model

12. Index Strategy

13. Security Recommendations

14. Performance Analysis

15. Database Review

Everything should be implementation-ready.

---

# FINAL DATABASE AUDIT

Before finishing,

review the entire database architecture.

Check for:

Missing tables

Missing columns

Duplicate entities

Normalization problems

Naming inconsistencies

Scalability issues

Performance bottlenecks

Security risks

GIS limitations

Offline synchronization issues

Google Drive integration issues

Google Calendar integration issues

If improvements are needed,

update the design before presenting the final result.

# IMPORTANT

Do NOT generate SQL.

Do NOT generate Prisma models.

Do NOT generate Supabase migration files.

Only produce the database specification.

Wait for approval before generating the physical database.

Jangan buat tabel "warga"

Banyak mahasiswa langsung membuat:

Warga

Padahal yang diwawancarai saat KKN biasanya adalah rumah tangga, bukan seluruh individu.

Menurutku struktur yang lebih tepat adalah:

Dusun
    │
    ├── RW
    │      │
    │      ├── RT
    │      │      │
    │      │      ├── Household (Rumah)
    │      │      │        │
    │      │      │        ├── Survey
    │      │      │        ├── Problems
    │      │      │        ├── Potentials
    │      │      │        ├── Photos
    │      │      │        └── Timeline
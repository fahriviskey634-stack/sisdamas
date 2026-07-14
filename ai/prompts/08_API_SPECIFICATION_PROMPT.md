# ROLE

You are acting as an elite API Design Team composed of:

- Principal Backend Architect
- Principal API Architect
- Senior Software Architect
- Senior Backend Engineer
- REST API Specialist
- OpenAPI Expert
- Supabase Expert
- Security Engineer
- Technical Writer

You have already completed:

✔ Project Foundation

✔ Product Discovery

✔ System Blueprint

✔ Product Requirements Document

✔ UX Specification

✔ Technical Specification

✔ Database Specification

✔ Data Flow Specification

Never contradict previous documents.

Your task is to design a professional REST API specification.

Do NOT write implementation code.

---

# OBJECTIVE

Design a clean, scalable REST API.

The API should support:

Authentication

Survey

GIS

Documentation

Dashboard

Reporting

Google Drive

Google Calendar

Administration

Statistics

Notifications

Future expansion

---

# API DESIGN PRINCIPLES

Follow RESTful conventions.

Keep endpoints predictable.

Use nouns instead of verbs.

Support versioning.

Support pagination.

Support filtering.

Support sorting.

Support searching.

Support field selection.

Support future expansion.

Explain every decision.

---

# VERSIONING

Design versioning strategy.

Example:

/api/v1/

Explain future compatibility.

---

# AUTHENTICATION

Design:

Login

Logout

Refresh Token

Forgot Password

Profile

Google Login

Session Validation

Authorization

Explain flow.

---

# DOMAIN DESIGN

Organize APIs into domains.

Authentication

Users

Roles

Survey

Survey Sessions

Households

Problems

Potentials

GIS

Programs

Tasks

Dashboard

Reports

Statistics

Gallery

Documentation

Notifications

Settings

Audit Logs

Sticky Notes

Priority Matrix

---

# ENDPOINT SPECIFICATION

For every endpoint define:

Purpose

Method

URL

Description

Authentication Required

Permissions

Request Parameters

Path Parameters

Query Parameters

Request Body

Validation Rules

Success Response

Error Responses

Pagination

Filtering

Sorting

Search

Example Request

Example Response

Business Rules

Rate Limits

Notes

Explain every endpoint.

---

# STICKY NOTES API

Design endpoints for:

Get Sticky Boards

Create Board

Get Board Columns

Create Column

Get Column Notes

Create Note

Update Note (content, position, column_id)

Delete Note

Upvote Note

---

# PRIORITY MATRIX API

Design endpoints for:

Calculate Priority Score (using USG matrix parameters)

Save Priority Score for Problem

Get Priority Ranked List

Align Program with Priority Problem

---

# GIS API

Design endpoints for:

Household Markers

Heatmaps

Marker Details

Filtering

Coordinate Updates

Export

GeoJSON

KML

KMZ

Map Statistics

Map Layers

Explain usage.

---

# SURVEY API

Design APIs for:

Create Survey

Update Survey

Draft

Submit

Validation

History

Offline Synchronization

GPS

Photo Upload

Voice Notes

Explain every workflow.

---

# DASHBOARD API

Design APIs for:

Summary Cards

Charts

Progress

Statistics

Map Widgets

Recent Activities

Task Status

Problem Distribution

RW Statistics

RT Statistics

---

# REPORT API

Design APIs for:

Generate PDF

Generate Excel

Generate Word

Statistics

Charts

GIS Report

Documentation Export

---

# GOOGLE DRIVE API

Design interaction for:

Upload

Folder Sync

Archive

File Retrieval

Duplicate Prevention

Explain workflow.

---

# GOOGLE CALENDAR API

Design:

Create Event

Update Event

Delete Event

Reminder

Synchronization

---

# ERROR DESIGN

Create standard error format.

Include:

Code

Message

Details

Timestamp

Trace ID

Suggested Action

Validation Errors

Permission Errors

Authentication Errors

Business Errors

Network Errors

---

# RESPONSE FORMAT

Design standard response structure.

Success

Failure

Validation

Pagination

Metadata

Explain consistency rules.

---

# PAGINATION

Design:

Offset

Cursor

Page Number

Recommendation

Explain tradeoffs.

---

# FILTERING

Support:

RT

RW

Category

Status

Date

Surveyor

Keyword

Explain syntax.

---

# SEARCH

Design search strategy.

Global Search

Household Search

Survey Search

Documentation Search

Explain.

---

# SECURITY

Design:

Authentication

Authorization

Rate Limiting

Input Validation

CORS

File Upload Validation

Audit

API Keys

CSRF

OWASP

Explain.

---

# OPENAPI

Generate recommendations for:

OpenAPI 3.1

Swagger

API Documentation

Examples

Schemas

---

# API REVIEW

Review entire API.

Find:

Duplicate endpoints

Poor naming

Missing resources

Missing validations

Security issues

Performance issues

Suggest improvements.

---

# DELIVERABLES

Generate:

API Principles

Domain Overview

Endpoint Catalog

Endpoint Specifications

Authentication Flow

GIS APIs

Survey APIs

Dashboard APIs

Documentation APIs

Google APIs

Response Standards

Error Standards

Pagination Standards

Filtering Standards

Security Standards

OpenAPI Recommendations

API Review

Everything should be implementation-ready.

---

# IMPORTANT

Do NOT write backend code.

Do NOT generate controllers.

Do NOT generate services.

Wait for approval before Security Specification.
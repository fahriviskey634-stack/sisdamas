# ROLE

You are acting as an independent Software Architecture Review Board composed of internationally experienced experts.

The review board consists of:

- Principal Software Architect
- Enterprise Solution Architect
- Principal Product Manager
- Senior UX Researcher
- Senior UI Designer
- Senior Full Stack Engineer
- Principal Database Architect
- Senior GIS Engineer
- DevOps Architect
- Cloud Architect
- Cyber Security Architect
- Quality Assurance Lead
- Site Reliability Engineer
- Technical Writer
- Open Source Maintainer

Your responsibility is to perform a comprehensive design review before any software development begins.

You are NOT allowed to redesign the project unnecessarily.

You are NOT allowed to introduce unnecessary features.

You must preserve the approved MVP.

Your goal is to identify weaknesses, inconsistencies, missing information, technical risks, usability risks, maintainability risks, and architectural problems.

---

# PROJECT CONTEXT

The project is a web-based SISDAMAS Digital Platform developed specifically for one KKN group at:

Dusun 2

Desa Sukahaji

Bandung Barat

Indonesia

The platform supports the complete SISDAMAS workflow:

Cycle 1

Community Meeting

↓

Cycle 2

Household Survey

↓

Cycle 3

Problem Prioritization

↓

Cycle 4

Execution

Monitoring

Evaluation

The application will primarily be used during KKN.

The MVP must remain focused on supporting the KKN team's operational workflow.

Future scalability should be documented separately.

---

# DOCUMENTS TO REVIEW

Review every available document.

Including but not limited to:

Project Foundation

Product Discovery

Solution Architecture

Product Requirements

UX/UI Specification

Technical Architecture

Database Specification

Data Flow

API Specification

Security Architecture

Development Roadmap

Architecture Decision Records

Test Plan

Deployment Guide

User Manual

Implementation Plan

Also review:

AI Instructions

Knowledge Documents

Repository Structure

Naming Consistency

Folder Organization

---

# REVIEW OBJECTIVES

Perform a complete software project audit.

Review the project from:

Business Perspective

User Perspective

Developer Perspective

Architecture Perspective

Infrastructure Perspective

GIS Perspective

Security Perspective

Database Perspective

Testing Perspective

Deployment Perspective

Maintenance Perspective

Long-term Sustainability

---

# CONSISTENCY REVIEW

Verify consistency across every document.

Examples:

PRD vs Database

Database vs API

API vs UX

UX vs Security

Security vs Deployment

Implementation vs Roadmap

User Manual vs Features

Identify every inconsistency.

Explain why.

Recommend corrections.

---

# REQUIREMENTS REVIEW

Review all functional requirements.

Review all non-functional requirements.

Identify:

Missing requirements

Duplicated requirements

Ambiguous requirements

Impossible requirements

Conflicting requirements

Over-engineering

Under-engineering

---

# UX REVIEW

Review:

Navigation

Information Architecture

Mobile Experience

Accessibility

Field Workflow

Survey Workflow

Map Workflow

Dashboard

Forms

Offline Experience

Error Recovery

Provide recommendations.

---

# DATABASE REVIEW

Evaluate:

Normalization

Relationships

Indexes

Constraints

Scalability

Performance

Data Integrity

Ownership

Locking Strategy

Master Data

Survey Data

GIS Data

---

# API REVIEW

Review:

REST consistency

Endpoint naming

Request structures

Response structures

Error handling

Authentication

Authorization

Versioning

Performance

Maintainability

---

# GIS REVIEW

Review:

GPS Collection

Coordinate Accuracy

Marker Management

Filtering

GeoJSON

KML

Offline Maps

Performance

Coordinate Validation

Village Mapping Workflow

---

# SECURITY REVIEW

Review:

Authentication

Authorization

RBAC

Ownership

Locked Data

Input Validation

RLS

File Upload

Google Integration

API Security

Secrets Management

Privacy

OWASP Top 10

---

# PERFORMANCE REVIEW

Evaluate:

Dashboard

Map Rendering

Large Surveys

Image Upload

Database Queries

API Latency

Offline Synchronization

Caching

---

# DEPLOYMENT REVIEW

Review:

Supabase

Vercel

Google Drive

Google Calendar

Monitoring

Logging

Backup

Recovery

Environment Variables

Production Readiness

---

# TESTING REVIEW

Review:

Coverage

Unit Testing

Integration Testing

GIS Testing

Offline Testing

UAT

Field Testing

Regression

Automation

---

# DOCUMENTATION REVIEW

Review:

Completeness

Consistency

Terminology

Naming

Structure

Readability

Maintainability

Implementation Readiness

---

# MVP REVIEW

Verify that the MVP remains focused.

Reject unnecessary features.

Move future ideas into a Future Roadmap.

Ensure the project is achievable within the KKN timeline.

---

# FIELD READINESS REVIEW

Evaluate readiness for:

Cycle 1

Cycle 2

Cycle 3

Cycle 4

Identify operational risks.

Provide mitigation.

---

# AI READINESS REVIEW

Assume Claude Code will generate the software.

Review whether documentation is sufficient.

Identify missing technical details.

Identify ambiguities.

Identify implementation risks.

Recommend improvements.

---

# FINAL SCORECARD

Score every category from 1–10.

Business

UX

Architecture

Database

API

GIS

Security

Testing

Deployment

Documentation

Maintainability

Scalability

Overall Readiness

Explain every score.

---

# FINAL DECISION

Choose ONE.

READY

READY WITH MINOR REVISIONS

READY WITH MAJOR REVISIONS

NOT READY

Explain why.

---

# DELIVERABLES

Generate:

1. Executive Summary

2. Architecture Review

3. UX Review

4. Database Review

5. API Review

6. GIS Review

7. Security Review

8. Testing Review

9. Deployment Review

10. Documentation Review

11. Risk Matrix

12. Missing Items

13. Improvement Recommendations

14. Readiness Scorecard

15. Final Decision

Everything must be written in Markdown.

Provide constructive criticism.

Support every recommendation with clear technical reasoning.

---

# IMPORTANT

Do NOT redesign the approved MVP.

Do NOT introduce enterprise-scale features that are unnecessary for a single KKN group.

Respect all approved architecture decisions.

Focus on improving quality, consistency, maintainability, and implementation readiness.

The final goal is to prepare this project for implementation using Claude Code.
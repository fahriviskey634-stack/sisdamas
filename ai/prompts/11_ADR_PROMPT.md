# ROLE

You are acting as an elite Software Architecture Review Board composed of:

- Chief Software Architect
- Principal Solution Architect
- Principal Software Engineer
- Enterprise Architect
- Cloud Architect
- Database Architect
- GIS Architect
- DevOps Architect
- Security Architect
- Product Architect

You have already completed:

✔ Project Foundation

✔ Product Discovery

✔ System Blueprint

✔ Product Requirements Document

✔ UX Specification

✔ Technical Specification

✔ Database Specification

✔ Data Flow Specification

✔ API Specification

✔ Security Specification

✔ Development Roadmap

Your responsibility is to document every major architecture decision.

---

# OBJECTIVE

Generate a complete collection of Architecture Decision Records (ADR).

Each ADR must explain:

Why a decision was necessary.

What alternatives were considered.

Why one option was selected.

Its consequences.

Its trade-offs.

Its future impact.

Assume this documentation will be read years later by developers who never participated in this project.

Every decision should therefore be self-explanatory.

---

# ADR FORMAT

Every ADR must follow exactly this structure.

ADR Number

Title

Status

Date

Authors

Context

Problem Statement

Decision Drivers

Alternatives Considered

Decision

Advantages

Disadvantages

Trade-offs

Consequences

Rejected Alternatives

Risks

Mitigation

Future Considerations

References

Review Notes

Lessons Learned

---

# REQUIRED ADR LIST

Generate ADRs for at least:

ADR-001

Overall Technology Stack

ADR-002

Frontend Framework

ADR-003

Backend Architecture

ADR-004

Database Platform

ADR-005

Authentication

ADR-006

GIS Technology

ADR-007

Offline Strategy

ADR-008

Google Drive Integration

ADR-009

Google Calendar Integration

ADR-010

Storage Strategy

ADR-011

Deployment Platform

ADR-012

Security Model

ADR-013

MVP Scope

ADR-014

Survey Data Model

ADR-015

Reporting Strategy

ADR-016

PWA Strategy

ADR-017

Household-Centered Data Model

ADR-018

OpenStreetMap vs Google Maps

ADR-019

Photo Storage Strategy

ADR-020

Future Scalability

Suggest additional ADRs if important decisions are identified.

---

# DECISION QUALITY

Every decision should include:

Business Perspective

Technical Perspective

User Perspective

Maintenance Perspective

Operational Perspective

Explain why.

---

# ALTERNATIVE ANALYSIS

Never accept the first solution immediately.

Compare alternatives.

Examples:

Supabase vs Firebase

Leaflet vs Google Maps

PWA vs Android Native

Google Drive vs Supabase Storage

Explain why alternatives were rejected.

---

# CONSISTENCY REVIEW

Review all previous documents.

If any architectural decision conflicts with previous documentation,

identify the conflict.

Resolve it.

Explain the reason.

---

# FUTURE IMPACT

For every ADR evaluate:

Short-term impact

Long-term impact

Migration difficulty

Scalability

Maintainability

Vendor Lock-in

Cost

Learning Curve

Risk

Explain every point.

---

# FINAL ARCHITECTURE REVIEW

Review the architecture as a whole.

Identify:

Weak decisions

Strong decisions

Potential improvements

Technical debt

Missing ADRs

Architecture risks

Recommendations

---

# DELIVERABLES

Generate:

1. ADR Collection

2. Architecture Review

3. Decision Matrix

4. Trade-off Analysis

5. Risk Summary

6. Recommendations

Everything should be written in Markdown.

Each ADR should be independent.

Each ADR should be implementation-ready.

---

# IMPORTANT

Do NOT redesign the project.

Document only approved decisions.

If a decision has not yet been made,

recommend the best option and clearly mark it as "Proposed".
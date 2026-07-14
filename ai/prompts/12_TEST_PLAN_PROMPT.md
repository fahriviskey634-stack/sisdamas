# ROLE

You are acting as an elite Quality Assurance (QA) and Software Testing Team composed of:

- Principal QA Engineer
- Software Test Architect
- Senior Automation Test Engineer
- GIS Quality Assurance Engineer
- Mobile & PWA Testing Specialist
- Backend QA Engineer
- Frontend QA Engineer
- Security Testing Engineer
- Performance Testing Engineer
- User Acceptance Testing (UAT) Coordinator

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
✔ Architecture Decision Records

Never redesign previous documents.

Your responsibility is to create a complete Test Plan for the SISDAMAS Digital Platform.

---

# OBJECTIVE

Create a professional Test Plan that ensures the platform is reliable before it is used during KKN field activities.

The plan should cover:

- Functional testing
- Non-functional testing
- Security testing
- GIS testing
- Offline synchronization testing
- Google integration testing
- Mobile testing
- User Acceptance Testing

The Test Plan must be implementation-ready.

---

# TESTING PRINCIPLES

Explain the testing philosophy.

Include:

Risk-Based Testing

Shift Left Testing

Continuous Testing

Regression Prevention

Test Pyramid

User-Centered Validation

Field Reliability

Explain how each principle applies to this project.

---

# TEST STRATEGY

Describe the overall testing strategy.

Include:

Objectives

Scope

Approach

Test Environment

Entry Criteria

Exit Criteria

Success Criteria

Deliverables

Assumptions

Constraints

---

# TEST LEVELS

Define the testing scope for:

Unit Testing

Integration Testing

System Testing

End-to-End Testing

User Acceptance Testing

Regression Testing

Smoke Testing

Sanity Testing

Accessibility Testing

Compatibility Testing

Explain the purpose of each level.

---

# FUNCTIONAL TESTING

Generate detailed test scenarios for:

Authentication

Dashboard

Survey Module

Household Management

Problem Management

Potential Management

Interactive Map

GIS Filtering

Documentation

Photo Upload

Google Drive Integration

Google Calendar Integration

Reports

Notifications

Settings

For every feature define:

Test ID

Feature

Scenario

Preconditions

Steps

Expected Result

Priority

Severity

Test Type

---

# GIS TESTING

Design test cases for:

GPS Capture

Coordinate Accuracy

Marker Placement

Map Rendering

Marker Filtering

GeoJSON Export

KML Export

Offline Map Behaviour

Map Performance

Invalid Coordinates

Duplicate Coordinates

---

# OFFLINE TESTING

Create testing scenarios for:

No Internet

Weak Signal

Synchronization

Conflict Resolution

Queue Processing

Duplicate Prevention

Photo Synchronization

GPS Synchronization

Unexpected Shutdown

Device Restart

---

# MOBILE TESTING

Assume surveyors use Android smartphones.

Test:

Responsive UI

Touch Interaction

Camera

GPS

Battery Usage

Offline Storage

Network Switching

Screen Rotation

Different Screen Sizes

---

# PERFORMANCE TESTING

Evaluate:

Dashboard Loading

Map Rendering

Large Survey Data

Large Photo Upload

Multiple Concurrent Users

Search Performance

Filtering Performance

Export Performance

Define performance targets.

---

# SECURITY TESTING

Test:

Authentication

Authorization

Session Timeout

Role Permissions

File Upload Validation

SQL Injection

XSS

CSRF

Broken Access Control

API Authorization

Sensitive Data Exposure

Rate Limiting

---

# USABILITY TESTING

Evaluate:

Ease of Survey

Ease of Navigation

Map Usability

Dashboard Clarity

Accessibility

Form Completion Time

Error Messages

Learning Curve

---

# USER ACCEPTANCE TESTING

Prepare UAT scenarios for:

KKN Students

Field Coordinators

Supervising Lecturer (DPL)

Village Officials

Public Visitors

Define:

Objectives

Acceptance Criteria

Expected Outcome

---

# DATA VALIDATION TESTING

Verify:

RT

RW

Dusun

GPS Coordinates

Photos

Survey Answers

Problem Categories

Potential Categories

Task Status

Reports

---

# ERROR HANDLING TESTING

Test:

Invalid Login

Expired Session

GPS Failure

Upload Failure

Network Failure

Server Error

Database Error

Permission Error

Unexpected Input

Duplicate Submission

---

# BROWSER COMPATIBILITY

Test:

Chrome

Microsoft Edge

Firefox

Android Chrome

Safari (basic compatibility)

---

# DEVICE COMPATIBILITY

Assume support for:

Android Phone

Android Tablet

Laptop

Desktop

Minimum Screen Width

Maximum Screen Width

---

# TEST DATA MANAGEMENT

Describe:

Dummy Data

Seed Data

Real Survey Data

Reset Strategy

Privacy Protection

Anonymization

---

# DEFECT MANAGEMENT

Define:

Bug Severity

Bug Priority

Bug Workflow

Bug Report Template

Resolution Criteria

Retesting

Bug Closure

---

# TEST AUTOMATION

Recommend which tests should be automated.

Examples:

Authentication

API

Validation

Regression

Explain which tests should remain manual.

---

# FIELD TESTING

Create a dedicated Field Testing Plan.

Before Siklus 1

Before Siklus 2

Before Siklus 3

Before Siklus 4

For each phase define:

Objectives

Features to Validate

Expected Results

Risks

Checklist

---

# FINAL QUALITY GATE

Before production,

review the entire application.

Verify:

All critical features

Database integrity

API consistency

GIS accuracy

Offline synchronization

Security

Performance

Documentation

Deployment readiness

Generate a Go / No-Go checklist.

---

# DELIVERABLES

Generate:

1. Testing Strategy
2. Test Levels
3. Functional Test Cases
4. GIS Test Cases
5. Offline Test Cases
6. Mobile Test Cases
7. Performance Test Cases
8. Security Test Cases
9. UAT Plan
10. Field Testing Plan
11. Bug Management Process
12. Automation Recommendations
13. Go / No-Go Checklist
14. Final QA Review

Everything should be written in Markdown.

The Test Plan must be ready to guide both manual and automated testing.

---

# IMPORTANT

Do NOT generate test scripts.

Do NOT write Playwright, Cypress, Vitest, Jest, or PHPUnit code.

Focus on planning, strategy, coverage, and execution.

Wait for approval before creating the Deployment & Operations Guide.

# REAL FIELD SIMULATION

Simulate real KKN conditions.

Examples:

- Survey under direct sunlight.
- Weak cellular signal.
- GPS accuracy ±10–20 meters.
- Battery below 20%.
- Multiple surveyors collecting data simultaneously.
- Interrupted synchronization due to network loss.
- Uploading photos with poor connectivity.
- Village meeting with many users opening the dashboard simultaneously.

For each scenario define:

- Expected System Behavior
- Acceptance Criteria
- Potential Risks
- Mitigation Strategy
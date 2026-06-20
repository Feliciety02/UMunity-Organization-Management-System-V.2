# REQUIREMENTS SPECIFICATION

**Project:** UMunity  
**Document Version:** 2.1  
**Date:** December 10, 2025  
**Classification:** CONFIDENTIAL

---

## 1. Functional Requirements

| ID | Description | Priority | Status |
|----|-------------|----------|--------|
| FR-001 | User Registration and Authentication | Critical | Approved |
| FR-002 | Organization Discovery and Search | Critical | Approved |
| FR-003 | Membership Management | Critical | Approved |
| FR-004 | Event Management | High | Approved |
| FR-005 | Compliance and Accreditation | High | Approved |
| FR-006 | Role-Based Dashboards | Critical | Approved |
| FR-007 | Notification System | High | Approved |
| FR-008 | Officer Transition Management | Medium | In Review |
| FR-009 | Post and Announcement Publishing | High | Approved |
| FR-010 | Analytics and Reporting | Medium | In Review |
| FR-011 | Messaging System | Medium | Pending |
| FR-012 | Organization Profile Management | High | Approved |

### FR Details

**FR-001: User Registration and Authentication**
- Acceptance Criteria:
  - Users can register with university email
  - Users can log in with email and password
  - Password reset functionality is available
  - OAuth integration with university SSO

**FR-002: Organization Discovery and Search**
- Acceptance Criteria:
  - Users can browse all accredited organizations
  - Search by organization name and category
  - Filter by type, category, and popularity
  - View organization profiles and details

**FR-003: Membership Management**
- Acceptance Criteria:
  - Users can request to join organizations
  - Leaders can approve or reject membership requests
  - Member roles and permissions are configurable
  - Membership roster is exportable

**FR-004: Event Management**
- Acceptance Criteria:
  - Leaders can create and publish events
  - Students can RSVP to events
  - Event attendance can be tracked
  - Event calendar view is available

---

## 2. Non-Functional Requirements

| ID | Category | Description | Specification |
|----|----------|-------------|---------------|
| NFR-PERF-001 | Performance | Page load time | Initial load within 3 seconds |
| NFR-PERF-002 | Performance | Concurrent users | 500 concurrent users during peak |
| NFR-PERF-003 | Performance | API response time | 500ms for 95% of requests |
| NFR-SEC-001 | Security | Data encryption | TLS 1.3 in transit; AES-256 at rest |
| NFR-SEC-002 | Security | Authentication | MFA for admin accounts |
| NFR-SEC-003 | Security | Authorization | RBAC with least-privilege principle |
| NFR-ACC-001 | Accessibility | WCAG compliance | WCAG 2.1 Level AA standards |
| NFR-REL-001 | Reliability | System uptime | 99.5% during academic semesters |
| NFR-REL-002 | Reliability | Data backup | Daily backups with 30-day retention |
| NFR-SCA-001 | Scalability | Horizontal scaling | Containerized deployment |
| NFR-USA-001 | Usability | Mobile responsiveness | 320px to 2560px viewports |

---

## 3. User Stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| US-001 | Student | browse all student organizations | find orgs matching my interests |
| US-002 | Student | see upcoming events from followed orgs | plan my schedule |
| US-003 | Organization Leader | track membership and manage roster | grow and manage my org |
| US-004 | Organization Leader | create events and track attendance | measure engagement |
| US-005 | Adviser | review org activities and compliance | ensure requirements are met |
| US-006 | OSA Administrator | manage accreditation workflows | ensure proper accreditation |
| US-007 | Organization Leader | hand over to new officers | smooth transitions |
| US-008 | Student | receive notifications | never miss updates |
| US-009 | Administrator | view analytics | data-driven decisions |
| US-010 | Organization Leader | submit compliance documents | meet requirements efficiently |

---

## 4. Business Rules

| ID | Rule | Description |
|----|------|-------------|
| BR-001 | University Email Required | Only users with a valid @umindanao.edu.ph email can register |
| BR-002 | Organization Accreditation | Orgs must be accredited by OSA before listing on the platform |
| BR-003 | Officer Term Limits | Officers serve a maximum of one academic year per term |
| BR-004 | Event Approval Threshold | Events with 50+ attendees require OSA approval |
| BR-005 | Compliance Deadlines | Reports due within 15 days of semester end |
| BR-006 | Membership Limit | Students can be active in up to 3 orgs simultaneously |

---

## 5. Assumptions

- University IT department will provide SSO integration support
- Student organizations will assign at least one leader to manage their profile
- Internet access is available to the majority of the student body
- Existing organization data can be exported from current systems

---

## 6. Constraints

- Development timeline is fixed to the academic calendar
- Budget is fixed with no contingency for scope changes
- System must comply with university data privacy policies
- Legacy data formats may vary across different organizations

---

## 7. Acceptance Criteria

- All functional requirements must pass QA validation before release
- System must handle 500 concurrent users without degradation
- All user roles and permissions must be enforced at API and UI level
- Data export functionality must produce valid CSV and PDF formats
- Notification delivery must achieve 99% success rate within 5 minutes
- Mobile responsiveness must pass testing on iOS and Android devices
- All forms must validate input and provide clear error messages
- Search functionality must return results within 2 seconds

---

*End of Document — CONFIDENTIAL*

# QUALITY ASSURANCE REPORT

**Project:** UMunity  
**Document Version:** 2.0  
**Date:** March 15, 2026  
**Classification:** CONFIDENTIAL

---

## 1. QA Strategy

The QA strategy follows a risk-based testing approach, prioritizing critical business flows including user authentication, organization management, and event workflows. Testing is conducted across four phases:

1. **Unit Testing** — Individual components and utilities
2. **Integration Testing** — API endpoints and data flows
3. **End-to-End Testing** — Critical user journeys
4. **User Acceptance Testing** — Real stakeholder validation

Automated testing is implemented for regression coverage, while exploratory testing validates edge cases and usability. Performance testing uses k6 for load testing and Lighthouse for frontend performance auditing. Security testing includes vulnerability scanning and penetration testing.

---

## 2. Test Scope

| # | Area |
|---|------|
| 1 | User authentication and authorization flows |
| 2 | Organization creation, profile management, membership workflows |
| 3 | Event creation, RSVP, and attendance tracking |
| 4 | Compliance submission and accreditation tracking |
| 5 | Role-based dashboard rendering and data access |
| 6 | Notification delivery and preferences |
| 7 | Post creation, approval workflow, and publishing |
| 8 | Officer transition and handover processes |
| 9 | Search and discovery functionality |
| 10 | Data export and report generation |

---

## 3. Test Plan

Testing is executed across three environments:

| Environment | Purpose |
|-------------|---------|
| Development | Unit and integration testing |
| Staging | E2E and performance testing |
| Production | Smoke and sanity testing |

Each sprint includes dedicated QA time for feature testing and regression testing. A test management dashboard tracks execution progress, defect density, and coverage metrics. UAT is conducted with a representative group of students, organization leaders, and OSA staff over a 2-week period.

---

## 4. QA Metrics Dashboard

| Metric | Value |
|--------|-------|
| Total Test Cases Executed | 20 |
| Passed | 17 |
| Failed | 1 |
| Blocked | 0 |
| Defects Identified | 7 |
| Defects Resolved | 4 |
| Critical Issues Closed | 1 |
| UAT Pass Rate | 83% Passed, 17% Passed with Issues |

**Pass Rate: 85%**

---

## 5. Test Cases

| ID | Scenario | Expected Result | Actual Result | Status |
|----|----------|----------------|---------------|--------|
| TC-001 | Registration with valid university email | Account created; verification email sent | Account created; email delivered within 30s | PASSED |
| TC-002 | Registration with non-university email | Rejected with clear error message | Error: "Please use your @umindanao.edu.ph email" | PASSED |
| TC-003 | Password reset flow | Reset email sent; user can set new password | Reset email delivered; password updated successfully | PASSED |
| TC-004 | Browse organizations with filters | Correct filtered results displayed | Filters work correctly; results < 1 second | PASSED |
| TC-005 | Join organization request | Request submitted; leader notified | Submitted successfully; leader received notification | PASSED |
| TC-006 | Event creation with all fields | Event created and visible in calendar | Created; appears in calendar view | PASSED |
| TC-007 | RSVP to event with waitlist | Added to attendee list or waitlist if full | RSVP successful; waitlist works correctly | PASSED |
| TC-008 | Compliance document submission | Uploaded; status updated to Pending Review | Upload successful; status updated correctly | PASSED |
| TC-009 | Role-based access control — Student | Student sees only authorized features | Access controls correctly enforced | PASSED |
| TC-010 | Role-based access control — Admin | Admin sees all management features | Full admin access granted correctly | PASSED |
| TC-011 | Notification delivery on event update | Notification sent to all RSVP'd users | Notifications delivered within 2 minutes | PASSED |
| TC-012 | Post approval workflow | Created; sent for approval; published after approval | Workflow functions correctly | PASSED |
| TC-013 | Officer transition initiation | Transition created; tasks assigned to new officer | Transition created; tasks visible | PASSED |
| TC-014 | Data export to PDF | Valid PDF generated with correct data | PDF generated; formatting needs minor adjustment | PASSED |
| TC-015 | Load test — 500 concurrent users | System responds within 3 seconds | Average 1.8s; max 3.2s | PASSED |
| TC-016 | Mobile responsiveness — 375px | List renders correctly on small viewport | Layout breaks below 360px | FAILED |
| TC-017 | Search organizations by name | Relevant results within 2 seconds | Results in < 1 second; accurate | PASSED |
| TC-018 | Event calendar monthly view | Events displayed correctly by date | Calendar renders; events positioned correctly | PASSED |
| TC-019 | Profile photo upload | Uploaded and cropped; displayed in profile | Upload works; cropping UI needs improvement | PASSED |
| TC-020 | Messaging between users | Messages delivered and displayed in conversation | Real-time update working | PASSED |

---

## 6. Defect Tracking

| Bug ID | Description | Severity | Priority | Status | Resolution |
|--------|-------------|----------|----------|--------|------------|
| BUG-001 | Organization list layout breaks on screens < 360px | Major | P2 | In Progress | CSS grid breakpoint adjustment in progress |
| BUG-002 | Password reset email delayed beyond 5 minutes | Minor | P3 | Open | Investigating email queue timing |
| BUG-003 | Event RSVP count not updating immediately | Major | P2 | Resolved | Cache invalidation fixed; deployed to staging |
| BUG-004 | Compliance form file upload limit 5MB (needs 10MB) | Minor | P3 | Resolved | Upload limit increased to 10MB and deployed |
| BUG-005 | Notification preferences not saving for new users | Critical | P1 | Resolved | Default preferences initialization added; deployed |
| BUG-006 | Admin analytics chart dates not displaying correctly | Minor | P4 | Closed | Date formatting fixed using date-fns |
| BUG-007 | Search results include inactive organizations | Major | P2 | Open | Query filter for active status being added |

### Severity Classification

| Severity | Count |
|----------|-------|
| Critical | 1 |
| Major | 3 |
| Minor | 3 |
| Trivial | 0 |

---

## 7. User Acceptance Testing

| Participant | Role | Feedback | Result |
|-------------|------|----------|--------|
| Student Representative — Engineering | End User | The platform is intuitive and easy to navigate. I like the organization discovery feature. Would love to see a dark mode option. | PASSED |
| Organization Leader — Student Government | Power User | Event management is straightforward. The attendance tracking feature is very useful. The compliance submission process could be simplified. | PASSED WITH ISSUES |
| OSA Coordinator | Administrator | The compliance dashboard provides excellent visibility into organization status. Accreditation workflow is much more efficient than the current manual process. | PASSED |
| Student Representative — Arts & Sciences | End User | Found it easy to find organizations matching my interests. The event calendar helps me plan my schedule. | PASSED |
| Organization Adviser | Adviser | The adviser dashboard gives me a good overview of my assigned organizations. Approval workflows are clear and easy to use. | PASSED |
| IT Department Representative | Technical Reviewer | System performance is good. Security measures are appropriate. Documentation is comprehensive. | PASSED |

---

## 8. Regression Testing

All resolved defects underwent regression testing to verify fixes and ensure no side effects:

- BUG-003 (RSVP count): Retested — count updates immediately after fix
- BUG-004 (Upload limit): Retested — 10MB upload confirmed working
- BUG-005 (Notification prefs): Retested — preferences persist across sessions
- BUG-006 (Chart dates): Retested — dates display correctly

No regression issues found.

---

## 9. Verification & Validation Activities

### Verification (Are we building the product right?)
- Code reviews conducted for all pull requests
- Static analysis integrated into CI/CD pipeline
- Unit test coverage maintained above 80%
- API contract testing for all endpoints

### Validation (Are we building the right product?)
- Stakeholder demos at end of each sprint
- UAT with real users from each role category
- Feedback incorporated into sprint backlog
- Acceptance criteria reviewed before each release

---

## 10. Findings

1. **Authentication flow** is robust and handles edge cases correctly
2. **Organization management** workflows are complete and functional
3. **Event management** requires minor UI refinement for calendar views
4. **Mobile responsiveness** needs improvement for devices below 360px width
5. **Notification system** performs reliably with < 2 minute delivery time
6. **Performance** meets targets with average response time under 2 seconds

---

## 11. Recommendations

1. Address mobile responsiveness for small viewports (< 360px) as a priority
2. Implement automated UI testing for cross-browser compatibility
3. Add performance monitoring alerts for proactive issue detection
4. Enhance test automation coverage for regression testing
5. Conduct accessibility audit for WCAG 2.1 AA compliance

---

## 12. Final QA Assessment

The UMunity platform has passed quality assurance criteria for release. Core functionality is stable, performance meets targets, and critical defects have been resolved. The single failed test case (mobile responsiveness) is documented with an active fix in progress. UAT results indicate strong stakeholder satisfaction with the platform's functionality and usability.

**QA Verdict: Conditional Pass** — Release approved pending resolution of BUG-001 (mobile responsiveness) within the next sprint cycle.

---

*End of Document — CONFIDENTIAL*

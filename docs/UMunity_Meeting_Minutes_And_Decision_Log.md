# MEETING MINUTES & DECISION LOG

**Project:** UMunity  
**Document Version:** 1.0  
**Date:** March 1, 2026  
**Classification:** CONFIDENTIAL

---

## Meeting #1 — November 16, 2025

**Participants:** Project Manager, QA Lead, Lead Developer, UI/UX Designer, OSA Representative

### Agenda

1. Project kickoff and team introductions
2. Review of approved project charter
3. High-level requirements discussion
4. Communication channels definition
5. Sprint cadence and delivery approach

### Discussion Summary

The team reviewed the approved project charter and aligned on key objectives. The OSA representative provided initial requirements for the compliance module, emphasizing the need for automated accreditation tracking and deadline management. The team agreed on a 2-week sprint cycle with bi-weekly stakeholder demos. Communication channels were established: Slack for daily updates and email for formal communications and approvals.

### Decisions Made

| Decision | Rationale | Made By |
|----------|-----------|---------|
| Sprint cycle: 2 weeks with Friday demos | Allows adequate development time while maintaining stakeholder visibility | Project Manager |
| React + TypeScript as primary tech stack | Team expertise and university preference for modern web technologies | Lead Developer |
| MVP scope: core org management + events | Ensures timely delivery of highest-value functionality | Team Consensus |

### Action Items

| Item | Responsible | Due Date |
|------|-------------|----------|
| Schedule individual stakeholder interviews | Project Manager | Nov 20, 2025 |
| Set up project repository and CI/CD pipeline | Lead Developer | Nov 18, 2025 |
| Prepare initial wireframes for core pages | UI/UX Designer | Nov 25, 2025 |
| Distribute project charter to all stakeholders | Project Manager | Nov 17, 2025 |

### Outcome

Successful kickoff with clear direction and assigned action items. All team members aligned on project goals and timeline.

---

## Meeting #2 — December 1, 2025

**Participants:** Project Manager, QA Lead, Lead Developer, UI/UX Designer

### Agenda

1. Review design prototypes
2. Discuss technical architecture
3. Review requirements progress
4. Plan Sprint 1 scope

### Discussion Summary

UI/UX Designer presented wireframes for the student dashboard, organization profiles, and event pages. Feedback was positive with minor adjustments needed for the organization discovery flow. Lead Developer proposed the system architecture using TanStack Start with PostgreSQL. The team agreed on Sprint 1 scope focusing on authentication and basic organization management functionality.

### Decisions Made

| Decision | Rationale | Made By |
|----------|-----------|---------|
| TanStack Start for full-stack framework | Best fit for React SSR with type-safe routing | Lead Developer |
| PostgreSQL with Prisma ORM | Robust relational data model for complex org relationships | Lead Developer |
| Design system follows university brand guidelines | Consistent branding across all university digital properties | UI/UX Designer |

### Action Items

| Item | Responsible | Due Date |
|------|-------------|----------|
| Update wireframes based on feedback and finalize | UI/UX Designer | Dec 5, 2025 |
| Finalize database schema for user and organization models | Lead Developer | Dec 4, 2025 |
| Prepare test strategy document for review | QA Lead | Dec 6, 2025 |

### Outcome

Design direction approved. Architecture decisions finalized. Sprint 1 scope defined and ready for development.

---

## Meeting #3 — January 15, 2026

**Participants:** Project Manager, QA Lead, Lead Developer, OSA Representative

### Agenda

1. Sprint 1 demo (Auth & Organizations)
2. Review compliance requirements
3. Discuss testing approach
4. Plan Sprint 2 (Events & Notifications)

### Discussion Summary

Demonstrated working authentication flow with university email registration and login. Organization profile creation and membership management were functional. OSA Representative tested the flow and provided specific feedback on compliance form requirements. QA Lead presented the test strategy with emphasis on automated testing for critical business paths. Sprint 2 planning focused on event management and the notification system.

### Decisions Made

| Decision | Rationale | Made By |
|----------|-----------|---------|
| Automated testing prioritized for critical business flows | Ensures reliability of core functionality | QA Lead |
| Event approval workflow requires adviser sign-off | Adds oversight without creating bottlenecks | OSA Representative |

### Action Items

| Item | Responsible | Due Date |
|------|-------------|----------|
| Add organization category filtering to search | Frontend Developer | Jan 20, 2026 |
| Begin drafting compliance module requirements | QA Lead | Jan 22, 2026 |
| Set up automated test suite for auth flows | QA Lead | Jan 18, 2026 |
| Provide sample compliance forms from OSA | OSA Representative | Jan 20, 2026 |

### Outcome

Sprint 1 successfully completed. Stakeholder feedback incorporated. Sprint 2 clearly scoped and ready to begin.

---

## Decision Log Summary

| # | Date | Decision | Impact |
|---|------|----------|--------|
| 1 | Nov 16 | 2-week sprint cycle with Friday demos | Established project cadence |
| 2 | Nov 16 | React + TypeScript tech stack | Defined technology foundation |
| 3 | Nov 16 | MVP scope: org management + events | Focused delivery timeline |
| 4 | Dec 1 | TanStack Start framework | Full-stack architecture decision |
| 5 | Dec 1 | PostgreSQL with Prisma | Database technology selection |
| 6 | Jan 15 | Automated testing for critical paths | Quality assurance strategy |
| 7 | Jan 15 | Adviser sign-off for event approval | Governance workflow decision |


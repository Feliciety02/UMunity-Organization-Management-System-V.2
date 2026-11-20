<p align="center">
  <img src="docs/readme/banner.svg" width="1200" alt="UMunity logomark and name, with a network illustration linking UMunity to eight student organizations, each shown by its category icon">
</p>

<h1 align="center">UMunity</h1>

<p align="center">One platform for every student organization at the University of Mindanao. Students discover and join organizations, leaders run events and posts, and advisers and the Office of Student Affairs review each step in one place.</p>

<p align="center"><code>Organization Management System V.2</code> &nbsp; <code>React 19 + TanStack Start</code> &nbsp; <code>Tailwind CSS 4</code> &nbsp; <code>Turso / SQLite</code></p>

<p align="center">
  <a href="#run-locally"><img src="docs/readme/run-button.svg" width="216" alt="Run locally"></a>
  <br>
  <sub>Development needs no accounts: the app creates a local SQLite database and seeds demo users on first run.</sub>
</p>

<p align="center">
  <a href="#at-a-glance"><strong>At a glance</strong></a> &nbsp;·&nbsp;
  <a href="#roles"><strong>Roles</strong></a> &nbsp;·&nbsp;
  <a href="#screenshots-by-role"><strong>Screenshots</strong></a> &nbsp;·&nbsp;
  <a href="#how-it-works"><strong>How it works</strong></a> &nbsp;·&nbsp;
  <a href="#run-locally"><strong>Run locally</strong></a> &nbsp;·&nbsp;
  <a href="#database"><strong>Database</strong></a> &nbsp;·&nbsp;
  <a href="#explore-the-repository"><strong>Explore the repository</strong></a>
</p>

## At a glance

<table>
  <tr>
    <td align="center" width="25%"><strong>01 · Discover</strong><br><sub>Browse recognized organizations by interest, mission, and campus culture</sub></td>
    <td align="center" width="25%"><strong>02 · Participate</strong><br><sub>Join events, RSVP quickly, and stay updated</sub></td>
    <td align="center" width="25%"><strong>03 · Connect</strong><br><sub>Follow communities, announcements, and messages</sub></td>
    <td align="center" width="25%"><strong>04 · Lead</strong><br><sub>Manage members, publish updates, and run your organization</sub></td>
  </tr>
</table>

## Roles

Each role signs in to its own workspace. In development, the sign-in page lists one demo account per role.

| Role | Workspace | What they do |
| --- | --- | --- |
| **Student** | `/student` | Home feed, explore and join organizations, events and RSVPs, saved items, messages, and organization finances |
| **Organization leader** | `/leader` | Events and event workflows, requirements, attendance, posts, members and join requests, finance, accreditation, and officer transitions |
| **Adviser** | `/adviser` | First review of event workflows, posts, requirements, accreditation, and officer transitions; analytics and member activity |
| **OSA compliance officer** (`admin2`) | `/admin2` | Monitoring, Review Center, compliance, requirements, finance, and post publishing |
| **Director of Student Affairs** (`admin1`) | `/admin1` | Final authority on accreditation, event workflows, and officer transitions; organizations, finance, and governance |
| **System administrator** (`admin`) | `/admin` | Users, organizations, events, announcements, reported posts and comments, reports, and activity logs |

## Screenshots by role

Captured from the seeded local demo at 1440 × 900. Select any image to open the full-size screenshot. The data shown here is illustrative.

<details>
<summary>Sign-in screen and demo role shortcuts</summary>

[![UMunity sign-in screen with demo accounts](docs/readme/screenshots/sign-in.png)](docs/readme/screenshots/sign-in.png)

</details>

### Role dashboards

| Student | Organization leader | Adviser |
| --- | --- | --- |
| [![Student dashboard](docs/readme/screenshots/student-dashboard.png)](docs/readme/screenshots/student-dashboard.png) | [![Organization leader dashboard](docs/readme/screenshots/leader-dashboard.png)](docs/readme/screenshots/leader-dashboard.png) | [![Adviser dashboard](docs/readme/screenshots/adviser-dashboard.png)](docs/readme/screenshots/adviser-dashboard.png) |

| OSA compliance officer (Admin 2) | Director of Student Affairs (Admin 1) | System administrator |
| --- | --- | --- |
| [![OSA compliance officer (Admin 2) dashboard](docs/readme/screenshots/admin2-dashboard.png)](docs/readme/screenshots/admin2-dashboard.png) | [![Director of Student Affairs (Admin 1) dashboard](docs/readme/screenshots/admin1-dashboard.png)](docs/readme/screenshots/admin1-dashboard.png) | [![System administrator dashboard](docs/readme/screenshots/admin-dashboard.png)](docs/readme/screenshots/admin-dashboard.png) |

### Key screens

<details>
<summary><strong>Student</strong> — Discover, join, RSVP, save posts and message organizations.</summary>

| Screen | Screen |
| --- | --- |
| [![Student: Explore organizations](docs/readme/screenshots/student-explore.png)](docs/readme/screenshots/student-explore.png)<br><sub>Explore organizations</sub> | [![Student: My organizations](docs/readme/screenshots/student-my-orgs.png)](docs/readme/screenshots/student-my-orgs.png)<br><sub>My organizations</sub> |
| [![Student: Events and RSVPs](docs/readme/screenshots/student-events.png)](docs/readme/screenshots/student-events.png)<br><sub>Events and RSVPs</sub> | [![Student: Saved posts](docs/readme/screenshots/student-saved.png)](docs/readme/screenshots/student-saved.png)<br><sub>Saved posts</sub> |
| [![Student: Messages](docs/readme/screenshots/student-messages.png)](docs/readme/screenshots/student-messages.png)<br><sub>Messages</sub> | [![Student: Organization finances](docs/readme/screenshots/student-finance.png)](docs/readme/screenshots/student-finance.png)<br><sub>Organization finances</sub> |

</details>

<details>
<summary><strong>Organization leader</strong> — Plan events, publish posts, manage members and maintain accreditation.</summary>

| Screen | Screen |
| --- | --- |
| [![Organization leader: Revision center](docs/readme/screenshots/leader-revisions.png)](docs/readme/screenshots/leader-revisions.png)<br><sub>Revision center</sub> | [![Organization leader: Manage events](docs/readme/screenshots/leader-manage-events.png)](docs/readme/screenshots/leader-manage-events.png)<br><sub>Manage events</sub> |
| [![Organization leader: Create an event workflow](docs/readme/screenshots/leader-create-event.png)](docs/readme/screenshots/leader-create-event.png)<br><sub>Create an event workflow</sub> | [![Organization leader: Event workflows](docs/readme/screenshots/leader-workflows.png)](docs/readme/screenshots/leader-workflows.png)<br><sub>Event workflows</sub> |
| [![Organization leader: Event workflow detail](docs/readme/screenshots/leader-workflow-detail.png)](docs/readme/screenshots/leader-workflow-detail.png)<br><sub>Event workflow detail</sub> | [![Organization leader: Event requirements](docs/readme/screenshots/leader-requirements.png)](docs/readme/screenshots/leader-requirements.png)<br><sub>Event requirements</sub> |
| [![Organization leader: Attendance report](docs/readme/screenshots/leader-attendance.png)](docs/readme/screenshots/leader-attendance.png)<br><sub>Attendance report</sub> | [![Organization leader: Create post](docs/readme/screenshots/leader-create-post.png)](docs/readme/screenshots/leader-create-post.png)<br><sub>Create post</sub> |
| [![Organization leader: Manage posts](docs/readme/screenshots/leader-posts.png)](docs/readme/screenshots/leader-posts.png)<br><sub>Manage posts</sub> | [![Organization leader: Edit organization](docs/readme/screenshots/leader-organization.png)](docs/readme/screenshots/leader-organization.png)<br><sub>Edit organization</sub> |
| [![Organization leader: Members](docs/readme/screenshots/leader-members.png)](docs/readme/screenshots/leader-members.png)<br><sub>Members</sub> | [![Organization leader: Membership requests](docs/readme/screenshots/leader-requests.png)](docs/readme/screenshots/leader-requests.png)<br><sub>Membership requests</sub> |
| [![Organization leader: Finance ledger](docs/readme/screenshots/leader-finance.png)](docs/readme/screenshots/leader-finance.png)<br><sub>Finance ledger</sub> | [![Organization leader: Accreditation](docs/readme/screenshots/leader-compliance.png)](docs/readme/screenshots/leader-compliance.png)<br><sub>Accreditation</sub> |
| [![Organization leader: Accreditation detail](docs/readme/screenshots/leader-accreditation-detail.png)](docs/readme/screenshots/leader-accreditation-detail.png)<br><sub>Accreditation detail</sub> | [![Organization leader: Officer transition](docs/readme/screenshots/leader-officer-transition.png)](docs/readme/screenshots/leader-officer-transition.png)<br><sub>Officer transition</sub> |

</details>

<details>
<summary><strong>Adviser</strong> — Review submissions, guide revisions and monitor organization activity.</summary>

| Screen | Screen |
| --- | --- |
| [![Adviser: Review center](docs/readme/screenshots/adviser-review-center.png)](docs/readme/screenshots/adviser-review-center.png)<br><sub>Review center</sub> | [![Adviser: Event workflow detail](docs/readme/screenshots/adviser-workflow-detail.png)](docs/readme/screenshots/adviser-workflow-detail.png)<br><sub>Event workflow detail</sub> |
| [![Adviser: Post approval queue](docs/readme/screenshots/adviser-posts.png)](docs/readme/screenshots/adviser-posts.png)<br><sub>Post approval queue</sub> | [![Adviser: Post review detail](docs/readme/screenshots/adviser-post-detail.png)](docs/readme/screenshots/adviser-post-detail.png)<br><sub>Post review detail</sub> |
| [![Adviser: Requirements review](docs/readme/screenshots/adviser-requirements.png)](docs/readme/screenshots/adviser-requirements.png)<br><sub>Requirements review</sub> | [![Adviser: Accreditation review](docs/readme/screenshots/adviser-compliance.png)](docs/readme/screenshots/adviser-compliance.png)<br><sub>Accreditation review</sub> |
| [![Adviser: Accreditation detail](docs/readme/screenshots/adviser-accreditation-detail.png)](docs/readme/screenshots/adviser-accreditation-detail.png)<br><sub>Accreditation detail</sub> | [![Adviser: Officer transition detail](docs/readme/screenshots/adviser-transition-detail.png)](docs/readme/screenshots/adviser-transition-detail.png)<br><sub>Officer transition detail</sub> |
| [![Adviser: Finance ledger](docs/readme/screenshots/adviser-finance.png)](docs/readme/screenshots/adviser-finance.png)<br><sub>Finance ledger</sub> | [![Adviser: Analytics](docs/readme/screenshots/adviser-analytics.png)](docs/readme/screenshots/adviser-analytics.png)<br><sub>Analytics</sub> |
| [![Adviser: Member activity](docs/readme/screenshots/adviser-members.png)](docs/readme/screenshots/adviser-members.png)<br><sub>Member activity</sub> |  |

</details>

<details>
<summary><strong>OSA compliance officer (Admin 2)</strong> — Monitor compliance, perform secondary review and publish approved posts.</summary>

| Screen | Screen |
| --- | --- |
| [![OSA compliance officer (Admin 2): Monitoring](docs/readme/screenshots/admin2-monitoring.png)](docs/readme/screenshots/admin2-monitoring.png)<br><sub>Monitoring</sub> | [![OSA compliance officer (Admin 2): Review center](docs/readme/screenshots/admin2-review-center.png)](docs/readme/screenshots/admin2-review-center.png)<br><sub>Review center</sub> |
| [![OSA compliance officer (Admin 2): Event workflow detail](docs/readme/screenshots/admin2-workflow-detail.png)](docs/readme/screenshots/admin2-workflow-detail.png)<br><sub>Event workflow detail</sub> | [![OSA compliance officer (Admin 2): Compliance overview](docs/readme/screenshots/admin2-compliance.png)](docs/readme/screenshots/admin2-compliance.png)<br><sub>Compliance overview</sub> |
| [![OSA compliance officer (Admin 2): Accreditation detail](docs/readme/screenshots/admin2-accreditation-detail.png)](docs/readme/screenshots/admin2-accreditation-detail.png)<br><sub>Accreditation detail</sub> | [![OSA compliance officer (Admin 2): Requirements compliance](docs/readme/screenshots/admin2-requirements.png)](docs/readme/screenshots/admin2-requirements.png)<br><sub>Requirements compliance</sub> |
| [![OSA compliance officer (Admin 2): Post publishing queue](docs/readme/screenshots/admin2-posts.png)](docs/readme/screenshots/admin2-posts.png)<br><sub>Post publishing queue</sub> | [![OSA compliance officer (Admin 2): Post publishing detail](docs/readme/screenshots/admin2-post-detail.png)](docs/readme/screenshots/admin2-post-detail.png)<br><sub>Post publishing detail</sub> |
| [![OSA compliance officer (Admin 2): Finance ledger](docs/readme/screenshots/admin2-finance.png)](docs/readme/screenshots/admin2-finance.png)<br><sub>Finance ledger</sub> |  |

</details>

<details>
<summary><strong>Director of Student Affairs (Admin 1)</strong> — Make final decisions on workflows, accreditation and officer transitions.</summary>

| Screen | Screen |
| --- | --- |
| [![Director of Student Affairs (Admin 1): Final authority](docs/readme/screenshots/admin1-authority.png)](docs/readme/screenshots/admin1-authority.png)<br><sub>Final authority</sub> | [![Director of Student Affairs (Admin 1): Event workflow decision](docs/readme/screenshots/admin1-workflow-detail.png)](docs/readme/screenshots/admin1-workflow-detail.png)<br><sub>Event workflow decision</sub> |
| [![Director of Student Affairs (Admin 1): Organization registry](docs/readme/screenshots/admin1-organizations.png)](docs/readme/screenshots/admin1-organizations.png)<br><sub>Organization registry</sub> | [![Director of Student Affairs (Admin 1): Accreditation queue](docs/readme/screenshots/admin1-accreditation.png)](docs/readme/screenshots/admin1-accreditation.png)<br><sub>Accreditation queue</sub> |
| [![Director of Student Affairs (Admin 1): Accreditation decision](docs/readme/screenshots/admin1-accreditation-detail.png)](docs/readme/screenshots/admin1-accreditation-detail.png)<br><sub>Accreditation decision</sub> | [![Director of Student Affairs (Admin 1): Requirements approval](docs/readme/screenshots/admin1-requirements.png)](docs/readme/screenshots/admin1-requirements.png)<br><sub>Requirements approval</sub> |
| [![Director of Student Affairs (Admin 1): Officer transitions](docs/readme/screenshots/admin1-transitions.png)](docs/readme/screenshots/admin1-transitions.png)<br><sub>Officer transitions</sub> | [![Director of Student Affairs (Admin 1): Officer transition detail](docs/readme/screenshots/admin1-transition-detail.png)](docs/readme/screenshots/admin1-transition-detail.png)<br><sub>Officer transition detail</sub> |
| [![Director of Student Affairs (Admin 1): Governance records](docs/readme/screenshots/admin1-governance.png)](docs/readme/screenshots/admin1-governance.png)<br><sub>Governance records</sub> | [![Director of Student Affairs (Admin 1): Finance ledger](docs/readme/screenshots/admin1-finance.png)](docs/readme/screenshots/admin1-finance.png)<br><sub>Finance ledger</sub> |

</details>

<details>
<summary><strong>System administrator</strong> — Manage platform records, moderation, reporting and activity logs.</summary>

| Screen | Screen |
| --- | --- |
| [![System administrator: Analytics](docs/readme/screenshots/admin-analytics.png)](docs/readme/screenshots/admin-analytics.png)<br><sub>Analytics</sub> | [![System administrator: Reports](docs/readme/screenshots/admin-reports.png)](docs/readme/screenshots/admin-reports.png)<br><sub>Reports</sub> |
| [![System administrator: Users](docs/readme/screenshots/admin-users.png)](docs/readme/screenshots/admin-users.png)<br><sub>Users</sub> | [![System administrator: Organizations](docs/readme/screenshots/admin-organizations.png)](docs/readme/screenshots/admin-organizations.png)<br><sub>Organizations</sub> |
| [![System administrator: Events](docs/readme/screenshots/admin-events.png)](docs/readme/screenshots/admin-events.png)<br><sub>Events</sub> | [![System administrator: Announcements](docs/readme/screenshots/admin-announcements.png)](docs/readme/screenshots/admin-announcements.png)<br><sub>Announcements</sub> |
| [![System administrator: Reported posts](docs/readme/screenshots/admin-reported-posts.png)](docs/readme/screenshots/admin-reported-posts.png)<br><sub>Reported posts</sub> | [![System administrator: Reported comments](docs/readme/screenshots/admin-reported-comments.png)](docs/readme/screenshots/admin-reported-comments.png)<br><sub>Reported comments</sub> |
| [![System administrator: Activity logs](docs/readme/screenshots/admin-logs.png)](docs/readme/screenshots/admin-logs.png)<br><sub>Activity logs</sub> |  |

</details>

## How it works

Leaders submit work; reviewers approve it in order. The server checks every save against the review rules in [src/lib/review-rules.ts](src/lib/review-rules.ts) and refuses a step the signed-in role may not take.

```mermaid
flowchart LR
    L["Organization leader<br/>Submits"] --> A["Adviser<br/>First review"]
    A --> O["OSA compliance (admin2)<br/>Compliance review"]
    O --> D["Director (admin1)<br/>Final approval"]
    A -.->|Officer transitions| D
    O -.->|Posts| P["Published"]
```

| Item | Review chain |
| --- | --- |
| Event workflows and accreditation | Adviser → OSA compliance → Director → approved (events also have a post-event closeout) |
| Officer transitions | Adviser → Director → completed |
| Organization posts | Adviser → OSA compliance → published |

## Run locally

You need **Node.js** and npm.

```powershell
npm install
npm run dev
```

Open **http://localhost:8080** (or the port Vite prints) and sign in with one of the demo accounts listed on the sign-in page.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run the automated tests (Vitest) |
| `npm run lint` | Check the code with ESLint |
| `npm run build` | Build for production |

## Database

Accounts, sessions, and app data are stored in a free [Turso](https://turso.tech) database. Development needs no setup: the first request creates `local.db` (SQLite), builds the tables, and seeds the demo accounts. Delete `local.db` to start over.

To deploy, set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `APP_URL`, and (for password-reset email) `RESEND_API_KEY` and `RESET_EMAIL_FROM`; see [.env.example](.env.example). Demo accounts are disabled in production. See [docs/DATABASE.md](docs/DATABASE.md) for setup and how it works.

## Explore the repository

| Area | Start here | What you will find |
| --- | --- | --- |
| Pages | [src/routes/](src/routes/) | Public pages and one route group per role |
| Components | [src/components/](src/components/) | Dashboard layout, events, finance, workflows, social feed, and shared UI |
| Server and data | [src/lib/core.server.ts](src/lib/core.server.ts) · [src/lib/db.server.ts](src/lib/db.server.ts) | Sessions, database access, and review-rule enforcement |
| Workflows | [src/lib/workflows.ts](src/lib/workflows.ts) · [src/lib/review-rules.ts](src/lib/review-rules.ts) | Event proposals, closeouts, officer transitions, and approval chains |
| Tests | [src/lib/*.test.ts](src/lib/) | Core server, finance, and synced-storage tests |
| Project documents | [docs/](docs/) | Charter, requirements, WBS, timeline, risk register, QA, and closure report |

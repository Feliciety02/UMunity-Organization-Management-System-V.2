const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.join(__dirname, "..", "docs");

const COLORS = {
  maroon: "#7A0019",
  gold: "#F4B000",
  dark: "#1E1B16",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  white: "#FFFFFF",
  green: "#059669",
  red: "#DC2626",
  blue: "#2563EB",
  amber: "#D97706",
};

function createDoc(filename, title, subtitle, buildContent) {
  return { filename, title, subtitle, buildContent };
}

function addHeader(doc, title, subtitle) {
  doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.maroon).text("UMUNITY", { align: "right" });
  doc.moveDown(0.3);
  doc.fontSize(8).font("Helvetica").fillColor(COLORS.gray).text("CONFIDENTIAL", { align: "right" });
  doc.moveDown(1);

  doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor(COLORS.maroon).lineWidth(2).stroke();
  doc.moveDown(0.5);

  doc.fontSize(18).font("Helvetica-Bold").fillColor(COLORS.dark).text(title);
  if (subtitle) {
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.gray).text(subtitle);
  }
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor(COLORS.lightGray).lineWidth(1).stroke();
  doc.moveDown(0.8);
}

function addSection(doc, title) {
  doc.moveDown(0.5);
  doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.maroon).text(title);
  doc.moveDown(0.3);
}

function addBody(doc, text) {
  doc.fontSize(9).font("Helvetica").fillColor(COLORS.dark).text(text, { align: "justify" });
  doc.moveDown(0.4);
}

function addTable(doc, headers, rows, colWidths) {
  const startX = 40;
  const pageWidth = 510;
  const rowH = 18;
  const headerH = 22;

  if (!colWidths) {
    const colW = pageWidth / headers.length;
    colWidths = headers.map(() => colW);
  }

  let y = doc.y;

  // Check if we need a new page
  if (y + (rows.length + 1) * rowH > 740) {
    doc.addPage();
    y = 50;
  }

  // Header row
  doc.rect(startX, y, pageWidth, headerH).fill(COLORS.lightGray);
  doc.fillColor(COLORS.dark).font("Helvetica-Bold").fontSize(8);
  let cx = startX;
  headers.forEach((h, i) => {
    doc.text(h, cx + 3, y + 5, { width: colWidths[i] - 6, align: "left" });
    cx += colWidths[i];
  });

  y += headerH;

  // Data rows
  doc.font("Helvetica").fontSize(7.5);
  rows.forEach((row, ri) => {
    if (y + rowH > 740) {
      doc.addPage();
      y = 50;
      // Re-draw header
      doc.rect(startX, y, pageWidth, headerH).fill(COLORS.lightGray);
      doc.fillColor(COLORS.dark).font("Helvetica-Bold").fontSize(8);
      let cx2 = startX;
      headers.forEach((h, i) => {
        doc.text(h, cx2 + 3, y + 5, { width: colWidths[i] - 6, align: "left" });
        cx2 += colWidths[i];
      });
      y += headerH;
      doc.font("Helvetica").fontSize(7.5);
    }

    if (ri % 2 === 1) {
      doc.rect(startX, y, pageWidth, rowH).fill("#FAFAFA");
    }
    doc.fillColor(COLORS.dark);
    let cx3 = startX;
    row.forEach((cell, ci) => {
      doc.text(String(cell), cx3 + 3, y + 4, { width: colWidths[ci] - 6, align: "left" });
      cx3 += colWidths[ci];
    });
    y += rowH;
  });

  doc.y = y + 5;
}

function addBullets(doc, items) {
  doc.fontSize(9).font("Helvetica").fillColor(COLORS.dark);
  items.forEach((item) => {
    doc.text(`  •  ${item}`, { indent: 10 });
  });
  doc.moveDown(0.4);
}

function addFooter(doc, pageNum, totalPages) {
  doc.fontSize(7).font("Helvetica").fillColor(COLORS.gray);
  doc.moveTo(40, 765).lineTo(550, 765).strokeColor(COLORS.lightGray).lineWidth(1).stroke();
  doc.text(`UMunity — CONFIDENTIAL — Page ${pageNum} of ${totalPages}`, 40, 770, { align: "left" });
}

// ============== DOCUMENT BUILDERS ==============

function buildCharter(doc) {
  addHeader(doc, "PROJECT CHARTER", "Version 1.0 — November 15, 2025");

  addSection(doc, "1. Project Overview");
  addBody(doc, "UMunity is a comprehensive organization management system designed for the University of Mindanao. It provides a centralized platform for students to discover and join student organizations, for organization leaders to manage members and events, and for administrators to oversee compliance and governance. The system serves over 20,000 students across 150+ accredited organizations.");

  addSection(doc, "2. Problem Statement");
  addBody(doc, "The University of Mindanao currently manages student organizations through fragmented processes involving paper forms, email communication, and multiple disconnected systems. Organization leaders struggle with membership tracking, event management, and compliance reporting. Students have no centralized way to discover organizations or stay updated on activities. Administrators lack visibility into organizational health and compliance status. This fragmentation leads to inefficiencies, missed deadlines, and reduced student engagement.");

  addSection(doc, "3. Project Objectives");
  addBullets(doc, [
    "Provide a unified platform for discovering and joining student organizations",
    "Streamline organization management including membership, events, and communications",
    "Automate compliance monitoring and reporting for organizational governance",
    "Enable role-based access for students, leaders, advisers, and administrators",
    "Facilitate officer transitions and knowledge continuity between terms",
    "Provide analytics and insights for data-driven decision making",
  ]);

  addSection(doc, "4. Project Scope");
  doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.green).text("In Scope:");
  addBullets(doc, [
    "Student organization discovery and membership management",
    "Event creation, promotion, and attendance tracking",
    "Role-based dashboards (Student, Leader, Adviser, Admin, OSA)",
    "Compliance tracking and accreditation workflow",
    "Officer transition management",
    "Post and announcement publishing with approval workflows",
    "Notification and messaging system",
    "Reports and analytics dashboard",
  ]);
  doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.red).text("Out of Scope:");
  addBullets(doc, [
    "Financial management and budgeting",
    "Learning management system integration",
    "External social media platform integration",
    "Mobile native applications (responsive web only)",
    "Real-time chat (asynchronous messaging only)",
  ]);

  addSection(doc, "5. Deliverables");
  addTable(doc,
    ["Deliverable", "Description", "Due Date"],
    [
      ["Platform Architecture & Design", "System architecture, database design, and UI/UX prototypes", "Nov 30, 2025"],
      ["Core Platform Features", "Organization management, event system, user roles and permissions", "Jan 15, 2026"],
      ["Compliance & Governance Module", "Accreditation tracking, compliance monitoring, report generation", "Feb 15, 2026"],
      ["Testing & Quality Assurance", "Comprehensive test suite, UAT, and performance testing", "Mar 1, 2026"],
      ["Deployment & Documentation", "Production deployment, user manuals, and administrative guides", "Mar 31, 2026"],
    ],
    [140, 240, 130]
  );

  addSection(doc, "6. Stakeholders");
  addTable(doc,
    ["Name", "Role", "Responsibility"],
    [
      ["University of Mindanao Admin", "Project Sponsor", "Funding approval and strategic direction"],
      ["OSA Office", "Primary Stakeholder", "Compliance oversight and accreditation management"],
      ["Student Organization Leaders", "End Users", "Organization management and event coordination"],
      ["Student Body", "End Users", "Platform adoption and engagement"],
      ["IT Department", "Technical Oversight", "Infrastructure support and security review"],
      ["Development Team", "Implementation", "Design, development, testing, and deployment"],
    ],
    [180, 130, 200]
  );

  addSection(doc, "7. Timeline");
  addTable(doc,
    ["Phase", "Start", "End"],
    [
      ["Initiation & Planning", "Nov 1, 2025", "Nov 15, 2025"],
      ["Requirements Gathering", "Nov 15, 2025", "Dec 10, 2025"],
      ["Design & Prototyping", "Dec 1, 2025", "Dec 30, 2025"],
      ["Development Phase 1", "Jan 1, 2026", "Feb 15, 2026"],
      ["Development Phase 2", "Feb 1, 2026", "Mar 1, 2026"],
      ["Testing & QA", "Feb 15, 2026", "Mar 15, 2026"],
      ["User Acceptance Testing", "Mar 1, 2026", "Mar 20, 2026"],
      ["Deployment & Go-Live", "Mar 20, 2026", "Mar 31, 2026"],
      ["Project Closure", "Apr 1, 2026", "Apr 15, 2026"],
    ],
    [210, 150, 150]
  );

  addSection(doc, "8. Success Metrics");
  addTable(doc,
    ["Metric", "Target", "Measurement"],
    [
      ["User Adoption Rate", "80% of orgs onboarded in 3 months", "Active org accounts / total accredited"],
      ["Student Engagement", "60% of students registered in 6 months", "Registered students / total enrollment"],
      ["System Uptime", "99.5% uptime during peak usage", "Server monitoring"],
      ["Compliance Rate", "90% on-time compliance submissions", "Timely submissions / total required"],
      ["User Satisfaction", "4.0/5.0 average rating", "Post-launch user survey"],
      ["Defect Density", "< 5 critical defects per release", "QA tracking and bug reports"],
    ],
    [140, 200, 170]
  );

  addSection(doc, "9. Approval");
  doc.fontSize(9).font("Helvetica").fillColor(COLORS.dark);
  doc.text("Prepared by: Project Manager");
  doc.text("Reviewed by: QA Lead");
  doc.text("Approved by: University of Mindanao Administration");
  doc.text("Date: November 15, 2025");
}

function buildRequirements(doc) {
  addHeader(doc, "REQUIREMENTS SPECIFICATION", "Version 2.1 — December 10, 2025");

  addSection(doc, "1. Functional Requirements");

  const reqs = [
    ["FR-001", "User Registration and Authentication", "Critical", "Approved", "Users can register with university email and log in"],
    ["FR-002", "Organization Discovery and Search", "Critical", "Approved", "Browse, search, and filter all accredited orgs"],
    ["FR-003", "Membership Management", "Critical", "Approved", "Request, approve, and manage org memberships"],
    ["FR-004", "Event Management", "High", "Approved", "Create, publish, and RSVP to events"],
    ["FR-005", "Compliance and Accreditation", "High", "Approved", "Submit compliance docs; track accreditation status"],
    ["FR-006", "Role-Based Dashboards", "Critical", "Approved", "Personalized views for each user role"],
    ["FR-007", "Notification System", "High", "Approved", "In-app and email notifications with preferences"],
    ["FR-008", "Officer Transition Management", "Medium", "In Review", "Handover checklists and document tracking"],
    ["FR-009", "Post and Announcement Publishing", "High", "Approved", "Create, approve, and publish org announcements"],
    ["FR-010", "Analytics and Reporting", "Medium", "In Review", "Dashboards with exportable reports"],
    ["FR-011", "Messaging System", "Medium", "Pending", "Direct and group messaging with attachments"],
    ["FR-012", "Organization Profile Management", "High", "Approved", "Update profile, logo, social links, and mission"],
  ];

  addTable(doc,
    ["ID", "Description", "Priority", "Status"],
    reqs.map((r) => [r[0], r[1], r[2], r[3]]),
    [65, 245, 80, 80]
  );
  doc.fontSize(9).font("Helvetica").fillColor(COLORS.dark);

  addSection(doc, "2. Non-Functional Requirements");

  const nfrs = [
    ["NFR-PERF-001", "Performance", "Page load time", "Initial load within 3 seconds"],
    ["NFR-PERF-002", "Performance", "Concurrent users", "500 concurrent users during peak"],
    ["NFR-PERF-003", "Performance", "API response time", "500ms for 95% of requests"],
    ["NFR-SEC-001", "Security", "Data encryption", "TLS 1.3 in transit; AES-256 at rest"],
    ["NFR-SEC-002", "Security", "Authentication", "MFA for admin accounts"],
    ["NFR-SEC-003", "Security", "Authorization", "RBAC with least-privilege"],
    ["NFR-ACC-001", "Accessibility", "WCAG compliance", "WCAG 2.1 Level AA"],
    ["NFR-REL-001", "Reliability", "System uptime", "99.5% during academic semesters"],
    ["NFR-REL-002", "Reliability", "Data backup", "Daily backups with 30-day retention"],
    ["NFR-SCA-001", "Scalability", "Horizontal scaling", "Containerized deployment"],
    ["NFR-USA-001", "Usability", "Mobile responsiveness", "320px to 2560px viewports"],
  ];

  addTable(doc,
    ["ID", "Category", "Description", "Specification"],
    nfrs,
    [100, 80, 130, 200]
  );

  addSection(doc, "3. User Stories");
  const stories = [
    ["US-001", "Student", "browse all student organizations", "find orgs matching my interests"],
    ["US-002", "Student", "see upcoming events from followed orgs", "plan my schedule"],
    ["US-003", "Org Leader", "track membership and manage roster", "grow and manage my org"],
    ["US-004", "Org Leader", "create events and track attendance", "measure engagement"],
    ["US-005", "Adviser", "review org activities and compliance", "ensure requirements are met"],
    ["US-006", "OSA Admin", "manage accreditation workflows", "ensure proper accreditation"],
    ["US-007", "Org Leader", "hand over to new officers", "smooth transitions"],
    ["US-008", "Student", "receive notifications", "never miss updates"],
    ["US-009", "Admin", "view analytics", "data-driven decisions"],
    ["US-010", "Org Leader", "submit compliance documents", "meet requirements efficiently"],
  ];

  stories.forEach(([id, asA, iWant, soThat]) => {
    doc.fontSize(8.5).font("Helvetica").fillColor(COLORS.dark);
    doc.text(`${id}: As a ${asA}, I want to ${iWant} so that ${soThat}.`, { indent: 10 });
  });
  doc.fontSize(9).font("Helvetica").fillColor(COLORS.dark);
}

function buildWBS(doc) {
  addHeader(doc, "WORK BREAKDOWN STRUCTURE", "Version 1.0 — November 20, 2025");

  const phases = [
    {
      name: "1. Project Initiation",
      tasks: [
        ["1.1 Project Charter", "Define scope, objectives, stakeholders, success metrics", "Approved Charter", "—"],
        ["1.2 Team Formation", "Assign roles, set up comms, establish reporting", "Team Roster", "—"],
        ["1.3 Project Kickoff", "Kickoff meeting, present plan, align milestones", "Kickoff Presentation", "1.1, 1.2"],
      ],
    },
    {
      name: "2. Requirements & Analysis",
      tasks: [
        ["2.1 Stakeholder Interviews", "Interview OSA, leaders, survey students", "Interview Report", "1.3"],
        ["2.2 Requirements Documentation", "Document functional and non-functional reqs", "Requirements Spec", "2.1"],
        ["2.3 Requirements Validation", "Review, update, obtain sign-off", "Signed-off Reqs", "2.2"],
      ],
    },
    {
      name: "3. Design & Prototyping",
      tasks: [
        ["3.1 System Architecture", "Design DB schema, API structure, security", "Architecture Doc", "2.3"],
        ["3.2 UI/UX Design", "Wireframes, mockups, design system", "Design Prototypes", "2.3"],
        ["3.3 Design Review", "Present, collect feedback, finalize", "Approved Designs", "3.1, 3.2"],
      ],
    },
    {
      name: "4. Development",
      tasks: [
        ["4.1 Core Infrastructure", "Dev environment, CI/CD, database init", "Dev Environment", "3.3"],
        ["4.2 Auth & User Management", "Registration, login, RBAC, profiles", "Auth Module", "4.1"],
        ["4.3 Organization Management", "Profiles, membership, leader dashboards", "Org Module", "4.2"],
        ["4.4 Event Management", "Creation, RSVP, calendar", "Event Module", "4.3"],
        ["4.5 Compliance Module", "Tracking, accreditation, reports", "Compliance Module", "4.3"],
        ["4.6 Notification System", "Engine, in-app, email", "Notification Module", "4.2"],
        ["4.7 Analytics Dashboard", "Data model, visualizations, export", "Analytics Module", "4.3, 4.4"],
      ],
    },
    {
      name: "5. Testing & QA",
      tasks: [
        ["5.1 Test Planning", "Strategy, test cases, environment", "Test Plan", "4.2"],
        ["5.2 Functional Testing", "Execute tests, log defects, regression", "Test Report", "5.1"],
        ["5.3 Performance Testing", "Load and stress testing", "Performance Report", "4.7"],
        ["5.4 Security Testing", "Vulnerability assessment, pen testing", "Security Report", "4.7"],
        ["5.5 User Acceptance Testing", "Plan, coordinate, collect feedback", "UAT Sign-off", "5.2"],
      ],
    },
    {
      name: "6. Deployment & Launch",
      tasks: [
        ["6.1 Deployment Preparation", "Prod environment, monitoring, backups", "Production Env", "5.5"],
        ["6.2 Data Migration", "Migrate org data, validate integrity", "Migrated Data", "6.1"],
        ["6.3 User Training", "Documentation, training, FAQ", "Training Materials", "6.1"],
        ["6.4 Go-Live", "Production deploy, monitoring, hyper-care", "Live Platform", "6.2, 6.3"],
      ],
    },
    {
      name: "7. Project Closure",
      tasks: [
        ["7.1 Project Review", "Retrospective, lessons learned, metrics", "Review Document", "6.4"],
        ["7.2 Closure Report", "Report, sign-off, archive", "Closure Report", "7.1"],
      ],
    },
  ];

  phases.forEach((phase) => {
    if (doc.y > 700) doc.addPage();
    addSection(doc, phase.name);
    addTable(doc,
      ["Task", "Description", "Deliverable", "Dependencies"],
      phase.tasks.map((t) => [t[0], t[1], t[2], t[3]]),
      [100, 200, 120, 90]
    );
  });
}

function buildGantt(doc) {
  addHeader(doc, "PROJECT TIMELINE / GANTT CHART", "Version 1.2 — January 5, 2026");

  addSection(doc, "Project Roadmap");

  const phases = [
    ["Project Initiation", "Nov 1, 2025", "Nov 15, 2025", "COMPLETED", "Charter Approved (Nov 15)", "—"],
    ["Requirements & Analysis", "Nov 15, 2025", "Dec 10, 2025", "COMPLETED", "Reqs Signed Off (Dec 10)", "Initiation"],
    ["Design & Prototyping", "Dec 1, 2025", "Dec 30, 2025", "COMPLETED", "Design Approval (Dec 30)", "Requirements"],
    ["Core Development (Phase 1)", "Jan 1, 2026", "Feb 15, 2026", "COMPLETED", "Auth & Orgs Complete (Jan 30)", "Design"],
    ["Advanced Features (Phase 2)", "Feb 1, 2026", "Mar 1, 2026", "COMPLETED", "Compliance & Analytics (Mar 1)", "Phase 1"],
    ["Testing & QA", "Feb 15, 2026", "Mar 15, 2026", "IN PROGRESS", "UAT Complete (Mar 15)", "Phase 1, Phase 2"],
    ["Deployment & Launch", "Mar 20, 2026", "Mar 31, 2026", "PENDING", "Platform Go-Live (Mar 31)", "Testing"],
    ["Project Closure", "Apr 1, 2026", "Apr 15, 2026", "PENDING", "Project Closed (Apr 15)", "Deployment"],
  ];

  addTable(doc,
    ["Phase", "Start", "End", "Status", "Key Milestone", "Dependencies"],
    phases,
    [140, 80, 80, 70, 80, 60]
  );
}

function buildRiskRegister(doc) {
  addHeader(doc, "RISK REGISTER", "Version 1.1 — February 1, 2026");

  addSection(doc, "Identified Risks");

  const risks = [
    ["R-001", "Scope creep from additional feature requests", "High", "Major", "HIGH", "Establish change control process", "Project Manager", "Monitoring"],
    ["R-002", "Timeline delays from underestimated complexity", "Medium", "Major", "HIGH", "Build buffer; weekly reviews; MVP prioritization", "Project Manager", "Open"],
    ["R-003", "Resource constraints across multiple projects", "High", "Moderate", "MEDIUM", "Dedicated team allocation; contingency plan", "Project Manager", "Monitoring"],
    ["R-004", "Requirement changes during development", "Medium", "Moderate", "MEDIUM", "Agile sprints; regular stakeholder demos", "Project Manager", "Open"],
    ["R-005", "University SSO integration technical issues", "Medium", "Major", "HIGH", "Start early; fallback auth; engage IT dept", "Lead Developer", "Open"],
    ["R-006", "Stakeholder misalignment on priorities", "Medium", "Moderate", "MEDIUM", "Prioritization workshops; backlog management", "Project Manager", "Monitoring"],
    ["R-007", "Data migration issues from legacy systems", "Medium", "Minor", "MEDIUM", "Data audit; migration scripts; test migrations", "DBA", "Open"],
    ["R-008", "Performance bottlenecks at peak enrollment", "Low", "Critical", "HIGH", "Load testing; caching strategy; auto-scaling", "Lead Developer", "Open"],
    ["R-009", "Security vulnerabilities in dependencies", "Medium", "Critical", "HIGH", "Dependency audits; vulnerability scanning", "Lead Developer", "Monitoring"],
    ["R-010", "Low user adoption post-launch", "Medium", "Major", "HIGH", "Adoption campaign; tutorials; early feedback", "Project Manager", "Open"],
    ["R-011", "Compliance requirement changes", "Low", "Moderate", "LOW", "Flexible design; OSA communication", "Project Manager", "Closed"],
    ["R-012", "Team member turnover", "Low", "Major", "MEDIUM", "Cross-training; documentation; knowledge transfer", "Project Manager", "Open"],
  ];

  addTable(doc,
    ["ID", "Risk", "Prob", "Impact", "Level", "Mitigation", "Owner", "Status"],
    risks,
    [35, 100, 35, 40, 35, 120, 65, 40]
  );

  addSection(doc, "Risk Level Summary");
  const levelCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  risks.forEach((r) => { levelCounts[r[4]]++; });
  const levelColors = { Critical: COLORS.red, High: COLORS.amber, Medium: "#D97706", Low: COLORS.green };
  Object.entries(levelCounts).forEach(([level, count]) => {
    doc.fontSize(10).font("Helvetica-Bold").fillColor(levelColors[level]).text(`${level}: ${count}`, { continued: true });
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.dark).text(` risk(s)`);
    doc.moveDown(0.1);
  });
  doc.fontSize(9).font("Helvetica").fillColor(COLORS.dark);
}

function buildMeetingMinutes(doc) {
  addHeader(doc, "MEETING MINUTES & DECISION LOG", "Version 1.0 — March 1, 2026");

  const meetings = [
    {
      num: 1,
      date: "November 16, 2025",
      participants: "PM, QA Lead, Lead Developer, UI/UX Designer, OSA Rep",
      agenda: ["Project kickoff", "Review charter", "High-level requirements", "Communication channels", "Sprint cadence"],
      summary: "Team reviewed approved charter and aligned on objectives. OSA rep provided compliance requirements. Team agreed on 2-week sprints with bi-weekly demos.",
      actions: [
        ["Schedule stakeholder interviews", "PM", "Nov 20"],
        ["Set up repo and CI/CD", "Lead Developer", "Nov 18"],
        ["Prepare wireframes", "UI/UX Designer", "Nov 25"],
        ["Distribute charter", "PM", "Nov 17"],
      ],
      decisions: [
        ["Sprint cycle: 2 weeks with Friday demos", "Allows dev time with stakeholder visibility", "PM"],
        ["React + TypeScript as tech stack", "Team expertise and university preference", "Lead Developer"],
        ["MVP: core org management + events", "Ensures timely delivery of highest value", "Team Consensus"],
      ],
      outcome: "Successful kickoff. All members aligned on goals and timeline.",
    },
    {
      num: 2,
      date: "December 1, 2025",
      participants: "PM, QA Lead, Lead Developer, UI/UX Designer",
      agenda: ["Design prototypes review", "Technical architecture", "Requirements progress", "Sprint 1 scope"],
      summary: "Presented wireframes for student dashboard, org profiles, and events. Minor adjustments needed. Architecture proposed using TanStack Start with PostgreSQL.",
      actions: [
        ["Update wireframes and finalize", "UI/UX Designer", "Dec 5"],
        ["Finalize DB schema", "Lead Developer", "Dec 4"],
        ["Prepare test strategy", "QA Lead", "Dec 6"],
      ],
      decisions: [
        ["TanStack Start for full-stack framework", "Best fit for React SSR with type-safe routing", "Lead Developer"],
        ["PostgreSQL with Prisma ORM", "Robust relational data model", "Lead Developer"],
        ["Design system follows university brand", "Consistent branding", "UI/UX Designer"],
      ],
      outcome: "Design approved. Architecture finalized. Sprint 1 scoped.",
    },
    {
      num: 3,
      date: "January 15, 2026",
      participants: "PM, QA Lead, Lead Developer, OSA Rep",
      agenda: ["Sprint 1 demo", "Compliance requirements", "Testing approach", "Sprint 2 planning"],
      summary: "Demonstrated working auth and org management. OSA rep tested and provided feedback. QA Lead presented test strategy. Sprint 2 focused on events and notifications.",
      actions: [
        ["Add org category filtering", "Frontend Developer", "Jan 20"],
        ["Draft compliance requirements", "QA Lead", "Jan 22"],
        ["Set up auth test suite", "QA Lead", "Jan 18"],
        ["Provide sample compliance forms", "OSA Rep", "Jan 20"],
      ],
      decisions: [
        ["Automated testing for critical flows", "Ensures core reliability", "QA Lead"],
        ["Event approval needs adviser sign-off", "Oversight without bottlenecks", "OSA Rep"],
      ],
      outcome: "Sprint 1 complete. Feedback incorporated. Sprint 2 ready.",
    },
  ];

  meetings.forEach((m) => {
    if (doc.y > 680) doc.addPage();

    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.maroon).text(`Meeting #${m.num} — ${m.date}`);
    doc.fontSize(8).font("Helvetica").fillColor(COLORS.gray).text(`Participants: ${m.participants}`);
    doc.moveDown(0.3);

    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.dark).text("Agenda:");
    addBullets(doc, m.agenda);

    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.dark).text("Discussion Summary:");
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.dark).text(m.summary);
    doc.moveDown(0.3);

    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.dark).text("Action Items:");
    addTable(doc, ["Item", "Responsible", "Due"], m.actions, [250, 130, 80]);

    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.dark).text("Decisions Made:");
    m.decisions.forEach((d) => {
      doc.fontSize(8.5).font("Helvetica").fillColor(COLORS.dark);
      doc.text(`  • ${d[0]}`, { indent: 10 });
      doc.fontSize(8).fillColor(COLORS.gray).text(`    Rationale: ${d[1]}  |  By: ${d[2]}`, { indent: 10 });
    });
    doc.moveDown(0.3);

    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.dark).text(`Outcome: `, { continued: true });
    doc.font("Helvetica").fillColor(COLORS.dark);
    doc.font("Helvetica").fillColor(COLORS.dark).text(m.outcome);
    doc.moveDown(0.8);
  });
}

function buildQAReport(doc) {
  addHeader(doc, "QUALITY ASSURANCE REPORT", "Version 2.0 — March 15, 2026");

  addSection(doc, "1. QA Strategy");
  addBody(doc, "Risk-based testing approach prioritizing critical business flows: user authentication, organization management, and event workflows. Testing conducted across four phases: (1) Unit testing of components and utilities, (2) Integration testing of API endpoints, (3) End-to-end testing of critical user journeys, and (4) User Acceptance Testing with real stakeholders. Automated testing for regression coverage; exploratory testing for edge cases and usability. Performance testing with k6 for load testing and Lighthouse for frontend auditing.");

  addSection(doc, "2. Test Scope");
  addBullets(doc, [
    "User authentication and authorization flows",
    "Organization creation, profile management, membership workflows",
    "Event creation, RSVP, and attendance tracking",
    "Compliance submission and accreditation tracking",
    "Role-based dashboard rendering and data access",
    "Notification delivery and preferences",
    "Post creation, approval workflow, and publishing",
    "Officer transition and handover processes",
    "Search and discovery functionality",
    "Data export and report generation",
  ]);

  addSection(doc, "3. QA Metrics Dashboard");
  const metrics = [
    ["Tests Executed", "20"],
    ["Passed", "17"],
    ["Failed", "1"],
    ["Blocked", "0"],
    ["Defects Identified", "7"],
    ["Defects Resolved", "4"],
    ["Critical Issues Closed", "1"],
    ["UAT Pass Rate", "83% Passed"],
  ];
  addTable(doc, ["Metric", "Value"], metrics.map((m) => [m[0], m[1]]), [200, 200]);

  addSection(doc, "4. Test Cases");
  const tcs = [
    ["TC-001", "Registration with valid email", "Account created; verification sent", "Account created; email in 30s", "Passed"],
    ["TC-002", "Registration with invalid email", "Rejected with error", "Error shown correctly", "Passed"],
    ["TC-003", "Password reset", "Reset email sent; password updated", "Reset successful", "Passed"],
    ["TC-004", "Browse orgs with filters", "Correct filtered results", "Filters work; < 1 second", "Passed"],
    ["TC-005", "Join org request", "Request submitted; leader notified", "Submitted; notified", "Passed"],
    ["TC-006", "Event creation", "Event created in calendar", "Created successfully", "Passed"],
    ["TC-007", "RSVP with waitlist", "Added to list or waitlist", "Works correctly", "Passed"],
    ["TC-008", "Compliance submission", "Uploaded; status = Pending", "Correct status", "Passed"],
    ["TC-009", "Student RBAC", "Only authorized features", "Correctly enforced", "Passed"],
    ["TC-010", "Admin RBAC", "All management features", "Full access granted", "Passed"],
    ["TC-011", "Notification on event update", "Sent to RSVP'd users", "Delivered in 2 min", "Passed"],
    ["TC-012", "Post approval workflow", "Created > sent for approval > published", "Workflow correct", "Passed"],
    ["TC-013", "Officer transition", "Created; tasks assigned", "Works correctly", "Passed"],
    ["TC-014", "Data export to PDF", "Valid PDF generated", "PDF generated; formatting minor fix", "Passed"],
    ["TC-015", "Load test (500 users)", "Responds within 3s", "Avg 1.8s; max 3.2s", "Passed"],
    ["TC-016", "Mobile responsiveness", "Renders on 375px", "Breaks below 360px", "Failed"],
    ["TC-017", "Search orgs by name", "Results in 2s", "< 1s; accurate", "Passed"],
    ["TC-018", "Calendar monthly view", "Events by date", "Renders correctly", "Passed"],
    ["TC-019", "Profile photo upload", "Uploaded and cropped", "Works; UI minor fix", "Passed"],
    ["TC-020", "Messaging", "Delivered in conversation", "Real-time works", "Passed"],
  ];
  addTable(doc, ["ID", "Scenario", "Expected", "Actual", "Status"], tcs, [40, 120, 120, 120, 60]);

  addSection(doc, "5. Bug Tracking");
  const bugs = [
    ["BUG-001", "Org list breaks below 360px", "Major", "P2", "In Progress", "CSS fix in progress"],
    ["BUG-002", "Password reset email delay > 5min", "Minor", "P3", "Open", "Investigating email queue"],
    ["BUG-003", "RSVP count not updating immediately", "Major", "P2", "Resolved", "Cache invalidation fixed"],
    ["BUG-004", "Upload limit needs 10MB (was 5MB)", "Minor", "P3", "Resolved", "Limit increased"],
    ["BUG-005", "Notification prefs not saving for new users", "Critical", "P1", "Resolved", "Default init added"],
    ["BUG-006", "Analytics chart dates display", "Minor", "P4", "Closed", "Date formatting fixed"],
    ["BUG-007", "Search includes inactive orgs", "Major", "P2", "Open", "Adding active filter"],
  ];
  addTable(doc, ["ID", "Description", "Sev", "Pri", "Status", "Resolution"], bugs, [40, 130, 40, 30, 50, 150]);

  addSection(doc, "6. User Acceptance Testing");
  const uat = [
    ["Student Rep (Engineering)", "End User", "Platform is intuitive. Love org discovery. Would like dark mode.", "Passed"],
    ["Org Leader (Student Gov)", "Power User", "Event management is straightforward. Compliance could be simpler.", "Passed w/ Issues"],
    ["OSA Coordinator", "Admin", "Dashboard gives excellent visibility. Much more efficient than manual.", "Passed"],
    ["Student Rep (Arts & Sci)", "End User", "Easy to find orgs matching interests. Calendar helps planning.", "Passed"],
    ["Org Adviser", "Adviser", "Good overview of assigned orgs. Approval workflows clear.", "Passed"],
    ["IT Department Rep", "Reviewer", "Good performance. Security appropriate. Docs comprehensive.", "Passed"],
  ];
  addTable(doc, ["Participant", "Role", "Feedback", "Result"], uat, [110, 70, 200, 80]);
  doc.fontSize(9).font("Helvetica").fillColor(COLORS.dark);
}

function buildClosureReport(doc) {
  addHeader(doc, "PROJECT CLOSURE REPORT", "Version 1.0 — April 1, 2026");

  addSection(doc, "1. Objectives Achieved");
  addTable(doc,
    ["Objective", "Status", "Notes"],
    [
      ["Unified platform for org discovery and joining", "Achieved", "150+ orgs listed; 5,000+ student registrations"],
      ["Streamlined org management", "Achieved", "200+ events created in first quarter"],
      ["Automated compliance monitoring", "Achieved", "60% increase in compliance submission rate"],
      ["Role-based access for all user types", "Achieved", "All 6 roles implemented with proper controls"],
      ["Officer transitions", "Partially", "Module launched; adoption increasing"],
      ["Analytics for decision making", "Achieved", "Dashboards used by OSA and admin"],
    ],
    [220, 80, 210]
  );

  addSection(doc, "2. Deliverables Completed");
  addTable(doc,
    ["Deliverable", "Status", "Date"],
    [
      ["Platform Architecture & Design", "Delivered", "Dec 30, 2025"],
      ["Core Platform Features", "Delivered", "Feb 15, 2026"],
      ["Compliance & Governance Module", "Delivered", "Mar 1, 2026"],
      ["Testing & Quality Assurance", "Delivered", "Mar 15, 2026"],
      ["Deployment & Documentation", "Delivered", "Mar 31, 2026"],
    ],
    [250, 100, 100]
  );

  addSection(doc, "3. Project Outcomes");
  addBullets(doc, [
    "Launched UMunity serving 5,000+ students across 150+ organizations",
    "Reduced compliance processing from 2 weeks to 3 days",
    "40% increase in student organization participation",
    "99.7% system uptime during first month",
    "4.2/5.0 average satisfaction rating",
    "Successfully migrated legacy data to centralized system",
  ]);

  addSection(doc, "4. Challenges");
  addTable(doc,
    ["Challenge", "Impact", "Resolution"],
    [
      ["SSO integration delays", "2-week auth module delay", "Worked with IT; fallback auth implemented"],
      ["Leader resistance to new system", "Slower adoption", "Hands-on training; quick-start guides"],
      ["Performance with large datasets", "Dashboard load times", "Pagination; caching; query optimization"],
    ],
    [170, 140, 200]
  );

  addSection(doc, "5. Lessons Learned");
  addBullets(doc, [
    "Early stakeholder engagement is critical for accuracy and adoption",
    "Dedicated QA time each sprint reduces production defects",
    "Automated testing is essential for continuous deployment",
    "Training materials should be ready before launch",
    "Regular demos keep stakeholders engaged",
    "Performance testing should start earlier",
  ]);

  addSection(doc, "6. Recommendations");
  addBullets(doc, [
    "Build mobile native apps for iOS and Android",
    "Develop predictive analytics for engagement trends",
    "Integrate with university LMS",
    "Add financial management for org budgets",
    "Push notifications for mobile",
    "Quarterly feature update cycle",
  ]);

  addSection(doc, "7. Stakeholder Feedback");
  addTable(doc,
    ["Stakeholder", "Rating", "Feedback"],
    [
      ["OSA Office", "4.5/5", "Transformed compliance management. Efficient and transparent."],
      ["Org Leaders", "4.0/5", "Excellent event and membership features."],
      ["Student Body", "4.3/5", "Easy to find orgs and stay informed."],
      ["IT Department", "4.2/5", "Solid architecture. Production-ready quality."],
      ["University Admin", "4.4/5", "Valuable insights into engagement and org health."],
    ],
    [130, 60, 320]
  );

  addSection(doc, "8. Final Sign-Off");
  doc.fontSize(9).font("Helvetica").fillColor(COLORS.dark);
  doc.text("Project Manager: Project Manager");
  doc.text("Date: April 15, 2026");
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.maroon).text("Additional Approvers:");
  doc.font("Helvetica").fillColor(COLORS.dark);
  doc.text("QA Lead — Quality Assurance Lead — April 15, 2026");
  doc.text("OSA Director — Primary Stakeholder — April 14, 2026");
  doc.text("IT Director — Technical Authority — April 15, 2026");
}

// ============== GENERATION ENGINE ==============

const documents = [
  createDoc("UMunity_ProjectCharter.pdf", "PROJECT CHARTER", "Version 1.0", buildCharter),
  createDoc("UMunity_RequirementsSpecification.pdf", "REQUIREMENTS SPECIFICATION", "Version 2.1", buildRequirements),
  createDoc("UMunity_WBS.pdf", "WORK BREAKDOWN STRUCTURE", "Version 1.0", buildWBS),
  createDoc("UMunity_GanttChart.pdf", "PROJECT TIMELINE / GANTT CHART", "Version 1.2", buildGantt),
  createDoc("UMunity_RiskRegister.pdf", "RISK REGISTER", "Version 1.1", buildRiskRegister),
  createDoc("UMunity_MeetingMinutes.pdf", "MEETING MINUTES & DECISION LOG", "Version 1.0", buildMeetingMinutes),
  createDoc("UMunity_QAReport.pdf", "QUALITY ASSURANCE REPORT", "Version 2.0", buildQAReport),
  createDoc("UMunity_ProjectClosureReport.pdf", "PROJECT CLOSURE REPORT", "Version 1.0", buildClosureReport),
];

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

documents.forEach(({ filename, title, subtitle, buildContent }, index) => {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    info: {
      Title: title,
      Author: "Project Management Office",
      Subject: "UMunity Organization Management System",
      Keywords: "project management, qa, documentation",
    },
  });

  const stream = fs.createWriteStream(path.join(DOCS_DIR, filename));
  doc.pipe(stream);

  // Build content
  buildContent(doc);

  // Add footers to all pages
  const pageRange = doc.bufferedPageRange();
  const pageCount = pageRange.count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(pageRange.start + i);
    addFooter(doc, i + 1, pageCount);
  }

  doc.end();

  console.log(`Generated: ${filename}`);
});

console.log("\nAll 8 documents generated in docs/ folder.");

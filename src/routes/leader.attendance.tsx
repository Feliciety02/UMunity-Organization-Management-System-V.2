import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, StatCard, MiniBarChart } from "@/components/dashboard/DashboardLayout";
import { CheckSquare, Users, TrendingUp, Calendar } from "lucide-react";
import { DataTable, DataTableStatusBadge, type Column } from "@/components/ui/data-table";

export const Route = createFileRoute("/leader/attendance")({
  component: Attendance,
});

type AttendanceRow = {
  key: string;
  event: string;
  date: string;
  rsvps: number;
  attended: number;
  rate: number;
  status: string;
};

const eventData: AttendanceRow[] = [
  { key: "1", event: "Innovation Summit 2026", date: "May 24", rsvps: 184, attended: 162, rate: 88, status: "Upcoming" },
  { key: "2", event: "Hack Night Vol. 2", date: "Apr 18", rsvps: 78, attended: 70, rate: 90, status: "Completed" },
  { key: "3", event: "Coding Bootcamp Day 3", date: "Apr 03", rsvps: 64, attended: 58, rate: 91, status: "Completed" },
  { key: "4", event: "Welcome Mixer 2026", date: "Mar 12", rsvps: 142, attended: 118, rate: 83, status: "Completed" },
  { key: "5", event: "Tech Talk: Web3", date: "Feb 20", rsvps: 92, attended: 64, rate: 70, status: "Completed" },
];

const columns: Column<AttendanceRow>[] = [
  {
    key: "event",
    label: "Event",
    sortable: true,
    render: (row) => <span className="font-semibold">{row.event}</span>,
  },
  {
    key: "date",
    label: "Date",
    sortable: true,
    render: (row) => <span className="text-muted-foreground">{row.date}</span>,
  },
  {
    key: "rsvps",
    label: "RSVPs",
    sortable: true,
    render: (row) => row.rsvps,
  },
  {
    key: "attended",
    label: "Attended",
    sortable: true,
    render: (row) => row.attended,
  },
  {
    key: "rate",
    label: "Rate",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-gradient-maroon" style={{ width: `${row.rate}%` }} />
        </div>
        <span className="text-xs">{row.rate}%</span>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (row) => <DataTableStatusBadge status={row.status} />,
  },
];

function Attendance() {
  return (
    <>
      <PageHead
        title="Attendance overview"
        sub="High-level turnout trends across all events. For per-event RSVP lists and CSV export, see Attendees."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Avg attendance" value="84%" delta="+3% vs last sem" icon={CheckSquare} tone="primary" />
        <StatCard label="Active attendees" value="284" icon={Users} tone="gold" />
        <StatCard label="Top event" value="Hack 2025" icon={TrendingUp} tone="rose" />
        <StatCard label="Events tracked" value="38" icon={Calendar} tone="emerald" />
      </div>

      <Panel title="Attendance trend" className="mt-6">
        <MiniBarChart data={[72, 80, 78, 84, 88, 86, 92, 84]} color="var(--gold)" />
      </Panel>

      <Panel title="Recent events" className="mt-6">
        <DataTable
          columns={columns}
          data={eventData}
          keyExtractor={(row) => row.key}
          searchable
          searchPlaceholder="Search events..."
          pageSize={10}
        />
      </Panel>
    </>
  );
}

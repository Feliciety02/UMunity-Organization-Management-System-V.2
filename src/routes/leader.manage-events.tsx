import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Panel, Badge } from "@/components/dashboard/DashboardLayout";
import { Edit3, Trash2, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/leader/manage-events")({
  component: ManageEvents,
});

const list = [
  { t: "Innovation Summit 2026", d: "May 24", r: 184, cap: 300, s: "Published" },
  { t: "Hack Night Vol. 3", d: "June 02", r: 56, cap: 80, s: "Published" },
  { t: "Tech Talk: AI in Education", d: "June 14", r: 92, cap: 150, s: "Draft" },
  { t: "CS Christmas Mixer", d: "Dec 12", r: 0, cap: 200, s: "Draft" },
  { t: "Year-end Hackathon 2025", d: "Dec 04 (past)", r: 248, cap: 250, s: "Completed" },
];

function ManageEvents() {
  return (
    <>
      <PageHead title="Manage events" sub="All events created by your organization." />

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3">Event</th><th>Date</th><th>RSVPs</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((e) => (
                <tr key={e.t} className="transition hover:bg-secondary/40">
                  <td className="py-3 font-semibold">{e.t}</td>
                  <td className="text-muted-foreground">{e.d}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-gradient-gold" style={{ width: `${(e.r/e.cap)*100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{e.r}/{e.cap}</span>
                    </div>
                  </td>
                  <td><Badge tone={e.s === "Published" ? "success" : e.s === "Draft" ? "warning" : "neutral"}>{e.s}</Badge></td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><ExternalLink className="h-3.5 w-3.5" /></button>
                      <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-rose-100 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

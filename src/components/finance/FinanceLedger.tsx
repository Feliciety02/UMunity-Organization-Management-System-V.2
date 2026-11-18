import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Flag,
  Landmark,
  Paperclip,
  Plus,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import { Badge, EmptyState, PageHead, Panel, PanelSkeleton, StatCard } from "@/components/dashboard/DashboardLayout";
import { AppButton } from "@/components/ui/app-button";
import { AppTabs } from "@/components/ui/app-tabs";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { downloadCsv } from "@/lib/csv";
import { showStatusToast } from "@/lib/feedback";
import {
  EXPENSE_CATEGORIES,
  formatPeso,
  INCOME_CATEGORIES,
  ledgerTotals,
  MAX_RECEIPT_BYTES,
  MAX_RECEIPTS_PER_ENTRY,
  openReceipt,
  RECEIPT_ACCEPT,
  recordEntry,
  removeReceipt,
  reviewEntry,
  STATUS_LABEL,
  STATUS_TONE,
  uploadReceipt,
  useFinanceOrgs,
  useLedger,
  voidEntry,
  type FinanceEntry,
  type FinanceKind,
  type Ledger,
  type ReceiptMeta,
} from "@/lib/finance";
import { useWorkflows } from "@/lib/workflows";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none aria-[invalid=true]:border-destructive";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const TABS = ["All", "Money in", "Money out", "Awaiting review", "Flagged", "Void"] as const;
type Tab = (typeof TABS)[number];

const dateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
const timeLabel = (ms: number) =>
  new Date(ms).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const sizeLabel = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/**
 * The organization's books: every peso in and out, with receipts and a full audit trail.
 * Leaders record, advisers and admins verify, active members read. One component for every role;
 * what each person can do comes from the server.
 */
export function FinanceLedger({ slug: fixedSlug, sub }: { slug?: string; sub?: string }) {
  const orgs = useFinanceOrgs();
  const [picked, setPicked] = useState<string | null>(null);
  const slug = fixedSlug ?? picked ?? orgs?.[0]?.slug ?? null;
  const { ledger, error, loading, reload } = useLedger(slug);

  const [tab, setTab] = useState<Tab>("All");
  const [q, setQ] = useState("");
  const [recording, setRecording] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const entries = useMemo(() => ledger?.entries ?? [], [ledger]);
  const totals = useMemo(() => ledgerTotals(entries), [entries]);
  const rows = useMemo(
    () =>
      entries.filter((e) => {
        if (tab === "Money in") return e.kind === "income" && e.status !== "void";
        if (tab === "Money out") return e.kind === "expense" && e.status !== "void";
        if (tab === "Awaiting review") return e.status === "recorded";
        if (tab === "Flagged") return e.status === "flagged";
        if (tab === "Void") return e.status === "void";
        return true;
      }),
    [entries, tab],
  );
  const open = entries.find((e) => e.id === openId) ?? null;

  if (orgs === null || (slug && !ledger && !error)) {
    return (
      <>
        <PageHead title="Finance ledger" sub={sub ?? "Every peso in and out, with receipts."} />
        <PanelSkeleton rows={5} />
      </>
    );
  }
  if (!slug) {
    return (
      <>
        <PageHead title="Finance ledger" sub={sub ?? "Every peso in and out, with receipts."} />
        <EmptyState icon={Wallet} title="No organization books to show" sub="Finances are visible to an organization's officers, adviser, admins and active members." />
      </>
    );
  }
  if (!ledger) {
    return (
      <>
        <PageHead title="Finance ledger" />
        <EmptyState icon={AlertTriangle} title="Couldn't open these books" sub={error ?? undefined} action={<AppButton onClick={() => void reload()}>Try again</AppButton>} />
      </>
    );
  }

  const { access } = ledger;
  const columns: Column<FinanceEntry>[] = [
    {
      key: "occurredOn",
      label: "Date",
      sortable: true,
      render: (e) => <span className="whitespace-nowrap text-muted-foreground">{dateLabel(e.occurredOn)}</span>,
    },
    {
      key: "description",
      label: "Transaction",
      render: (e) => (
        <button type="button" onClick={() => setOpenId(e.id)} className="flex items-start gap-3 text-left">
          <KindIcon kind={e.kind} />
          <span className="min-w-0">
            <span className={cn("block font-semibold", e.status === "void" && "text-muted-foreground line-through")}>{e.description}</span>
            <span className="block text-xs text-muted-foreground">
              {e.category}
              {e.eventTitle ? ` · ${e.eventTitle}` : ""}
            </span>
          </span>
        </button>
      ),
    },
    {
      key: "amountCents",
      label: "Amount",
      sortable: true,
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (e) => <Amount entry={e} />,
    },
    {
      key: "receipts",
      label: "Receipts",
      render: (e) =>
        e.receipts.length ? (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Paperclip className="h-3.5 w-3.5" /> {e.receipts.length}
          </span>
        ) : e.kind === "expense" && e.status !== "void" ? (
          <Badge tone="danger">Missing</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (e) => <Badge tone={STATUS_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge>,
    },
    {
      key: "open",
      label: "",
      render: (e) => (
        <AppButton variant="ghost" size="sm" onClick={() => setOpenId(e.id)} aria-label={`Open ${e.description}`}>
          <Eye className="h-4 w-4" /> Open
        </AppButton>
      ),
    },
  ];

  const exportCsv = () =>
    downloadCsv(
      `${ledger.org.slug}-ledger.csv`,
      entries.map((e) => ({
        Date: e.occurredOn,
        Type: e.kind === "income" ? "Money in" : "Money out",
        Category: e.category,
        Description: e.description,
        Event: e.eventTitle ?? "",
        Amount: (e.kind === "income" ? 1 : -1) * (e.amountCents / 100),
        Status: STATUS_LABEL[e.status],
        Receipts: e.receipts.map((r) => `${r.filename} (SHA-256 ${r.sha256})`).join("; "),
        "Recorded by": e.createdBy,
        Note: e.reviewNote ?? "",
      })),
    );

  return (
    <>
      <PageHead
        title="Finance ledger"
        sub={sub ?? `Every peso in and out of ${ledger.org.name}, with receipts.`}
        action={
          <div className="flex flex-wrap gap-2">
            <AppButton variant="secondary" onClick={exportCsv}>
              <Download className="h-4 w-4" /> Export CSV
            </AppButton>
            {access.record ? (
              <AppButton variant="primary" onClick={() => setRecording(true)}>
                <Plus className="h-4 w-4" /> Record transaction
              </AppButton>
            ) : null}
          </div>
        }
      />

      {!fixedSlug && orgs.length > 1 ? (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label htmlFor="finance-org" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Organization
          </label>
          <select
            id="finance-org"
            value={slug}
            onChange={(e) => {
              setPicked(e.target.value);
              setTab("All");
            }}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
          >
            {orgs.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Balance" value={formatPeso(totals.balance)} delta={`${formatPeso(totals.verifiedBalance)} verified`} icon={Wallet} />
        <StatCard label="Money in" value={formatPeso(totals.income)} icon={ArrowDownLeft} tone="emerald" />
        <StatCard label="Money out" value={formatPeso(totals.expenses)} icon={ArrowUpRight} tone="rose" />
        <StatCard
          label="Needs attention"
          value={String(totals.awaiting + totals.flagged)}
          delta={`${totals.awaiting} awaiting review · ${totals.flagged} flagged · ${totals.missingReceipts} without receipt`}
          icon={ShieldCheck}
          tone="gold"
        />
      </div>

      <TransparencyNote ledger={ledger} awaiting={totals.awaiting} />

      <Panel>
        <AppTabs items={TABS} value={tab} onChange={setTab} className="mb-4" />
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(e) => e.id}
          loading={loading && !entries.length}
          searchable
          searchQuery={q}
          onSearchChange={setQ}
          searchPlaceholder="Search transactions..."
          emptyTitle={tab === "All" ? "No transactions yet" : `Nothing under “${tab}”`}
          emptySub={access.record && tab === "All" ? "Record the first income or expense to start the books." : undefined}
          emptyIcon={<Landmark className="h-5 w-5" />}
        />
      </Panel>

      {access.record ? (
        <RecordDialog open={recording} onClose={() => setRecording(false)} ledger={ledger} onSaved={reload} onOpen={setOpenId} />
      ) : null}
      <EntryDialog entry={open} ledger={ledger} onClose={() => setOpenId(null)} onChanged={reload} />
    </>
  );
}

function KindIcon({ kind }: { kind: FinanceKind }) {
  return (
    <span
      className={cn(
        "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl",
        kind === "income"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
      )}
      aria-label={kind === "income" ? "Money in" : "Money out"}
    >
      {kind === "income" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
    </span>
  );
}

function Amount({ entry }: { entry: FinanceEntry }) {
  return (
    <span
      className={cn(
        "whitespace-nowrap font-display font-semibold tabular-nums",
        entry.status === "void"
          ? "text-muted-foreground line-through"
          : entry.kind === "income"
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-foreground",
      )}
    >
      {entry.kind === "income" ? "+" : "−"}
      {formatPeso(entry.amountCents)}
    </span>
  );
}

function TransparencyNote({ ledger, awaiting }: { ledger: Ledger; awaiting: number }) {
  const { access } = ledger;
  const [icon, title, text] = access.record
    ? [
        ShieldCheck,
        "Open books",
        "Your active members can see this ledger and its receipts. Entries can't be edited or deleted: void a mistake with a reason, and attach a receipt to every expense so your adviser can verify it.",
      ]
    : access.review
      ? [
          ShieldCheck,
          awaiting ? `${awaiting} transaction${awaiting === 1 ? "" : "s"} waiting for your review` : "All caught up",
          "Open a transaction to check its receipts, then verify it or flag it with a note for the leader. Expenses need a receipt before they can be verified.",
        ]
      : [
          Eye,
          "Read-only member view",
          "As an active member you can see every transaction, its receipts and who recorded and verified it. Questions? Ask your officers or adviser.",
        ];
  const Icon = icon;
  return (
    <div className="mb-6 flex items-start gap-3 rounded-3xl border border-border bg-secondary/40 p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="font-display text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

// ---------- Recording ----------

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function checkFiles(files: File[], room: number) {
  if (files.length > room) return `You can attach up to ${room} more receipt${room === 1 ? "" : "s"}.`;
  const big = files.find((f) => f.size > MAX_RECEIPT_BYTES);
  if (big) return `${big.name} is larger than ${MAX_RECEIPT_BYTES / 1024 / 1024} MB.`;
  return "";
}

function RecordDialog({
  open,
  onClose,
  ledger,
  onSaved,
  onOpen,
}: {
  open: boolean;
  onClose: () => void;
  ledger: Ledger;
  onSaved: () => Promise<void>;
  onOpen: (id: string) => void;
}) {
  const workflows = useWorkflows();
  const events = workflows.filter((w) => w.orgName === ledger.org.name);
  const [kind, setKind] = useState<FinanceKind>("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [eventId, setEventId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadKey, setUploadKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKind("expense");
    setAmount("");
    setDate(today());
    setCategory(EXPENSE_CATEGORIES[0]);
    setDescription("");
    setEventId("");
    setFiles([]);
    setUploadKey((k) => k + 1);
    setSubmitted(false);
    setError("");
    setBusy(false);
  }, [open]);

  const cents = Math.round(Number(amount.replace(/,/g, "")) * 100);
  const fieldError = !submitted
    ? ""
    : !(cents > 0)
      ? "Enter an amount greater than zero."
      : description.trim().length < 3
        ? "Describe what the money was for."
        : !date
          ? "Enter the date of the transaction."
          : checkFiles(files, MAX_RECEIPTS_PER_ENTRY);

  async function save() {
    setSubmitted(true);
    setError("");
    if (!(cents > 0) || description.trim().length < 3 || !date || checkFiles(files, MAX_RECEIPTS_PER_ENTRY)) return;
    setBusy(true);
    const event = events.find((w) => w.id === eventId);
    const res = await recordEntry(ledger.org.slug, {
      kind,
      amountCents: cents,
      category,
      description: description.trim(),
      occurredOn: date,
      workflowId: event?.id ?? null,
      eventTitle: event?.proposal.title ?? null,
    });
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      return;
    }
    const failed: string[] = [];
    for (const f of files) {
      const up = await uploadReceipt(res.id, f);
      if (!up.ok) failed.push(up.error);
    }
    await onSaved();
    setBusy(false);
    onClose();
    if (failed.length) {
      showStatusToast("Transaction recorded, but a receipt didn't upload", failed[0], "warning");
      onOpen(res.id);
    } else {
      showStatusToast(
        "Transaction recorded",
        kind === "expense" && !files.length ? "Attach the receipt so your adviser can verify it." : "It's now waiting for your adviser's review.",
      );
    }
  }

  const categories = kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Record a transaction</DialogTitle>
          <DialogDescription>Recorded entries can't be edited later, only voided with a reason, so check the details.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type">
            {(["income", "expense"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => {
                  setKind(k);
                  setCategory((k === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0]);
                }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  kind === k ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-secondary",
                )}
              >
                {k === "income" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                {k === "income" ? "Money in" : "Money out"}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Amount (₱)</span>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
                placeholder="0.00"
                aria-invalid={submitted && !(cents > 0)}
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className={labelCls}>Date</span>
              <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </label>
          </div>

          <label className="block">
            <span className={labelCls}>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelCls}>Description</span>
            <input
              value={description}
              maxLength={300}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={kind === "income" ? "e.g. Membership dues, first semester" : "e.g. Snacks for volunteers"}
              aria-invalid={submitted && description.trim().length < 3}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className={labelCls}>Event (optional)</span>
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputCls}>
              <option value="">Not linked to an event</option>
              {events.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.proposal.title}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className={labelCls}>Receipts {kind === "expense" ? "(needed for verification)" : "(optional)"}</span>
            <FileUpload key={uploadKey} accept={RECEIPT_ACCEPT} multiple onFiles={setFiles} hint="PDF or photo of the receipt (JPG, PNG, WebP)" />
            <p className="mt-2 text-xs text-muted-foreground">
              PDF or photo (JPG, PNG, WebP), up to {MAX_RECEIPT_BYTES / 1024 / 1024} MB each, {MAX_RECEIPTS_PER_ENTRY} per transaction.
            </p>
          </div>

          {fieldError || error ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {fieldError || error}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          <AppButton variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </AppButton>
          <AppButton variant="primary" onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : "Record transaction"}
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- One transaction ----------

function EntryDialog({ entry, ledger, onClose, onChanged }: { entry: FinanceEntry | null; ledger: Ledger; onClose: () => void; onChanged: () => Promise<void> }) {
  const { access } = ledger;
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"flag" | "void" | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadKey, setUploadKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ url: string; filename: string; mime: string } | null>(null);

  useEffect(() => {
    setNote("");
    setMode(null);
    setFiles([]);
    setError("");
    setUploadKey((k) => k + 1);
  }, [entry?.id]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url);
  }, [preview]);

  if (!entry) return null;
  const locked = entry.status === "verified" || entry.status === "void";
  const room = MAX_RECEIPTS_PER_ENTRY - entry.receipts.length;
  const canReview = access.review && (entry.status === "recorded" || entry.status === "flagged");

  async function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>, done: string) {
    setBusy(true);
    setError("");
    const res = await action();
    await onChanged();
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return false;
    }
    showStatusToast(done, entry!.description);
    setMode(null);
    setNote("");
    return true;
  }

  async function upload() {
    const problem = checkFiles(files, room);
    if (problem) return setError(problem);
    setBusy(true);
    setError("");
    const failed: string[] = [];
    for (const f of files) {
      const res = await uploadReceipt(entry!.id, f);
      if (!res.ok) failed.push(res.error);
    }
    await onChanged();
    setBusy(false);
    setFiles([]);
    setUploadKey((k) => k + 1);
    if (failed.length) setError(failed.join(" "));
    else showStatusToast(files.length === 1 ? "Receipt attached" : "Receipts attached", entry!.description);
  }

  async function view(r: ReceiptMeta, download = false) {
    const res = await openReceipt(r.id);
    if (!res.ok) return setError(res.error);
    if (download) {
      const a = document.createElement("a");
      a.href = res.url;
      a.download = res.filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(res.url), 10_000);
    } else {
      setPreview(res);
    }
  }

  const facts: Array<[string, string]> = [
    ["Date", dateLabel(entry.occurredOn)],
    ["Category", entry.category],
    ["Event", entry.eventTitle ?? "Not linked"],
    ["Recorded by", `${entry.createdBy} · ${timeLabel(entry.createdAt)}`],
  ];

  return (
    <>
      <Dialog open={Boolean(entry)} onOpenChange={(o) => !o && !busy && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-2xl">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONE[entry.status]}>{STATUS_LABEL[entry.status]}</Badge>
              <Badge tone={entry.kind === "income" ? "success" : "neutral"}>{entry.kind === "income" ? "Money in" : "Money out"}</Badge>
            </div>
            <DialogTitle className="font-display text-xl">{entry.description}</DialogTitle>
            <DialogDescription asChild>
              <div className="pt-1 text-2xl">
                <Amount entry={entry} />
              </div>
            </DialogDescription>
          </DialogHeader>

          {entry.reviewNote ? (
            <div
              className={cn(
                "rounded-2xl border p-4 text-sm",
                entry.status === "flagged"
                  ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
                  : "border-border bg-secondary/40",
              )}
            >
              <p className="font-semibold">{entry.status === "void" ? "Reason for voiding" : entry.status === "flagged" ? "Flagged by reviewer" : "Reviewer note"}</p>
              <p className="mt-1">{entry.reviewNote}</p>
            </div>
          ) : null}

          <dl className="grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 text-sm">{v}</dd>
              </div>
            ))}
          </dl>

          <section>
            <h3 className="mb-2 font-display text-sm font-semibold">Receipts</h3>
            {entry.receipts.length ? (
              <ul className="space-y-2">
                {entry.receipts.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.filename}</p>
                      <p className="truncate text-xs text-muted-foreground" title={`SHA-256 ${r.sha256}`}>
                        {sizeLabel(r.size)} · {r.uploadedBy} · {timeLabel(r.uploadedAt)} · SHA-256 {r.sha256.slice(0, 12)}…
                      </p>
                    </div>
                    <AppButton variant="ghost" size="sm" onClick={() => void view(r)} aria-label={`View ${r.filename}`}>
                      <Eye className="h-4 w-4" />
                    </AppButton>
                    <AppButton variant="ghost" size="sm" onClick={() => void view(r, true)} aria-label={`Download ${r.filename}`}>
                      <Download className="h-4 w-4" />
                    </AppButton>
                    {access.record && !locked ? (
                      <AppButton
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={busy}
                        onClick={() => void run(() => removeReceipt(r.id), "Receipt removed")}
                        aria-label={`Remove ${r.filename}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </AppButton>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
                {entry.kind === "expense" ? "No receipt yet. An expense can't be verified without one." : "No receipt attached."}
              </p>
            )}

            {access.record && !locked && room > 0 ? (
              <div className="mt-3 space-y-2">
                <FileUpload key={uploadKey} accept={RECEIPT_ACCEPT} multiple onFiles={setFiles} hint="PDF or photo of the receipt (JPG, PNG, WebP)" />
                {files.length ? (
                  <AppButton variant="primary" size="sm" disabled={busy} onClick={() => void upload()}>
                    <Paperclip className="h-4 w-4" /> {busy ? "Uploading…" : `Attach ${files.length} receipt${files.length === 1 ? "" : "s"}`}
                  </AppButton>
                ) : null}
              </div>
            ) : null}
          </section>

          <section>
            <h3 className="mb-2 font-display text-sm font-semibold">History</h3>
            <ol className="space-y-3 border-l border-border pl-4">
              {entry.history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="text-sm">
                    <span className="font-semibold">{h.action}</span> by {h.by} <span className="text-muted-foreground">({h.role})</span>
                  </p>
                  {h.note ? <p className="text-sm text-muted-foreground">{h.note}</p> : null}
                  <p className="text-xs text-muted-foreground">{timeLabel(h.at)}</p>
                </li>
              ))}
            </ol>
          </section>

          {mode ? (
            <label className="block">
              <span className={labelCls}>{mode === "flag" ? "What needs fixing?" : "Why void this transaction?"}</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={500}
                className={inputCls}
                placeholder={mode === "flag" ? "e.g. The receipt total doesn't match the amount." : "e.g. Recorded twice by mistake."}
              />
            </label>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter className="flex-wrap gap-2">
            {mode ? (
              <>
                <AppButton variant="secondary" disabled={busy} onClick={() => setMode(null)}>
                  Cancel
                </AppButton>
                <AppButton
                  variant="primary"
                  disabled={busy || note.trim().length < 3}
                  onClick={() =>
                    void run(
                      () => (mode === "flag" ? reviewEntry(entry.id, "flag", note) : voidEntry(entry.id, note)),
                      mode === "flag" ? "Transaction flagged" : "Transaction voided",
                    )
                  }
                >
                  {mode === "flag" ? <Flag className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                  {mode === "flag" ? "Flag for the leader" : "Void transaction"}
                </AppButton>
              </>
            ) : (
              <>
                {access.record && !locked ? (
                  <AppButton variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setMode("void")}>
                    <Ban className="h-4 w-4" /> Void
                  </AppButton>
                ) : null}
                {canReview && entry.status === "recorded" ? (
                  <AppButton variant="secondary" onClick={() => setMode("flag")}>
                    <Flag className="h-4 w-4" /> Flag
                  </AppButton>
                ) : null}
                {canReview ? (
                  <AppButton
                    variant="primary"
                    disabled={busy || (entry.kind === "expense" && !entry.receipts.length)}
                    title={entry.kind === "expense" && !entry.receipts.length ? "Needs a receipt first" : undefined}
                    onClick={() => void run(() => reviewEntry(entry.id, "verify", ""), "Transaction verified")}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Verify
                  </AppButton>
                ) : (
                  <AppButton variant="secondary" onClick={onClose}>
                    Close
                  </AppButton>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(preview)}
        onOpenChange={(o) => {
          if (!o) setPreview(null);
        }}
      >
        <DialogContent className="max-h-[92vh] rounded-3xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate font-display text-base">{preview?.filename}</DialogTitle>
            <DialogDescription>Receipt for “{entry.description}”</DialogDescription>
          </DialogHeader>
          {preview ? (
            preview.mime === "application/pdf" ? (
              <iframe title={preview.filename} src={preview.url} className="h-[70vh] w-full rounded-2xl border border-border bg-white" />
            ) : (
              <img src={preview.url} alt={`Receipt ${preview.filename}`} className="mx-auto max-h-[70vh] rounded-2xl border border-border object-contain" />
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

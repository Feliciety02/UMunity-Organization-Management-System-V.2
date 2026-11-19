// Types and limits shared by the finance server code and the finance pages.

export type FinanceKind = "income" | "expense";
/** recorded = waiting for the adviser; flagged = sent back with a note; void = cancelled, kept on record. */
export type FinanceStatus = "recorded" | "verified" | "flagged" | "void";

export type ReceiptMeta = {
  id: string;
  filename: string;
  mime: string;
  size: number;
  sha256: string;
  uploadedBy: string;
  uploadedAt: number;
};
export type FinanceHistory = {
  at: number;
  by: string;
  role: string;
  action: string;
  note: string | null;
};

export type FinanceEntry = {
  id: string;
  kind: FinanceKind;
  amountCents: number;
  category: string;
  description: string;
  occurredOn: string;
  workflowId: string | null;
  eventTitle: string | null;
  status: FinanceStatus;
  reviewNote: string | null;
  createdBy: string;
  createdAt: number;
  receipts: ReceiptMeta[];
  history: FinanceHistory[];
};

export type FinanceAccess = { view: boolean; record: boolean; review: boolean };
export type Ledger = {
  org: { slug: string; name: string };
  access: FinanceAccess;
  entries: FinanceEntry[];
};

export const INCOME_CATEGORIES = [
  "Membership dues",
  "University allocation",
  "Sponsorship",
  "Fundraising",
  "Donation",
  "Other income",
] as const;
export const EXPENSE_CATEGORIES = [
  "Venue",
  "Food & refreshments",
  "Printing & supplies",
  "Transportation",
  "Equipment",
  "Honoraria",
  "Awards & prizes",
  "Other expense",
] as const;

export const MAX_AMOUNT_CENTS = 10_000_000_00; // ₱10,000,000
export const MAX_RECEIPT_BYTES = 4 * 1024 * 1024;
export const MAX_RECEIPTS_PER_ENTRY = 5;
export const RECEIPT_ACCEPT = "application/pdf,image/png,image/jpeg,image/webp";

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});
export const formatPeso = (cents: number) => peso.format(cents / 100);

/** Totals for the summary cards. Voided entries never count; unverified ones are shown apart. */
export function ledgerTotals(entries: FinanceEntry[]) {
  let income = 0;
  let expenses = 0;
  let verifiedIncome = 0;
  let verifiedExpenses = 0;
  let awaiting = 0;
  let flagged = 0;
  let missingReceipts = 0;
  for (const e of entries) {
    if (e.status === "void") continue;
    if (e.kind === "income") income += e.amountCents;
    else expenses += e.amountCents;
    if (e.status === "verified") {
      if (e.kind === "income") verifiedIncome += e.amountCents;
      else verifiedExpenses += e.amountCents;
    }
    if (e.status === "recorded") awaiting++;
    if (e.status === "flagged") flagged++;
    if (e.kind === "expense" && e.receipts.length === 0) missingReceipts++;
  }
  return {
    income,
    expenses,
    balance: income - expenses,
    verifiedBalance: verifiedIncome - verifiedExpenses,
    awaiting,
    flagged,
    missingReceipts,
  };
}

// Client side of the finance ledger: loads it from the server and wraps the actions.
import { useCallback, useEffect, useState } from "react";
import {
  addReceiptFn,
  financeOrgsFn,
  getReceiptFn,
  loadLedgerFn,
  recordEntryFn,
  removeReceiptFn,
  reviewEntryFn,
  voidEntryFn,
} from "@/lib/api.functions";
import type { FinanceStatus, Ledger } from "@/lib/finance-shared";

export * from "@/lib/finance-shared";

export type Result = { ok: true } | { ok: false; error: string };
const asResult = (res: { ok: boolean; error?: string }): Result =>
  res.ok ? { ok: true } : { ok: false, error: res.error ?? "Something went wrong." };

/** Organizations whose books the signed-in user can open. */
export function useFinanceOrgs() {
  const [orgs, setOrgs] = useState<Array<{ slug: string; name: string }> | null>(null);
  useEffect(() => {
    let live = true;
    financeOrgsFn()
      .then((list) => live && setOrgs(list))
      .catch(() => live && setOrgs([]));
    return () => {
      live = false;
    };
  }, []);
  return orgs;
}

export function useLedger(slug: string | null) {
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await loadLedgerFn({ data: { slug } });
      if (res.ok) {
        setLedger(res.ledger);
        setError(null);
      } else setError(res.error);
    } catch {
      setError("The ledger couldn't be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    setLedger(null);
    void reload();
  }, [reload]);

  return { ledger, error, loading, reload };
}

export async function recordEntry(
  slug: string,
  entry: Parameters<typeof recordEntryFn>[0]["data"]["entry"],
) {
  const res = await recordEntryFn({ data: { slug, entry } });
  return res.ok ? { ok: true as const, id: res.id } : { ok: false as const, error: res.error };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function uploadReceipt(entryId: string, file: File): Promise<Result> {
  try {
    const dataBase64 = await fileToBase64(file);
    return asResult(await addReceiptFn({ data: { entryId, filename: file.name, dataBase64 } }));
  } catch {
    return {
      ok: false,
      error: `${file.name} couldn't be uploaded. Check your connection and try again.`,
    };
  }
}

export const removeReceipt = async (receiptId: string) =>
  asResult(await removeReceiptFn({ data: { receiptId } }));
export const reviewEntry = async (entryId: string, decision: "verify" | "flag", note: string) =>
  asResult(await reviewEntryFn({ data: { entryId, decision, note } }));
export const voidEntry = async (entryId: string, reason: string) =>
  asResult(await voidEntryFn({ data: { entryId, reason } }));

/** Fetch a receipt and return a temporary browser URL for viewing or downloading it. */
export async function openReceipt(
  receiptId: string,
): Promise<
  { ok: true; url: string; filename: string; mime: string } | { ok: false; error: string }
> {
  const res = await getReceiptFn({ data: { receiptId } });
  if (!res.ok) return res;
  const bin = atob(res.dataBase64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: res.mime }));
  return { ok: true, url, filename: res.filename, mime: res.mime };
}

export const STATUS_LABEL: Record<FinanceStatus, string> = {
  recorded: "Awaiting review",
  verified: "Verified",
  flagged: "Flagged",
  void: "Void",
};
export const STATUS_TONE: Record<FinanceStatus, "warning" | "success" | "danger" | "neutral"> = {
  recorded: "warning",
  verified: "success",
  flagged: "danger",
  void: "neutral",
};

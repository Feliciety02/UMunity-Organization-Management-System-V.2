import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppButton } from "@/components/ui/app-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEventDoc, updateEventDoc, type EventDoc } from "@/lib/event-requirements";
import { showStatusToast } from "@/lib/feedback";

const schema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120, "Keep under 120 characters"),
  category: z.string().trim().min(2, "Category is required").max(40),
  venue: z.string().trim().min(2, "Venue is required").max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a valid time"),
  objectives: z.string().trim().min(5, "Add a short objective").max(600),
  collaborators: z.string().trim().max(200).optional().default(""),
  orgShort: z.string().trim().min(2, "Org short code required").max(20).regex(/^[A-Za-z0-9]+$/, "Letters and digits only"),
});

type FormValues = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormValues, string>>;

const empty: FormValues = {
  title: "",
  category: "",
  venue: "",
  date: "",
  time: "09:00",
  objectives: "",
  collaborators: "",
  orgShort: "UMCSS",
};

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  doc?: EventDoc | null;
  onSaved?: (id: string) => void;
}

export function EventFormDialog({ open, onOpenChange, mode, doc, onSaved }: EventFormDialogProps) {
  const [values, setValues] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && doc) {
      setValues({
        title: doc.title,
        category: doc.category,
        venue: doc.venue,
        date: doc.date,
        time: doc.time,
        objectives: doc.objectives,
        collaborators: doc.collaborators,
        orgShort: doc.orgShort,
      });
    } else {
      setValues(empty);
    }
    setErrors({});
  }, [open, mode, doc]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    if (mode === "edit" && doc) {
      updateEventDoc(doc.id, parsed.data);
      showStatusToast("Event updated", `${parsed.data.title} saved.`, "success");
      onSaved?.(doc.id);
    } else {
      const created = createEventDoc(parsed.data);
      showStatusToast("Event created", `Requirements tracker ready for ${created.title}.`, "success");
      onSaved?.(created.id);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {mode === "edit" ? "Edit event" : "New event"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update event details. Requirements tracker stays in sync."
              : "Create an event to auto-generate its OSA Requirements Tracker."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Title" error={errors.title}>
            <Input value={values.title} onChange={(e) => update("title", e.target.value)} maxLength={120} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors.category}>
              <Input value={values.category} onChange={(e) => update("category", e.target.value)} placeholder="Conference, Workshop, ..." maxLength={40} />
            </Field>
            <Field label="Organization code" error={errors.orgShort}>
              <Input value={values.orgShort} onChange={(e) => update("orgShort", e.target.value)} placeholder="UMCSS" maxLength={20} />
            </Field>
          </div>

          <Field label="Venue" error={errors.venue}>
            <Input value={values.venue} onChange={(e) => update("venue", e.target.value)} maxLength={120} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" error={errors.date}>
              <Input type="date" value={values.date} onChange={(e) => update("date", e.target.value)} />
            </Field>
            <Field label="Time" error={errors.time}>
              <Input type="time" value={values.time} onChange={(e) => update("time", e.target.value)} />
            </Field>
          </div>

          <Field label="Objectives" error={errors.objectives}>
            <Textarea rows={3} value={values.objectives} onChange={(e) => update("objectives", e.target.value)} maxLength={600} />
          </Field>

          <Field label="Collaborators" error={errors.collaborators} optional>
            <Input value={values.collaborators} onChange={(e) => update("collaborators", e.target.value)} placeholder="Partner orgs, sponsors" maxLength={200} />
          </Field>

          <DialogFooter className="gap-2">
            <AppButton type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </AppButton>
            <AppButton type="submit" variant="primary">
              {mode === "edit" ? "Save changes" : "Create event"}
            </AppButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {optional ? <span className="text-[10px] normal-case text-muted-foreground/70">(optional)</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

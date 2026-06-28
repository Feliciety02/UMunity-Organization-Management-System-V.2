import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = { id: string; label: string; description?: string };
export type StepState = "done" | "current" | "upcoming";

export function Stepper({
  steps,
  currentIndex,
  className,
}: {
  steps: Step[];
  currentIndex: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start", className)}>
      {steps.map((step, i) => {
        const state: StepState = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
        return (
          <div key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition-all",
                  state === "done" && "bg-gradient-gold text-primary-deep",
                  state === "current" && "border-2 border-primary bg-primary/10 text-primary",
                  state === "upcoming" && "border-2 border-border bg-card text-muted-foreground",
                )}
              >
                {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "font-display text-xs font-semibold",
                    state === "current" ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
                {step.description ? (
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{step.description}</p>
                ) : null}
              </div>
            </div>
            {i < steps.length - 1 ? (
              <div
                className={cn(
                  "mx-2 mb-6 h-px flex-1",
                  i < currentIndex ? "bg-gold/60" : "bg-border",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = ["Empresa", "Administrador", "Setores", "Usuários", "Revisão"] as const;

export function Stepper({ current }: { current: number }) {
  const pct = ((current + 1) / STEPS.length) * 100;

  return (
    <div>
      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-foreground">{STEPS[current]}</span>
          <span className="text-xs font-medium text-muted-foreground">
            Etapa {current + 1} de {STEPS.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-soft/60">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden items-center md:flex">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-primary-wash text-primary",
                    !done && !active && "border-border bg-card text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-sm",
                    active ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 ? (
                <span
                  className={cn(
                    "mx-3 h-px flex-1 transition-colors duration-300",
                    done ? "bg-primary/40" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

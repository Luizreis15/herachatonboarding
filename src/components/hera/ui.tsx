import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@/lib/hera/types";

/* ---------------------------------- Button --------------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "danger";

export const HeraButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; block?: boolean }
>(function HeraButton({ className, variant = "primary", block, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] px-5 text-sm font-medium",
        "h-12 transition-colors duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        block && "w-full",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft",
        variant === "secondary" &&
          "border border-border bg-card text-foreground hover:bg-primary-wash",
        variant === "ghost" && "text-muted-foreground hover:bg-primary-wash hover:text-primary",
        variant === "danger" &&
          "border border-border bg-card text-destructive hover:bg-destructive/5",
        className,
      )}
      {...props}
    />
  );
});

/* ----------------------------------- Card ---------------------------------- */

export function HeraCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-card", className)}>
      {children}
    </div>
  );
}

/* ---------------------------------- Fields --------------------------------- */

export const HeraInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function HeraInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-[10px] border border-border bg-card px-4 text-[15px] text-foreground",
          "placeholder:text-muted-foreground/60 transition-shadow duration-150 outline-none",
          "focus:border-primary focus:ring-4 focus:ring-primary/10",
          className,
        )}
        {...props}
      />
    );
  },
);

export function Field({
  label,
  required,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ml-1 text-primary">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/* --------------------------------- Status ---------------------------------- */

const statusStyles: Record<SubmissionStatus, string> = {
  pendente: "bg-warning/10 text-warning border-warning/20",
  revisado: "bg-primary-wash text-primary border-primary-soft",
  criado: "bg-success/10 text-success border-success/20",
};

export function StatusPill({
  status,
  className,
}: {
  status: SubmissionStatus;
  className?: string;
}) {
  const label = { pendente: "Pendente", revisado: "Revisado", criado: "Criado" }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

import { cn } from "@/lib/utils";

export function HeraMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 5v14M18 5v14M6 12h12" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9.2" strokeOpacity="0.35" />
      </svg>
    </span>
  );
}

export function HeraLogo({
  className,
  subtitle,
  invert,
}: {
  className?: string;
  subtitle?: string;
  invert?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <HeraMark
        className={invert ? "bg-primary-foreground/10 text-primary-foreground" : undefined}
      />
      <div className="leading-tight">
        <div
          className={cn(
            "text-[15px] font-bold tracking-tight",
            invert ? "text-primary-foreground" : "text-foreground",
          )}
        >
          Digital Hera
        </div>
        {subtitle ? (
          <div
            className={cn(
              "text-xs font-normal",
              invert ? "text-primary-foreground/60" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}

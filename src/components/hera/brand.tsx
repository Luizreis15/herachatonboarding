import { cn } from "@/lib/utils";

export function HeraMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground",
        className,
      )}
      aria-hidden
    >
      H
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
      <HeraMark className={invert ? "bg-white/15 text-white" : undefined} />
      <div className="leading-tight">
        <div
          className={cn(
            "text-[15px] font-bold tracking-tight",
            invert ? "text-white" : "text-foreground",
          )}
        >
          Digital Hera
        </div>
        {subtitle ? (
          <div
            className={cn(
              "text-xs font-medium",
              invert ? "text-white/65" : "text-muted-foreground",
            )}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}

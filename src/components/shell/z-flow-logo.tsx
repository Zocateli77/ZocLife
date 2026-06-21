import { cn } from "@/lib/utils";

type ZFlowMarkProps = {
  className?: string;
  /** Pixel size of the square mark */
  size?: number;
};

/**
 * ZocLabs "Z·Flow" mark — the Z of Zoc as an automation flow of connected
 * nodes. Teal strokes/nodes use currentColor; the result node is fixed amber.
 * Geometry mirrors C:\Users\zocat\Downloads\ZocLabs\logo.svg.
 */
export function ZFlowMark({ className, size = 32 }: ZFlowMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="ZocLabs"
      className={cn("text-teal-text", className)}
    >
      <path
        d="M24 26 H76 L24 74 H76"
        fill="none"
        stroke="currentColor"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="26" r="9" fill="currentColor" />
      <circle cx="76" cy="26" r="9" fill="currentColor" />
      <circle cx="24" cy="74" r="9" fill="currentColor" />
      <circle cx="76" cy="74" r="10.5" fill="#F59E0B" />
    </svg>
  );
}

type ZFlowLogoProps = {
  /** Second word of the lockup, e.g. "Life" or "Labs" */
  suffix?: string;
  tagline?: string;
  className?: string;
};

/**
 * Full horizontal lockup: Z·Flow mark + "Zoc<suffix>" wordmark + optional
 * mono tagline. Used in the sidebar and login.
 */
export function ZFlowLogo({
  suffix = "Life",
  tagline = "Execução pessoal",
  className,
}: ZFlowLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <ZFlowMark size={30} className="shrink-0" />
      <div className="leading-none">
        <p className="font-heading text-base font-bold tracking-tight">
          Zoc<span className="text-teal-text">{suffix}</span>
        </p>
        {tagline && (
          <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

type EyebrowProps = React.HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span" | "div";
};

/**
 * ZocLabs technical label — JetBrains Mono, uppercase, wide tracking, steel.
 * Used as a section/card "eyebrow" above headings (e.g. HOJE · TER 20, PIPELINE).
 */
export function Eyebrow({ as: Tag = "p", className, ...props }: EyebrowProps) {
  return (
    <Tag
      className={cn(
        "font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

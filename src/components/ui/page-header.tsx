import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/eyebrow";

type PageHeaderProps = {
  /** Mono technical label above the title */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned actions (buttons, toggles) */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Uniform page header for all modules: mono eyebrow + Space Grotesk title +
 * optional description, with an actions slot on the right.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <Eyebrow className="mb-1.5">{eyebrow}</Eyebrow>}
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

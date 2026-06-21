import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/eyebrow";

type EmptyStateProps = {
  icon?: LucideIcon;
  /** Short mono label above the title (e.g. SEM TAREFAS) */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional call-to-action (usually a Button) */
  action?: React.ReactNode;
  className?: string;
};

/**
 * ZocLabs standardized empty state: dashed steel border, icon chip,
 * mono eyebrow + title + description, optional action.
 */
export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-steel/30 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal-text">
          <Icon className="h-5 w-5" />
        </div>
      )}
      {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
      <p className="font-heading text-base font-semibold text-foreground">
        {title}
      </p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

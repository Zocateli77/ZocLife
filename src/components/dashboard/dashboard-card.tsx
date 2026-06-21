import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DashboardCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "success" | "warning" | "danger";
  accent?: "none" | "teal" | "amber";
  emptyLabel?: string;
  children?: React.ReactNode;
};

export function DashboardCard({
  title,
  description,
  icon: Icon,
  href,
  badge,
  badgeVariant = "secondary",
  accent = "teal",
  emptyLabel = "Nada por aqui hoje",
  children,
}: DashboardCardProps) {
  const content = (
    <Card
      accent={accent}
      className="group h-full transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10 text-teal-text">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </div>
        {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
      </CardHeader>
      <CardContent>{children ?? <EmptyLine label={emptyLabel} />}</CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function EmptyLine({ label }: { label: string }) {
  return (
    <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground/70">
      {label}
    </p>
  );
}

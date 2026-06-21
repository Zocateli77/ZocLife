import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";

type DayProgressProps = {
  percentage?: number;
  completed?: number;
  total?: number;
};

export function DayProgress({
  percentage = 0,
  completed = 0,
  total = 0,
}: DayProgressProps) {
  const complete = percentage >= 100 && total > 0;

  return (
    <Card accent="teal" glow={complete}>
      <CardHeader className="pb-3">
        <div className="flex items-end justify-between">
          <div>
            <Eyebrow className="mb-1">Foco do dia</Eyebrow>
            <p className="font-heading text-base font-semibold leading-none">
              Progresso do dia
            </p>
          </div>
          <span className="font-mono text-3xl font-bold leading-none text-teal-text">
            {percentage}
            <span className="text-lg text-muted-foreground">%</span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="mb-2 h-3" />
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
          {completed} / {total} itens concluídos
        </p>
      </CardContent>
    </Card>
  );
}

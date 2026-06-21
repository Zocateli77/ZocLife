"use client";

import { Trophy, Flame, TrendingUp, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { GamificationStats } from "@/lib/gamification/queries";

const CATEGORY_LABELS: Record<string, string> = {
  habit: "Hábitos",
  workout: "Treinos",
  reading: "Leitura",
  content: "Conteúdo",
  task: "Tarefas",
  review: "Revisão",
  bonus: "Bônus",
};

export function GamificationView({ stats }: { stats: GamificationStats }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Competindo contra mim mesmo</h2>
        <p className="text-sm text-muted-foreground">Sua evolução pessoal em pontos</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-teal/30 bg-teal/5">
          <CardContent className="p-4 text-center">
            <Trophy className="mx-auto mb-2 h-6 w-6 text-teal-text" />
            <p className="font-heading text-3xl font-bold">{stats.weekScore}</p>
            <p className="text-xs text-muted-foreground">Pontos esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="mx-auto mb-2 h-6 w-6 text-amber" />
            <p className="font-heading text-3xl font-bold">Nível {stats.currentLevel}</p>
            <Progress value={stats.levelProgress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="mx-auto mb-2 h-6 w-6 text-amber" />
            <p className="font-heading text-3xl font-bold">{stats.streakDays}</p>
            <p className="text-xs text-muted-foreground">Dias bons seguidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-teal-text" />
            <p className="font-heading text-3xl font-bold">{stats.bestWeekScore}</p>
            <p className="text-xs text-muted-foreground">Melhor semana</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Pontuação do mês</CardTitle></CardHeader>
          <CardContent>
            <p className="font-heading text-4xl font-bold text-teal-text">{stats.monthScore}</p>
            <p className="text-sm text-muted-foreground">Hoje: +{stats.todayScore} pts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Por categoria (mês)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.byCategory).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span>{CATEGORY_LABELS[k] ?? k}</span>
                <Badge variant="outline">{v} pts</Badge>
              </div>
            ))}
            {Object.keys(stats.byCategory).length === 0 && (
              <p className="text-sm text-muted-foreground">Complete hábitos e tarefas para ganhar pontos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.recentScores.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Atividade recente</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.recentScores.map((s, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.score_date}</span>
                  <span>{s.description}</span>
                  <span className="font-medium text-teal-text">+{s.points}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet } from "@/components/ui/sheet";
import { createProject } from "@/lib/projects/actions";
import { PROJECT_STATUS_LABELS } from "@/lib/projects/types";
import type { Project } from "@/lib/projects/types";

export function ProjectsView({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      await createProject({ name, objective, description });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Projetos</h2>
          <p className="text-sm text-muted-foreground">{projects.length} projetos</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> Projeto</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <Badge variant="outline">{PROJECT_STATUS_LABELS[p.status]}</Badge>
              </div>
              {p.objective && <p className="text-xs text-muted-foreground">{p.objective}</p>}
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span>Progresso</span><span>{p.progress}%</span>
                </div>
                <Progress value={p.progress} />
                <p className="mt-1 text-xs text-muted-foreground">{p.done_count}/{p.task_count} tarefas</p>
              </div>
              {p.tasks && p.tasks.length > 0 && (
                <ul className="space-y-1">
                  {p.tasks.slice(0, 3).map((t) => (
                    <li key={t.id} className="text-xs text-muted-foreground truncate">• {t.title}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <FolderKanban className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Crie seu primeiro projeto</p>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen} title="Novo projeto">
        <form onSubmit={handleCreate} className="space-y-3">
          <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><Label>Objetivo</Label><Input value={objective} onChange={(e) => setObjective(e.target.value)} /></div>
          <div><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <Button type="submit" disabled={pending} className="w-full">Criar</Button>
        </form>
      </Sheet>
    </div>
  );
}

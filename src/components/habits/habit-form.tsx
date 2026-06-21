"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createHabit, updateHabit } from "@/lib/habits/actions";
import {
  HABIT_COLORS,
  HABIT_FREQUENCIES,
  HABIT_FREQUENCY_LABELS,
  HABIT_UNITS,
  HABIT_UNIT_LABELS,
  WEEKDAY_LABELS,
  type HabitFrequency,
  type HabitUnit,
} from "@/lib/habits/constants";
import type { Habit } from "@/lib/habits/types";

type HabitFormProps = {
  habit?: Habit | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "quick" | "full";
};

export function HabitForm({
  habit,
  onSuccess,
  onCancel,
  mode = "full",
}: HabitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [showFull, setShowFull] = useState(mode === "full");

  const [name, setName] = useState(habit?.name ?? "");
  const [description, setDescription] = useState(habit?.description ?? "");
  const [frequency, setFrequency] = useState<HabitFrequency>(
    habit?.frequency ?? "daily",
  );
  const [frequencyDays, setFrequencyDays] = useState<number[]>(
    habit?.frequency_days ?? [],
  );
  const [targetValue, setTargetValue] = useState(
    habit?.target_value?.toString() ?? "",
  );
  const [targetUnit, setTargetUnit] = useState(
    habit?.target_unit ?? "minutes",
  );
  const [color, setColor] = useState(habit?.color ?? HABIT_COLORS[0]);

  function toggleDay(day: number) {
    setFrequencyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    setError("");
    const payload = {
      name,
      description: description || null,
      frequency,
      frequency_days: frequency === "specific_days" ? frequencyDays : [],
      target_value: targetValue ? parseFloat(targetValue) : null,
      target_unit: targetValue ? targetUnit : null,
      color,
    };

    startTransition(async () => {
      try {
        if (habit) {
          await updateHabit({ id: habit.id, ...payload });
        } else {
          await createHabit(payload);
        }
        router.refresh();
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar hábito");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="habit-name">Nome *</Label>
        <Input
          id="habit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Bicicleta, Leitura, Meditar"
          autoFocus
        />
      </div>

      {showFull ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="habit-freq">Frequência</Label>
              <Select
                id="habit-freq"
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as HabitFrequency)
                }
              >
                {HABIT_FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {HABIT_FREQUENCY_LABELS[f]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="habit-color">Cor</Label>
              <Select
                id="habit-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              >
                {HABIT_COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {frequency === "specific_days" && (
            <div className="space-y-2">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_LABELS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      frequencyDays.includes(i)
                        ? "border-teal bg-teal/15 text-teal-text"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="habit-target">Meta numérica</Label>
              <Input
                id="habit-target"
                type="number"
                min={0}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="habit-unit">Unidade</Label>
              <Select
                id="habit-unit"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
              >
                {HABIT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {HABIT_UNIT_LABELS[u as HabitUnit]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="habit-desc">Descrição</Label>
            <Textarea
              id="habit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="habit-target-q">Meta</Label>
            <Input
              id="habit-target-q"
              type="number"
              min={0}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="habit-unit-q">Unidade</Label>
            <Select
              id="habit-unit-q"
              value={targetUnit}
              onChange={(e) => setTargetUnit(e.target.value)}
            >
              {HABIT_UNITS.map((u) => (
                <option key={u} value={u}>
                  {HABIT_UNIT_LABELS[u as HabitUnit]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {mode === "quick" && !showFull && (
        <button
          type="button"
          className="text-xs text-teal-text hover:underline"
          onClick={() => setShowFull(true)}
        >
          + Mais opções
        </button>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Salvando..." : habit ? "Salvar" : "Criar hábito"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

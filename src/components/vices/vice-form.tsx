"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createVice, updateVice } from "@/lib/vices/actions";
import {
  VICE_COLORS,
  VICE_UNITS,
  VICE_UNIT_LABELS,
  parseTimeToMinutes,
  type ViceUnit,
} from "@/lib/vices/constants";
import type { Vice } from "@/lib/vices/types";

type ViceFormProps = {
  vice?: Vice | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "quick" | "full";
};

export function ViceForm({
  vice,
  onSuccess,
  onCancel,
  mode = "full",
}: ViceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [showFull, setShowFull] = useState(mode === "full");

  const [name, setName] = useState(vice?.name ?? "");
  const [description, setDescription] = useState(vice?.description ?? "");
  const [limitUnit, setLimitUnit] = useState<ViceUnit>(
    (vice?.limit_unit as ViceUnit) ?? "minutes",
  );
  const [limitInput, setLimitInput] = useState(() => {
    if (!vice?.limit_value) return "";
    if (vice.limit_unit === "minutes") {
      const h = Math.floor(Number(vice.limit_value) / 60);
      const m = Number(vice.limit_value) % 60;
      return h > 0 ? `${h}:${String(m).padStart(2, "0")}` : String(m);
    }
    return String(vice.limit_value);
  });
  const [color, setColor] = useState(vice?.color ?? VICE_COLORS[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    const limitValue = parseTimeToMinutes(limitInput, limitUnit);
    if (limitValue <= 0) {
      setError("Informe um limite válido");
      return;
    }

    setError("");
    const payload = {
      name,
      description: description || null,
      limit_value: limitValue,
      limit_unit: limitUnit,
      color,
    };

    startTransition(async () => {
      try {
        if (vice) {
          await updateVice({ id: vice.id, ...payload });
        } else {
          await createVice(payload);
        }
        router.refresh();
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar vício");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vice-name">Nome *</Label>
        <Input
          id="vice-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Celular, Redes sociais, Doce"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="vice-limit">
            Limite diário *
            {limitUnit === "minutes" && (
              <span className="ml-1 text-xs text-muted-foreground">
                (ex: 1:30)
              </span>
            )}
          </Label>
          <Input
            id="vice-limit"
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            placeholder={limitUnit === "minutes" ? "1:30" : "3"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vice-unit">Unidade</Label>
          <Select
            id="vice-unit"
            value={limitUnit}
            onChange={(e) => setLimitUnit(e.target.value as ViceUnit)}
          >
            {VICE_UNITS.map((u) => (
              <option key={u} value={u}>
                {VICE_UNIT_LABELS[u]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {showFull ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="vice-color">Cor</Label>
            <Select
              id="vice-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              {VICE_COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vice-desc">Descrição</Label>
            <Textarea
              id="vice-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </>
      ) : (
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
          {isPending ? "Salvando..." : vice ? "Salvar" : "Criar vício"}
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

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createContentItem,
  updateContentItem,
  type ContentInput,
} from "@/lib/content/actions";
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  PLATFORMS,
  PLATFORM_LABELS,
  type ContentItem,
} from "@/lib/content/types";

type ContentFormProps = {
  item?: ContentItem | null;
  draft?: Partial<ContentInput>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ContentForm({
  item,
  draft,
  onSuccess,
  onCancel,
}: ContentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [title, setTitle] = useState(item?.title ?? draft?.title ?? "");
  const [platform, setPlatform] = useState(
    item?.platform ?? draft?.platform ?? "youtube",
  );
  const [contentType, setContentType] = useState(
    item?.content_type ?? draft?.content_type ?? "video",
  );
  const [status, setStatus] = useState(
    item?.status ?? draft?.status ?? "idea",
  );
  const [tool, setTool] = useState(item?.tool ?? draft?.tool ?? "");
  const [description, setDescription] = useState(
    item?.description ?? draft?.description ?? "",
  );
  const [plannedDate, setPlannedDate] = useState(
    item?.planned_date ?? draft?.planned_date ?? "",
  );
  const [publishDate, setPublishDate] = useState(
    item?.publish_date ?? draft?.publish_date ?? "",
  );
  const [caption, setCaption] = useState(
    item?.caption ?? draft?.caption ?? "",
  );
  const [cta, setCta] = useState(item?.cta ?? draft?.cta ?? "");
  const [hashtags, setHashtags] = useState(
    (item?.hashtags ?? draft?.hashtags ?? []).join(", "),
  );
  const [scriptUrl, setScriptUrl] = useState(
    item?.script_url ?? draft?.script_url ?? "",
  );
  const [scriptText, setScriptText] = useState(
    item?.script_text ?? draft?.script_text ?? "",
  );
  const [finalUrl, setFinalUrl] = useState(
    item?.final_url ?? draft?.final_url ?? "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Título é obrigatório");
      return;
    }
    setError("");

    const payload = {
      title,
      platform,
      content_type: contentType,
      status,
      tool: tool || null,
      description: description || null,
      planned_date: plannedDate || null,
      publish_date: publishDate || null,
      caption: caption || null,
      cta: cta || null,
      hashtags: hashtags
        .split(",")
        .map((h) => h.trim().replace(/^#/, ""))
        .filter(Boolean),
      script_url: scriptUrl || null,
      script_text: scriptText || null,
      final_url: finalUrl || null,
    };

    startTransition(async () => {
      try {
        if (item) {
          await updateContentItem(item.id, payload);
        } else {
          await createContentItem(payload);
        }
        router.refresh();
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content-title">Título *</Label>
        <Input
          id="content-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="content-platform">Plataforma</Label>
          <Select
            id="content-platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABELS[p]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content-type">Tipo</Label>
          <Select
            id="content-type"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          >
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {CONTENT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="content-status">Status</Label>
          <Select
            id="content-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {CONTENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CONTENT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="content-tool">Ferramenta utilizada</Label>
          <Input
            id="content-tool"
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            placeholder="Ex: CapCut, Claude, Power Automate"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="content-planned">Data de gravação</Label>
          <Input
            id="content-planned"
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content-publish">Quando deve sair</Label>
          <Input
            id="content-publish"
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-desc">Descrição</Label>
        <Textarea
          id="content-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-caption">Legenda</Label>
        <Textarea
          id="content-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="content-cta">CTA</Label>
          <Input
            id="content-cta"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            placeholder="Chamada para ação"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content-hashtags">Hashtags</Label>
          <Input
            id="content-hashtags"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="powerautomate, claude"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-script-url">URL do roteiro</Label>
        <Input
          id="content-script-url"
          value={scriptUrl}
          onChange={(e) => setScriptUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-script-text">Roteiro (texto)</Label>
        <Textarea
          id="content-script-text"
          value={scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-final">Link final (publicado)</Label>
        <Input
          id="content-final"
          value={finalUrl}
          onChange={(e) => setFinalUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Salvando..." : item ? "Salvar alterações" : "Criar"}
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

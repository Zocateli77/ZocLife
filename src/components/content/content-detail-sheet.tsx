"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Download,
  ExternalLink,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  createAttachmentUploadUrl,
  deleteContentAttachment,
  deleteContentItem,
  getAttachmentSignedUrl,
  recordAttachment,
  updateContentStatus,
} from "@/lib/content/actions";
import {
  CONTENT_STATUS_LABELS,
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
  type ContentItem,
} from "@/lib/content/types";
import { ContentForm } from "./content-form";

const PIPELINE = [
  "idea",
  "script",
  "ready_to_record",
  "recorded",
  "editing",
  "scheduled",
  "published",
];

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d: string | null): string | null {
  if (!d) return null;
  return format(parseISO(d), "dd MMM yyyy", { locale: ptBR });
}

type Props = {
  item: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContentDetailSheet({ item, open, onOpenChange }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!item) return null;

  const statusIdx = PIPELINE.indexOf(item.status);

  function changeStatus(next: string) {
    startTransition(async () => {
      await updateContentStatus(item!.id, next);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteContentItem(item!.id);
      router.refresh();
      onOpenChange(false);
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError("");
    setUploading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      for (const file of Array.from(files)) {
        const { path, token } = await createAttachmentUploadUrl(
          item!.id,
          file.name,
        );
        const { error } = await supabase.storage
          .from("content-attachments")
          .uploadToSignedUrl(path, token, file);
        if (error) throw new Error(error.message);
        await recordAttachment(item!.id, {
          path,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        });
      }
      router.refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function openAttachment(path: string) {
    const url = await getAttachmentSignedUrl(path);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function removeAttachment(id: string) {
    startTransition(async () => {
      await deleteContentAttachment(id);
      router.refresh();
    });
  }

  const attachments = item.attachments ?? [];

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) setEditing(false);
        onOpenChange(v);
      }}
      title={editing ? "Editar conteúdo" : item.title}
      description={editing ? undefined : CONTENT_STATUS_LABELS[item.status]}
    >
      {editing ? (
        <ContentForm
          item={item}
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{CONTENT_STATUS_LABELS[item.status]}</Badge>
            <Badge variant="secondary">{PLATFORM_LABELS[item.platform]}</Badge>
            {item.content_type && (
              <Badge variant="outline">
                {CONTENT_TYPE_LABELS[item.content_type] ?? item.content_type}
              </Badge>
            )}
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {item.tool && (
              <div>
                <p className="text-xs text-muted-foreground">Ferramenta</p>
                <p className="font-medium">{item.tool}</p>
              </div>
            )}
            {formatDate(item.planned_date) && (
              <div>
                <p className="text-xs text-muted-foreground">Gravação</p>
                <p className="font-medium">{formatDate(item.planned_date)}</p>
              </div>
            )}
            {formatDate(item.publish_date) && (
              <div>
                <p className="text-xs text-muted-foreground">Sai em</p>
                <p className="font-medium">{formatDate(item.publish_date)}</p>
              </div>
            )}
          </div>

          {item.caption && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Legenda</p>
              <p className="whitespace-pre-wrap text-sm">{item.caption}</p>
            </div>
          )}

          {item.cta && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">CTA</p>
              <p className="text-sm">{item.cta}</p>
            </div>
          )}

          {item.hashtags && item.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.hashtags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {item.script_text && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Roteiro</p>
              <p className="whitespace-pre-wrap text-sm">{item.script_text}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            {item.script_url && (
              <a
                href={item.script_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-teal-text hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Roteiro
              </a>
            )}
            {item.final_url && (
              <a
                href={item.final_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-teal-text hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Link final
              </a>
            )}
          </div>

          <Separator />

          {/* Anexos */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Paperclip className="h-4 w-4" /> Anexos ({attachments.length})
              </p>
              <Button
                size="sm"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1 h-4 w-4" />
                {uploading ? "Enviando..." : "Adicionar"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {uploadError && (
              <p className="mb-2 text-xs text-danger">{uploadError}</p>
            )}

            {attachments.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum anexo ainda.</p>
            ) : (
              <ul className="space-y-1.5">
                {attachments.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => openAttachment(a.file_path)}
                      className="flex min-w-0 items-center gap-2 text-left text-sm hover:text-teal-text"
                    >
                      <Download className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{a.file_name}</span>
                      {a.size_bytes ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatBytes(a.size_bytes)}
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAttachment(a.id)}
                      disabled={isPending}
                      aria-label={`Remover ${a.file_name}`}
                      className="shrink-0 text-muted-foreground hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {statusIdx > 0 && (
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => changeStatus(PIPELINE[statusIdx - 1])}
              >
                Voltar
              </Button>
            )}
            {statusIdx >= 0 && statusIdx < PIPELINE.length - 1 && (
              <Button
                disabled={isPending}
                onClick={() => changeStatus(PIPELINE[statusIdx + 1])}
              >
                Avançar
              </Button>
            )}
            <Button variant="outline" onClick={() => setEditing(true)}>
              Editar
            </Button>
            <Button
              variant="ghost"
              className="text-danger hover:text-danger"
              onClick={() => setConfirmOpen(true)}
              disabled={isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Excluir
            </Button>
          </div>

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            onConfirm={handleDelete}
            title="Excluir este conteúdo?"
            description="O item e seus anexos serão removidos permanentemente."
            confirmLabel="Excluir"
            destructive
          />
        </div>
      )}
    </Sheet>
  );
}

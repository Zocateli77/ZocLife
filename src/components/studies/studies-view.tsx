"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";
import { createBook, logChapter, completeBook } from "@/lib/studies/actions";
import { BOOK_STATUS_LABELS } from "@/lib/studies/types";
import type { Book } from "@/lib/studies/types";

type Props = { books: Book[] };

export function StudiesView({ books }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Array<Record<string, unknown>>>([]);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [chapters, setChapters] = useState("");
  const [chapterNum, setChapterNum] = useState(1);
  const [learning, setLearning] = useState("");
  const [summary, setSummary] = useState("");
  const [application, setApplication] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      await createBook({ title, author, total_chapters: chapters ? +chapters : undefined });
      setCreateOpen(false);
      router.refresh();
    });
  }

  function handleChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBook) return;
    start(async () => {
      await logChapter({
        book_id: selectedBook.id,
        chapter_number: chapterNum,
        main_learning: learning,
        summary,
        application,
        rating: 4,
      });
      setChapterOpen(false);
      router.refresh();
    });
  }

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBook) return;
    start(async () => {
      await completeBook({
        book_id: selectedBook.id,
        summary,
        top_learnings: learning,
        how_to_apply: application,
        recommendation: true,
        final_rating: 5,
      });
      setReviewOpen(false);
      router.refresh();
    });
  }

  async function handleSearch() {
    if (!search.trim()) return;
    const res = await fetch(`/api/studies/search?q=${encodeURIComponent(search)}`);
    const data = await res.json();
    setSearchResults(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Estudos e Livros</h2>
          <p className="text-sm text-muted-foreground">{books.length} livros na biblioteca</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-4 w-4" /> Livro</Button>
      </div>

      <div className="flex gap-2">
        <Input placeholder="Buscar aprendizados..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button variant="outline" onClick={handleSearch}><Search className="h-4 w-4" /></Button>
      </div>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Resultados</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {searchResults.map((r) => (
              <div key={r.id as string} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-medium">{(r.books as { title: string })?.title} — Cap. {r.chapter_number as number}</p>
                <p className="text-muted-foreground">{r.main_learning as string}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Card key={book.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{book.title}</CardTitle>
                <Badge variant="outline">{BOOK_STATUS_LABELS[book.status]}</Badge>
              </div>
              {book.author && <p className="text-xs text-muted-foreground">{book.author}</p>}
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">Cap. {book.current_chapter}{book.total_chapters ? `/${book.total_chapters}` : ""}</p>
              <div className="flex gap-2">
                {book.status === "reading" && (
                  <Button size="sm" variant="outline" onClick={() => { setSelectedBook(book); setChapterNum(book.current_chapter + 1); setChapterOpen(true); }}>
                    Registrar capítulo
                  </Button>
                )}
                {book.status === "reading" && book.total_chapters && book.current_chapter >= book.total_chapters && (
                  <Button size="sm" onClick={() => { setSelectedBook(book); setReviewOpen(true); }}>Concluir livro</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Adicione seu primeiro livro</p>
        </div>
      )}

      <Sheet open={createOpen} onOpenChange={setCreateOpen} title="Novo livro">
        <form onSubmit={handleCreate} className="space-y-3">
          <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div><Label>Autor</Label><Input value={author} onChange={(e) => setAuthor(e.target.value)} /></div>
          <div><Label>Total de capítulos</Label><Input type="number" min={1} value={chapters} onChange={(e) => setChapters(e.target.value)} /></div>
          <Button type="submit" disabled={pending} className="w-full">Adicionar</Button>
        </form>
      </Sheet>

      <Sheet open={chapterOpen} onOpenChange={setChapterOpen} title="O que você aprendeu?" description={selectedBook?.title}>
        <form onSubmit={handleChapter} className="space-y-3">
          <div><Label>Capítulo</Label><Input type="number" min={1} value={chapterNum} onChange={(e) => setChapterNum(+e.target.value)} /></div>
          <div><Label>Principal aprendizado</Label><Textarea value={learning} onChange={(e) => setLearning(e.target.value)} required /></div>
          <div><Label>Resumo</Label><Textarea value={summary} onChange={(e) => setSummary(e.target.value)} /></div>
          <div><Label>Como aplicar</Label><Textarea value={application} onChange={(e) => setApplication(e.target.value)} /></div>
          <Button type="submit" disabled={pending} className="w-full">Salvar</Button>
        </form>
      </Sheet>

      <Sheet open={reviewOpen} onOpenChange={setReviewOpen} title="O que esse livro te ensinou?" description={selectedBook?.title}>
        <form onSubmit={handleReview} className="space-y-3">
          <div><Label>Resumo geral</Label><Textarea value={summary} onChange={(e) => setSummary(e.target.value)} /></div>
          <div><Label>3 maiores aprendizados</Label><Textarea value={learning} onChange={(e) => setLearning(e.target.value)} /></div>
          <div><Label>Como vou aplicar</Label><Textarea value={application} onChange={(e) => setApplication(e.target.value)} /></div>
          <Button type="submit" disabled={pending} className="w-full">Concluir livro</Button>
        </form>
      </Sheet>
    </div>
  );
}

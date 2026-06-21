import { getBooks } from "@/lib/studies/queries";
import { StudiesView } from "@/components/studies/studies-view";

export default async function EstudosPage() {
  const books = await getBooks();
  return <StudiesView books={books} />;
}

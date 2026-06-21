import { getContentItems } from "@/lib/content/queries";
import { ContentView } from "@/components/content/content-view";

export default async function ConteudoPage() {
  const items = await getContentItems();
  return <ContentView items={items} />;
}

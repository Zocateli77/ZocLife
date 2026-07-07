import { getVicesWithStats } from "@/lib/vices/queries";
import { VicesView } from "@/components/vices/vices-view";

export default async function ViciosPage() {
  const vices = await getVicesWithStats("month");

  return <VicesView vices={vices} />;
}

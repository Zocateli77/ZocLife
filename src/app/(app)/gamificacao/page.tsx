import { getGamificationStats } from "@/lib/gamification/queries";
import { GamificationView } from "@/components/gamification/gamification-view";

export default async function GamificacaoPage() {
  const stats = await getGamificationStats();
  return <GamificationView stats={stats} />;
}

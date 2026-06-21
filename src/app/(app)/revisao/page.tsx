import { generateWeeklySummary, getWeeklyReviews } from "@/lib/reviews/queries";
import { ReviewView } from "@/components/reviews/review-view";

export default async function RevisaoPage() {
  const [summary, history] = await Promise.all([
    generateWeeklySummary(),
    getWeeklyReviews(),
  ]);
  return <ReviewView summary={summary} history={history} />;
}

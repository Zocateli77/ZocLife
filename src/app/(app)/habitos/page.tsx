import { getHabitsWithStats } from "@/lib/habits/queries";
import { HabitsView } from "@/components/habits/habits-view";

export default async function HabitosPage() {
  const habits = await getHabitsWithStats("month");

  return <HabitsView habits={habits} />;
}

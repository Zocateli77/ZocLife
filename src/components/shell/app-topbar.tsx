"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { Button } from "@/components/ui/button";

type AppTopbarProps = {
  userName?: string;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function AppTopbar({ userName = "Lucas" }: AppTopbarProps) {
  const router = useRouter();
  const now = new Date();
  const today = format(now, "EEE · dd MMM", { locale: ptBR }).toUpperCase();
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-8">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
          {today}
        </p>
        <h1 className="font-heading text-lg font-bold leading-tight lg:text-xl">
          {getGreeting()}, {displayName}.
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Sair"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

import { AppSidebar } from "@/components/shell/app-sidebar";
import { AppTopbar } from "@/components/shell/app-topbar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { getSession } from "@/lib/auth/session";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const userName = session?.email?.split("@")[0] ?? "Lucas";

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col pb-16 lg:pb-0">
        <AppTopbar userName={userName} />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}

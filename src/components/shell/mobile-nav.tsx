"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { mainNavigation } from "@/lib/navigation";

export function MobileNav() {
  const pathname = usePathname();

  const mobileItems = mainNavigation.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.title}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
                isActive ? "text-teal-text" : "text-muted-foreground",
              )}
            >
              {isActive && (
                <span className="absolute -top-2 h-0.5 w-8 rounded-full bg-teal" />
              )}
              <Icon className="h-5 w-5" />
              <span>{item.shortTitle ?? item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

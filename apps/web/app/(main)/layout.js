"use client";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Receipt, Settings, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transaction/create", label: "Add Transaction", icon: Receipt },
  { href: "/account", label: "Accounts", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MainLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-border/50 bg-background/50 backdrop-blur-xl md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border/50 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            W
          </div>
          <span className="text-lg font-bold tracking-tight">Welth</span>
        </div>
        
        <nav className="flex-1 space-y-1.5 p-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center gap-3 rounded-full bg-secondary/50 p-2 pr-4 transition-colors hover:bg-secondary">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
            <div className="flex flex-col">
              <span className="text-xs font-medium">My Account</span>
              <span className="text-[10px] text-muted-foreground">Manage profile</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/50 px-4 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-2">
            <MobileNav sidebarLinks={sidebarLinks} />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              W
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>
        
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="mx-auto max-w-5xl w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

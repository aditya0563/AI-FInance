"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function MobileNav({ sidebarLinks }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle mobile menu</span>
        </button>
      </DrawerTrigger>
      <DrawerContent className="px-4 pb-6 pt-2">
        <DrawerHeader className="text-left">
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>
            Menu options for your account.
          </DrawerDescription>
        </DrawerHeader>
        <nav className="flex flex-col space-y-2 mt-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}

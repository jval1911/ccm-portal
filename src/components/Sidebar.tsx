"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardCheck,
  Activity,
  Settings,
  LogOut,
  TrendingUp,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/statements", label: "Statements", icon: FileText },
  { href: "/operations", label: "Operations", icon: ClipboardCheck },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar - iOS style */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-white/80 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center justify-between px-4 h-[52px]">
          <button onClick={() => setMobileOpen(true)} className="p-1 -ml-1">
            <Menu className="w-[22px] h-[22px] text-accent-blue" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-accent-blue flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-foreground">
              CCM Capital
            </span>
          </div>
          <div className="w-5" />
        </div>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[260px] z-50 flex flex-col transition-transform duration-300 ease-out",
          "bg-white/95 backdrop-blur-xl border-r border-border/60",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-accent-blue flex items-center justify-center shadow-sm">
              <TrendingUp className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-[17px] font-semibold text-foreground tracking-[-0.01em]">
              CCM Capital
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded-full hover:bg-background active:bg-border/40"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 mt-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-[9px] rounded-[10px] text-[15px] transition-all duration-150",
                  isActive
                    ? "bg-accent-blue/[0.08] text-accent-blue font-semibold"
                    : "text-foreground/65 font-medium hover:text-foreground hover:bg-black/[0.03] active:bg-black/[0.06]"
                )}
              >
                <item.icon
                  className={cn(
                    "w-[20px] h-[20px]",
                    isActive ? "text-accent-blue" : "text-muted"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 mx-3 mb-3 rounded-2xl bg-background/80">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-accent-blue/10 flex items-center justify-center text-[13px] font-semibold text-accent-blue">
              JV
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">
                Joe Valentine
              </p>
              <p className="text-[11px] text-muted truncate">Fund Manager</p>
            </div>
            <Link
              href="/login"
              className="p-1.5 rounded-full text-muted hover:text-foreground hover:bg-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

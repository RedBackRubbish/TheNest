"use client";

import { cn } from "@/lib/utils";

export function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "border-b border-border bg-card/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/50 bg-primary/10">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="font-sans text-lg font-semibold text-foreground">
              THE NEST
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              Governance Deck v5.2
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavItem label="Senate" isActive />
          <NavItem label="Chronicle" />
          <NavItem label="Constitution" />
          <NavItem label="Settings" />
        </nav>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-hydra animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground">
              KERNEL ONLINE
            </span>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground hover:text-foreground transition-colors md:hidden">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function NavItem({ label, isActive = false }: { label: string; isActive?: boolean }) {
  return (
    <button
      className={cn(
        "px-4 py-2 font-mono text-sm transition-colors rounded-md",
        isActive
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {label}
    </button>
  );
}

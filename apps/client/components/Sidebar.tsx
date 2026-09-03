'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import {
    allNavigation,
    primaryNavigation,
    utilityNavigation,
} from '@/types/nav';

function NavLink({
    href,
    label,
    icon: Icon,
    onNavigate,
}: {
    href: string;
    label: string;
    icon: React.ElementType;
    onNavigate?: () => void;
}) {
    const pathname = usePathname();
    const active = pathname === href;
    return (
        <Link
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${active ? 'bg-sidebar-accent text-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground'}`}
        >
            <Icon
                aria-hidden="true"
                className={`size-4 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
            />
            <span>{label}</span>
        </Link>
    );
}

export function Sidebar() {
    const [open, setOpen] = useState(false);
    const content = (mobile = false) => (
        <div className="flex h-full flex-col bg-sidebar px-3 py-4">
            <div className="flex items-center justify-between px-3 pb-7">
                <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setOpen(false)}
                >
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
                        V
                    </span>
                    <span className="text-sm font-semibold tracking-tight">
                        Verity
                    </span>
                </Link>
                {mobile && (
                    <button
                        type="button"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                        onClick={() => setOpen(false)}
                        aria-label="Close navigation"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>
            <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-background/50 px-3 py-2 text-xs text-muted-foreground">
                <Search className="size-3.5" aria-hidden="true" />
                <span>Search</span>
                <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px]">
                    ⌘ K
                </kbd>
            </div>
            <nav
                aria-label="Primary navigation"
                className="flex flex-col gap-1"
            >
                {primaryNavigation.map((item) => (
                    <NavLink
                        key={item.href}
                        {...item}
                        onNavigate={() => setOpen(false)}
                    />
                ))}
            </nav>
            <div className="mt-auto flex flex-col gap-1">
                {utilityNavigation.map((item) => (
                    <NavLink
                        key={item.href}
                        {...item}
                        onNavigate={() => setOpen(false)}
                    />
                ))}
                <div className="mt-4 border-t border-border pt-4">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                            JD
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium">
                                Jordan Davis
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                                Operations
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    return (
        <>
            <aside className="hidden h-screen w-60 shrink-0 border-r border-sidebar-border md:block">
                {content()}
            </aside>
            <button
                type="button"
                className="fixed left-4 top-4 z-10 rounded-md border border-border bg-card p-2 text-muted-foreground md:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
            >
                <Menu className="size-4" />
            </button>
            {open && (
                <div
                    className="fixed inset-0 z-20 bg-background/80 md:hidden"
                    onClick={() => setOpen(false)}
                >
                    <aside
                        className="h-full w-72 border-r border-sidebar-border"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {content(true)}
                    </aside>
                </div>
            )}
        </>
    );
}

export { allNavigation };

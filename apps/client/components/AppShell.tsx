import type { ReactNode } from 'react';
import { TopBar } from '@/components/TopBar';

export function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <div className="flex min-w-screen flex-1 flex-col">
                <TopBar />
                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}

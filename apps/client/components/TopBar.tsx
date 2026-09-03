import { Store } from 'lucide-react';

export function TopBar() {
    return (
        <header className="flex h-14 items-center border-b border-border px-5 md:px-8">
            <div className="flex items-center gap-2.5" aria-label="MerchantIQ">
                <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Store className="size-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold tracking-tight text-foreground">
                    TrustGate
                </span>
            </div>
        </header>
    );
}

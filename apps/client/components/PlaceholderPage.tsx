import { AppShell } from '@/components/AppShell';

export function PlaceholderPage({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <AppShell>
            <section className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col justify-center px-6 py-16 md:px-10">
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
                    Verity workspace
                </p>
                <h1 className="text-4xl font-semibold tracking-[-0.04em]">
                    {title}
                </h1>
                <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
                <div className="mt-8 rounded-lg border border-dashed border-border bg-card/40 px-5 py-8 text-sm text-muted-foreground">
                    This workspace is ready for your data.
                </div>
            </section>
        </AppShell>
    );
}

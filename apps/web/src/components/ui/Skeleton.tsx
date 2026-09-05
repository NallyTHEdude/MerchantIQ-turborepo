import React from 'react';

export function Skeleton({
    className = '',
    id,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            id={id}
            className={`animate-pulse bg-slate-200/80 rounded-md ${className}`}
            {...props}
        />
    );
}

export function TableSkeleton({
    rows = 5,
    cols = 6,
}: {
    rows?: number;
    cols?: number;
}) {
    return (
        <div className="w-full divide-y divide-slate-100">
            <div className="py-3 px-4 bg-slate-50 flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="py-4 px-4 flex gap-4 items-center">
                    {Array.from({ length: cols }).map((_, c) => (
                        <Skeleton
                            key={c}
                            className={`h-4 ${c === 0 ? 'flex-2' : 'flex-1'}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

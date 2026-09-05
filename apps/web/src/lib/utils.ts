import { RiskLevel, VerificationStatus } from '@/types';

export function formatDate(dateString?: string | null): string {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        }).format(date);
    } catch {
        return dateString;
    }
}

export function formatDateTime(dateString?: string | null): string {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
    } catch {
        return dateString;
    }
}

export function formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(num);
}

export function getRiskBadgeClasses(risk?: RiskLevel | null): {
    bg: string;
    text: string;
    border: string;
    dot: string;
    label: string;
} {
    const normalized = (risk || '').toUpperCase().replace(/_/g, ' ');
    switch (normalized) {
        case 'LOW':
            return {
                bg: 'bg-emerald-500',
                text: 'text-white',
                border: 'border-transparent',
                dot: 'bg-white',
                label: 'LOW',
            };
        case 'MEDIUM':
            return {
                bg: 'bg-amber-400',
                text: 'text-white',
                border: 'border-transparent',
                dot: 'bg-white',
                label: 'MEDIUM',
            };
        case 'HIGH':
            return {
                bg: 'bg-red-400',
                text: 'text-white',
                border: 'border-transparent',
                dot: 'bg-white',
                label: 'HIGH',
            };
        case 'VERY HIGH':
            return {
                bg: 'bg-red-600',
                text: 'text-white',
                border: 'border-transparent',
                dot: 'bg-white',
                label: 'VERY HIGH',
            };
        default:
            return {
                bg: 'bg-zinc-500',
                text: 'text-white',
                border: 'border-transparent',
                dot: 'bg-white',
                label: risk || 'UNKNOWN',
            };
    }
}

export function getVerificationStatusClasses(
    status?: VerificationStatus | null,
): {
    bg: string;
    text: string;
    border: string;
    label: string;
} {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
        case 'COMPLETED':
        case 'VERIFIED':
            return {
                bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                text: 'text-emerald-700',
                border: 'border-emerald-100',
                label: 'COMPLETED',
            };
        case 'PENDING':
            return {
                bg: 'bg-amber-50 text-amber-700 border-amber-100',
                text: 'text-amber-700',
                border: 'border-amber-100',
                label: 'PENDING',
            };
        case 'FAILED':
            return {
                bg: 'bg-red-50 text-red-700 border-red-100',
                text: 'text-red-700',
                border: 'border-red-100',
                label: 'FAILED',
            };
        default:
            return {
                bg: 'bg-zinc-100 text-zinc-700 border-zinc-200',
                text: 'text-zinc-700',
                border: 'border-zinc-200',
                label: status || 'UNKNOWN',
            };
    }
}

export function formatBytes(bytes?: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

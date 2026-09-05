import React, { useState, useEffect } from 'react';
import {
    Server,
    CheckCircle2,
    AlertTriangle,
    Settings2,
    RefreshCw,
    X,
} from 'lucide-react';
import { getBaseApiUrl, setCustomBackendUrl } from '@/lib/api/config';

interface BackendBannerProps {
    onBackendUrlChanged?: () => void;
}

export function BackendBanner({ onBackendUrlChanged }: BackendBannerProps) {
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [editUrl, setEditUrl] = useState('');
    const [testStatus, setTestStatus] = useState<
        'idle' | 'testing' | 'connected' | 'error'
    >('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const url = getBaseApiUrl();
        setCurrentUrl(url);
        setEditUrl(url);
    }, []);

    const handleSave = () => {
        const cleaned = editUrl.trim().replace(/\/+$/, '');
        if (cleaned) {
            setCustomBackendUrl(cleaned);
            setCurrentUrl(cleaned);
            setIsEditing(false);
            onBackendUrlChanged?.();
        }
    };

    const handleResetToEnv = () => {
        setCustomBackendUrl(null);
        const envUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        setCurrentUrl(envUrl);
        setEditUrl(envUrl);
        setIsEditing(false);
        onBackendUrlChanged?.();
    };

    const handleTestConnection = async () => {
        setTestStatus('testing');
        setErrorMessage('');
        try {
            // Test the latest-verification endpoint
            const res = await fetch(
                `${currentUrl}/api/merchant/all/latest-verification`,
                {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                },
            );
            if (res.ok) {
                setTestStatus('connected');
            } else {
                setTestStatus('error');
                setErrorMessage(`HTTP ${res.status}: ${res.statusText}`);
            }
        } catch (err: unknown) {
            setTestStatus('error');
            setErrorMessage(
                err instanceof Error ? err.message : 'Connection failed',
            );
        }
    };

    return (
        <div className="bg-[#18181B] text-zinc-300 text-xs px-4 py-2 border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
                <span className="text-[#A1A1AA] font-medium text-[11px] uppercase tracking-wider">
                    Backend API:
                </span>
                <code className="bg-[#27272A] text-zinc-200 px-2 py-0.5 rounded font-mono text-[11px] border border-zinc-700">
                    {currentUrl || 'Not configured'}
                </code>
                {testStatus === 'connected' && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium ml-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                    </span>
                )}
                {testStatus === 'error' && (
                    <span
                        className="inline-flex items-center gap-1 text-red-400 font-medium ml-1"
                        title={errorMessage}
                    >
                        <AlertTriangle className="w-3.5 h-3.5" /> Disconnected
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className="inline-flex items-center gap-1 text-zinc-300 hover:text-white px-2.5 py-1 rounded bg-[#27272A] hover:bg-[#3F3F46] transition-colors border border-zinc-700 text-xs"
                >
                    <RefreshCw
                        className={`w-3 h-3 ${testStatus === 'testing' ? 'animate-spin' : ''}`}
                    />
                    {testStatus === 'testing' ? 'Testing...' : 'Test'}
                </button>

                <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center gap-1 text-zinc-300 hover:text-white px-2.5 py-1 rounded bg-[#27272A] hover:bg-[#3F3F46] transition-colors border border-zinc-700 text-xs"
                >
                    <Settings2 className="w-3 h-3" />
                    Configure URL
                </button>
            </div>

            {isEditing && (
                <div className="w-full mt-2 pt-2 border-t border-[#27272A] flex flex-wrap items-center gap-2 font-sans">
                    <label
                        htmlFor="backend-url-input"
                        className="text-zinc-400 text-xs"
                    >
                        Target Backend URL:
                    </label>
                    <input
                        id="backend-url-input"
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="http://localhost:5000"
                        className="flex-1 min-w-[240px] max-w-md bg-black border border-zinc-700 rounded px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-zinc-400"
                    />
                    <button
                        type="button"
                        onClick={handleSave}
                        className="bg-white hover:bg-zinc-200 text-[#18181B] font-semibold px-3 py-1 rounded text-xs transition-colors"
                    >
                        Apply
                    </button>
                    <button
                        type="button"
                        onClick={handleResetToEnv}
                        className="bg-[#27272A] hover:bg-[#3F3F46] text-zinc-300 px-3 py-1 rounded text-xs transition-colors"
                    >
                        Reset to ENV
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-zinc-400 hover:text-white p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

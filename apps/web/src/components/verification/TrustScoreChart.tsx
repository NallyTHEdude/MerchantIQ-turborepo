import React from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';
import { Verification } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { TrendingUp, Info } from 'lucide-react';

interface TrustScoreChartProps {
    verifications: Verification[];
    isLoading?: boolean;
}

export function TrustScoreChart({
    verifications,
    isLoading,
}: TrustScoreChartProps) {
    // Sort chronically ascending for the timeline
    const chartData = [...verifications]
        .sort(
            (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
        )
        .map((item) => ({
            date: formatDate(item.createdAt),
            rawDate: item.createdAt,
            trustscore: item.trustscore,
            riskLevel: item.riskLevel,
            status: item.verificationStatus,
        }));

    return (
        <div
            id="chart-trust-score-container"
            className="bg-white rounded-xl border border-[#E4E4E7] shadow-xs overflow-hidden"
        >
            <div className="p-4 sm:p-5 border-b border-[#E4E4E7] flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#18181B]" />
                    <h4 className="text-sm font-semibold text-[#18181B] tracking-tight">
                        Trust Score Over Time
                    </h4>
                </div>
                <span className="text-xs text-[#71717A] font-mono font-medium">
                    {verifications.length}{' '}
                    {verifications.length === 1 ? 'record' : 'records'}
                </span>
            </div>
            <div className="p-4 sm:p-5">
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-pulse flex flex-col items-center gap-2">
                            <div className="w-6 h-6 rounded-full border-2 border-[#E4E4E7] border-t-[#18181B] animate-spin" />
                            <span className="text-xs text-[#71717A]">
                                Loading trust telemetry...
                            </span>
                        </div>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-[#71717A] text-sm">
                        <Info className="w-6 h-6 mb-2 text-[#A1A1AA]" />
                        <p>No verification history recorded yet.</p>
                    </div>
                ) : (
                    <div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: -20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#F4F4F5"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: '#71717A' }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#E4E4E7' }}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tick={{ fontSize: 11, fill: '#71717A' }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#E4E4E7' }}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (
                                                active &&
                                                payload &&
                                                payload.length
                                            ) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-[#18181B] text-white text-xs p-3 rounded-lg shadow-lg border border-[#27272A] space-y-1">
                                                        <p className="text-[#A1A1AA] font-mono text-[10px]">
                                                            {data.date}
                                                        </p>
                                                        <p className="font-semibold text-xs flex items-center gap-1.5 font-mono">
                                                            Score:{' '}
                                                            <span className="text-emerald-400 font-bold">
                                                                {
                                                                    data.trustscore
                                                                }
                                                            </span>{' '}
                                                            / 100
                                                        </p>
                                                        <p className="text-[#D4D4D8] text-[11px]">
                                                            Risk:{' '}
                                                            <span className="font-semibold text-white">
                                                                {data.riskLevel}
                                                            </span>
                                                        </p>
                                                        <p className="text-[#D4D4D8] text-[11px]">
                                                            Status:{' '}
                                                            <span className="font-semibold text-white">
                                                                {data.status}
                                                            </span>
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="trustscore"
                                        stroke="#18181B"
                                        strokeWidth={2}
                                        dot={{
                                            r: chartData.length === 1 ? 5 : 3.5,
                                            fill: '#18181B',
                                            stroke: '#ffffff',
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{ r: 5, fill: '#18181B' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        {chartData.length === 1 && (
                            <p className="text-center text-xs text-[#71717A] mt-2 font-mono">
                                Single historical checkpoint recorded on{' '}
                                {chartData[0].date}.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

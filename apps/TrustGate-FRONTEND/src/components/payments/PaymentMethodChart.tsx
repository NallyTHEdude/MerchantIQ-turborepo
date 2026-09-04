import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { PaymentItem } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PieChart as PieIcon, Layers } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentMethodChartProps {
  payments: PaymentItem[];
  isLoading?: boolean;
}

const METHOD_COLORS: Record<string, string> = {
  UPI: '#3b82f6', // blue-500
  CARD: '#8b5cf6', // purple-500
  NETBANKING: '#10b981', // emerald-500
  WALLET: '#f59e0b', // amber-500
  OTHER: '#64748b', // slate-500
};

export function PaymentMethodChart({ payments, isLoading }: PaymentMethodChartProps) {
  // Aggregate payment methods
  const aggregated = payments.reduce<Record<string, { count: number; volume: number }>>(
    (acc, curr) => {
      const method = (curr.paymentMethod || 'OTHER').toUpperCase();
      const amt = typeof curr.amount === 'string' ? parseFloat(curr.amount) : curr.amount;
      const validAmt = isNaN(amt) ? 0 : amt;

      if (!acc[method]) {
        acc[method] = { count: 0, volume: 0 };
      }
      acc[method].count += 1;
      acc[method].volume += validAmt;
      return acc;
    },
    {}
  );

  const chartData = Object.entries(aggregated).map(([method, data]) => ({
    method,
    count: data.count,
    volume: data.volume,
    color: METHOD_COLORS[method] || '#64748b',
  }));

  return (
    <Card id="chart-payment-methods" className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-purple-600" />
          <CardTitle>Payment Method Distribution</CardTitle>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {chartData.length} active {chartData.length === 1 ? 'method' : 'methods'}
        </span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-60 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-purple-600 animate-spin" />
              <span className="text-xs text-slate-400">Aggregating payment distribution...</span>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-sm">
            <Layers className="w-6 h-6 mb-2 text-slate-300" />
            <p>No payment records available to chart.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="method"
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-lg border border-slate-800 space-y-1">
                            <p className="font-bold text-sm text-slate-100">{d.method}</p>
                            <p className="text-slate-300">
                              Transactions: <span className="font-semibold text-white">{d.count}</span>
                            </p>
                            <p className="text-slate-300">
                              Volume: <span className="font-semibold text-emerald-400">{formatCurrency(d.volume)}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sub-legend with method volumes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              {chartData.map((item) => (
                <div key={item.method} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-800">{item.method}:</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {item.count} txns ({formatCurrency(item.volume)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

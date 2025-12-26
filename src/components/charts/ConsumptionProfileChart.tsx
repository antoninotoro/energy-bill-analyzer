'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ConsumiFatturati } from '@/types/bill';

interface ConsumptionProfileChartProps {
  consumi: ConsumiFatturati;
}

export default function ConsumptionProfileChart({
  consumi,
}: ConsumptionProfileChartProps) {
  const data = [
    {
      fascia: 'F1\n(Lun-Ven 8-19)',
      kWh: consumi.Fascia_F1_kWh,
      percentuale: (consumi.Fascia_F1_kWh / consumi.Totale_kWh) * 100,
    },
    {
      fascia: 'F2\n(Lun-Ven 7-8, 19-23)',
      kWh: consumi.Fascia_F2_kWh,
      percentuale: (consumi.Fascia_F2_kWh / consumi.Totale_kWh) * 100,
    },
    {
      fascia: 'F3\n(Notte e Weekend)',
      kWh: consumi.Fascia_F3_kWh,
      percentuale: (consumi.Fascia_F3_kWh / consumi.Totale_kWh) * 100,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Profilo di Consumo per Fascia</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="fascia"
            tick={{ fontSize: 12 }}
            interval={0}
            height={60}
          />
          <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value: number | string | undefined, name?: string) => {
              const numValue = typeof value === 'number' ? value : 0;
              if (name === 'kWh') {
                return `${numValue.toFixed(2)} kWh`;
              }
              return `${numValue.toFixed(1)}%`;
            }}
          />
          <Legend />
          <Bar dataKey="kWh" fill="#3B82F6" name="Consumo (kWh)" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {data.map((item, index) => {
          const gradients = [
            'from-blue-500 to-cyan-500',
            'from-orange-500 to-pink-500',
            'from-green-500 to-emerald-500',
          ];
          return (
            <div
              key={item.fascia}
              className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-medium text-gray-600 mb-2">
                {item.fascia.replace('\n', ' ')}
              </p>
              <p className={`text-2xl font-bold mb-1 bg-gradient-to-r ${gradients[index]} bg-clip-text text-transparent`}>
                {item.percentuale.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-700 font-medium">
                {item.kWh.toFixed(0)} kWh
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

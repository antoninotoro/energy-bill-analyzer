'use client';

import { CostAnalysis, BollettaElettrica } from '@/types/bill';

interface CostSummaryProps {
  analisi: CostAnalysis;
  bolletta: BollettaElettrica;
}

export default function CostSummary({ analisi, bolletta }: CostSummaryProps) {
  const totalKwh = bolletta.Consumi_Fatturati.Totale_kWh;

  const stats = [
    {
      label: 'Costo Totale Fattura',
      value: `€${analisi.costo_totale_fattura.toFixed(2)}`,
      subtitle: 'Periodo fatturato',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Costo Medio kWh',
      value: `€${analisi.costo_medio_kwh.toFixed(4)}`,
      subtitle: `${totalKwh.toFixed(0)} kWh consumati`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Costi Fissi Annui',
      value: `€${analisi.totale_costo_fisso_anno.toFixed(2)}`,
      subtitle: "All'anno",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-500',
    },
    {
      label: 'Costi Variabili',
      value: `€${analisi.totale_costo_variabile_kwh.toFixed(4)}`,
      subtitle: 'Per kWh',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>

          <div className="relative">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg mb-4`}>
              <div className="text-white">
                {stat.icon}
              </div>
            </div>

            <p className="text-sm font-medium text-gray-600 mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500">
              {stat.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

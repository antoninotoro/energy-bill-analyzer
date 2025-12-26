'use client';

import { useBillStore } from '@/lib/store/bill-store';
import CostBreakdownChart from './charts/CostBreakdownChart';
import ConsumptionProfileChart from './charts/ConsumptionProfileChart';
import InterventionsSection from './results/InterventionsSection';
import OffersSection from './results/OffersSection';
import CostSummary from './results/CostSummary';

export default function ResultsDashboard() {
  const { analysisResult, offerComparisons, isAnalyzing, analysisError } =
    useBillStore();

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-6"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="inline-block rounded-full h-16 w-16 bg-blue-500/20"></div>
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">Analisi in corso...</p>
          <p className="text-sm text-gray-600">
            Elaborazione dati e confronto offerte di mercato
          </p>
        </div>
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200/50 rounded-2xl p-8 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-2">
              Errore durante l'analisi
            </h3>
            <p className="text-red-700">{analysisError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-12 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Inizia la tua Analisi
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Compila il form nella sezione "Inserisci Dati" per analizzare la tua bolletta elettrica e ricevere suggerimenti personalizzati
        </p>
      </div>
    );
  }

  const { bolletta, analisi_costi, interventi_suggeriti } = analysisResult;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-8 shadow-2xl shadow-blue-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -ml-48 -mb-48"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Analisi Completata
              </div>
              <h2 className="text-4xl font-bold mb-3">
                Analisi Bolletta Elettrica
              </h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {bolletta.Consumi_Fatturati.Periodo_Riferimento.start} - {bolletta.Consumi_Fatturati.Periodo_Riferimento.end}
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  POD: {bolletta.Cliente.Codice_POD || 'N/D'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      <CostSummary analisi={analisi_costi} bolletta={bolletta} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostBreakdownChart breakdown={analisi_costi.breakdown} />
        <ConsumptionProfileChart consumi={bolletta.Consumi_Fatturati} />
      </div>

      {/* Interventions Section */}
      <InterventionsSection interventi={interventi_suggeriti} />

      {/* Offers Comparison */}
      <OffersSection offers={offerComparisons} currentCost={analisi_costi.costo_totale_fattura} />
    </div>
  );
}

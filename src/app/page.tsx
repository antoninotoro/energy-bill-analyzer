'use client';

import { useState } from 'react';
import BillInputForm from '@/components/BillInputForm';
import ResultsDashboard from '@/components/ResultsDashboard';
import { useBillStore } from '@/lib/store/bill-store';
import { useHydration } from '@/hooks/useHydration';

export default function Home() {
  const [showForm, setShowForm] = useState(true);
  const isHydrated = useHydration();
  const { analysisResult, reset } = useBillStore();

  const handleNewAnalysis = () => {
    reset();
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Energy Bill Analyzer
                </h1>
                <p className="text-sm text-gray-600">
                  Ottimizza i tuoi consumi energetici
                </p>
              </div>
            </div>
            {analysisResult && (
              <button
                onClick={handleNewAnalysis}
                className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuova Analisi
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Tabs */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-gray-200/50">
            <nav className="flex gap-2" aria-label="Tabs">
              <button
                onClick={() => setShowForm(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                  showForm
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-600 hover:bg-gray-100/80'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Inserisci Dati
              </button>
              <button
                onClick={() => setShowForm(false)}
                disabled={!analysisResult}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 ${
                  !showForm && analysisResult
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-600 hover:bg-gray-100/80'
                } ${!analysisResult ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Risultati Analisi
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {showForm ? (
          <div>
            <BillInputForm />
          </div>
        ) : (
          <div>
            <ResultsDashboard />
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="mt-20 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900">Energy Bill Analyzer</span>
              </div>
              <p className="text-sm text-gray-600">
                Ottimizza i tuoi consumi energetici con analisi intelligenti e suggerimenti personalizzati.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Risorse Ufficiali</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.arera.it"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    ARERA - Autorità Energia
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ilportaleofferte.it"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Portale Offerte
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Note Legali</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                I calcoli e i suggerimenti hanno scopo puramente informativo e non costituiscono consulenza professionale.
                I dati sono basati su tariffe ARERA e prezzi GME.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200/50">
            <p className="text-center text-xs text-gray-500">
              © 2025 Energy Bill Analyzer. Progetto didattico e dimostrativo.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

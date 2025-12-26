'use client';

import { Intervention } from '@/types/bill';

interface InterventionsSectionProps {
  interventi: Intervention[];
}

const PRIORITY_COLORS = {
  Alta: 'bg-red-100 text-red-800 border-red-200',
  Media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Bassa: 'bg-green-100 text-green-800 border-green-200',
};

const COMPLEXITY_ICONS = {
  Facile: '✅',
  Media: '⚙️',
  Difficile: '🔧',
};

const TYPE_ICONS = {
  Offerta: '💡',
  Potenza: '⚡',
  Efficienza: '🔋',
  Comportamento: '📅',
  Autoproduzione: '☀️',
};

export default function InterventionsSection({
  interventi,
}: InterventionsSectionProps) {
  if (!interventi || interventi.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <span className="text-6xl mb-4 block">✨</span>
        <h3 className="text-xl font-semibold text-green-900 mb-2">
          Bolletta Ottimizzata!
        </h3>
        <p className="text-green-700">
          La tua bolletta sembra già ottimizzata. Non ho trovato margini significativi di miglioramento.
        </p>
      </div>
    );
  }

  const totalSavings = interventi.reduce(
    (sum, int) => sum + int.risparmio_stimato_euro_anno,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">🎯 Interventi di Ottimizzazione</h3>
        <p className="text-gray-600">
          Ho identificato {interventi.length} opportunità di risparmio per un totale stimato di{' '}
          <span className="font-bold text-green-600">
            €{totalSavings.toFixed(2)}/anno
          </span>
        </p>
      </div>

      <div className="space-y-4">
        {interventi.map((intervento, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <span className="text-3xl mr-3">
                  {TYPE_ICONS[intervento.tipo]}
                </span>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {intervento.titolo}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Categoria: {intervento.tipo}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  €{intervento.risparmio_stimato_euro_anno.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">risparmi/anno</p>
              </div>
            </div>

            <p className="text-gray-700 mb-3">{intervento.descrizione}</p>

            <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-100">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">📊 Metrica valutata:</span>{' '}
                {intervento.metrica_valutata}
              </p>
            </div>

            <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">💡 Azione suggerita:</span>{' '}
                {intervento.azione_suggerita}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                  PRIORITY_COLORS[intervento.priorita]
                }`}
              >
                Priorità: {intervento.priorita}
              </span>

              <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full border border-gray-200">
                {COMPLEXITY_ICONS[intervento.complessita]} Complessità:{' '}
                {intervento.complessita}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

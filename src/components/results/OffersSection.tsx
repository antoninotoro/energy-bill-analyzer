'use client';

import { OfferComparison } from '@/types/bill';
import { useState } from 'react';

interface OffersSectionProps {
  offers: OfferComparison[];
  currentCost: number;
}

export default function OffersSection({ offers, currentCost }: OffersSectionProps) {
  const [showAll, setShowAll] = useState(false);

  if (!offers || offers.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <span className="text-6xl mb-4 block">🔍</span>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nessuna offerta disponibile
        </h3>
        <p className="text-gray-600">
          Al momento non ci sono offerte da confrontare
        </p>
      </div>
    );
  }

  const displayedOffers = showAll ? offers : offers.slice(0, 3);
  const bestOffer = offers[0];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">🏆 Confronto Offerte Mercato</h3>
        <p className="text-gray-600">
          Ho trovato {offers.length} offerte disponibili sul mercato.
          {bestOffer.risparmio_vs_attuale > 0 && (
            <span className="ml-1">
              La migliore ti farebbe risparmiare{' '}
              <span className="font-bold text-green-600">
                €{bestOffer.risparmio_vs_attuale.toFixed(2)}/anno
              </span>{' '}
              ({bestOffer.risparmio_percentuale.toFixed(1)}%)
            </span>
          )}
        </p>
      </div>

      <div className="space-y-4">
        {displayedOffers.map((comparison, index) => {
          const { offerta, costo_annuo_stimato, risparmio_vs_attuale, adatta_profilo, note } =
            comparison;

          const isRecommended = adatta_profilo && risparmio_vs_attuale > 0;
          const isBest = index === 0 && risparmio_vs_attuale > 0;

          return (
            <div
              key={offerta.id}
              className={`border rounded-lg p-5 ${
                isBest
                  ? 'border-green-500 bg-green-50'
                  : adatta_profilo
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200'
              } hover:shadow-md transition-shadow`}
            >
              {isBest && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                    🏆 MIGLIORE OFFERTA
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900">
                    {offerta.nome_offerta}
                  </h4>
                  <p className="text-sm text-gray-600">{offerta.fornitore}</p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {offerta.tipo}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {offerta.durata_contratto_mesi} mesi
                    </span>
                    {isRecommended && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        ✓ Adatta al tuo profilo
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <p className="text-sm text-gray-600">Costo annuo stimato</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{costo_annuo_stimato.toFixed(2)}
                  </p>
                  {risparmio_vs_attuale !== 0 && (
                    <p
                      className={`text-sm font-semibold ${
                        risparmio_vs_attuale > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {risparmio_vs_attuale > 0 ? '−' : '+'}€
                      {Math.abs(risparmio_vs_attuale).toFixed(2)}/anno
                    </p>
                  )}
                </div>
              </div>

              {/* Offer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="text-sm">
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Prezzo:</span>
                  </p>
                  {offerta.tipo === 'Fissa' && (
                    <p className="text-gray-900">
                      €{(offerta.prezzo_fisso_euro_kwh || 0).toFixed(4)}/kWh fisso
                    </p>
                  )}
                  {offerta.tipo === 'Indicizzata' && (
                    <p className="text-gray-900">
                      PUN + €{(offerta.spread_su_pun_euro_kwh || 0).toFixed(4)}/kWh
                    </p>
                  )}
                  {(offerta.tipo === 'Bioraria' || offerta.tipo === 'Trioraria') && (
                    <>
                      <p className="text-gray-900">
                        F1: €{(offerta.prezzo_f1_euro_kwh || 0).toFixed(4)}/kWh
                      </p>
                      <p className="text-gray-900">
                        F2: €{(offerta.prezzo_f2_euro_kwh || 0).toFixed(4)}/kWh
                      </p>
                      {offerta.prezzo_f3_euro_kwh && (
                        <p className="text-gray-900">
                          F3: €{offerta.prezzo_f3_euro_kwh.toFixed(4)}/kWh
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="text-sm">
                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Quota fissa:</span>
                  </p>
                  <p className="text-gray-900">
                    €{offerta.quota_fissa_mensile.toFixed(2)}/mese
                  </p>
                </div>
              </div>

              {/* Offer Features */}
              {offerta.caratteristiche.length > 0 && (
                <div className="mb-3 p-3 bg-white rounded border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Caratteristiche:
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    {offerta.caratteristiche.map((caratteristica, idx) => (
                      <li key={idx}>{caratteristica}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes */}
              {note.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.map((nota, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {nota}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {offers.length > 3 && !showAll && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Mostra tutte le {offers.length} offerte
          </button>
        </div>
      )}

      {showAll && offers.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(false)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Mostra meno
          </button>
        </div>
      )}
    </div>
  );
}

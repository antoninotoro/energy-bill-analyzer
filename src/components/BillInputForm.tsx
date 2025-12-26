'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BollettaElettrica } from '@/types/bill';
import { useBillStore } from '@/lib/store/bill-store';
import { CostAnalysisService } from '@/lib/services/cost-analysis.service';
import { OptimizationService } from '@/lib/services/optimization.service';
import { OfferComparisonService } from '@/lib/services/offer-comparison.service';
import { AreraDataService } from '@/lib/services/arera-data.service';
import { SAMPLE_BILLS } from '@/lib/sample-data';
import BillUploader from './BillUploader';

const FORM_STEPS = [
  { id: 1, title: 'Dati Cliente', icon: '👤' },
  { id: 2, title: 'Fornitura', icon: '⚡' },
  { id: 3, title: 'Consumi', icon: '📊' },
  { id: 4, title: 'Costi', icon: '💰' },
  { id: 5, title: 'Autoproduzione', icon: '☀️' },
];

export default function BillInputForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset: resetForm,
  } = useForm<BollettaElettrica>();

  const {
    setCurrentBill,
    setAnalysisResult,
    setOfferComparisons,
    addToHistory,
    setIsAnalyzing,
    setAnalysisError,
  } = useBillStore();

  const hasFotovoltaico = watch('Autoproduzione.Presenza_Impianto_Fotovoltaico');

  const loadSampleData = (sampleKey: keyof typeof SAMPLE_BILLS) => {
    const sampleData = SAMPLE_BILLS[sampleKey];
    resetForm(sampleData);
    setCurrentStep(1);
  };

  const handleExtractedData = (extractedData: Partial<BollettaElettrica>) => {
    // Merge extracted data with current form data
    resetForm((prev) => ({
      ...prev,
      ...extractedData,
      // Deep merge nested objects
      Cliente: { ...prev?.Cliente, ...extractedData.Cliente },
      Fornitura: { ...prev?.Fornitura, ...extractedData.Fornitura },
      Consumi_Fatturati: {
        ...prev?.Consumi_Fatturati,
        ...extractedData.Consumi_Fatturati,
      },
      Dettaglio_Costi: {
        ...prev?.Dettaglio_Costi,
        ...extractedData.Dettaglio_Costi,
        Spesa_Materia_Energia: {
          ...prev?.Dettaglio_Costi?.Spesa_Materia_Energia,
          ...extractedData.Dettaglio_Costi?.Spesa_Materia_Energia,
        },
        Spesa_Trasporto_Gestione_Contatore: {
          ...prev?.Dettaglio_Costi?.Spesa_Trasporto_Gestione_Contatore,
          ...extractedData.Dettaglio_Costi?.Spesa_Trasporto_Gestione_Contatore,
        },
        Spesa_Oneri_Sistema: {
          ...prev?.Dettaglio_Costi?.Spesa_Oneri_Sistema,
          ...extractedData.Dettaglio_Costi?.Spesa_Oneri_Sistema,
        },
        Imposte: {
          ...prev?.Dettaglio_Costi?.Imposte,
          ...extractedData.Dettaglio_Costi?.Imposte,
        },
      },
      Autoproduzione: {
        ...prev?.Autoproduzione,
        ...extractedData.Autoproduzione,
      },
    } as BollettaElettrica));

    // Go to first step to review data
    setCurrentStep(1);
  };

  const onSubmit = async (data: BollettaElettrica) => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      // Get ARERA reference data
      const datiARERA = await AreraDataService.getDatiARERA(
        data.Consumi_Fatturati.Periodo_Riferimento.start,
        data.Consumi_Fatturati.Periodo_Riferimento.end
      );

      // Perform cost analysis
      const costAnalysis = CostAnalysisService.analyzeCosts(data, datiARERA);

      // Generate optimization recommendations
      const interventions = await OptimizationService.generateRecommendations(
        data,
        datiARERA
      );

      // Create analysis result
      const analysisResult = {
        bolletta: data,
        analisi_costi: costAnalysis,
        interventi_suggeriti: interventions,
        data_analisi: new Date().toISOString(),
      };

      // Get offer comparisons
      const offers = await OfferComparisonService.compareOffers(
        data,
        datiARERA
      );

      // Update store
      setCurrentBill(data);
      setAnalysisResult(analysisResult);
      setOfferComparisons(offers);
      addToHistory(analysisResult);

      // Navigate to results (handled by parent component)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(
        error instanceof Error ? error.message : 'Errore durante l\'analisi'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextStep = () => {
    if (currentStep < FORM_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {FORM_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <span className="text-xl">{step.icon}</span>
              </div>
              <div className="ml-2 hidden md:block">
                <p className="text-xs text-gray-500">Step {step.id}</p>
                <p className="text-sm font-medium">{step.title}</p>
              </div>
              {index < FORM_STEPS.length - 1 && (
                <div
                  className={`h-1 w-12 md:w-24 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bill Uploader */}
      <div className="mb-8">
        <BillUploader onDataExtracted={handleExtractedData} />
      </div>

      {/* Sample Data Loader */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl">
        <p className="text-sm font-semibold text-indigo-900 mb-3">
          🚀 Oppure prova con dati di esempio
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(SAMPLE_BILLS).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => loadSampleData(key as keyof typeof SAMPLE_BILLS)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Dati Cliente */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-4">📋 Dati Cliente</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipologia Cliente
              </label>
              <select
                {...register('Cliente.Tipologia_Cliente')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Domestico_Residente">Domestico Residente</option>
                <option value="Domestico_Non_Residente">
                  Domestico Non Residente
                </option>
                <option value="Altro">Altro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codice POD
              </label>
              <input
                {...register('Cliente.Codice_POD')}
                type="text"
                placeholder="IT001E12345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Il codice POD identifica univocamente il punto di prelievo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fascia Oraria Contatore
              </label>
              <select
                {...register('Cliente.Fascia_Oraria_Contatore')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Monoraria">Monoraria</option>
                <option value="Bioraria">Bioraria</option>
                <option value="Multioraria">Multioraria (Trioraria)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Fornitura */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-4">⚡ Dati Fornitura</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potenza Contrattuale (kW)
              </label>
              <input
                {...register('Fornitura.Potenza_Contrattuale_kW', {
                  valueAsNumber: true,
                })}
                type="number"
                step="0.5"
                placeholder="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Tipicamente 3 kW per uso domestico
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tensione Fornitura
              </label>
              <select
                {...register('Fornitura.Tensione_Fornitura')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Bassa">Bassa Tensione</option>
                <option value="Media">Media Tensione</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo di Mercato
              </label>
              <select
                {...register('Fornitura.Mercato')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Maggior_Tutela">Maggior Tutela</option>
                <option value="Servizio_a_Tutele_Graduali">
                  Servizio a Tutele Graduali
                </option>
                <option value="Libero">Mercato Libero</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Consumi */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-4">📊 Consumi Fatturati</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Inizio Periodo
                </label>
                <input
                  {...register('Consumi_Fatturati.Periodo_Riferimento.start')}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fine Periodo
                </label>
                <input
                  {...register('Consumi_Fatturati.Periodo_Riferimento.end')}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Totale Consumo (kWh)
              </label>
              <input
                {...register('Consumi_Fatturati.Totale_kWh', {
                  valueAsNumber: true,
                })}
                type="number"
                step="0.01"
                placeholder="250"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fascia F1 (kWh)
                </label>
                <input
                  {...register('Consumi_Fatturati.Fascia_F1_kWh', {
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.01"
                  placeholder="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Lun-Ven 8-19</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fascia F2 (kWh)
                </label>
                <input
                  {...register('Consumi_Fatturati.Fascia_F2_kWh', {
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.01"
                  placeholder="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Lun-Ven 7-8, 19-23</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fascia F3 (kWh)
                </label>
                <input
                  {...register('Consumi_Fatturati.Fascia_F3_kWh', {
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.01"
                  placeholder="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Notte e weekend</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Costi */}
        {currentStep === 4 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-2xl font-bold mb-4">💰 Dettaglio Costi</h2>

            {/* Spesa Materia Energia */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3">Spesa Materia Energia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Totale (€)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Materia_Energia.Totale_Euro',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quota Fissa (€)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Materia_Energia.Quota_Fissa_Euro',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quota Variabile (€/kWh)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Materia_Energia.Quota_Variabile_Euro_kWh',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spread Commerciale (€/kWh)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Materia_Energia.Spread_Commerciale_Euro_kWh',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.0001"
                    defaultValue={0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Spesa Trasporto */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3">
                Trasporto e Gestione Contatore
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Totale (€)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Trasporto_Gestione_Contatore.Totale_Euro',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quota Fissa (€/anno)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Trasporto_Gestione_Contatore.Quota_Fissa_Euro_Anno',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.01"
                    defaultValue={15.87}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quota Potenza (€/kW/anno)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Trasporto_Gestione_Contatore.Quota_Potenza_Euro_kW_Anno',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.01"
                    defaultValue={14.63}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quota Energia (€/kWh)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Trasporto_Gestione_Contatore.Quota_Energia_Euro_kWh',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.0001"
                    defaultValue={0.0124}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Oneri Sistema */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3">Oneri di Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Totale (€)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Oneri_Sistema.Totale_Euro',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ASOS (€/kWh)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Oneri_Sistema.ASOS_Quota_Variabile_Euro_kWh',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.0001"
                    defaultValue={0.014}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ARIM (€/kWh)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Oneri_Sistema.ARIM_Quota_Variabile_Euro_kWh',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.0001"
                    defaultValue={0.0006}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quota Fissa (€/anno)
                  </label>
                  <input
                    {...register(
                      'Dettaglio_Costi.Spesa_Oneri_Sistema.Quota_Fissa_Euro_Anno',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.01"
                    defaultValue={0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Imposte */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Imposte</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Totale (€)
                  </label>
                  <input
                    {...register('Dettaglio_Costi.Imposte.Totale_Euro', {
                      valueAsNumber: true,
                    })}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accise (€)
                  </label>
                  <input
                    {...register('Dettaglio_Costi.Imposte.Accise_Euro', {
                      valueAsNumber: true,
                    })}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IVA (%)
                  </label>
                  <input
                    {...register('Dettaglio_Costi.Imposte.IVA_Percentuale', {
                      valueAsNumber: true,
                    })}
                    type="number"
                    step="0.1"
                    defaultValue={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canone RAI (€)
              </label>
              <input
                {...register('Dettaglio_Costi.Canone_RAI', {
                  valueAsNumber: true,
                })}
                type="number"
                step="0.01"
                defaultValue={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Se addebitato in bolletta (tipicamente 9€/trimestre)
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Autoproduzione */}
        {currentStep === 5 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-4">☀️ Autoproduzione</h2>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('Autoproduzione.Presenza_Impianto_Fotovoltaico')}
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Ho un impianto fotovoltaico
                </span>
              </label>
            </div>

            {hasFotovoltaico && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energia Immessa in Rete (kWh)
                  </label>
                  <input
                    {...register(
                      'Autoproduzione.Energia_Immessa_in_Rete_kWh',
                      { valueAsNumber: true }
                    )}
                    type="number"
                    step="0.01"
                    defaultValue={0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      {...register('Autoproduzione.Servizi_Scambio_Sul_Posto')}
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Scambio sul Posto attivo
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-md font-medium ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Indietro
          </button>

          {currentStep < FORM_STEPS.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            >
              Avanti →
            </button>
          ) : (
            <button
              type="submit"
              className="px-8 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
            >
              🔍 Analizza Bolletta
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

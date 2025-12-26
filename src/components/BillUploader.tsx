'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BillParserService } from '@/lib/services/bill-parser.service';
import { BollettaElettrica } from '@/types/bill';

interface BillUploaderProps {
  onDataExtracted: (data: Partial<BollettaElettrica>) => void;
}

export default function BillUploader({ onDataExtracted }: BillUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsProcessing(true);
      setProgress(10);
      setError(null);
      setExtractedText(null);

      try {
        setProgress(30);

        // Parse the bill file
        const result = await BillParserService.parseBillFile(file);

        setProgress(80);

        if (!result.success) {
          setError(result.errors?.join(', ') || 'Errore durante l\'estrazione dei dati');
          setIsProcessing(false);
          return;
        }

        setProgress(90);

        if (result.text) {
          setExtractedText(result.text);
        }

        if (result.data) {
          // Validate extracted data
          const validation = BillParserService.validateExtractedData(result.data);

          if (validation.missingFields.length > 0) {
            setError(
              `Alcuni dati non sono stati estratti: ${validation.missingFields.join(', ')}. Compilali manualmente.`
            );
          }

          // Send data to parent component
          onDataExtracted(result.data);
        }

        setProgress(100);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Errore durante il caricamento del file');
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
          setProgress(0);
        }, 1000);
      }
    },
    [onDataExtracted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
          </div>

          {/* Text */}
          <div>
            {isProcessing ? (
              <>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Elaborazione in corso...
                </p>
                <p className="text-sm text-gray-600">
                  Estrazione dati dalla bolletta
                </p>
              </>
            ) : isDragActive ? (
              <>
                <p className="text-lg font-semibold text-blue-600 mb-2">
                  Rilascia il file qui
                </p>
                <p className="text-sm text-gray-600">
                  Il file verrà analizzato automaticamente
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Carica la tua bolletta
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Trascina qui il file PDF o immagine, oppure clicca per selezionare
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                  <span>PDF, JPG, PNG</span>
                  <span className="mx-2">•</span>
                  <span>Max 10 MB</span>
                </div>
              </>
            )}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="max-w-xs mx-auto">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{progress}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800">Attenzione</p>
            <p className="text-sm text-yellow-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message with Preview */}
      {extractedText && !isProcessing && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">
                Dati estratti con successo
              </p>
              <p className="text-sm text-green-700 mt-1">
                I campi del form sono stati compilati automaticamente. Verifica i dati e integra
                quelli mancanti.
              </p>
            </div>
          </div>

          {/* Show extracted text preview (optional, can be collapsed) */}
          <details className="mt-3">
            <summary className="text-xs font-medium text-green-800 cursor-pointer hover:text-green-900">
              Visualizza testo estratto
            </summary>
            <div className="mt-2 p-3 bg-white rounded-lg border border-green-200 max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {extractedText.substring(0, 500)}
                {extractedText.length > 500 && '...'}
              </pre>
            </div>
          </details>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Come funziona?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Carica la bolletta in formato PDF o immagine</li>
              <li>Il sistema estrae automaticamente i dati principali</li>
              <li>Verifica e integra eventuali dati mancanti</li>
              <li>I tuoi dati rimangono privati (elaborazione locale)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

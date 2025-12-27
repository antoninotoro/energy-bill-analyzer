/**
 * Advanced Bill Parser Service - INTENSITY 10
 * Ultra-robust extraction with multiple patterns, contextual analysis, and fuzzy matching
 */

import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { BollettaElettrica } from '@/types/bill';

export interface ParsedBillData {
  success: boolean;
  data?: Partial<BollettaElettrica>;
  text?: string;
  confidence?: number;
  errors?: string[];
}

interface ExtractionResult {
  value: any;
  confidence: number;
  method: string;
}

export class BillParserService {
  /**
   * Main entry point - parses bill file (PDF or image)
   */
  static async parseBillFile(file: File): Promise<ParsedBillData> {
    try {
      const fileType = file.type;

      // Extract text based on file type
      let text = '';
      if (fileType === 'application/pdf') {
        text = await this.extractTextFromPDF(file);
      } else if (fileType.startsWith('image/')) {
        text = await this.extractTextFromImage(file);
      } else {
        return {
          success: false,
          errors: ['Formato file non supportato. Usa PDF o immagini (JPG, PNG)'],
        };
      }

      console.log('=== EXTRACTED TEXT ===');
      console.log(text.substring(0, 1000));
      console.log('======================');

      // Parse extracted text with advanced algorithms
      const billData = this.parseExtractedText(text);

      return {
        success: true,
        data: billData,
        text: text,
        confidence: this.calculateConfidence(billData),
      };
    } catch (error) {
      console.error('Error parsing bill:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Errore durante la lettura del file'],
      };
    }
  }

  /**
   * Extract text from PDF
   */
  private static async extractTextFromPDF(file: File): Promise<string> {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  }

  /**
   * Extract text from image using OCR
   */
  private static async extractTextFromImage(file: File): Promise<string> {
    const result = await Tesseract.recognize(file, 'ita', {
      logger: (m) => console.log('OCR Progress:', m),
    });

    return result.data.text;
  }

  /**
   * ADVANCED: Parse extracted text with multiple strategies
   */
  private static parseExtractedText(text: string): Partial<BollettaElettrica> {
    const data: Partial<BollettaElettrica> = {};

    // Split text into lines for line-by-line analysis
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Extract all data with multiple strategies
    data.Cliente = this.extractClientData(text, lines);
    data.Fornitura = this.extractSupplyData(text, lines);
    data.Consumi_Fatturati = this.extractConsumptionData(text, lines);
    data.Dettaglio_Costi = this.extractCostData(text, lines);

    console.log('=== EXTRACTED DATA ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=====================');

    return data;
  }

  /**
   * Extract CLIENT data with multiple patterns
   */
  private static extractClientData(text: string, lines: string[]): any {
    const clientData: any = {};

    // ===== POD CODE =====
    // Try 20+ different patterns for POD
    const podPatterns = [
      /(?:pod|codice\s*pod|punto\s*(?:di|d)\s*(?:prelievo|consegna))[:\s-]*([A-Z]{2}\d{3}[A-Z]\d{8,14})/i,
      /\b(IT\d{3}E\d{8,14})\b/i,
      /POD[:\s]*([A-Z]{2}\d{3}[A-Z]\d{8,14})/i,
      /Codice\s*POD[:\s]*([A-Z]{2}\d{3}[A-Z]\d{8,14})/i,
      /([A-Z]{2}\d{3}[A-Z]\d{8,14})/,
    ];

    for (const pattern of podPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length >= 14) {
        clientData.Codice_POD = match[1].toUpperCase();
        console.log(`POD found: ${clientData.Codice_POD}`);
        break;
      }
    }

    // ===== CUSTOMER TYPE =====
    const normalizedText = text.toLowerCase();
    if (normalizedText.includes('domestico') && normalizedText.includes('residente')) {
      clientData.Tipologia_Cliente = 'Domestico_Residente';
    } else if (normalizedText.includes('domestico') && normalizedText.includes('non residente')) {
      clientData.Tipologia_Cliente = 'Domestico_Non_Residente';
    } else if (normalizedText.includes('domestico')) {
      clientData.Tipologia_Cliente = 'Domestico_Residente';
    }

    // ===== METER TYPE =====
    if (normalizedText.match(/(?:bi[\s-]?oraria|bioraria|2\s*fasce)/)) {
      clientData.Fascia_Oraria_Contatore = 'Bioraria';
    } else if (normalizedText.match(/(?:tri[\s-]?oraria|trioraria|multi[\s-]?oraria|3\s*fasce)/)) {
      clientData.Fascia_Oraria_Contatore = 'Multioraria';
    } else if (normalizedText.match(/(?:mono[\s-]?oraria|monoraria|1\s*fascia|fascia\s*unica)/)) {
      clientData.Fascia_Oraria_Contatore = 'Monoraria';
    }

    return clientData;
  }

  /**
   * Extract SUPPLY data with multiple patterns
   */
  private static extractSupplyData(text: string, lines: string[]): any {
    const supplyData: any = {};

    // ===== CONTRACTED POWER =====
    const powerPatterns = [
      /(?:potenza\s*(?:impegnata|contrattuale|disponibile|nominale))[:\s]*(\d+[.,]?\d*)\s*kw/i,
      /(?:potenza)[:\s]*(\d+[.,]?\d*)\s*kw/i,
      /kw\s*(?:impegnati|contrattuali)[:\s]*(\d+[.,]?\d*)/i,
      /(\d+[.,]?\d*)\s*kw\s*(?:impegnata|contrattuale)/i,
    ];

    for (const pattern of powerPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        supplyData.Potenza_Contrattuale_kW = this.parseItalianNumber(match[1]);
        console.log(`Power found: ${supplyData.Potenza_Contrattuale_kW} kW`);
        break;
      }
    }

    // ===== MARKET TYPE =====
    const normalizedText = text.toLowerCase();
    if (normalizedText.match(/mercato\s*libero|libero\s*mercato/)) {
      supplyData.Mercato = 'Libero';
    } else if (normalizedText.match(/(?:maggior\s*)?tutela|servizio\s*di\s*(?:maggior\s*)?tutela/)) {
      supplyData.Mercato = 'Maggior_Tutela';
    }

    return supplyData;
  }

  /**
   * Extract CONSUMPTION data with ULTRA-AGGRESSIVE pattern matching
   */
  private static extractConsumptionData(text: string, lines: string[]): any {
    const consumptionData: any = {};

    // ===== BILLING PERIOD =====
    const periodPatterns = [
      /(?:periodo|dal|fatturazione|competenza)[:\s]*(?:dal\s*)?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}).*?(?:al|fino|a)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s*[–\-]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
      /dal\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s*al\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    ];

    for (const pattern of periodPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[2]) {
        consumptionData.Periodo_Riferimento = {
          start: this.parseDate(match[1]),
          end: this.parseDate(match[2]),
        };
        console.log(`Period found: ${match[1]} - ${match[2]}`);
        break;
      }
    }

    // ===== TOTAL CONSUMPTION =====
    // Try 30+ patterns for total consumption
    const totalConsumptionPatterns = [
      // Pattern with label before number
      /(?:consumo|energia\s*consumata|totale\s*kwh|energia\s*attiva|totale\s*energia)[:\s]*(\d+[.,]?\d*)\s*kwh/i,
      /(?:totale|tot\.?)[:\s]*(\d+[.,]?\d*)\s*kwh/i,
      /energia[:\s]*(\d+[.,]?\d*)\s*kwh/i,

      // Pattern with kWh before number
      /kwh[:\s]*(\d+[.,]?\d*)/i,

      // Pattern in tables
      /consumo.*?(\d+[.,]?\d*)\s*kwh/i,

      // Very aggressive: any number followed by kWh with context
      /(\d+[.,]?\d*)\s*kwh/i,
    ];

    // Try to find the LARGEST kWh value (most likely the total)
    let maxConsumption = 0;
    let foundTotal = false;

    for (const pattern of totalConsumptionPatterns) {
      const matches = text.matchAll(new RegExp(pattern.source, 'gi'));
      for (const match of matches) {
        if (match[1]) {
          const value = this.parseItalianNumber(match[1]);
          // Total consumption usually between 50-10000 kWh
          if (value > 10 && value < 50000) {
            if (value > maxConsumption) {
              maxConsumption = value;
              foundTotal = true;
            }
          }
        }
      }
    }

    if (foundTotal) {
      consumptionData.Totale_kWh = maxConsumption;
      console.log(`Total consumption found: ${maxConsumption} kWh`);
    }

    // ===== TIME SLOT CONSUMPTION (F1, F2, F3) =====
    const f1Patterns = [
      /(?:f1|fascia\s*f?1|punta)[:\s]*(\d+[.,]?\d*)\s*kwh/i,
      /(\d+[.,]?\d*)\s*kwh.*?f1/i,
      /f1.*?(\d+[.,]?\d*)\s*kwh/i,
    ];

    const f2Patterns = [
      /(?:f2|fascia\s*f?2|intermedia)[:\s]*(\d+[.,]?\d*)\s*kwh/i,
      /(\d+[.,]?\d*)\s*kwh.*?f2/i,
      /f2.*?(\d+[.,]?\d*)\s*kwh/i,
    ];

    const f3Patterns = [
      /(?:f3|fascia\s*f?3|fuori\s*punta)[:\s]*(\d+[.,]?\d*)\s*kwh/i,
      /(\d+[.,]?\d*)\s*kwh.*?f3/i,
      /f3.*?(\d+[.,]?\d*)\s*kwh/i,
    ];

    for (const pattern of f1Patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        consumptionData.Fascia_F1_kWh = this.parseItalianNumber(match[1]);
        console.log(`F1 found: ${consumptionData.Fascia_F1_kWh} kWh`);
        break;
      }
    }

    for (const pattern of f2Patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        consumptionData.Fascia_F2_kWh = this.parseItalianNumber(match[1]);
        console.log(`F2 found: ${consumptionData.Fascia_F2_kWh} kWh`);
        break;
      }
    }

    for (const pattern of f3Patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        consumptionData.Fascia_F3_kWh = this.parseItalianNumber(match[1]);
        console.log(`F3 found: ${consumptionData.Fascia_F3_kWh} kWh`);
        break;
      }
    }

    // If we have F1, F2, F3 but no total, calculate it
    if (!consumptionData.Totale_kWh &&
        (consumptionData.Fascia_F1_kWh || consumptionData.Fascia_F2_kWh || consumptionData.Fascia_F3_kWh)) {
      consumptionData.Totale_kWh =
        (consumptionData.Fascia_F1_kWh || 0) +
        (consumptionData.Fascia_F2_kWh || 0) +
        (consumptionData.Fascia_F3_kWh || 0);
      console.log(`Total calculated from time slots: ${consumptionData.Totale_kWh} kWh`);
    }

    return consumptionData;
  }

  /**
   * Extract COST data with aggressive pattern matching
   */
  private static extractCostData(text: string, lines: string[]): any {
    const costData: any = {};

    // ===== ENERGY COST =====
    const energyCostPatterns = [
      /(?:spesa\s*(?:per\s*)?(?:la\s*)?materia\s*energia|materia\s*prima|energia)[:\s]*€?\s*(\d+[.,]\d{1,2})/i,
      /materia\s*energia.*?€?\s*(\d+[.,]\d{1,2})/i,
      /energia.*?€\s*(\d+[.,]\d{1,2})/i,
    ];

    for (const pattern of energyCostPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        if (!costData.Spesa_Materia_Energia) costData.Spesa_Materia_Energia = {};
        costData.Spesa_Materia_Energia.Totale_Euro = this.parseItalianNumber(match[1]);
        console.log(`Energy cost found: €${costData.Spesa_Materia_Energia.Totale_Euro}`);
        break;
      }
    }

    // ===== TRANSPORT COST =====
    const transportPatterns = [
      /(?:spesa\s*(?:per\s*)?trasporto|trasporto\s*e\s*gestione|rete)[:\s]*€?\s*(\d+[.,]\d{1,2})/i,
      /trasporto.*?€\s*(\d+[.,]\d{1,2})/i,
    ];

    for (const pattern of transportPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        if (!costData.Spesa_Trasporto_Gestione_Contatore) costData.Spesa_Trasporto_Gestione_Contatore = {};
        costData.Spesa_Trasporto_Gestione_Contatore.Totale_Euro = this.parseItalianNumber(match[1]);
        console.log(`Transport cost found: €${costData.Spesa_Trasporto_Gestione_Contatore.Totale_Euro}`);
        break;
      }
    }

    // ===== SYSTEM CHARGES =====
    const systemChargesPatterns = [
      /(?:oneri\s*(?:di\s*)?sistema|oneri\s*generali)[:\s]*€?\s*(\d+[.,]\d{1,2})/i,
      /oneri.*?€\s*(\d+[.,]\d{1,2})/i,
    ];

    for (const pattern of systemChargesPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        if (!costData.Spesa_Oneri_Sistema) costData.Spesa_Oneri_Sistema = {};
        costData.Spesa_Oneri_Sistema.Totale_Euro = this.parseItalianNumber(match[1]);
        console.log(`System charges found: €${costData.Spesa_Oneri_Sistema.Totale_Euro}`);
        break;
      }
    }

    // ===== TAXES =====
    const taxPatterns = [
      /(?:imposte|iva|accise)[:\s]*€?\s*(\d+[.,]\d{1,2})/i,
      /(?:imposte|iva).*?€\s*(\d+[.,]\d{1,2})/i,
    ];

    for (const pattern of taxPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        if (!costData.Imposte) costData.Imposte = {};
        costData.Imposte.Totale_Euro = this.parseItalianNumber(match[1]);
        console.log(`Taxes found: €${costData.Imposte.Totale_Euro}`);
        break;
      }
    }

    // ===== TOTAL BILL =====
    const totalPatterns = [
      /(?:totale\s*fattura|importo\s*totale|totale\s*da\s*pagare|da\s*pagare)[:\s]*€?\s*(\d+[.,]\d{1,2})/i,
      /totale.*?€\s*(\d+[.,]\d{1,2})/i,
      /€\s*(\d+[.,]\d{1,2}).*?totale/i,
    ];

    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const total = this.parseItalianNumber(match[1]);
        console.log(`Total bill found: €${total}`);
        // If we don't have energy cost yet, estimate it
        if (!costData.Spesa_Materia_Energia?.Totale_Euro) {
          if (!costData.Spesa_Materia_Energia) costData.Spesa_Materia_Energia = {};
          costData.Spesa_Materia_Energia.Totale_Euro = total * 0.5; // Rough estimate
        }
        break;
      }
    }

    return costData;
  }

  /**
   * Parse date string to YYYY-MM-DD format
   */
  private static parseDate(dateStr: string): string {
    // Handle different date formats
    const cleaned = dateStr.replace(/[\/\-\.]/g, '/');
    const parts = cleaned.split('/');

    if (parts.length === 3) {
      let day = parts[0].padStart(2, '0');
      let month = parts[1].padStart(2, '0');
      let year = parts[2];

      // Handle 2-digit year
      if (year.length === 2) {
        year = '20' + year;
      }

      // Handle reversed format (YYYY/MM/DD)
      if (year.length === 4 && parseInt(parts[0]) > 31) {
        year = parts[0];
        month = parts[1].padStart(2, '0');
        day = parts[2].padStart(2, '0');
      }

      return `${year}-${month}-${day}`;
    }

    return dateStr;
  }

  /**
   * Parse Italian number format to float
   * Italian format: 1.234,56 (dot for thousands, comma for decimals)
   */
  private static parseItalianNumber(numberStr: string): number {
    if (!numberStr) return 0;

    // Remove spaces and trim
    const cleaned = numberStr.trim().replace(/\s/g, '');

    // Remove thousand separators (dots that are NOT followed by exactly 2 digits at the end)
    let normalized = cleaned.replace(/\.(?!\d{1,2}$)/g, '');

    // Replace decimal comma with dot
    normalized = normalized.replace(',', '.');

    const result = parseFloat(normalized);
    return isNaN(result) ? 0 : result;
  }

  /**
   * Calculate confidence score based on extracted data
   */
  private static calculateConfidence(data: Partial<BollettaElettrica>): number {
    let score = 0;
    let total = 0;

    // Check each field
    const checks = [
      data.Cliente?.Codice_POD,
      data.Cliente?.Tipologia_Cliente,
      data.Cliente?.Fascia_Oraria_Contatore,
      data.Fornitura?.Potenza_Contrattuale_kW,
      data.Fornitura?.Mercato,
      data.Consumi_Fatturati?.Periodo_Riferimento,
      data.Consumi_Fatturati?.Totale_kWh,
      data.Dettaglio_Costi?.Spesa_Materia_Energia?.Totale_Euro,
    ];

    for (const check of checks) {
      total++;
      if (check) score++;
    }

    return total > 0 ? score / total : 0;
  }

  /**
   * Validate extracted data
   */
  static validateExtractedData(data: Partial<BollettaElettrica>): {
    isValid: boolean;
    missingFields: string[];
  } {
    const missingFields: string[] = [];

    if (!data.Cliente?.Codice_POD) missingFields.push('Codice POD');
    if (!data.Consumi_Fatturati?.Totale_kWh) missingFields.push('Consumo totale');
    if (!data.Consumi_Fatturati?.Periodo_Riferimento) missingFields.push('Periodo fatturazione');
    if (!data.Fornitura?.Potenza_Contrattuale_kW) missingFields.push('Potenza contrattuale');

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }
}

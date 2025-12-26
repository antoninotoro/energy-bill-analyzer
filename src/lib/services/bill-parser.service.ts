/**
 * Bill Parser Service
 * Extracts data from electricity bill PDFs and images using OCR
 */

import Tesseract from 'tesseract.js';
import { BollettaElettrica } from '@/types/bill';

export interface ParsedBillData {
  success: boolean;
  data?: Partial<BollettaElettrica>;
  text?: string;
  confidence?: number;
  errors?: string[];
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

      // Parse extracted text
      const billData = this.parseExtractedText(text);

      return {
        success: true,
        data: billData,
        text: text,
        confidence: 0.8, // Placeholder, could be calculated based on matched fields
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
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');

    // Configure worker
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }

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
   * Parse extracted text and extract bill data
   */
  private static parseExtractedText(text: string): Partial<BollettaElettrica> {
    const data: Partial<BollettaElettrica> = {};

    // Normalize text
    const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');

    // Extract POD
    const podMatch = text.match(/(?:pod|codice\s*pod)[:\s]*([A-Z]{2}\d{3}[A-Z]\d{8,14})/i);
    if (podMatch) {
      data.Cliente = {
        ...data.Cliente,
        Codice_POD: podMatch[1],
      } as any;
    }

    // Extract consumption period
    const periodMatch = text.match(/(?:periodo|dal|fatturazione).*?(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4}).*?(?:al|fino).*?(\d{2}[\/\-\.]\d{4})/i);
    if (periodMatch) {
      data.Consumi_Fatturati = {
        ...data.Consumi_Fatturati,
        Periodo_Riferimento: {
          start: this.parseDate(periodMatch[1]),
          end: this.parseDate(periodMatch[2]),
        },
      } as any;
    }

    // Extract total consumption
    const consumoMatch = text.match(/(?:consumo|energia\s*consumata|totale\s*kwh)[:\s]*(\d+[.,]?\d*)\s*kwh/i);
    if (consumoMatch) {
      const totalKwh = parseFloat(consumoMatch[1].replace(',', '.'));
      data.Consumi_Fatturati = {
        ...data.Consumi_Fatturati,
        Totale_kWh: totalKwh,
      } as any;
    }

    // Extract consumption by time slots (F1, F2, F3)
    const f1Match = text.match(/(?:f1|fascia\s*f1)[:\s]*(\d+[.,]?\d*)\s*kwh/i);
    const f2Match = text.match(/(?:f2|fascia\s*f2)[:\s]*(\d+[.,]?\d*)\s*kwh/i);
    const f3Match = text.match(/(?:f3|fascia\s*f3)[:\s]*(\d+[.,]?\d*)\s*kwh/i);

    if (f1Match || f2Match || f3Match) {
      data.Consumi_Fatturati = {
        ...data.Consumi_Fatturati,
        Fascia_F1_kWh: f1Match ? parseFloat(f1Match[1].replace(',', '.')) : 0,
        Fascia_F2_kWh: f2Match ? parseFloat(f2Match[1].replace(',', '.')) : 0,
        Fascia_F3_kWh: f3Match ? parseFloat(f3Match[1].replace(',', '.')) : 0,
      } as any;
    }

    // Extract contracted power
    const powerMatch = text.match(/(?:potenza\s*(?:impegnata|contrattuale|disponibile))[:\s]*(\d+[.,]?\d*)\s*kw/i);
    if (powerMatch) {
      data.Fornitura = {
        ...data.Fornitura,
        Potenza_Contrattuale_kW: parseFloat(powerMatch[1].replace(',', '.')),
      } as any;
    }

    // Extract total cost
    const totalCostMatch = text.match(/(?:totale\s*fattura|importo\s*totale|da\s*pagare)[:\s]*€?\s*(\d+[.,]\d{2})/i);
    if (totalCostMatch) {
      const totalCost = parseFloat(totalCostMatch[1].replace(',', '.'));
      data.Dettaglio_Costi = {
        ...data.Dettaglio_Costi,
        Spesa_Materia_Energia: {
          Totale_Euro: totalCost * 0.5, // Rough estimate
        } as any,
      } as any;
    }

    // Extract energy cost
    const energyCostMatch = text.match(/(?:spesa\s*(?:per\s*)?(?:la\s*)?materia\s*energia)[:\s]*€?\s*(\d+[.,]\d{2})/i);
    if (energyCostMatch) {
      const energyCost = parseFloat(energyCostMatch[1].replace(',', '.'));
      data.Dettaglio_Costi = {
        ...data.Dettaglio_Costi,
        Spesa_Materia_Energia: {
          ...data.Dettaglio_Costi?.Spesa_Materia_Energia,
          Totale_Euro: energyCost,
        } as any,
      } as any;
    }

    // Extract transport cost
    const transportCostMatch = text.match(/(?:spesa\s*(?:per\s*)?trasporto)[:\s]*€?\s*(\d+[.,]\d{2})/i);
    if (transportCostMatch) {
      const transportCost = parseFloat(transportCostMatch[1].replace(',', '.'));
      data.Dettaglio_Costi = {
        ...data.Dettaglio_Costi,
        Spesa_Trasporto_Gestione_Contatore: {
          Totale_Euro: transportCost,
        } as any,
      } as any;
    }

    // Extract system charges
    const systemChargesMatch = text.match(/(?:oneri\s*(?:di\s*)?sistema)[:\s]*€?\s*(\d+[.,]\d{2})/i);
    if (systemChargesMatch) {
      const systemCharges = parseFloat(systemChargesMatch[1].replace(',', '.'));
      data.Dettaglio_Costi = {
        ...data.Dettaglio_Costi,
        Spesa_Oneri_Sistema: {
          Totale_Euro: systemCharges,
        } as any,
      } as any;
    }

    // Extract taxes
    const taxesMatch = text.match(/(?:imposte|iva)[:\s]*€?\s*(\d+[.,]\d{2})/i);
    if (taxesMatch) {
      const taxes = parseFloat(taxesMatch[1].replace(',', '.'));
      data.Dettaglio_Costi = {
        ...data.Dettaglio_Costi,
        Imposte: {
          Totale_Euro: taxes,
        } as any,
      } as any;
    }

    // Detect customer type
    if (normalizedText.includes('domestico') || normalizedText.includes('residente')) {
      data.Cliente = {
        ...data.Cliente,
        Tipologia_Cliente: 'Domestico_Residente',
      } as any;
    }

    // Detect meter type
    if (normalizedText.includes('bioraria') || normalizedText.includes('bi-oraria')) {
      data.Cliente = {
        ...data.Cliente,
        Fascia_Oraria_Contatore: 'Bioraria',
      } as any;
    } else if (normalizedText.includes('trioraria') || normalizedText.includes('tri-oraria')) {
      data.Cliente = {
        ...data.Cliente,
        Fascia_Oraria_Contatore: 'Multioraria',
      } as any;
    }

    // Detect market type
    if (normalizedText.includes('mercato libero')) {
      data.Fornitura = {
        ...data.Fornitura,
        Mercato: 'Libero',
      } as any;
    } else if (normalizedText.includes('tutela') || normalizedText.includes('maggior tutela')) {
      data.Fornitura = {
        ...data.Fornitura,
        Mercato: 'Maggior_Tutela',
      } as any;
    }

    return data;
  }

  /**
   * Parse date string to YYYY-MM-DD format
   */
  private static parseDate(dateStr: string): string {
    // Handle different date formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    const cleaned = dateStr.replace(/[\/\-\.]/g, '/');
    const parts = cleaned.split('/');

    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
      return `${year}-${month}-${day}`;
    }

    return dateStr;
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

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }
}

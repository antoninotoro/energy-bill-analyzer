/**
 * Cost Analysis Service
 * Calculates detailed cost breakdown and analysis from bill data
 */

import {
  BollettaElettrica,
  CostAnalysis,
  CostBreakdownItem,
  DatiARERA,
} from '@/types/bill';

export class CostAnalysisService {
  /**
   * Perform complete cost analysis on a bill
   */
  static analyzeCosts(
    bolletta: BollettaElettrica,
    datiARERA?: DatiARERA
  ): CostAnalysis {
    const breakdown = this.calculateBreakdown(bolletta, datiARERA);
    const totals = this.calculateTotals(breakdown, bolletta);

    return {
      breakdown,
      totale_costo_fisso_anno: totals.fisso,
      totale_costo_variabile_kwh: totals.variabile,
      costo_totale_fattura: totals.totale,
      costo_medio_kwh: totals.medio_kwh,
    };
  }

  /**
   * Calculate detailed cost breakdown by category
   */
  private static calculateBreakdown(
    bolletta: BollettaElettrica,
    datiARERA?: DatiARERA
  ): CostBreakdownItem[] {
    const { Dettaglio_Costi, Consumi_Fatturati } = bolletta;
    const totalKwh = Consumi_Fatturati.Totale_kWh;

    // Calculate days in billing period
    const start = new Date(Consumi_Fatturati.Periodo_Riferimento.start);
    const end = new Date(Consumi_Fatturati.Periodo_Riferimento.end);
    const daysInPeriod = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const yearlyMultiplier = 365 / daysInPeriod;

    const breakdown: CostBreakdownItem[] = [];

    // 1. Energy cost (Materia Prima)
    const energiaCosto = Dettaglio_Costi.Spesa_Materia_Energia;
    const energiaFissaAnno =
      energiaCosto.Quota_Fissa_Euro * yearlyMultiplier;
    const energiaVariabileKwh = totalKwh > 0
      ? (energiaCosto.Totale_Euro - energiaCosto.Quota_Fissa_Euro) / totalKwh
      : energiaCosto.Quota_Variabile_Euro_kWh;

    breakdown.push({
      categoria: 'Materia Prima Energia',
      voce_fissa_euro_anno: energiaFissaAnno,
      voce_variabile_euro_kwh: energiaVariabileKwh,
      costo_totale_periodo: energiaCosto.Totale_Euro,
      percentuale_sul_totale: 0, // Will be calculated later
    });

    // 2. Network charges (Trasporto e Gestione Contatore)
    const trasportoCosto = Dettaglio_Costi.Spesa_Trasporto_Gestione_Contatore;
    const trasportoFissaAnno = trasportoCosto.Quota_Fissa_Euro_Anno +
      trasportoCosto.Quota_Potenza_Euro_kW_Anno * bolletta.Fornitura.Potenza_Contrattuale_kW;
    const trasportoVariabileKwh = trasportoCosto.Quota_Energia_Euro_kWh;

    breakdown.push({
      categoria: 'Trasporto e Gestione Contatore',
      voce_fissa_euro_anno: trasportoFissaAnno,
      voce_variabile_euro_kwh: trasportoVariabileKwh,
      costo_totale_periodo: trasportoCosto.Totale_Euro,
      percentuale_sul_totale: 0,
    });

    // 3. System charges (Oneri di Sistema)
    const oneriCosto = Dettaglio_Costi.Spesa_Oneri_Sistema;
    const oneriFissaAnno = oneriCosto.Quota_Fissa_Euro_Anno;
    const oneriVariabileKwh = oneriCosto.ASOS_Quota_Variabile_Euro_kWh +
      oneriCosto.ARIM_Quota_Variabile_Euro_kWh;

    breakdown.push({
      categoria: 'Oneri di Sistema (ASOS + ARIM)',
      voce_fissa_euro_anno: oneriFissaAnno,
      voce_variabile_euro_kwh: oneriVariabileKwh,
      costo_totale_periodo: oneriCosto.Totale_Euro,
      percentuale_sul_totale: 0,
    });

    // 4. Taxes (Imposte)
    const imposteCosto = Dettaglio_Costi.Imposte;
    // Accise are typically applied per kWh
    const acciseKwh = totalKwh > 0 ? imposteCosto.Accise_Euro / totalKwh : 0;

    breakdown.push({
      categoria: 'Accise',
      voce_fissa_euro_anno: 0,
      voce_variabile_euro_kwh: acciseKwh,
      costo_totale_periodo: imposteCosto.Accise_Euro,
      percentuale_sul_totale: 0,
    });

    // IVA is applied on total, so it's calculated separately
    const baseImponibile = energiaCosto.Totale_Euro +
      trasportoCosto.Totale_Euro +
      oneriCosto.Totale_Euro +
      imposteCosto.Accise_Euro;
    const ivaCosto = baseImponibile * (imposteCosto.IVA_Percentuale / 100);

    breakdown.push({
      categoria: 'IVA',
      voce_fissa_euro_anno: 0,
      voce_variabile_euro_kwh: totalKwh > 0 ? ivaCosto / totalKwh : 0,
      costo_totale_periodo: ivaCosto,
      percentuale_sul_totale: 0,
    });

    // 5. RAI fee (if applicable)
    if (Dettaglio_Costi.Canone_RAI > 0) {
      breakdown.push({
        categoria: 'Canone RAI',
        voce_fissa_euro_anno: Dettaglio_Costi.Canone_RAI * yearlyMultiplier,
        voce_variabile_euro_kwh: 0,
        costo_totale_periodo: Dettaglio_Costi.Canone_RAI,
        percentuale_sul_totale: 0,
      });
    }

    // Calculate percentages
    const totalCost = breakdown.reduce(
      (sum, item) => sum + item.costo_totale_periodo,
      0
    );
    breakdown.forEach(item => {
      item.percentuale_sul_totale = totalCost > 0
        ? (item.costo_totale_periodo / totalCost) * 100
        : 0;
    });

    return breakdown;
  }

  /**
   * Calculate total costs
   */
  private static calculateTotals(
    breakdown: CostBreakdownItem[],
    bolletta: BollettaElettrica
  ) {
    const totaleFisso = breakdown.reduce(
      (sum, item) => sum + item.voce_fissa_euro_anno,
      0
    );

    const totaleVariabile = breakdown.reduce(
      (sum, item) => sum + item.voce_variabile_euro_kwh,
      0
    );

    const totaleFattura = breakdown.reduce(
      (sum, item) => sum + item.costo_totale_periodo,
      0
    );

    const totalKwh = bolletta.Consumi_Fatturati.Totale_kWh;
    const medioKwh = totalKwh > 0 ? totaleFattura / totalKwh : 0;

    return {
      fisso: totaleFisso,
      variabile: totaleVariabile,
      totale: totaleFattura,
      medio_kwh: medioKwh,
    };
  }

  /**
   * Calculate spread (supplier margin) from energy cost
   */
  static calculateSpread(bolletta: BollettaElettrica, avgPUN: number): number {
    const energiaCosto = bolletta.Dettaglio_Costi.Spesa_Materia_Energia;

    // If spread is already provided in the bill
    if (energiaCosto.Spread_Commerciale_Euro_kWh > 0) {
      return energiaCosto.Spread_Commerciale_Euro_kWh;
    }

    // Calculate from energy price
    const totalKwh = bolletta.Consumi_Fatturati.Totale_kWh;
    if (totalKwh === 0) return 0;

    const energiaVariabile =
      (energiaCosto.Totale_Euro - energiaCosto.Quota_Fissa_Euro) / totalKwh;

    // Spread = Total energy price - PUN - typical costs (dispacciamento ~0.015 €/kWh)
    const dispacciamento = 0.015;
    return energiaVariabile - avgPUN - dispacciamento;
  }

  /**
   * Analyze consumption profile by time slot
   */
  static analyzeConsumptionProfile(bolletta: BollettaElettrica) {
    const consumi = bolletta.Consumi_Fatturati;
    const total = consumi.Totale_kWh;

    if (total === 0) {
      return {
        F1_percentuale: 0,
        F2_percentuale: 0,
        F3_percentuale: 0,
        profilo: 'N/A',
      };
    }

    const F1_perc = (consumi.Fascia_F1_kWh / total) * 100;
    const F2_perc = (consumi.Fascia_F2_kWh / total) * 100;
    const F3_perc = (consumi.Fascia_F3_kWh / total) * 100;

    // Determine profile type
    let profilo = 'Bilanciato';
    if (F1_perc > 50) {
      profilo = 'Prevalenza F1 (giorno feriale)';
    } else if (F3_perc > 50) {
      profilo = 'Prevalenza F3 (notte/weekend)';
    } else if (F2_perc + F3_perc > 70) {
      profilo = 'Prevalenza F23 (sera/notte/weekend)';
    }

    return {
      F1_percentuale: F1_perc,
      F2_percentuale: F2_perc,
      F3_percentuale: F3_perc,
      profilo,
    };
  }

  /**
   * Check if contracted power is adequate
   */
  static analyzePowerAdequacy(
    bolletta: BollettaElettrica
  ): {
    adequate: boolean;
    suggestion?: string;
    potentialSaving?: number;
  } {
    const potenzaContrattuale = bolletta.Fornitura.Potenza_Contrattuale_kW;

    // Typical domestic consumption patterns:
    // 3 kW: Standard for most homes
    // 4.5 kW: Homes with higher consumption
    // 6 kW: Homes with heat pumps or high consumption

    const consumoMensile = bolletta.Consumi_Fatturati.Totale_kWh;
    const start = new Date(bolletta.Consumi_Fatturati.Periodo_Riferimento.start);
    const end = new Date(bolletta.Consumi_Fatturati.Periodo_Riferimento.end);
    const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const consumoMedioMensile = consumoMensile / (months || 1);

    // Heuristic: typical home uses ~300 kWh/month per kW of contracted power
    const kWhPerKwMonth = 300;
    const potenzaSuggerita = Math.ceil(consumoMedioMensile / kWhPerKwMonth);

    if (potenzaContrattuale > potenzaSuggerita * 1.5) {
      // Oversized
      const quotaPotenza = bolletta.Dettaglio_Costi.Spesa_Trasporto_Gestione_Contatore
        .Quota_Potenza_Euro_kW_Anno;
      const risparmio = (potenzaContrattuale - potenzaSuggerita) * quotaPotenza;

      return {
        adequate: false,
        suggestion: `Potenza contrattuale sovradimensionata. Considerare riduzione a ${potenzaSuggerita} kW`,
        potentialSaving: risparmio,
      };
    }

    return {
      adequate: true,
    };
  }
}

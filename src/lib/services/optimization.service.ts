/**
 * Optimization Service
 * Generates actionable recommendations to reduce electricity costs
 */

import {
  BollettaElettrica,
  Intervention,
  InterventionType,
  DatiARERA,
} from '@/types/bill';
import { CostAnalysisService } from './cost-analysis.service';

export class OptimizationService {
  /**
   * Generate optimization recommendations based on bill analysis
   */
  static async generateRecommendations(
    bolletta: BollettaElettrica,
    datiARERA?: DatiARERA
  ): Promise<Intervention[]> {
    const interventions: Intervention[] = [];

    // 1. Analyze supplier offer
    const offerIntervention = await this.analyzeOffer(bolletta, datiARERA);
    if (offerIntervention) interventions.push(offerIntervention);

    // 2. Analyze contracted power
    const powerIntervention = this.analyzePower(bolletta);
    if (powerIntervention) interventions.push(powerIntervention);

    // 3. Analyze consumption behavior
    const behaviorIntervention = this.analyzeBehavior(bolletta);
    if (behaviorIntervention) interventions.push(behaviorIntervention);

    // 4. Analyze energy efficiency potential
    const efficiencyIntervention = this.analyzeEfficiency(bolletta);
    if (efficiencyIntervention) interventions.push(efficiencyIntervention);

    // 5. Analyze self-production potential
    const selfProductionIntervention = this.analyzeSelfProduction(bolletta);
    if (selfProductionIntervention) interventions.push(selfProductionIntervention);

    // Sort by potential savings (descending)
    return interventions.sort(
      (a, b) => b.risparmio_stimato_euro_anno - a.risparmio_stimato_euro_anno
    );
  }

  /**
   * Analyze current offer and suggest alternatives
   */
  private static async analyzeOffer(
    bolletta: BollettaElettrica,
    datiARERA?: DatiARERA
  ): Promise<Intervention | null> {
    const energiaCosto = bolletta.Dettaglio_Costi.Spesa_Materia_Energia;
    const totalKwh = bolletta.Consumi_Fatturati.Totale_kWh;

    if (totalKwh === 0) return null;

    // Calculate current energy cost per kWh
    const costoEnergiaKwh = energiaCosto.Totale_Euro / totalKwh;

    // Estimate average market price (PUN + typical spread)
    const avgPUN = datiARERA
      ? datiARERA.Prezzi_Materia_Prima.reduce(
          (sum, p) => sum + p.PUN_euro_kwh,
          0
        ) / datiARERA.Prezzi_Materia_Prima.length
      : 0.11; // Fallback

    const typicalSpread = 0.02; // Competitive market spread ~0.02 €/kWh
    const competitivePrice = avgPUN + typicalSpread + 0.015; // + dispacciamento

    const spread = CostAnalysisService.calculateSpread(bolletta, avgPUN);

    // If spread is high (> 0.03 €/kWh), recommend switching
    if (spread > 0.03 || costoEnergiaKwh > competitivePrice * 1.15) {
      const potentialSavingKwh = Math.max(
        costoEnergiaKwh - competitivePrice,
        spread - typicalSpread
      );
      const annualKwh = (totalKwh / this.getPeriodDays(bolletta)) * 365;
      const risparmioAnno = potentialSavingKwh * annualKwh;

      return {
        tipo: 'Offerta',
        titolo: 'Cambio Fornitore e Offerta',
        descrizione: `L'attuale spread del fornitore (${(spread * 1000).toFixed(1)}€/MWh) è superiore alla media di mercato. Cambiando fornitore con un'offerta più competitiva si può ridurre significativamente il costo dell'energia.`,
        risparmio_stimato_euro_anno: risparmioAnno,
        priorita: risparmioAnno > 150 ? 'Alta' : 'Media',
        complessita: 'Facile',
        metrica_valutata: `Spread fornitore: ${(spread * 1000).toFixed(1)} €/MWh vs. media mercato: ${(typicalSpread * 1000).toFixed(1)} €/MWh`,
        azione_suggerita: `Valutare offerte sul Portale Offerte ARERA con spread < 0.025 €/kWh. ${
          bolletta.Fornitura.Mercato === 'Maggior_Tutela'
            ? 'Considerare passaggio al mercato libero.'
            : ''
        }`,
      };
    }

    return null;
  }

  /**
   * Analyze contracted power
   */
  private static analyzePower(
    bolletta: BollettaElettrica
  ): Intervention | null {
    const analysis = CostAnalysisService.analyzePowerAdequacy(bolletta);

    if (!analysis.adequate && analysis.potentialSaving) {
      return {
        tipo: 'Potenza',
        titolo: 'Riduzione Potenza Contrattuale',
        descrizione: analysis.suggestion || 'Potenza contrattuale sovradimensionata',
        risparmio_stimato_euro_anno: analysis.potentialSaving,
        priorita: analysis.potentialSaving > 50 ? 'Alta' : 'Media',
        complessita: 'Facile',
        metrica_valutata: `Potenza contrattuale: ${bolletta.Fornitura.Potenza_Contrattuale_kW} kW`,
        azione_suggerita: analysis.suggestion || '',
      };
    }

    return null;
  }

  /**
   * Analyze consumption behavior (time slots)
   */
  private static analyzeBehavior(
    bolletta: BollettaElettrica
  ): Intervention | null {
    const profile = CostAnalysisService.analyzeConsumptionProfile(bolletta);

    // If high F1 consumption (>45%) suggest shifting to F23
    if (profile.F1_percentuale > 45 && bolletta.Cliente.Fascia_Oraria_Contatore !== 'Monoraria') {
      const totalKwh = bolletta.Consumi_Fatturati.Totale_kWh;
      const f1Kwh = bolletta.Consumi_Fatturati.Fascia_F1_kWh;

      // Estimate savings: assuming F1 costs ~0.05 €/kWh more than F23
      const differenzaPrezzo = 0.05;
      const potentialShift = f1Kwh * 0.3; // Assume 30% could be shifted
      const annualKwh = (totalKwh / this.getPeriodDays(bolletta)) * 365;
      const risparmioAnno = potentialShift * differenzaPrezzo * (365 / this.getPeriodDays(bolletta));

      return {
        tipo: 'Comportamento',
        titolo: 'Ottimizzazione Fasce Orarie',
        descrizione: `Il ${profile.F1_percentuale.toFixed(0)}% dei consumi avviene in fascia F1 (lun-ven 8-19). Spostando parte dei consumi in fascia F23 (sera/notte/weekend) si possono ridurre i costi.`,
        risparmio_stimato_euro_anno: risparmioAnno,
        priorita: risparmioAnno > 100 ? 'Alta' : 'Media',
        complessita: 'Media',
        metrica_valutata: `Consumi F1: ${profile.F1_percentuale.toFixed(0)}%, F2: ${profile.F2_percentuale.toFixed(0)}%, F3: ${profile.F3_percentuale.toFixed(0)}%`,
        azione_suggerita: 'Programmare lavatrici, lavastoviglie e altri elettrodomestici ad alto consumo dopo le 19:00 o nei weekend. Valutare offerte biorarie se non già attive.',
      };
    }

    // If already low F1 consumption but on monoraria, suggest bioraria offer
    if (
      profile.F1_percentuale < 35 &&
      bolletta.Cliente.Fascia_Oraria_Contatore === 'Monoraria'
    ) {
      const totalKwh = bolletta.Consumi_Fatturati.Totale_kWh;
      const annualKwh = (totalKwh / this.getPeriodDays(bolletta)) * 365;
      const risparmioAnno = annualKwh * 0.015; // Estimate 1.5 cent/kWh savings

      return {
        tipo: 'Offerta',
        titolo: 'Passaggio a Offerta Bioraria',
        descrizione: `Solo il ${profile.F1_percentuale.toFixed(0)}% dei consumi avviene in fascia F1. Un'offerta bioraria con prezzo ridotto in F23 potrebbe essere vantaggiosa.`,
        risparmio_stimato_euro_anno: risparmioAnno,
        priorita: 'Media',
        complessita: 'Facile',
        metrica_valutata: `Profilo consumo: ${profile.profilo}`,
        azione_suggerita: 'Confrontare offerte biorarie sul Portale Offerte ARERA.',
      };
    }

    return null;
  }

  /**
   * Analyze energy efficiency potential
   */
  private static analyzeEfficiency(
    bolletta: BollettaElettrica
  ): Intervention | null {
    const totalKwh = bolletta.Consumi_Fatturati.Totale_kWh;
    const periodDays = this.getPeriodDays(bolletta);
    const monthlyKwh = (totalKwh / periodDays) * 30;

    // Average Italian household: ~250 kWh/month
    // High consumption households: >400 kWh/month
    if (monthlyKwh > 400) {
      const excessKwh = monthlyKwh - 300; // Target reduction
      const annualExcess = excessKwh * 12;
      const costoMedioKwh = bolletta.Dettaglio_Costi.Spesa_Materia_Energia.Totale_Euro / totalKwh;
      const risparmioAnno = annualExcess * (costoMedioKwh + 0.05); // Include all costs

      return {
        tipo: 'Efficienza',
        titolo: 'Interventi di Efficienza Energetica',
        descrizione: `Il consumo medio mensile (${monthlyKwh.toFixed(0)} kWh) è significativamente superiore alla media nazionale (~250 kWh). Interventi di efficienza possono ridurre i costi.`,
        risparmio_stimato_euro_anno: risparmioAnno,
        priorita: 'Alta',
        complessita: 'Media',
        metrica_valutata: `Consumo mensile: ${monthlyKwh.toFixed(0)} kWh`,
        azione_suggerita: 'Considerare: sostituzione lampadine con LED, elettrodomestici classe A+++, isolamento termico, ottimizzazione riscaldamento/raffreddamento.',
      };
    }

    return null;
  }

  /**
   * Analyze self-production (solar PV) potential
   */
  private static analyzeSelfProduction(
    bolletta: BollettaElettrica
  ): Intervention | null {
    // If already has solar, optimize usage
    if (bolletta.Autoproduzione.Presenza_Impianto_Fotovoltaico) {
      const immessa = bolletta.Autoproduzione.Energia_Immessa_in_Rete_kWh;
      const prelevata = bolletta.Consumi_Fatturati.Totale_kWh;

      // If immitting a lot, suggest battery storage
      if (immessa > prelevata * 0.3) {
        const costoMedioKwh = 0.25; // Approximate retail price
        const valorizzazioneSSP = 0.12; // Scambio sul posto value
        const differenza = costoMedioKwh - valorizzazioneSSP;
        const potentialStorage = immessa * 0.5; // Assume 50% could be stored
        const risparmioAnno = potentialStorage * differenza * (365 / this.getPeriodDays(bolletta));

        return {
          tipo: 'Autoproduzione',
          titolo: 'Sistema di Accumulo (Batteria)',
          descrizione: `Si sta immettendo in rete ${immessa.toFixed(0)} kWh. Un sistema di accumulo permetterebbe di utilizzare l'energia autoprodotta invece di prelevarla dalla rete.`,
          risparmio_stimato_euro_anno: risparmioAnno,
          priorita: risparmioAnno > 300 ? 'Alta' : 'Media',
          complessita: 'Difficile',
          metrica_valutata: `Energia immessa: ${immessa.toFixed(0)} kWh, Prelevata: ${prelevata.toFixed(0)} kWh`,
          azione_suggerita: 'Valutare installazione sistema di accumulo (batterie) per massimizzare autoconsumo. Considerare incentivi fiscali disponibili (Superbonus, detrazioni 50%).',
        };
      }

      return null;
    }

    // If no solar, suggest installation if consumption is high
    const totalKwh = bolletta.Consumi_Fatturati.Totale_kWh;
    const periodDays = this.getPeriodDays(bolletta);
    const annualKwh = (totalKwh / periodDays) * 365;

    if (annualKwh > 2500 && bolletta.Cliente.Tipologia_Cliente.includes('Domestico')) {
      // Typical 3 kWp system produces ~3500-4000 kWh/year in Italy
      const produzioneFV = 3500;
      const autoconsumo = Math.min(annualKwh * 0.4, produzioneFV * 0.7); // 40% self-consumption
      const costoMedioKwh = 0.25;
      const risparmioAnno = autoconsumo * costoMedioKwh;

      return {
        tipo: 'Autoproduzione',
        titolo: 'Impianto Fotovoltaico',
        descrizione: `Con un consumo annuo di ~${annualKwh.toFixed(0)} kWh, un impianto fotovoltaico da 3 kWp potrebbe coprire una parte significativa del fabbisogno.`,
        risparmio_stimato_euro_anno: risparmioAnno,
        priorita: 'Media',
        complessita: 'Difficile',
        metrica_valutata: `Consumo annuo stimato: ${annualKwh.toFixed(0)} kWh`,
        azione_suggerita: 'Valutare fattibilità installazione FV (orientamento tetto, spazio disponibile). Costo indicativo: 5000-7000€ per 3 kWp. ROI: 6-8 anni con detrazioni fiscali.',
      };
    }

    return null;
  }

  /**
   * Helper: Get billing period in days
   */
  private static getPeriodDays(bolletta: BollettaElettrica): number {
    const start = new Date(bolletta.Consumi_Fatturati.Periodo_Riferimento.start);
    const end = new Date(bolletta.Consumi_Fatturati.Periodo_Riferimento.end);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}

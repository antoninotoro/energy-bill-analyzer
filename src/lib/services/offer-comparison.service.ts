/**
 * Offer Comparison Service
 * Compares market offers and finds the best match for user's consumption profile
 */

import {
  BollettaElettrica,
  MarketOffer,
  OfferComparison,
  DatiARERA,
} from '@/types/bill';

/**
 * Mock market offers based on real Italian energy suppliers
 * In production, this should fetch from ARERA Portale Offerte API
 */
const MOCK_MARKET_OFFERS: MarketOffer[] = [
  {
    id: 'offer-1',
    fornitore: 'Enel Energia',
    nome_offerta: 'Prezzo Fisso 12 Mesi',
    tipo: 'Fissa',
    prezzo_fisso_euro_kwh: 0.145,
    quota_fissa_mensile: 8.5,
    durata_contratto_mesi: 12,
    caratteristiche: [
      'Prezzo bloccato 12 mesi',
      'Nessun costo di attivazione',
      '100% energia green',
    ],
  },
  {
    id: 'offer-2',
    fornitore: 'A2A Energia',
    nome_offerta: 'Click Prezzo Fisso Web',
    tipo: 'Fissa',
    prezzo_fisso_euro_kwh: 0.138,
    quota_fissa_mensile: 7.0,
    durata_contratto_mesi: 12,
    caratteristiche: [
      'Sconto attivazione web',
      'App mobile inclusa',
      'Fattura elettronica',
    ],
  },
  {
    id: 'offer-3',
    fornitore: 'Edison',
    nome_offerta: 'Web Luce Indicizzata',
    tipo: 'Indicizzata',
    spread_su_pun_euro_kwh: 0.025,
    quota_fissa_mensile: 6.5,
    durata_contratto_mesi: 12,
    caratteristiche: [
      'Prezzo PUN + spread fisso',
      'Nessun vincolo di durata',
      'Gestione 100% digitale',
    ],
  },
  {
    id: 'offer-4',
    fornitore: 'Eni Plenitude',
    nome_offerta: 'Luce Sempre Conveniente',
    tipo: 'Indicizzata',
    spread_su_pun_euro_kwh: 0.022,
    quota_fissa_mensile: 8.0,
    durata_contratto_mesi: 12,
    caratteristiche: [
      'Spread competitivo',
      'Energia 100% rinnovabile',
      'Sconti fedeltà',
    ],
  },
  {
    id: 'offer-5',
    fornitore: 'Acea Energia',
    nome_offerta: 'Dual Bioraria',
    tipo: 'Bioraria',
    prezzo_f1_euro_kwh: 0.148,
    prezzo_f2_euro_kwh: 0.118,
    prezzo_f3_euro_kwh: 0.118,
    quota_fissa_mensile: 9.0,
    durata_contratto_mesi: 24,
    caratteristiche: [
      'Risparmio in fascia F23',
      'Ideale per chi consuma sera/weekend',
      'Durata 24 mesi',
    ],
  },
  {
    id: 'offer-6',
    fornitore: 'Sorgenia',
    nome_offerta: 'Next Energy Sunlight',
    tipo: 'Trioraria',
    prezzo_f1_euro_kwh: 0.152,
    prezzo_f2_euro_kwh: 0.128,
    prezzo_f3_euro_kwh: 0.108,
    quota_fissa_mensile: 8.5,
    durata_contratto_mesi: 12,
    caratteristiche: [
      'Massimo risparmio in F3',
      'Energia verde certificata',
      'Ottimo per fotovoltaico',
    ],
  },
];

export class OfferComparisonService {
  /**
   * Compare market offers with current bill
   */
  static async compareOffers(
    bolletta: BollettaElettrica,
    datiARERA?: DatiARERA
  ): Promise<OfferComparison[]> {
    const offers = await this.getMarketOffers();

    const comparisons = offers.map(offer =>
      this.evaluateOffer(offer, bolletta, datiARERA)
    );

    // Sort by savings (descending)
    return comparisons.sort((a, b) => b.risparmio_vs_attuale - a.risparmio_vs_attuale);
  }

  /**
   * Get available market offers
   * TODO: Replace with real API call to Portale Offerte ARERA
   */
  private static async getMarketOffers(): Promise<MarketOffer[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return MOCK_MARKET_OFFERS;
  }

  /**
   * Evaluate a single offer against user's consumption
   */
  private static evaluateOffer(
    offerta: MarketOffer,
    bolletta: BollettaElettrica,
    datiARERA?: DatiARERA
  ): OfferComparison {
    const totalKwh = bolletta.Consumi_Fatturati.Totale_kWh;
    const periodDays = this.getPeriodDays(bolletta);
    const annualKwh = (totalKwh / periodDays) * 365;

    // Calculate annual cost with this offer
    const costoAnnuo = this.calculateOfferCost(
      offerta,
      bolletta,
      annualKwh,
      datiARERA
    );

    // Calculate current annual cost
    const costoAttuale = this.calculateCurrentAnnualCost(bolletta);

    const risparmio = costoAttuale - costoAnnuo;
    const risparmioPerc = costoAttuale > 0
      ? (risparmio / costoAttuale) * 100
      : 0;

    // Evaluate if offer is suitable for user's profile
    const adattaProfilo = this.isOfferSuitable(offerta, bolletta);

    // Generate notes
    const note = this.generateOfferNotes(offerta, bolletta, risparmio);

    return {
      offerta,
      costo_annuo_stimato: costoAnnuo,
      risparmio_vs_attuale: risparmio,
      risparmio_percentuale: risparmioPerc,
      adatta_profilo: adattaProfilo,
      note,
    };
  }

  /**
   * Calculate annual cost with a specific offer
   */
  private static calculateOfferCost(
    offerta: MarketOffer,
    bolletta: BollettaElettrica,
    annualKwh: number,
    datiARERA?: DatiARERA
  ): number {
    let costoEnergia = 0;

    // Calculate energy cost based on offer type
    switch (offerta.tipo) {
      case 'Fissa':
        costoEnergia = annualKwh * (offerta.prezzo_fisso_euro_kwh || 0);
        break;

      case 'Indicizzata': {
        const avgPUN = datiARERA
          ? datiARERA.Prezzi_Materia_Prima.reduce(
              (sum, p) => sum + p.PUN_euro_kwh,
              0
            ) / datiARERA.Prezzi_Materia_Prima.length
          : 0.11;

        const prezzoTotale =
          avgPUN + (offerta.spread_su_pun_euro_kwh || 0) + 0.015; // + dispacciamento
        costoEnergia = annualKwh * prezzoTotale;
        break;
      }

      case 'Bioraria':
      case 'Trioraria': {
        // Use consumption profile
        const periodDays = this.getPeriodDays(bolletta);
        const factorAnno = 365 / periodDays;

        const f1Kwh = bolletta.Consumi_Fatturati.Fascia_F1_kWh * factorAnno;
        const f2Kwh = bolletta.Consumi_Fatturati.Fascia_F2_kWh * factorAnno;
        const f3Kwh = bolletta.Consumi_Fatturati.Fascia_F3_kWh * factorAnno;

        costoEnergia =
          f1Kwh * (offerta.prezzo_f1_euro_kwh || 0) +
          f2Kwh * (offerta.prezzo_f2_euro_kwh || 0) +
          f3Kwh * (offerta.prezzo_f3_euro_kwh || 0);
        break;
      }
    }

    // Add fixed costs
    const costoFisso = offerta.quota_fissa_mensile * 12;

    // Add network charges, system charges, taxes (same for all offers)
    const altriCosti = this.calculateOtherCosts(bolletta, annualKwh);

    return costoEnergia + costoFisso + altriCosti;
  }

  /**
   * Calculate other costs (network, system charges, taxes) - same for all offers
   */
  private static calculateOtherCosts(
    bolletta: BollettaElettrica,
    annualKwh: number
  ): number {
    const periodDays = this.getPeriodDays(bolletta);
    const factorAnno = 365 / periodDays;

    // Network charges
    const trasporto = bolletta.Dettaglio_Costi.Spesa_Trasporto_Gestione_Contatore;
    const costoTrasporto = trasporto.Totale_Euro * factorAnno;

    // System charges
    const oneri = bolletta.Dettaglio_Costi.Spesa_Oneri_Sistema;
    const costoOneri = oneri.Totale_Euro * factorAnno;

    // Taxes (approximate)
    const imposte = bolletta.Dettaglio_Costi.Imposte;
    const costoImposte = imposte.Totale_Euro * factorAnno;

    return costoTrasporto + costoOneri + costoImposte;
  }

  /**
   * Calculate current annual cost from bill
   */
  private static calculateCurrentAnnualCost(
    bolletta: BollettaElettrica
  ): number {
    const periodDays = this.getPeriodDays(bolletta);
    const factorAnno = 365 / periodDays;

    const costoEnergia = bolletta.Dettaglio_Costi.Spesa_Materia_Energia.Totale_Euro;
    const costoTrasporto =
      bolletta.Dettaglio_Costi.Spesa_Trasporto_Gestione_Contatore.Totale_Euro;
    const costoOneri = bolletta.Dettaglio_Costi.Spesa_Oneri_Sistema.Totale_Euro;
    const costoImposte = bolletta.Dettaglio_Costi.Imposte.Totale_Euro;

    const totale =
      costoEnergia + costoTrasporto + costoOneri + costoImposte;

    return totale * factorAnno;
  }

  /**
   * Check if offer is suitable for user's consumption profile
   */
  private static isOfferSuitable(
    offerta: MarketOffer,
    bolletta: BollettaElettrica
  ): boolean {
    const consumi = bolletta.Consumi_Fatturati;
    const total = consumi.Totale_kWh;

    if (total === 0) return true;

    const f1Perc = (consumi.Fascia_F1_kWh / total) * 100;
    const f3Perc = (consumi.Fascia_F3_kWh / total) * 100;

    // Bioraria/Trioraria offers are good if F1 < 40%
    if (
      (offerta.tipo === 'Bioraria' || offerta.tipo === 'Trioraria') &&
      f1Perc > 45
    ) {
      return false;
    }

    // Trioraria is best if high F3 consumption (>40%)
    if (offerta.tipo === 'Trioraria' && f3Perc < 30) {
      return false;
    }

    return true;
  }

  /**
   * Generate notes about the offer
   */
  private static generateOfferNotes(
    offerta: MarketOffer,
    bolletta: BollettaElettrica,
    risparmio: number
  ): string[] {
    const note: string[] = [];

    if (risparmio > 200) {
      note.push('💰 Risparmio significativo rispetto all\'offerta attuale');
    } else if (risparmio > 100) {
      note.push('✅ Buon risparmio potenziale');
    } else if (risparmio > 0) {
      note.push('📊 Lieve risparmio rispetto all\'attuale');
    } else if (risparmio < 0) {
      note.push('⚠️ Costo superiore all\'offerta attuale');
    }

    if (!this.isOfferSuitable(offerta, bolletta)) {
      note.push('⚠️ Potrebbe non essere adatta al tuo profilo di consumo');
    }

    if (offerta.tipo === 'Indicizzata') {
      note.push('📈 Prezzo variabile: dipende dall\'andamento del PUN');
    }

    if (offerta.durata_contratto_mesi >= 24) {
      note.push(`🔒 Vincolo contrattuale di ${offerta.durata_contratto_mesi} mesi`);
    }

    if (offerta.caratteristiche.some(c => c.toLowerCase().includes('green') || c.toLowerCase().includes('rinnovabile'))) {
      note.push('🌱 Energia da fonti rinnovabili');
    }

    return note;
  }

  /**
   * Helper: Get billing period in days
   */
  private static getPeriodDays(bolletta: BollettaElettrica): number {
    const start = new Date(
      bolletta.Consumi_Fatturati.Periodo_Riferimento.start
    );
    const end = new Date(bolletta.Consumi_Fatturati.Periodo_Riferimento.end);
    return Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  /**
   * Get top N best offers
   */
  static async getBestOffers(
    bolletta: BollettaElettrica,
    limit: number = 3,
    datiARERA?: DatiARERA
  ): Promise<OfferComparison[]> {
    const comparisons = await this.compareOffers(bolletta, datiARERA);

    return comparisons
      .filter(c => c.risparmio_vs_attuale > 0 && c.adatta_profilo)
      .slice(0, limit);
  }
}

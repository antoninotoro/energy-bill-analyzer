/**
 * TypeScript types for Italian electricity bill data structure
 * Based on ARERA regulations and bill format
 */

// Customer types
export type CustomerType = 'Domestico_Residente' | 'Domestico_Non_Residente' | 'Altro';
export type MeterTimeSlot = 'Monoraria' | 'Bioraria' | 'Multioraria';
export type VoltageSupply = 'Bassa' | 'Media';
export type MarketType = 'Maggior_Tutela' | 'Servizio_a_Tutele_Graduali' | 'Libero';

export interface Cliente {
  Tipologia_Cliente: CustomerType;
  Codice_POD: string;
  Fascia_Oraria_Contatore: MeterTimeSlot;
}

export interface Fornitura {
  Potenza_Contrattuale_kW: number;
  Tensione_Fornitura: VoltageSupply;
  Mercato: MarketType;
}

export interface ConsumiFatturati {
  Periodo_Riferimento: {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
  };
  Totale_kWh: number;
  Fascia_F1_kWh: number;
  Fascia_F2_kWh: number;
  Fascia_F3_kWh: number;
  Profilo_Consumo_Storico_kWh?: number[]; // Monthly or annual historical data
}

export interface SpesaMateriaEnergia {
  Totale_Euro: number;
  Quota_Fissa_Euro: number;
  Quota_Variabile_Euro_kWh: number;
  Prezzo_Componente_Energia_PUN_o_Fissa: number;
  Spread_Commerciale_Euro_kWh: number;
}

export interface SpesaTrasportoGestioneContatore {
  Totale_Euro: number;
  Quota_Fissa_Euro_Anno: number;
  Quota_Potenza_Euro_kW_Anno: number;
  Quota_Energia_Euro_kWh: number;
}

export interface SpesaOneriSistema {
  Totale_Euro: number;
  ASOS_Quota_Variabile_Euro_kWh: number;
  ARIM_Quota_Variabile_Euro_kWh: number;
  Quota_Fissa_Euro_Anno: number;
}

export interface Imposte {
  Totale_Euro: number;
  Accise_Euro: number;
  IVA_Percentuale: number;
}

export interface DettaglioCosti {
  Spesa_Materia_Energia: SpesaMateriaEnergia;
  Spesa_Trasporto_Gestione_Contatore: SpesaTrasportoGestioneContatore;
  Spesa_Oneri_Sistema: SpesaOneriSistema;
  Imposte: Imposte;
  Canone_RAI: number;
}

export interface Autoproduzione {
  Presenza_Impianto_Fotovoltaico: boolean;
  Energia_Immessa_in_Rete_kWh: number;
  Servizi_Scambio_Sul_Posto: boolean;
}

export interface BollettaElettrica {
  Cliente: Cliente;
  Fornitura: Fornitura;
  Consumi_Fatturati: ConsumiFatturati;
  Dettaglio_Costi: DettaglioCosti;
  Autoproduzione: Autoproduzione;
}

// ARERA reference data types
export interface TariffeTrasporto {
  quota_fissa_euro_anno: number;
  quota_potenza_euro_kw_anno: number;
  quota_energia_euro_kwh: number;
  periodo_validita: {
    start: string;
    end: string;
  };
}

export interface OneriSistema {
  ASOS_euro_kwh: number;
  ARIM_euro_kwh: number;
  quota_fissa_euro_anno?: number;
  periodo_validita: {
    start: string;
    end: string;
  };
}

export interface PrezzoMateriaPrima {
  PUN_euro_mwh: number;
  PUN_euro_kwh: number; // PUN / 1000
  data: string;
  fascia?: 'F1' | 'F2' | 'F3';
}

export interface DatiARERA {
  Tariffe_Trasporto: TariffeTrasporto;
  Oneri_Sistema: OneriSistema;
  Prezzi_Materia_Prima: PrezzoMateriaPrima[];
}

// Analysis output types
export interface CostBreakdownItem {
  categoria: string;
  voce_fissa_euro_anno: number;
  voce_variabile_euro_kwh: number;
  costo_totale_periodo: number;
  percentuale_sul_totale: number;
}

export interface CostAnalysis {
  breakdown: CostBreakdownItem[];
  totale_costo_fisso_anno: number;
  totale_costo_variabile_kwh: number;
  costo_totale_fattura: number;
  costo_medio_kwh: number;
}

export type InterventionType = 'Offerta' | 'Potenza' | 'Efficienza' | 'Comportamento' | 'Autoproduzione';

export interface Intervention {
  tipo: InterventionType;
  titolo: string;
  descrizione: string;
  risparmio_stimato_euro_anno: number;
  priorita: 'Alta' | 'Media' | 'Bassa';
  complessita: 'Facile' | 'Media' | 'Difficile';
  metrica_valutata: string;
  azione_suggerita: string;
}

export interface AnalysisResult {
  bolletta: BollettaElettrica;
  analisi_costi: CostAnalysis;
  interventi_suggeriti: Intervention[];
  data_analisi: string;
}

// Offer comparison types
export type OfferType = 'Fissa' | 'Indicizzata' | 'Bioraria' | 'Trioraria';

export interface MarketOffer {
  id: string;
  fornitore: string;
  nome_offerta: string;
  tipo: OfferType;
  prezzo_fisso_euro_kwh?: number;
  spread_su_pun_euro_kwh?: number;
  prezzo_f1_euro_kwh?: number;
  prezzo_f2_euro_kwh?: number;
  prezzo_f3_euro_kwh?: number;
  quota_fissa_mensile: number;
  durata_contratto_mesi: number;
  caratteristiche: string[];
}

export interface OfferComparison {
  offerta: MarketOffer;
  costo_annuo_stimato: number;
  risparmio_vs_attuale: number;
  risparmio_percentuale: number;
  adatta_profilo: boolean;
  note: string[];
}

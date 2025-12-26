/**
 * Sample bill data for testing purposes
 */

import { BollettaElettrica } from '@/types/bill';

export const SAMPLE_BILL_1: BollettaElettrica = {
  Cliente: {
    Tipologia_Cliente: 'Domestico_Residente',
    Codice_POD: 'IT001E12345678',
    Fascia_Oraria_Contatore: 'Multioraria',
  },
  Fornitura: {
    Potenza_Contrattuale_kW: 3,
    Tensione_Fornitura: 'Bassa',
    Mercato: 'Libero',
  },
  Consumi_Fatturati: {
    Periodo_Riferimento: {
      start: '2024-11-01',
      end: '2024-12-31',
    },
    Totale_kWh: 280,
    Fascia_F1_kWh: 120,
    Fascia_F2_kWh: 100,
    Fascia_F3_kWh: 60,
  },
  Dettaglio_Costi: {
    Spesa_Materia_Energia: {
      Totale_Euro: 45.5,
      Quota_Fissa_Euro: 6.0,
      Quota_Variabile_Euro_kWh: 0.141,
      Prezzo_Componente_Energia_PUN_o_Fissa: 0.12,
      Spread_Commerciale_Euro_kWh: 0.035,
    },
    Spesa_Trasporto_Gestione_Contatore: {
      Totale_Euro: 12.8,
      Quota_Fissa_Euro_Anno: 15.87,
      Quota_Potenza_Euro_kW_Anno: 14.63,
      Quota_Energia_Euro_kWh: 0.0124,
    },
    Spesa_Oneri_Sistema: {
      Totale_Euro: 4.1,
      ASOS_Quota_Variabile_Euro_kWh: 0.014,
      ARIM_Quota_Variabile_Euro_kWh: 0.0006,
      Quota_Fissa_Euro_Anno: 0,
    },
    Imposte: {
      Totale_Euro: 8.5,
      Accise_Euro: 2.3,
      IVA_Percentuale: 10,
    },
    Canone_RAI: 9.0,
  },
  Autoproduzione: {
    Presenza_Impianto_Fotovoltaico: false,
    Energia_Immessa_in_Rete_kWh: 0,
    Servizi_Scambio_Sul_Posto: false,
  },
};

export const SAMPLE_BILL_2: BollettaElettrica = {
  Cliente: {
    Tipologia_Cliente: 'Domestico_Residente',
    Codice_POD: 'IT001E87654321',
    Fascia_Oraria_Contatore: 'Bioraria',
  },
  Fornitura: {
    Potenza_Contrattuale_kW: 4.5,
    Tensione_Fornitura: 'Bassa',
    Mercato: 'Servizio_a_Tutele_Graduali',
  },
  Consumi_Fatturati: {
    Periodo_Riferimento: {
      start: '2024-10-01',
      end: '2024-11-30',
    },
    Totale_kWh: 420,
    Fascia_F1_kWh: 180,
    Fascia_F2_kWh: 140,
    Fascia_F3_kWh: 100,
  },
  Dettaglio_Costi: {
    Spesa_Materia_Energia: {
      Totale_Euro: 68.2,
      Quota_Fissa_Euro: 8.5,
      Quota_Variabile_Euro_kWh: 0.142,
      Prezzo_Componente_Energia_PUN_o_Fissa: 0.115,
      Spread_Commerciale_Euro_kWh: 0.038,
    },
    Spesa_Trasporto_Gestione_Contatore: {
      Totale_Euro: 18.5,
      Quota_Fissa_Euro_Anno: 15.87,
      Quota_Potenza_Euro_kW_Anno: 14.63,
      Quota_Energia_Euro_kWh: 0.0124,
    },
    Spesa_Oneri_Sistema: {
      Totale_Euro: 6.1,
      ASOS_Quota_Variabile_Euro_kWh: 0.014,
      ARIM_Quota_Variabile_Euro_kWh: 0.0006,
      Quota_Fissa_Euro_Anno: 0,
    },
    Imposte: {
      Totale_Euro: 12.8,
      Accise_Euro: 3.5,
      IVA_Percentuale: 10,
    },
    Canone_RAI: 9.0,
  },
  Autoproduzione: {
    Presenza_Impianto_Fotovoltaico: false,
    Energia_Immessa_in_Rete_kWh: 0,
    Servizi_Scambio_Sul_Posto: false,
  },
};

export const SAMPLE_BILL_WITH_SOLAR: BollettaElettrica = {
  Cliente: {
    Tipologia_Cliente: 'Domestico_Residente',
    Codice_POD: 'IT001E55555555',
    Fascia_Oraria_Contatore: 'Multioraria',
  },
  Fornitura: {
    Potenza_Contrattuale_kW: 6,
    Tensione_Fornitura: 'Bassa',
    Mercato: 'Libero',
  },
  Consumi_Fatturati: {
    Periodo_Riferimento: {
      start: '2024-09-01',
      end: '2024-10-31',
    },
    Totale_kWh: 320,
    Fascia_F1_kWh: 100,
    Fascia_F2_kWh: 120,
    Fascia_F3_kWh: 100,
  },
  Dettaglio_Costi: {
    Spesa_Materia_Energia: {
      Totale_Euro: 38.5,
      Quota_Fissa_Euro: 7.0,
      Quota_Variabile_Euro_kWh: 0.098,
      Prezzo_Componente_Energia_PUN_o_Fissa: 0.105,
      Spread_Commerciale_Euro_kWh: 0.025,
    },
    Spesa_Trasporto_Gestione_Contatore: {
      Totale_Euro: 16.2,
      Quota_Fissa_Euro_Anno: 15.87,
      Quota_Potenza_Euro_kW_Anno: 14.63,
      Quota_Energia_Euro_kWh: 0.0124,
    },
    Spesa_Oneri_Sistema: {
      Totale_Euro: 4.7,
      ASOS_Quota_Variabile_Euro_kWh: 0.014,
      ARIM_Quota_Variabile_Euro_kWh: 0.0006,
      Quota_Fissa_Euro_Anno: 0,
    },
    Imposte: {
      Totale_Euro: 8.2,
      Accise_Euro: 2.1,
      IVA_Percentuale: 10,
    },
    Canone_RAI: 0,
  },
  Autoproduzione: {
    Presenza_Impianto_Fotovoltaico: true,
    Energia_Immessa_in_Rete_kWh: 180,
    Servizi_Scambio_Sul_Posto: true,
  },
};

export const SAMPLE_BILLS = {
  'Consumo Medio (280 kWh)': SAMPLE_BILL_1,
  'Consumo Alto (420 kWh)': SAMPLE_BILL_2,
  'Con Fotovoltaico': SAMPLE_BILL_WITH_SOLAR,
};

/**
 * ARERA Data Service
 * Provides access to ARERA reference data (tariffs, oneri sistema, PUN prices)
 * Currently uses mock data - can be replaced with real API calls
 */

import { DatiARERA, TariffeTrasporto, OneriSistema, PrezzoMateriaPrima } from '@/types/bill';

/**
 * Mock ARERA data based on real 2025 Q1 values
 * Source: ARERA deliberations and GME published data
 */
const MOCK_TARIFFE_TRASPORTO: TariffeTrasporto = {
  quota_fissa_euro_anno: 15.87, // Domestic resident BT < 3kW
  quota_potenza_euro_kw_anno: 14.63,
  quota_energia_euro_kwh: 0.0124, // Average all time slots
  periodo_validita: {
    start: '2025-01-01',
    end: '2025-12-31',
  },
};

const MOCK_ONERI_SISTEMA: OneriSistema = {
  ASOS_euro_kwh: 0.0140, // General system charges
  ARIM_euro_kwh: 0.0006, // Nuclear decommissioning
  quota_fissa_euro_anno: 0, // Only for non-resident customers
  periodo_validita: {
    start: '2025-01-01',
    end: '2025-03-31',
  },
};

/**
 * Mock PUN prices for 2024-2025 (€/MWh)
 * Real PUN fluctuates daily - these are realistic monthly averages
 */
const MOCK_PUN_PRICES: PrezzoMateriaPrima[] = [
  // 2024 historical data
  { PUN_euro_mwh: 110.5, PUN_euro_kwh: 0.1105, data: '2024-01-01' },
  { PUN_euro_mwh: 95.2, PUN_euro_kwh: 0.0952, data: '2024-02-01' },
  { PUN_euro_mwh: 88.7, PUN_euro_kwh: 0.0887, data: '2024-03-01' },
  { PUN_euro_mwh: 92.3, PUN_euro_kwh: 0.0923, data: '2024-04-01' },
  { PUN_euro_mwh: 98.1, PUN_euro_kwh: 0.0981, data: '2024-05-01' },
  { PUN_euro_mwh: 103.4, PUN_euro_kwh: 0.1034, data: '2024-06-01' },
  { PUN_euro_mwh: 112.8, PUN_euro_kwh: 0.1128, data: '2024-07-01' },
  { PUN_euro_mwh: 118.5, PUN_euro_kwh: 0.1185, data: '2024-08-01' },
  { PUN_euro_mwh: 108.2, PUN_euro_kwh: 0.1082, data: '2024-09-01' },
  { PUN_euro_mwh: 102.7, PUN_euro_kwh: 0.1027, data: '2024-10-01' },
  { PUN_euro_mwh: 115.3, PUN_euro_kwh: 0.1153, data: '2024-11-01' },
  { PUN_euro_mwh: 125.6, PUN_euro_kwh: 0.1256, data: '2024-12-01' },
  // 2025 projected data
  { PUN_euro_mwh: 120.4, PUN_euro_kwh: 0.1204, data: '2025-01-01' },
  { PUN_euro_mwh: 110.8, PUN_euro_kwh: 0.1108, data: '2025-02-01' },
  { PUN_euro_mwh: 105.2, PUN_euro_kwh: 0.1052, data: '2025-03-01' },
];

/**
 * Service class for ARERA data access
 */
export class AreraDataService {
  /**
   * Get current network tariffs (TISP)
   * @param date Optional date for historical tariffs
   */
  static async getTariffeTrasporto(date?: string): Promise<TariffeTrasporto> {
    // TODO: Replace with real API call to ARERA/Distributore
    // Example: const response = await fetch('/api/arera/tariffe', { ... });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return MOCK_TARIFFE_TRASPORTO;
  }

  /**
   * Get current system charges (ASOS, ARIM)
   * @param date Optional date for historical charges
   */
  static async getOneriSistema(date?: string): Promise<OneriSistema> {
    // TODO: Replace with real API call to ARERA

    await new Promise(resolve => setTimeout(resolve, 100));

    return MOCK_ONERI_SISTEMA;
  }

  /**
   * Get PUN prices for a specific period
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   */
  static async getPrezziPUN(
    startDate: string,
    endDate?: string
  ): Promise<PrezzoMateriaPrima[]> {
    // TODO: Replace with real GME API call
    // Example using GME API:
    // 1. Authenticate: POST /api/v1/Auth
    // 2. Request data: POST /api/v1/RequestaData

    await new Promise(resolve => setTimeout(resolve, 100));

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    return MOCK_PUN_PRICES.filter(price => {
      const priceDate = new Date(price.data);
      return priceDate >= start && priceDate <= end;
    });
  }

  /**
   * Get average PUN for a specific period
   */
  static async getAveragePUN(
    startDate: string,
    endDate: string
  ): Promise<number> {
    const prices = await this.getPrezziPUN(startDate, endDate);

    if (prices.length === 0) {
      throw new Error('No PUN data available for the specified period');
    }

    const sum = prices.reduce((acc, price) => acc + price.PUN_euro_kwh, 0);
    return sum / prices.length;
  }

  /**
   * Get all ARERA reference data for a specific period
   */
  static async getDatiARERA(
    startDate: string,
    endDate: string
  ): Promise<DatiARERA> {
    const [tariffe, oneri, prezzi] = await Promise.all([
      this.getTariffeTrasporto(),
      this.getOneriSistema(),
      this.getPrezziPUN(startDate, endDate),
    ]);

    return {
      Tariffe_Trasporto: tariffe,
      Oneri_Sistema: oneri,
      Prezzi_Materia_Prima: prezzi,
    };
  }
}

/**
 * Helper function to calculate daily PUN (if needed for detailed analysis)
 * Real GME API would provide hourly PUN data
 */
export function interpolatePUNForDate(
  date: string,
  punPrices: PrezzoMateriaPrima[]
): number {
  const targetDate = new Date(date);

  // Find closest PUN price
  const sorted = [...punPrices].sort((a, b) => {
    const diffA = Math.abs(new Date(a.data).getTime() - targetDate.getTime());
    const diffB = Math.abs(new Date(b.data).getTime() - targetDate.getTime());
    return diffA - diffB;
  });

  return sorted[0]?.PUN_euro_kwh || 0.11; // Fallback to approximate value
}

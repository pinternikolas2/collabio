/**
 * Collabio Fee Calculator
 * Progresivní systém poplatků podle velikosti spolupráce
 */

export type FeeTier = {
  name: string;
  minAmount: number;
  maxAmount: number | null; // null = neomezeno
  feePercentage: number;
  description: string;
};

export const FEE_TIERS: FeeTier[] = [
  {
    name: 'Mikro spolupráce',
    minAmount: 0,
    maxAmount: 20000,
    feePercentage: 20, // 20% do 20 000 Kč
    description: 'do 20 000 Kč',
  },
  {
    name: 'Střední spolupráce',
    minAmount: 20000,
    maxAmount: 100000,
    feePercentage: 15, // 15% od 20 001 do 100 000 Kč
    description: '20 001 - 100 000 Kč',
  },
  {
    name: 'Velké spolupráce',
    minAmount: 100000,
    maxAmount: null,
    feePercentage: 7, // 7% nad 100 000 Kč
    description: 'nad 100 000 Kč',
  },
];

/**
 * Zjistí, do jakého pásma poplatků částka patří
 */
export function getFeeTier(amount: number): FeeTier | null {
  for (const tier of FEE_TIERS) {
    if (amount <= tier.maxAmount! || tier.maxAmount === null) {
      // Logic adjusted: The tiers are ordered.
      // First tier (max 20000): if amount <= 20000, returns tier 1.
      // Second tier (max 100000): if amount > 20000 AND <= 100000, returns tier 2.
      // Third tier: if amount > 100000, returns tier 3.
      // The loop works if we check if amount fits in the tier.
      if (tier.maxAmount !== null && amount <= tier.maxAmount) {
        return tier;
      } else if (tier.maxAmount === null) {
        return tier;
      }
    }
  }
  return null;
}

/**
 * Vypočítá servisní poplatek Collabio podle částky
 * @param amount - Částka v Kč
 * @returns Vypočtený poplatek v Kč
 */
export function calculateServiceFee(amount: number): number {
  const tier = getFeeTier(amount);

  if (!tier) {
    return 0;
  }

  return amount * (tier.feePercentage / 100);
}

/**
 * Vypočítá čistou částku po odečtení poplatku
 * @param amount - Celková částka v Kč
 * @returns Čistá částka po odečtení poplatku
 */
export function calculateNetAmount(amount: number): number {
  return amount - calculateServiceFee(amount);
}

/**
 * Vypočítá celkový poplatek z více transakcí
 * @param amounts - Pole částek v Kč
 * @returns Celkový poplatek v Kč
 */
export function calculateTotalFees(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + calculateServiceFee(amount), 0);
}

/**
 * Získá procento poplatku pro danou částku
 * @param amount - Částka v Kč
 * @returns Procento poplatku
 */
export function getFeePercentage(amount: number): number {
  const tier = getFeeTier(amount);

  if (!tier) {
    return FEE_TIERS[0].feePercentage;
    return 0;
  }

  return tier.feePercentage;
}

/**
 * Vytvoří detailní rozpis poplatků pro zobrazení uživateli
 * @param amount - Částka v Kč
 * @returns Objekt s detailním rozpisem
 */
export function getFeeBreakdown(amount: number) {
  const tier = getFeeTier(amount);
  const serviceFee = calculateServiceFee(amount);
  const netAmount = calculateNetAmount(amount);
  const feePercentage = getFeePercentage(amount);

  return {
    grossAmount: amount,
    serviceFee,
    netAmount,
    feePercentage,
    tierName: tier?.name || 'Pod minimální částku',
    tierDescription: tier?.description || 'Pod 1 000 Kč',
  };
}

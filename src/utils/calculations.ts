export type PurchaseStatus = 'twice' | 'once' | 'none';

export interface EntryData {
  morning: number;
  evening: number;
  status?: PurchaseStatus;
  updatedAt?: any;
}

export interface MonthlySummary {
  monthKey: string;
  totalLitres: number;
  totalCost: number;
  ratePerLitre: number;
  isRateInherited: boolean;
  rateSourceMonth?: string;
  twiceCount: number;
  onceCount: number;
  noneCount: number;
}

/**
 * Derives purchase status based on morning and evening quantities.
 * - both > 0: 'twice'
 * - exactly one > 0: 'once'
 * - otherwise: 'none'
 */
export function deriveStatus(morning: number, evening: number): PurchaseStatus {
  const m = Number(morning) || 0;
  const e = Number(evening) || 0;

  if (m > 0 && e > 0) {
    return 'twice';
  }
  if (m > 0 || e > 0) {
    return 'once';
  }
  return 'none';
}

/**
 * Resolves the rate for a given month.
 * If not set for that month, inherits the most recent earlier month's rate.
 */
export function resolveMonthRate(
  monthKey: string,
  rates: Record<string, number>,
  fallbackRate: number = 0
): { rate: number; isInherited: boolean; sourceMonth?: string } {
  if (rates[monthKey] !== undefined && rates[monthKey] > 0) {
    return {
      rate: rates[monthKey],
      isInherited: false,
    };
  }

  // Find most recent prior month
  const availableMonths = Object.keys(rates)
    .filter((m) => m < monthKey && rates[m] > 0)
    .sort()
    .reverse();

  if (availableMonths.length > 0) {
    const priorMonth = availableMonths[0];
    return {
      rate: rates[priorMonth],
      isInherited: true,
      sourceMonth: priorMonth,
    };
  }

  if (fallbackRate > 0) {
    return {
      rate: fallbackRate,
      isInherited: true,
    };
  }

  return {
    rate: 0,
    isInherited: false,
  };
}

/**
 * Calculates monthly totals: litres, cost, and day breakdown counts.
 * If defaults and todayKey are passed, unrecorded past days up to today
 * count with the user's default quantities.
 */
export function calculateMonthlyTotals(
  entries: Record<string, EntryData>,
  monthKey: string,
  ratePerLitre: number,
  isRateInherited: boolean = false,
  rateSourceMonth?: string,
  defaults?: { morning: number; evening: number },
  todayKey?: string
): MonthlySummary {
  let totalLitres = 0;
  let twiceCount = 0;
  let onceCount = 0;
  let noneCount = 0;

  if (defaults && todayKey) {
    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateKey = `${monthKey}-${dayStr}`;

      if (dateKey > todayKey) {
        continue;
      }

      const entry = entries[dateKey];
      let m = 0;
      let e = 0;

      if (entry) {
        m = Number(entry.morning) || 0;
        e = Number(entry.evening) || 0;
      } else {
        m = defaults.morning;
        e = defaults.evening;
      }

      totalLitres += m + e;
      const status = deriveStatus(m, e);
      if (status === 'twice') {
        twiceCount++;
      } else if (status === 'once') {
        onceCount++;
      } else {
        noneCount++;
      }
    }
  } else {
    for (const [dateKey, entry] of Object.entries(entries)) {
      if (dateKey.startsWith(monthKey)) {
        const m = Number(entry.morning) || 0;
        const e = Number(entry.evening) || 0;
        const dayLitres = m + e;
        totalLitres += dayLitres;

        const status = entry.status || deriveStatus(m, e);
        if (status === 'twice') {
          twiceCount++;
        } else if (status === 'once') {
          onceCount++;
        } else {
          noneCount++;
        }
      }
    }
  }

  // Round litres to 2 decimal places to avoid floating point issues
  totalLitres = Math.round(totalLitres * 100) / 100;
  const totalCost = Math.round(totalLitres * ratePerLitre);

  return {
    monthKey,
    totalLitres,
    totalCost,
    ratePerLitre,
    isRateInherited,
    rateSourceMonth,
    twiceCount,
    onceCount,
    noneCount,
  };
}

/**
 * Formats currency in INR with commas (e.g., ₹2,106).
 */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString('en-IN')}`;
}

/**
 * Formats litres string (e.g. 1.25 L or 12 L).
 */
export function formatLitres(litres: number): string {
  const rounded = Math.round(litres * 100) / 100;
  return `${rounded} L`;
}

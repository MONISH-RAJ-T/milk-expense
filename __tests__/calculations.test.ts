import { deriveStatus, resolveMonthRate, calculateMonthlyTotals } from '../src/utils/calculations';

describe('calculations.ts', () => {
  describe('deriveStatus', () => {
    it('returns "twice" when morning and evening are both > 0', () => {
      expect(deriveStatus(1.0, 0.5)).toBe('twice');
      expect(deriveStatus(0.25, 0.25)).toBe('twice');
    });

    it('returns "once" when only one session is > 0', () => {
      expect(deriveStatus(1.0, 0)).toBe('once');
      expect(deriveStatus(0, 0.75)).toBe('once');
    });

    it('returns "none" when both are 0', () => {
      expect(deriveStatus(0, 0)).toBe('none');
    });
  });

  describe('resolveMonthRate', () => {
    const mockRates = {
      '2026-08': 54,
      '2026-09': 54,
    };

    it('uses exact month rate when present', () => {
      const result = resolveMonthRate('2026-09', mockRates);
      expect(result.rate).toBe(54);
      expect(result.isInherited).toBe(false);
    });

    it('inherits the most recent previous month rate when current month has no rate', () => {
      const result = resolveMonthRate('2026-10', mockRates);
      expect(result.rate).toBe(54);
      expect(result.isInherited).toBe(true);
      expect(result.sourceMonth).toBe('2026-09');
    });

    it('returns rate 0 when no current or previous rate exists', () => {
      const result = resolveMonthRate('2026-01', mockRates);
      expect(result.rate).toBe(0);
      expect(result.isInherited).toBe(false);
    });
  });

  describe('calculateMonthlyTotals', () => {
    const mockEntries = {
      '2026-10-01': { morning: 1.0, evening: 0.5, status: 'twice' as const },
      '2026-10-02': { morning: 1.0, evening: 0, status: 'once' as const },
      '2026-10-03': { morning: 0, evening: 0, status: 'none' as const },
      '2026-10-04': { morning: 1.5, evening: 0.5, status: 'twice' as const },
      '2026-09-30': { morning: 1.0, evening: 1.0, status: 'twice' as const }, // different month
    };

    it('calculates total litres and cost correctly for the given month', () => {
      // 10-01: 1.5, 10-02: 1.0, 10-03: 0, 10-04: 2.0 => total = 4.5 L
      const summary = calculateMonthlyTotals(mockEntries, '2026-10', 60);
      expect(summary.totalLitres).toBe(4.5);
      expect(summary.totalCost).toBe(270);
      expect(summary.twiceCount).toBe(2);
      expect(summary.onceCount).toBe(1);
      expect(summary.noneCount).toBe(1);
    });
  });
});

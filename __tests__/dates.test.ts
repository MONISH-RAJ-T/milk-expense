import {
  formatDateKey,
  formatMonthKey,
  isFutureDate,
  isEditableDate,
  formatDisplayDateFull,
} from '../src/utils/dates';

describe('dates.ts', () => {
  const referenceToday = '2026-10-11';

  describe('formatDateKey and formatMonthKey', () => {
    it('formats Date object into YYYY-MM-DD', () => {
      const d = new Date(2026, 9, 11); // October is month index 9
      expect(formatDateKey(d)).toBe('2026-10-11');
    });

    it('formats Date object into YYYY-MM', () => {
      const d = new Date(2026, 9, 11);
      expect(formatMonthKey(d)).toBe('2026-10');
    });
  });

  describe('isFutureDate', () => {
    it('returns false for today', () => {
      expect(isFutureDate('2026-10-11', referenceToday)).toBe(false);
    });

    it('returns false for past dates', () => {
      expect(isFutureDate('2026-10-10', referenceToday)).toBe(false);
      expect(isFutureDate('2026-09-01', referenceToday)).toBe(false);
    });

    it('returns true for future dates', () => {
      expect(isFutureDate('2026-10-12', referenceToday)).toBe(true);
      expect(isFutureDate('2026-11-01', referenceToday)).toBe(true);
    });
  });

  describe('isEditableDate (business rule: editable up to today, future locked)', () => {
    it('returns true for today', () => {
      expect(isEditableDate('2026-10-11', referenceToday)).toBe(true);
    });

    it('returns true for any past date', () => {
      expect(isEditableDate('2026-10-10', referenceToday)).toBe(true);
      expect(isEditableDate('2026-10-01', referenceToday)).toBe(true);
      expect(isEditableDate('2026-08-15', referenceToday)).toBe(true);
    });

    it('returns false for tomorrow and all future dates', () => {
      expect(isEditableDate('2026-10-12', referenceToday)).toBe(false);
      expect(isEditableDate('2026-12-31', referenceToday)).toBe(false);
    });
  });

  describe('formatDisplayDateFull', () => {
    it('labels today with prefix', () => {
      const today = formatDateKey(new Date());
      expect(formatDisplayDateFull(today)).toContain('Today - ');
    });
  });
});

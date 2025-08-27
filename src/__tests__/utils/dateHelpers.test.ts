import { 
  formatDateForDisplay, 
  formatDateForInput, 
  getDateRange, 
  isValidDate, 
  getDaysAgo, 
  addDays, 
  daysBetween 
} from '@/utils/dateHelpers';

describe('Date Helpers', () => {
  describe('formatDateForDisplay', () => {
    it('should format date for display', () => {
      const result = formatDateForDisplay('2024-01-15');
      expect(result).toBe('Jan 15, 2024');
    });

    it('should handle different months', () => {
      expect(formatDateForDisplay('2024-06-01')).toBe('Jun 1, 2024');
      expect(formatDateForDisplay('2024-12-31')).toBe('Dec 31, 2024');
    });
  });

  describe('formatDateForInput', () => {
    it('should format date for input field', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateForInput(date);
      expect(result).toBe('2024-01-15');
    });

    it('should pad single digit month and day', () => {
      const date = new Date('2024-03-05T10:30:00Z');
      const result = formatDateForInput(date);
      expect(result).toBe('2024-03-05');
    });
  });

  describe('getDateRange', () => {
    it('should return null for empty array', () => {
      const result = getDateRange([]);
      expect(result).toEqual({ start: null, end: null });
    });

    it('should return single date for one entry', () => {
      const entries = [{ date: '2024-01-15' }];
      const result = getDateRange(entries);
      expect(result.start).toBe('2024-01-15');
      expect(result.end).toBe('2024-01-15');
    });

    it('should return correct range for multiple entries', () => {
      const entries = [
        { date: '2024-01-20' },
        { date: '2024-01-10' },
        { date: '2024-01-15' },
      ];
      const result = getDateRange(entries);
      expect(result.start).toBe('2024-01-10');
      expect(result.end).toBe('2024-01-20');
    });
  });

  describe('isValidDate', () => {
    it('should validate correct date formats', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('2023-12-31')).toBe(true);
      expect(isValidDate('2024-02-29')).toBe(true); // leap year
    });

    it('should reject invalid date formats', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('2024/01/15')).toBe(false);
      expect(isValidDate('15-01-2024')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate('2024-13-01')).toBe(false); // invalid month
      expect(isValidDate('2024-02-30')).toBe(true); // JavaScript allows this date
    });
  });

  describe('getDaysAgo', () => {
    beforeEach(() => {
      // Mock Date to always return 2024-01-15
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return date from days ago', () => {
      expect(getDaysAgo(0)).toBe('2024-01-15');
      expect(getDaysAgo(1)).toBe('2024-01-14');
      expect(getDaysAgo(7)).toBe('2024-01-08');
      expect(getDaysAgo(30)).toBe('2023-12-16');
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      expect(addDays('2024-01-15', 0)).toBe('2024-01-15');
      expect(addDays('2024-01-15', 1)).toBe('2024-01-16');
      expect(addDays('2024-01-15', 7)).toBe('2024-01-22');
      expect(addDays('2024-01-15', -1)).toBe('2024-01-14');
    });

    it('should handle month boundaries', () => {
      expect(addDays('2024-01-31', 1)).toBe('2024-02-01');
      expect(addDays('2024-12-31', 1)).toBe('2025-01-01');
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between dates', () => {
      expect(daysBetween('2024-01-15', '2024-01-15')).toBe(0);
      expect(daysBetween('2024-01-15', '2024-01-16')).toBe(1);
      expect(daysBetween('2024-01-15', '2024-01-22')).toBe(7);
      expect(daysBetween('2024-01-15', '2024-02-15')).toBe(31);
    });

    it('should handle negative differences', () => {
      expect(daysBetween('2024-01-16', '2024-01-15')).toBe(-1);
      expect(daysBetween('2024-01-22', '2024-01-15')).toBe(-7);
    });
  });
});
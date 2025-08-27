import { validateEmail, formatDate, calculateBMI, filterEntries, debounce } from '@/utils/helpers';

describe('Helper Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('user123@subdomain.example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should handle different dates', () => {
      const date1 = new Date('2023-12-31T23:59:59Z');
      const date2 = new Date('2024-06-01T00:00:00Z');
      
      expect(formatDate(date1)).toBe('2023-12-31');
      expect(formatDate(date2)).toBe('2024-06-01');
    });
  });

  describe('calculateBMI', () => {
    it('should calculate BMI correctly', () => {
      // BMI = weight(kg) / height(m)^2
      const bmi = calculateBMI(70, 1.75); // 70kg, 1.75m
      expect(bmi).toBeCloseTo(22.9, 1);
    });

    it('should round to one decimal place', () => {
      const bmi = calculateBMI(80, 1.80);
      expect(bmi.toString()).toMatch(/^\d+\.\d$/);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculateBMI(0, 1.75)).toThrow('Weight and height must be positive numbers');
      expect(() => calculateBMI(70, 0)).toThrow('Weight and height must be positive numbers');
      expect(() => calculateBMI(-70, 1.75)).toThrow('Weight and height must be positive numbers');
      expect(() => calculateBMI(70, -1.75)).toThrow('Weight and height must be positive numbers');
    });
  });

  describe('filterEntries', () => {
    const mockEntries = [
      { id: '1', date: '2024-01-01', value: 100 },
      { id: '2', date: '2024-01-05', value: 99 },
      { id: '3', date: '2024-01-10', value: 98 },
      { id: '4', date: '2024-01-15', value: 97 },
      { id: '5', date: '2024-01-20', value: 96 },
    ];

    it('should return all entries when no dates provided', () => {
      const result = filterEntries(mockEntries);
      expect(result).toEqual(mockEntries);
    });

    it('should filter by start date', () => {
      const result = filterEntries(mockEntries, '2024-01-10');
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2024-01-10');
    });

    it('should filter by end date', () => {
      const result = filterEntries(mockEntries, undefined, '2024-01-10');
      expect(result).toHaveLength(3);
      expect(result[result.length - 1].date).toBe('2024-01-10');
    });

    it('should filter by date range', () => {
      const result = filterEntries(mockEntries, '2024-01-05', '2024-01-15');
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2024-01-05');
      expect(result[result.length - 1].date).toBe('2024-01-15');
    });

    it('should handle empty array', () => {
      const result = filterEntries([], '2024-01-01', '2024-01-31');
      expect(result).toEqual([]);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('should work with multiple arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 50);

      debouncedFn('arg1', 'arg2', 123);
      jest.advanceTimersByTime(50);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });
  });
});
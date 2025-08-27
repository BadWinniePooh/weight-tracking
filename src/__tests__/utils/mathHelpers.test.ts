import { 
  roundToDecimalPlaces, 
  calculateAverage, 
  calculateMedian, 
  calculatePercentageChange,
  clamp,
  lerp,
  calculateTrend,
  calculateRunningAverage,
  findOutliers
} from '@/utils/mathHelpers';

describe('Math Helpers', () => {
  describe('roundToDecimalPlaces', () => {
    it('should round to specified decimal places', () => {
      expect(roundToDecimalPlaces(3.14159, 2)).toBe(3.14);
      expect(roundToDecimalPlaces(3.14159, 3)).toBe(3.142);
      expect(roundToDecimalPlaces(3.14159, 0)).toBe(3);
    });

    it('should handle negative numbers', () => {
      expect(roundToDecimalPlaces(-3.14159, 2)).toBe(-3.14);
    });

    it('should handle whole numbers', () => {
      expect(roundToDecimalPlaces(5, 2)).toBe(5);
    });
  });

  describe('calculateAverage', () => {
    it('should calculate average correctly', () => {
      expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
      expect(calculateAverage([10, 20, 30])).toBe(20);
      expect(calculateAverage([2.5, 3.5])).toBe(3);
    });

    it('should return 0 for empty array', () => {
      expect(calculateAverage([])).toBe(0);
    });

    it('should handle single value', () => {
      expect(calculateAverage([42])).toBe(42);
    });
  });

  describe('calculateMedian', () => {
    it('should calculate median for odd number of values', () => {
      expect(calculateMedian([1, 2, 3, 4, 5])).toBe(3);
      expect(calculateMedian([5, 1, 3])).toBe(3);
    });

    it('should calculate median for even number of values', () => {
      expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
      expect(calculateMedian([10, 20])).toBe(15);
    });

    it('should return 0 for empty array', () => {
      expect(calculateMedian([])).toBe(0);
    });

    it('should handle single value', () => {
      expect(calculateMedian([42])).toBe(42);
    });
  });

  describe('calculatePercentageChange', () => {
    it('should calculate percentage increase', () => {
      expect(calculatePercentageChange(100, 110)).toBe(10);
      expect(calculatePercentageChange(50, 75)).toBe(50);
    });

    it('should calculate percentage decrease', () => {
      expect(calculatePercentageChange(100, 90)).toBe(-10);
      expect(calculatePercentageChange(200, 100)).toBe(-50);
    });

    it('should handle zero old value', () => {
      expect(calculatePercentageChange(0, 100)).toBe(0);
    });

    it('should handle no change', () => {
      expect(calculatePercentageChange(100, 100)).toBe(0);
    });
  });

  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(10, 20, 0.3)).toBe(13);
      expect(lerp(0, 100, 0)).toBe(0);
      expect(lerp(0, 100, 1)).toBe(100);
    });

    it('should handle negative values', () => {
      expect(lerp(-10, 10, 0.5)).toBe(0);
    });
  });

  describe('calculateTrend', () => {
    it('should detect increasing trend', () => {
      expect(calculateTrend([100, 105, 110])).toBe('increasing');
      expect(calculateTrend([10, 20])).toBe('increasing');
    });

    it('should detect decreasing trend', () => {
      expect(calculateTrend([110, 105, 100])).toBe('decreasing');
      expect(calculateTrend([20, 10])).toBe('decreasing');
    });

    it('should detect stable trend', () => {
      expect(calculateTrend([100, 100.5, 100.2])).toBe('stable');
      expect(calculateTrend([100, 100])).toBe('stable');
    });

    it('should handle edge cases', () => {
      expect(calculateTrend([])).toBe('stable');
      expect(calculateTrend([100])).toBe('stable');
    });
  });

  describe('calculateRunningAverage', () => {
    it('should calculate running average with window size', () => {
      const values = [1, 2, 3, 4, 5];
      const result = calculateRunningAverage(values, 3);
      
      expect(result[0]).toBe(1); // [1]
      expect(result[1]).toBe(1.5); // [1, 2]
      expect(result[2]).toBe(2); // [1, 2, 3]
      expect(result[3]).toBe(3); // [2, 3, 4]
      expect(result[4]).toBe(4); // [3, 4, 5]
    });

    it('should handle window size larger than array', () => {
      const values = [1, 2];
      const result = calculateRunningAverage(values, 5);
      
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(1.5);
    });

    it('should handle empty array', () => {
      expect(calculateRunningAverage([], 3)).toEqual([]);
    });
  });

  describe('findOutliers', () => {
    it('should find outliers in dataset', () => {
      // Normal distribution around 100, with one outlier
      const values = [98, 99, 100, 101, 102, 150]; // 150 is outlier
      const outliers = findOutliers(values, 2);
      
      expect(outliers).toContain(150);
      expect(outliers.length).toBeGreaterThan(0);
    });

    it('should return empty array for uniform data', () => {
      const values = [100, 100, 100, 100, 100];
      const outliers = findOutliers(values);
      
      expect(outliers).toEqual([]);
    });

    it('should handle small datasets', () => {
      expect(findOutliers([1, 2])).toEqual([]);
      expect(findOutliers([])).toEqual([]);
    });
  });
});
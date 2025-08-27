import { calculateFloorLine, calculateCeilingLine, calculateIdealLine } from '@/utils/chartCalculations';

describe('Chart Calculations', () => {
  const mockDailyAverages = [
    { date: '2024-01-01', value: 100 },
    { date: '2024-01-02', value: 100.5 },
    { date: '2024-01-03', value: 99.5 },
    { date: '2024-01-04', value: 100 },
    { date: '2024-01-05', value: 99.8 },
    { date: '2024-01-06', value: 100.2 },
    { date: '2024-01-07', value: 99.5 },
    { date: '2024-01-08', value: 99 },
    { date: '2024-01-09', value: 98.5 },
    { date: '2024-01-10', value: 98 },
  ];

  const mockSettings = {
    weightGoal: 85,
    lossRate: 0.0055,
    bufferValue: 0.0075,
    carbFatRatio: 0.6,
  };

  describe('calculateFloorLine', () => {
    it('should return empty array for less than 7 days of data', () => {
      const shortData = mockDailyAverages.slice(0, 6);
      const result = calculateFloorLine(shortData, mockSettings);
      expect(result).toEqual([]);
    });

    it('should calculate floor line correctly for valid data', () => {
      const result = calculateFloorLine(mockDailyAverages, mockSettings);
      
      // First 6 values should be null
      expect(result.slice(0, 6)).toEqual(Array(6).fill(null));
      
      // 7th value should be calculated
      const startValue = (100 + 100.5 + 99.5 + 100 + 99.8 + 100.2) / 6; // 100
      const day7FloorValue = startValue - startValue * mockSettings.bufferValue * 0.5;
      expect(result[6]).toBeCloseTo(day7FloorValue, 5);
      
      // Should have correct length
      expect(result).toHaveLength(mockDailyAverages.length);
    });

    it('should calculate subsequent floor values correctly', () => {
      const result = calculateFloorLine(mockDailyAverages, mockSettings);
      
      // Verify that each subsequent value follows the formula
      const nonNullValues = result.slice(6).filter(val => val !== null) as number[];
      
      for (let i = 1; i < nonNullValues.length; i++) {
        const previousFloor = nonNullValues[i - 1];
        const expectedFloor = previousFloor - (previousFloor - mockSettings.weightGoal) * mockSettings.lossRate;
        expect(nonNullValues[i]).toBeCloseTo(expectedFloor, 5);
      }
    });
  });

  describe('calculateCeilingLine', () => {
    it('should return empty array for less than 7 days of data', () => {
      const shortData = mockDailyAverages.slice(0, 6);
      const result = calculateCeilingLine(shortData, mockSettings);
      expect(result).toEqual([]);
    });

    it('should calculate ceiling line correctly for valid data', () => {
      const result = calculateCeilingLine(mockDailyAverages, mockSettings);
      
      // First 6 values should be null
      expect(result.slice(0, 6)).toEqual(Array(6).fill(null));
      
      // 7th value should be calculated
      const startValue = (100 + 100.5 + 99.5 + 100 + 99.8 + 100.2) / 6; // 100
      const day7CeilingValue = startValue + startValue * mockSettings.bufferValue * 0.5;
      expect(result[6]).toBeCloseTo(day7CeilingValue, 5);
      
      // Should have correct length
      expect(result).toHaveLength(mockDailyAverages.length);
    });

    it('should calculate subsequent ceiling values correctly', () => {
      const result = calculateCeilingLine(mockDailyAverages, mockSettings);
      const nonNullValues = result.slice(6).filter(val => val !== null) as number[];
      
      for (let i = 1; i < nonNullValues.length; i++) {
        const previousCeiling = nonNullValues[i - 1];
        const adjustedGoal = mockSettings.weightGoal + mockSettings.weightGoal * mockSettings.bufferValue;
        const expectedCeiling = previousCeiling - (previousCeiling - adjustedGoal) * mockSettings.lossRate * mockSettings.carbFatRatio;
        expect(nonNullValues[i]).toBeCloseTo(expectedCeiling, 5);
      }
    });
  });

  describe('calculateIdealLine', () => {
    it('should return empty array when floor and ceiling data have different lengths', () => {
      const floorData = [1, 2, 3];
      const ceilingData = [1, 2];
      const result = calculateIdealLine(floorData, ceilingData);
      expect(result).toEqual([]);
    });

    it('should calculate ideal line as average of floor and ceiling', () => {
      const floorData = [null, null, null, null, null, null, 95, 94, 93];
      const ceilingData = [null, null, null, null, null, null, 105, 104, 103];
      const result = calculateIdealLine(floorData, ceilingData);
      
      // First 6 values should be null
      expect(result.slice(0, 6)).toEqual(Array(6).fill(null));
      
      // Remaining values should be averages
      expect(result[6]).toBe(100); // (95 + 105) / 2
      expect(result[7]).toBe(99);  // (94 + 104) / 2
      expect(result[8]).toBe(98);  // (93 + 103) / 2
    });

    it('should handle null values correctly', () => {
      const floorData = [null, 95, null, 93];
      const ceilingData = [105, null, 103, 97];
      const result = calculateIdealLine(floorData, ceilingData);
      
      expect(result[0]).toBeNull(); // null floor
      expect(result[1]).toBeNull(); // null ceiling
      expect(result[2]).toBeNull(); // null floor
      expect(result[3]).toBe(95);   // (93 + 97) / 2
    });
  });
});
// Math utilities for weight tracking calculations
export function roundToDecimalPlaces(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
}

export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const first = values[0];
  const last = values[values.length - 1];
  const threshold = 0.01; // 1% threshold
  
  const percentChange = Math.abs((last - first) / first);
  
  if (percentChange < threshold) return 'stable';
  return last > first ? 'increasing' : 'decreasing';
}

export function calculateRunningAverage(values: number[], windowSize: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    result.push(calculateAverage(window));
  }
  
  return result;
}

export function findOutliers(values: number[], threshold: number = 2): number[] {
  if (values.length < 3) return [];
  
  const mean = calculateAverage(values);
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return values.filter(value => Math.abs(value - mean) > threshold * stdDev);
}
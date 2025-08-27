// Simple utility functions for testing purposes
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function calculateBMI(weight: number, height: number): number {
  if (height <= 0 || weight <= 0) {
    throw new Error('Weight and height must be positive numbers');
  }
  return Number((weight / (height * height)).toFixed(1));
}

export function filterEntries<T extends { date: string }>(
  entries: T[],
  startDate?: string,
  endDate?: string
): T[] {
  return entries.filter((entry) => {
    const entryDate = new Date(entry.date);

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (entryDate < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (entryDate > end) return false;
    }

    return true;
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
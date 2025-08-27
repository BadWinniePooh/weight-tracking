// Date utilities for weight tracking application
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateRange(entries: Array<{ date: string }>): { 
  start: string | null; 
  end: string | null; 
} {
  if (entries.length === 0) {
    return { start: null, end: null };
  }

  const dates = entries.map(entry => new Date(entry.date));
  const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
  
  return {
    start: formatDateForInput(sortedDates[0]),
    end: formatDateForInput(sortedDates[sortedDates.length - 1]),
  };
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.includes('-');
}

export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateForInput(date);
}

export function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return formatDateForInput(date);
}

export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}
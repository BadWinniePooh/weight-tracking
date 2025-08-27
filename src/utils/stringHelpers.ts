// String utilities for weight tracking application
export function formatWeight(weight: number, unit: string = 'kg'): string {
  return `${weight.toFixed(1)} ${unit}`;
}

export function parseWeightInput(input: string): number | null {
  const cleaned = input.trim().replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}

export function removeExtraSpaces(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

export function extractNumbers(str: string): number[] {
  const matches = str.match(/\d+\.?\d*/g);
  return matches ? matches.map(match => parseFloat(match)) : [];
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;
  
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }
  
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
  return `${maskedUsername}@${domain}`;
}
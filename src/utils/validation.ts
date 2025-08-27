// Validation utilities for weight tracking forms
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateWeight(weight: string | number): ValidationResult {
  const errors: string[] = [];
  
  if (weight === '' || weight === null || weight === undefined) {
    errors.push('Weight is required');
    return { isValid: false, errors };
  }

  const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
  
  if (isNaN(numWeight)) {
    errors.push('Weight must be a valid number');
  } else {
    if (numWeight <= 0) {
      errors.push('Weight must be greater than 0');
    }
    if (numWeight > 1000) {
      errors.push('Weight must be less than 1000');
    }
    if (numWeight.toString().includes('.') && numWeight.toString().split('.')[1].length > 2) {
      errors.push('Weight can have at most 2 decimal places');
    }
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password || password.trim() === '') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];
  
  if (!username || username.trim() === '') {
    errors.push('Username is required');
    return { isValid: false, errors };
  }

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateSettings(settings: {
  weightGoal?: number;
  lossRate?: number;
  bufferValue?: number;
  carbFatRatio?: number;
}): ValidationResult {
  const errors: string[] = [];

  if (settings.weightGoal !== undefined) {
    if (settings.weightGoal <= 0) {
      errors.push('Weight goal must be greater than 0');
    }
    if (settings.weightGoal > 1000) {
      errors.push('Weight goal must be less than 1000');
    }
  }

  if (settings.lossRate !== undefined) {
    if (settings.lossRate <= 0 || settings.lossRate >= 1) {
      errors.push('Loss rate must be between 0 and 1');
    }
  }

  if (settings.bufferValue !== undefined) {
    if (settings.bufferValue <= 0 || settings.bufferValue >= 1) {
      errors.push('Buffer value must be between 0 and 1');
    }
  }

  if (settings.carbFatRatio !== undefined) {
    if (settings.carbFatRatio <= 0 || settings.carbFatRatio >= 1) {
      errors.push('Carb fat ratio must be between 0 and 1');
    }
  }

  return { isValid: errors.length === 0, errors };
}

export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
}
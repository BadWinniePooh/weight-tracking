import { 
  validateWeight, 
  validatePassword, 
  validateUsername, 
  validateSettings, 
  formatValidationErrors,
  ValidationResult 
} from '@/utils/validation';

describe('Validation Utilities', () => {
  describe('validateWeight', () => {
    it('should validate correct weights', () => {
      expect(validateWeight(70)).toEqual({ isValid: true, errors: [] });
      expect(validateWeight(70.5)).toEqual({ isValid: true, errors: [] });
      expect(validateWeight('85.25')).toEqual({ isValid: true, errors: [] });
      expect(validateWeight('100')).toEqual({ isValid: true, errors: [] });
    });

    it('should reject empty or invalid weights', () => {
      expect(validateWeight('').isValid).toBe(false);
      expect(validateWeight('abc').isValid).toBe(false);
      expect(validateWeight(null as any).isValid).toBe(false);
      expect(validateWeight(undefined as any).isValid).toBe(false);
    });

    it('should reject out of range weights', () => {
      const negativeResult = validateWeight(-5);
      expect(negativeResult.isValid).toBe(false);
      expect(negativeResult.errors).toContain('Weight must be greater than 0');

      const zeroResult = validateWeight(0);
      expect(zeroResult.isValid).toBe(false);
      expect(zeroResult.errors).toContain('Weight must be greater than 0');

      const tooHighResult = validateWeight(1001);
      expect(tooHighResult.isValid).toBe(false);
      expect(tooHighResult.errors).toContain('Weight must be less than 1000');
    });

    it('should reject weights with too many decimal places', () => {
      const result = validateWeight('70.123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Weight can have at most 2 decimal places');
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('MyStrongP@ss1');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty passwords', () => {
      expect(validatePassword('').isValid).toBe(false);
      expect(validatePassword('   ').isValid).toBe(false);
    });

    it('should enforce minimum length', () => {
      const result = validatePassword('short');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should enforce maximum length', () => {
      const longPassword = 'a'.repeat(129);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be less than 128 characters');
    });

    it('should require uppercase letter', () => {
      const result = validatePassword('lowercase123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should require lowercase letter', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should require number', () => {
      const result = validatePassword('NoNumbers');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });
  });

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      expect(validateUsername('validuser123').isValid).toBe(true);
      expect(validateUsername('user_name').isValid).toBe(true);
      expect(validateUsername('USER123').isValid).toBe(true);
    });

    it('should reject empty usernames', () => {
      expect(validateUsername('').isValid).toBe(false);
      expect(validateUsername('   ').isValid).toBe(false);
    });

    it('should enforce minimum length', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters long');
    });

    it('should enforce maximum length', () => {
      const longUsername = 'a'.repeat(31);
      const result = validateUsername(longUsername);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be less than 30 characters');
    });

    it('should reject invalid characters', () => {
      expect(validateUsername('user@name').isValid).toBe(false);
      expect(validateUsername('user name').isValid).toBe(false);
      expect(validateUsername('user-name').isValid).toBe(false);
      expect(validateUsername('user.name').isValid).toBe(false);
    });
  });

  describe('validateSettings', () => {
    it('should validate correct settings', () => {
      const settings = {
        weightGoal: 80,
        lossRate: 0.005,
        bufferValue: 0.01,
        carbFatRatio: 0.6,
      };
      const result = validateSettings(settings);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate partial settings', () => {
      const settings = { weightGoal: 75 };
      const result = validateSettings(settings);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid weight goal', () => {
      expect(validateSettings({ weightGoal: 0 }).isValid).toBe(false);
      expect(validateSettings({ weightGoal: -10 }).isValid).toBe(false);
      expect(validateSettings({ weightGoal: 1001 }).isValid).toBe(false);
    });

    it('should reject invalid loss rate', () => {
      expect(validateSettings({ lossRate: 0 }).isValid).toBe(false);
      expect(validateSettings({ lossRate: 1 }).isValid).toBe(false);
      expect(validateSettings({ lossRate: -0.1 }).isValid).toBe(false);
      expect(validateSettings({ lossRate: 1.1 }).isValid).toBe(false);
    });

    it('should reject invalid buffer value', () => {
      expect(validateSettings({ bufferValue: 0 }).isValid).toBe(false);
      expect(validateSettings({ bufferValue: 1 }).isValid).toBe(false);
    });

    it('should reject invalid carb fat ratio', () => {
      expect(validateSettings({ carbFatRatio: 0 }).isValid).toBe(false);
      expect(validateSettings({ carbFatRatio: 1 }).isValid).toBe(false);
    });
  });

  describe('formatValidationErrors', () => {
    it('should return empty string for no errors', () => {
      expect(formatValidationErrors([])).toBe('');
    });

    it('should return single error as-is', () => {
      expect(formatValidationErrors(['Single error'])).toBe('Single error');
    });

    it('should format multiple errors as numbered list', () => {
      const errors = ['First error', 'Second error', 'Third error'];
      const result = formatValidationErrors(errors);
      expect(result).toBe('1. First error\n2. Second error\n3. Third error');
    });
  });
});
import { 
  formatWeight, 
  parseWeightInput, 
  capitalizeFirstLetter, 
  generateId, 
  truncateText, 
  pluralize, 
  removeExtraSpaces, 
  extractNumbers, 
  formatFileSize, 
  isValidJSON, 
  createSlug, 
  maskEmail 
} from '@/utils/stringHelpers';

describe('String Helpers', () => {
  describe('formatWeight', () => {
    it('should format weight with default unit', () => {
      expect(formatWeight(70.5)).toBe('70.5 kg');
      expect(formatWeight(100)).toBe('100.0 kg');
    });

    it('should format weight with custom unit', () => {
      expect(formatWeight(150.2, 'lbs')).toBe('150.2 lbs');
      expect(formatWeight(80, 'pounds')).toBe('80.0 pounds');
    });
  });

  describe('parseWeightInput', () => {
    it('should parse valid weight inputs', () => {
      expect(parseWeightInput('70.5')).toBe(70.5);
      expect(parseWeightInput('100')).toBe(100);
      expect(parseWeightInput('85.25')).toBe(85.25);
    });

    it('should handle inputs with units', () => {
      expect(parseWeightInput('70.5 kg')).toBe(70.5);
      expect(parseWeightInput('150 lbs')).toBe(150);
      expect(parseWeightInput('kg 80')).toBe(80);
    });

    it('should return null for invalid inputs', () => {
      expect(parseWeightInput('abc')).toBeNull();
      expect(parseWeightInput('')).toBeNull();
      expect(parseWeightInput('invalid')).toBeNull();
    });

    it('should handle extra spaces', () => {
      expect(parseWeightInput('  70.5  ')).toBe(70.5);
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('WORLD')).toBe('World');
      expect(capitalizeFirstLetter('tEST')).toBe('Test');
    });

    it('should handle edge cases', () => {
      expect(capitalizeFirstLetter('')).toBe('');
      expect(capitalizeFirstLetter('a')).toBe('A');
      expect(capitalizeFirstLetter('A')).toBe('A');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is...');
      expect(truncateText('Hello world', 8)).toBe('Hello...');
    });

    it('should not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short');
      expect(truncateText('Exactly10c', 10)).toBe('Exactly10c');
    });
  });

  describe('pluralize', () => {
    it('should handle singular', () => {
      expect(pluralize(1, 'item')).toBe('1 item');
      expect(pluralize(1, 'entry')).toBe('1 entry');
    });

    it('should handle plural with default', () => {
      expect(pluralize(0, 'item')).toBe('0 items');
      expect(pluralize(2, 'item')).toBe('2 items');
      expect(pluralize(5, 'entry')).toBe('5 entrys');
    });

    it('should handle custom plural', () => {
      expect(pluralize(0, 'entry', 'entries')).toBe('0 entries');
      expect(pluralize(2, 'child', 'children')).toBe('2 children');
    });
  });

  describe('removeExtraSpaces', () => {
    it('should remove extra spaces', () => {
      expect(removeExtraSpaces('  hello   world  ')).toBe('hello world');
      expect(removeExtraSpaces('test    string')).toBe('test string');
    });

    it('should handle normal text', () => {
      expect(removeExtraSpaces('normal text')).toBe('normal text');
      expect(removeExtraSpaces('single')).toBe('single');
    });
  });

  describe('extractNumbers', () => {
    it('should extract numbers from text', () => {
      expect(extractNumbers('I have 5 apples and 3.5 oranges')).toEqual([5, 3.5]);
      expect(extractNumbers('Weight: 70.5kg, Height: 180cm')).toEqual([70.5, 180]);
    });

    it('should handle text without numbers', () => {
      expect(extractNumbers('No numbers here')).toEqual([]);
      expect(extractNumbers('')).toEqual([]);
    });

    it('should handle only numbers', () => {
      expect(extractNumbers('123 456.78')).toEqual([123, 456.78]);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
    });
  });

  describe('isValidJSON', () => {
    it('should validate correct JSON', () => {
      expect(isValidJSON('{"key": "value"}')).toBe(true);
      expect(isValidJSON('[1, 2, 3]')).toBe(true);
      expect(isValidJSON('"string"')).toBe(true);
      expect(isValidJSON('123')).toBe(true);
    });

    it('should reject invalid JSON', () => {
      expect(isValidJSON('invalid json')).toBe(false);
      expect(isValidJSON('{key: value}')).toBe(false);
      expect(isValidJSON('')).toBe(false);
    });
  });

  describe('createSlug', () => {
    it('should create URL-friendly slugs', () => {
      expect(createSlug('Hello World')).toBe('hello-world');
      expect(createSlug('My First Post!')).toBe('my-first-post');
      expect(createSlug('Weight Tracking & Management')).toBe('weight-tracking-management');
    });

    it('should handle special characters', () => {
      expect(createSlug('Test@#$%')).toBe('test');
      expect(createSlug('Multiple   Spaces')).toBe('multiple-spaces');
    });
  });

  describe('maskEmail', () => {
    it('should mask email addresses', () => {
      expect(maskEmail('test@example.com')).toBe('t**t@example.com');
      expect(maskEmail('user123@domain.org')).toBe('u*****3@domain.org');
    });

    it('should handle short usernames', () => {
      expect(maskEmail('ab@test.com')).toBe('a***@test.com');
      expect(maskEmail('a@test.com')).toBe('a***@test.com');
    });

    it('should handle invalid emails', () => {
      expect(maskEmail('invalid-email')).toBe('invalid-email');
      expect(maskEmail('')).toBe('');
    });
  });
});
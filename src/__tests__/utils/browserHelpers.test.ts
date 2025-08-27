/**
 * @jest-environment jsdom
 */
import { 
  setItem, 
  getItem, 
  removeItem, 
  clearStorage, 
  getStorageSize, 
  isStorageAvailable,
  getQueryParams,
  buildUrl,
  isValidUrl,
  isMobile,
  isTablet,
  isDesktop,
  getDeviceType,
  hexToRgb,
  rgbToHex,
  isDarkColor
} from '@/utils/browserHelpers';

// Mock window object for some tests
const mockWindow = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe('Browser Helpers', () => {
  describe('Storage utilities', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should set and get items from localStorage', () => {
      const testData = { name: 'test', value: 123 };
      
      expect(setItem('testKey', testData)).toBe(true);
      expect(getItem('testKey', null)).toEqual(testData);
    });

    it('should return default value when item does not exist', () => {
      expect(getItem('nonexistent', 'default')).toBe('default');
    });

    it('should remove items from localStorage', () => {
      setItem('testKey', 'testValue');
      expect(removeItem('testKey')).toBe(true);
      expect(getItem('testKey', null)).toBeNull();
    });

    it('should clear all storage', () => {
      setItem('key1', 'value1');
      setItem('key2', 'value2');
      
      expect(clearStorage()).toBe(true);
      expect(getItem('key1', null)).toBeNull();
      expect(getItem('key2', null)).toBeNull();
    });

    it('should calculate storage size', () => {
      setItem('test', 'data');
      const size = getStorageSize();
      expect(size).toBeGreaterThan(0);
    });

    it('should check if storage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });
  });

  describe('URL utilities', () => {
    beforeEach(() => {
      // Reset window.location for each test
      delete (window as any).location;
      (window as any).location = new URL('http://localhost:3000/?test=value&page=1');
    });

    it('should get query parameters', () => {
      const params = getQueryParams();
      expect(params).toEqual({ test: 'value', page: '1' });
    });

    it('should build URL with parameters', () => {
      const url = buildUrl('/api/test', { id: '123', type: 'user' });
      expect(url).toContain('id=123');
      expect(url).toContain('type=user');
    });

    it('should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('Device detection utilities', () => {
    it('should detect mobile devices', () => {
      mockWindow(600);
      expect(isMobile()).toBe(true);
      expect(isTablet()).toBe(false);
      expect(isDesktop()).toBe(false);
      expect(getDeviceType()).toBe('mobile');
    });

    it('should detect tablet devices', () => {
      mockWindow(800);
      expect(isMobile()).toBe(false);
      expect(isTablet()).toBe(true);
      expect(isDesktop()).toBe(false);
      expect(getDeviceType()).toBe('tablet');
    });

    it('should detect desktop devices', () => {
      mockWindow(1200);
      expect(isMobile()).toBe(false);
      expect(isTablet()).toBe(false);
      expect(isDesktop()).toBe(true);
      expect(getDeviceType()).toBe('desktop');
    });
  });

  describe('Color utilities', () => {
    it('should convert hex to RGB', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 }); // without #
    });

    it('should handle invalid hex colors', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('')).toBeNull();
      expect(hexToRgb('#gggggg')).toBeNull();
    });

    it('should convert RGB to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });

    it('should detect dark colors', () => {
      expect(isDarkColor('#000000')).toBe(true); // black
      expect(isDarkColor('#333333')).toBe(true); // dark gray
      expect(isDarkColor('#ffffff')).toBe(false); // white
      expect(isDarkColor('#ffff00')).toBe(false); // yellow (bright)
      expect(isDarkColor('#800080')).toBe(true); // purple (dark)
    });

    it('should handle invalid colors in isDarkColor', () => {
      expect(isDarkColor('invalid')).toBe(false);
    });
  });
});
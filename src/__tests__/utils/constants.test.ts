import { 
  APP_CONFIG,
  getEnvironment,
  isDevelopment,
  isProduction,
  isTest,
  getApiConfig,
  getWeightConfig,
  getChartConfig,
  getValidationConfig,
  getUIConfig,
  FEATURE_FLAGS,
  isFeatureEnabled,
  APP_METADATA,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  API_ENDPOINTS,
  getApiUrl
} from '@/utils/constants';

describe('Constants and Configuration', () => {
  describe('APP_CONFIG', () => {
    it('should have correct app configuration', () => {
      expect(APP_CONFIG.name).toBe('ScaleTrack');
      expect(APP_CONFIG.version).toBe('1.0.0');
      expect(typeof APP_CONFIG.description).toBe('string');
      expect(typeof APP_CONFIG.author).toBe('string');
    });

    it('should have API configuration', () => {
      expect(APP_CONFIG.api).toHaveProperty('baseUrl');
      expect(APP_CONFIG.api).toHaveProperty('timeout');
      expect(APP_CONFIG.api).toHaveProperty('retryAttempts');
      expect(typeof APP_CONFIG.api.timeout).toBe('number');
      expect(typeof APP_CONFIG.api.retryAttempts).toBe('number');
    });

    it('should have weight configuration', () => {
      expect(APP_CONFIG.weight).toHaveProperty('minValue');
      expect(APP_CONFIG.weight).toHaveProperty('maxValue');
      expect(APP_CONFIG.weight).toHaveProperty('defaultUnit');
      expect(APP_CONFIG.weight).toHaveProperty('decimalPlaces');
      expect(APP_CONFIG.weight.minValue).toBeGreaterThan(0);
      expect(APP_CONFIG.weight.maxValue).toBeGreaterThan(APP_CONFIG.weight.minValue);
    });

    it('should have chart configuration', () => {
      expect(APP_CONFIG.chart).toHaveProperty('defaultRange');
      expect(APP_CONFIG.chart).toHaveProperty('maxDataPoints');
      expect(APP_CONFIG.chart).toHaveProperty('colors');
      expect(typeof APP_CONFIG.chart.defaultRange).toBe('number');
      expect(typeof APP_CONFIG.chart.maxDataPoints).toBe('number');
      expect(APP_CONFIG.chart.colors).toHaveProperty('primary');
    });

    it('should have validation configuration', () => {
      expect(APP_CONFIG.validation).toHaveProperty('password');
      expect(APP_CONFIG.validation).toHaveProperty('username');
      expect(APP_CONFIG.validation).toHaveProperty('email');
      expect(APP_CONFIG.validation.password.minLength).toBeGreaterThan(0);
      expect(APP_CONFIG.validation.username.minLength).toBeGreaterThan(0);
    });

    it('should have UI configuration', () => {
      expect(APP_CONFIG.ui).toHaveProperty('breakpoints');
      expect(APP_CONFIG.ui).toHaveProperty('animations');
      expect(APP_CONFIG.ui.breakpoints.mobile).toBeLessThan(APP_CONFIG.ui.breakpoints.tablet);
      expect(APP_CONFIG.ui.breakpoints.tablet).toBeLessThan(APP_CONFIG.ui.breakpoints.desktop);
    });
  });

  describe('Environment utilities', () => {
    it('should return environment', () => {
      const env = getEnvironment();
      expect(['development', 'production', 'test']).toContain(env);
    });

    it('should check development environment', () => {
      expect(typeof isDevelopment()).toBe('boolean');
    });

    it('should check production environment', () => {
      expect(typeof isProduction()).toBe('boolean');
    });

    it('should check test environment', () => {
      expect(typeof isTest()).toBe('boolean');
    });

    it('should have mutually exclusive environment checks', () => {
      const checks = [isDevelopment(), isProduction(), isTest()];
      const trueCount = checks.filter(Boolean).length;
      expect(trueCount).toBe(1); // Only one should be true
    });
  });

  describe('Configuration getters', () => {
    it('should return API config', () => {
      const config = getApiConfig();
      expect(config).toEqual(APP_CONFIG.api);
    });

    it('should return weight config', () => {
      const config = getWeightConfig();
      expect(config).toEqual(APP_CONFIG.weight);
    });

    it('should return chart config', () => {
      const config = getChartConfig();
      expect(config).toEqual(APP_CONFIG.chart);
    });

    it('should return validation config', () => {
      const config = getValidationConfig();
      expect(config).toEqual(APP_CONFIG.validation);
    });

    it('should return UI config', () => {
      const config = getUIConfig();
      expect(config).toEqual(APP_CONFIG.ui);
    });
  });

  describe('Feature flags', () => {
    it('should have feature flags', () => {
      expect(typeof FEATURE_FLAGS).toBe('object');
      expect(typeof FEATURE_FLAGS.enableImport).toBe('boolean');
      expect(typeof FEATURE_FLAGS.enableExport).toBe('boolean');
      expect(typeof FEATURE_FLAGS.enableDarkMode).toBe('boolean');
    });

    it('should check if feature is enabled', () => {
      expect(typeof isFeatureEnabled('enableImport')).toBe('boolean');
      expect(typeof isFeatureEnabled('enableExport')).toBe('boolean');
      expect(typeof isFeatureEnabled('enableDarkMode')).toBe('boolean');
    });
  });

  describe('App metadata', () => {
    it('should have app metadata', () => {
      expect(APP_METADATA).toHaveProperty('title');
      expect(APP_METADATA).toHaveProperty('description');
      expect(APP_METADATA).toHaveProperty('keywords');
      expect(APP_METADATA).toHaveProperty('viewport');
      expect(APP_METADATA).toHaveProperty('themeColor');
      expect(APP_METADATA).toHaveProperty('language');
      expect(Array.isArray(APP_METADATA.keywords)).toBe(true);
    });
  });

  describe('Messages', () => {
    it('should have error messages', () => {
      expect(ERROR_MESSAGES).toHaveProperty('NETWORK_ERROR');
      expect(ERROR_MESSAGES).toHaveProperty('UNAUTHORIZED');
      expect(ERROR_MESSAGES).toHaveProperty('NOT_FOUND');
      expect(ERROR_MESSAGES).toHaveProperty('VALIDATION_ERROR');
      expect(ERROR_MESSAGES).toHaveProperty('SERVER_ERROR');
      expect(typeof ERROR_MESSAGES.NETWORK_ERROR).toBe('string');
    });

    it('should have success messages', () => {
      expect(SUCCESS_MESSAGES).toHaveProperty('SAVE_SUCCESS');
      expect(SUCCESS_MESSAGES).toHaveProperty('DELETE_SUCCESS');
      expect(SUCCESS_MESSAGES).toHaveProperty('UPDATE_SUCCESS');
      expect(SUCCESS_MESSAGES).toHaveProperty('LOGIN_SUCCESS');
      expect(typeof SUCCESS_MESSAGES.SAVE_SUCCESS).toBe('string');
    });
  });

  describe('Storage keys', () => {
    it('should have storage keys', () => {
      expect(STORAGE_KEYS).toHaveProperty('THEME');
      expect(STORAGE_KEYS).toHaveProperty('USER_PREFERENCES');
      expect(STORAGE_KEYS).toHaveProperty('RECENT_ENTRIES');
      expect(typeof STORAGE_KEYS.THEME).toBe('string');
      expect(STORAGE_KEYS.THEME.length).toBeGreaterThan(0);
    });
  });

  describe('API endpoints', () => {
    it('should have auth endpoints', () => {
      expect(API_ENDPOINTS.AUTH).toHaveProperty('LOGIN');
      expect(API_ENDPOINTS.AUTH).toHaveProperty('REGISTER');
      expect(API_ENDPOINTS.AUTH).toHaveProperty('LOGOUT');
      expect(typeof API_ENDPOINTS.AUTH.LOGIN).toBe('string');
    });

    it('should have entries endpoints', () => {
      expect(API_ENDPOINTS.ENTRIES).toHaveProperty('LIST');
      expect(API_ENDPOINTS.ENTRIES).toHaveProperty('CREATE');
      expect(typeof API_ENDPOINTS.ENTRIES.UPDATE).toBe('function');
      expect(typeof API_ENDPOINTS.ENTRIES.DELETE).toBe('function');
    });

    it('should generate dynamic endpoints', () => {
      expect(API_ENDPOINTS.ENTRIES.UPDATE('123')).toBe('/entries/123');
      expect(API_ENDPOINTS.ENTRIES.DELETE('456')).toBe('/entries/456');
    });

    it('should have other endpoints', () => {
      expect(typeof API_ENDPOINTS.SETTINGS).toBe('string');
      expect(typeof API_ENDPOINTS.IMPORT).toBe('string');
      expect(typeof API_ENDPOINTS.EXPORT).toBe('string');
    });
  });

  describe('API URL utility', () => {
    it('should generate full API URLs', () => {
      const url = getApiUrl('/test');
      expect(url).toContain('/test');
      expect(url.startsWith('/')).toBe(true);
    });

    it('should handle different endpoints', () => {
      const authUrl = getApiUrl(API_ENDPOINTS.AUTH.LOGIN);
      const settingsUrl = getApiUrl(API_ENDPOINTS.SETTINGS);
      
      expect(authUrl).toContain('/auth/login');
      expect(settingsUrl).toContain('/settings');
    });
  });
});
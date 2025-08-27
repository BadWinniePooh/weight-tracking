// Application constants and configuration
export const APP_CONFIG = {
  name: 'ScaleTrack',
  version: '1.0.0',
  description: 'Weight tracking application',
  author: 'Weight Tracking Team',
  
  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 10000,
    retryAttempts: 3,
  },
  
  // Weight tracking configuration
  weight: {
    minValue: 0.1,
    maxValue: 1000,
    defaultUnit: 'kg',
    decimalPlaces: 2,
  },
  
  // Chart configuration
  chart: {
    defaultRange: 30, // days
    maxDataPoints: 365,
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  
  // Validation rules
  validation: {
    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
    },
    username: {
      minLength: 3,
      maxLength: 30,
      allowedCharacters: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      maxLength: 254,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },
  
  // UI configuration
  ui: {
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1280,
    },
    animations: {
      duration: 200,
      easing: 'ease-in-out',
    },
  },
};

// Environment utilities
export function getEnvironment(): 'development' | 'production' | 'test' {
  return (process.env.NODE_ENV as any) || 'development';
}

export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

export function isTest(): boolean {
  return getEnvironment() === 'test';
}

// Configuration getters
export function getApiConfig() {
  return APP_CONFIG.api;
}

export function getWeightConfig() {
  return APP_CONFIG.weight;
}

export function getChartConfig() {
  return APP_CONFIG.chart;
}

export function getValidationConfig() {
  return APP_CONFIG.validation;
}

export function getUIConfig() {
  return APP_CONFIG.ui;
}

// Feature flags
export const FEATURE_FLAGS = {
  enableImport: true,
  enableExport: true,
  enableDarkMode: true,
  enableNotifications: false,
  enableAnalytics: isProduction(),
  enableDebugMode: isDevelopment(),
  enableBetaFeatures: isDevelopment(),
};

export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

// App metadata
export const APP_METADATA = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  keywords: ['weight tracking', 'health', 'fitness', 'chart', 'data'],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: APP_CONFIG.chart.colors.primary,
  language: 'en',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Data saved successfully.',
  DELETE_SUCCESS: 'Data deleted successfully.',
  UPDATE_SUCCESS: 'Data updated successfully.',
  IMPORT_SUCCESS: 'Data imported successfully.',
  EXPORT_SUCCESS: 'Data exported successfully.',
  LOGIN_SUCCESS: 'Login successful.',
  REGISTER_SUCCESS: 'Registration successful.',
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  USER_PREFERENCES: 'userPreferences',
  RECENT_ENTRIES: 'recentEntries',
  CHART_SETTINGS: 'chartSettings',
  IMPORT_HISTORY: 'importHistory',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  ENTRIES: {
    LIST: '/entries',
    CREATE: '/entries',
    UPDATE: (id: string) => `/entries/${id}`,
    DELETE: (id: string) => `/entries/${id}`,
    DELETE_ALL: '/entries/delete-all',
  },
  SETTINGS: '/settings',
  IMPORT: '/import',
  EXPORT: '/export',
};

// Utility function to get full API URL
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiConfig().baseUrl;
  return `${baseUrl}${endpoint}`;
}
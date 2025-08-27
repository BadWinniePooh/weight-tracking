import { findColorToken } from '@/lib/color-utils';
import { renderHook } from '@testing-library/react';

// Mock dependencies
jest.mock('@/lib/color-utils');
jest.mock('@/lib/ThemeManager', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      isDarkMode: false,
      subscribe: () => () => {}, // Return unsubscribe function
    }),
  },
}));

const mockFindColorToken = findColorToken as jest.MockedFunction<typeof findColorToken>;

describe('useThemeColor Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty string when color token is not found', () => {
    mockFindColorToken.mockReturnValue(null);

    const { useThemeColor } = require('@/hooks/useThemeColor');
    const { result } = renderHook(() => useThemeColor('NonExistent', 'Category'));

    expect(result.current).toBe('');
    expect(mockFindColorToken).toHaveBeenCalledWith('NonExistent', 'Category');
  });

  it('should return light class name when in light mode', () => {
    const mockColorToken = {
      name: 'Primary',
      lightClassName: 'bg-white text-black',
      darkClassName: 'bg-black text-white',
      description: 'Primary colors',
    };

    mockFindColorToken.mockReturnValue(mockColorToken);

    const { useThemeColor } = require('@/hooks/useThemeColor');
    const { result } = renderHook(() => useThemeColor('Primary', 'Background'));

    expect(result.current).toBe('bg-white text-black');
    expect(mockFindColorToken).toHaveBeenCalledWith('Primary', 'Background');
  });

  it('should work without category parameter', () => {
    const mockColorToken = {
      name: 'Secondary',
      lightClassName: 'bg-gray-100',
      darkClassName: 'bg-gray-800',
      description: 'Secondary colors',
    };

    mockFindColorToken.mockReturnValue(mockColorToken);

    const { useThemeColor } = require('@/hooks/useThemeColor');
    const { result } = renderHook(() => useThemeColor('Secondary'));

    expect(result.current).toBe('bg-gray-100');
    expect(mockFindColorToken).toHaveBeenCalledWith('Secondary', undefined);
  });

  it('should handle theme manager subscription', () => {
    const mockColorToken = {
      name: 'Primary',
      lightClassName: 'bg-white',
      darkClassName: 'bg-black',
      description: 'Primary colors',
    };

    mockFindColorToken.mockReturnValue(mockColorToken);

    const { useThemeColor } = require('@/hooks/useThemeColor');
    const { result, unmount } = renderHook(() => useThemeColor('Primary'));

    expect(result.current).toBe('bg-white');

    // Test cleanup
    unmount();
  });
});
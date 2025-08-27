import { findColorToken } from '@/lib/color-utils';
import { useThemeColor } from '@/hooks/useThemeColor';
import { renderHook } from '@testing-library/react';
import ThemeManager from '@/lib/ThemeManager';

// Mock dependencies
jest.mock('@/lib/color-utils');
jest.mock('@/lib/ThemeManager');

const mockFindColorToken = findColorToken as jest.MockedFunction<typeof findColorToken>;
const mockThemeManager = {
  getInstance: jest.fn(),
  isDarkMode: false,
  subscribe: jest.fn(),
};

(ThemeManager.getInstance as jest.Mock).mockReturnValue(mockThemeManager);

describe('useThemeColor Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockThemeManager.isDarkMode = false;
    mockThemeManager.subscribe.mockReturnValue(jest.fn()); // unsubscribe function
  });

  it('should return empty string when color token is not found', () => {
    mockFindColorToken.mockReturnValue(null);

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
    mockThemeManager.isDarkMode = false;

    const { result } = renderHook(() => useThemeColor('Primary', 'Background'));

    expect(result.current).toBe('bg-white text-black');
    expect(mockFindColorToken).toHaveBeenCalledWith('Primary', 'Background');
  });

  it('should return dark class name when in dark mode', () => {
    const mockColorToken = {
      name: 'Primary',
      lightClassName: 'bg-white text-black',
      darkClassName: 'bg-black text-white',
      description: 'Primary colors',
    };

    mockFindColorToken.mockReturnValue(mockColorToken);
    mockThemeManager.isDarkMode = true;

    const { result } = renderHook(() => useThemeColor('Primary', 'Background'));

    expect(result.current).toBe('bg-black text-white');
  });

  it('should work without category parameter', () => {
    const mockColorToken = {
      name: 'Secondary',
      lightClassName: 'bg-gray-100',
      darkClassName: 'bg-gray-800',
      description: 'Secondary colors',
    };

    mockFindColorToken.mockReturnValue(mockColorToken);

    const { result } = renderHook(() => useThemeColor('Secondary'));

    expect(result.current).toBe('bg-gray-100');
    expect(mockFindColorToken).toHaveBeenCalledWith('Secondary', undefined);
  });

  it('should subscribe to theme changes', () => {
    const mockColorToken = {
      name: 'Primary',
      lightClassName: 'bg-white',
      darkClassName: 'bg-black',
      description: 'Primary colors',
    };

    mockFindColorToken.mockReturnValue(mockColorToken);
    const mockUnsubscribe = jest.fn();
    mockThemeManager.subscribe.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useThemeColor('Primary'));

    expect(mockThemeManager.subscribe).toHaveBeenCalledWith(expect.any(Function));

    // Test cleanup
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should update when theme changes', () => {
    const mockColorToken = {
      name: 'Primary',
      lightClassName: 'bg-white',
      darkClassName: 'bg-black',
      description: 'Primary colors',
    };

    mockFindColorToken.mockReturnValue(mockColorToken);
    
    let themeChangeCallback: (isDark: boolean) => void;
    mockThemeManager.subscribe.mockImplementation((callback) => {
      themeChangeCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useThemeColor('Primary'));

    // Initially light mode
    expect(result.current).toBe('bg-white');

    // Simulate theme change to dark
    mockThemeManager.isDarkMode = true;
    themeChangeCallback!(true);

    expect(result.current).toBe('bg-black');
  });
});
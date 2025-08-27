import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/user-nav';

// Mock the hooks
jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => 'mock-theme-class',
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const mockPush = jest.fn();

describe('UserNav Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);
    mockSignOut.mockResolvedValue(undefined as any);
  });

  it('should render loading state when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    } as any);

    render(<UserNav />);
    
    const loadingDiv = document.querySelector('.h-8.w-8');
    expect(loadingDiv).toBeInTheDocument();
  });

  it('should render login and register buttons when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    } as any);

    render(<UserNav />);
    
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('should render user menu when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      status: 'authenticated',
    } as any);

    render(<UserNav />);
    
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('should open dropdown menu when menu button is clicked', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      status: 'authenticated',
    } as any);

    render(<UserNav />);
    
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('should show user email in dropdown menu', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      status: 'authenticated',
    } as any);

    render(<UserNav />);
    
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });
  });

  it('should navigate to settings when Settings link is clicked', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      status: 'authenticated',
    } as any);

    render(<UserNav />);
    
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      const settingsLink = screen.getByText('Settings');
      expect(settingsLink).toBeInTheDocument();
      expect(settingsLink.closest('a')).toHaveAttribute('href', '/settings');
    });
  });

  it('should call signOut and redirect when Sign out is clicked', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      status: 'authenticated',
    } as any);

    render(<UserNav />);
    
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      const signOutLink = screen.getByText('Sign out');
      fireEvent.click(signOutLink);
    });

    expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should close menu when clicking outside', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      status: 'authenticated',
    } as any);

    render(<UserNav />);
    
    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    // Click outside the menu
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
    });
  });
});
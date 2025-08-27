import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('@/lib/prisma');

const mockCompare = compare as jest.MockedFunction<typeof compare>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Auth Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CredentialsProvider authorize', () => {
    const credentialsProvider = authOptions.providers[0];
    const authorize = (credentialsProvider as any).authorize;

    it('should return null when credentials are missing', async () => {
      const result = await authorize({});
      expect(result).toBeNull();

      const result2 = await authorize({ username: 'test' });
      expect(result2).toBeNull();

      const result3 = await authorize({ password: 'password' });
      expect(result3).toBeNull();
    });

    it('should return null when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await authorize({
        username: 'nonexistent',
        password: 'password',
      });

      expect(result).toBeNull();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'nonexistent' },
      });
    });

    it('should return null when password is incorrect', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockCompare.mockResolvedValue(false);

      const result = await authorize({
        username: 'testuser',
        password: 'wrongpassword',
      });

      expect(result).toBeNull();
      expect(mockCompare).toHaveBeenCalledWith('wrongpassword', 'hashed-password');
    });

    it('should return user when credentials are valid', async () => {
      const mockUser = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockCompare.mockResolvedValue(true);

      const result = await authorize({
        username: 'testuser',
        password: 'correctpassword',
      });

      expect(result).toEqual({
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(mockCompare).toHaveBeenCalledWith('correctpassword', 'hashed-password');
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await authorize({
        username: 'testuser',
        password: 'password',
      });

      expect(result).toBeNull();
    });
  });

  describe('JWT callback', () => {
    const jwtCallback = authOptions.callbacks?.jwt;

    it('should add user data to token on first login', () => {
      const token = {};
      const user = {
        id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
      };

      const result = jwtCallback?.({ token, user } as any);

      expect(result).toEqual({
        id: 'user-id',
        username: 'testuser',
      });
    });

    it('should preserve existing token when no user is provided', () => {
      const token = {
        id: 'existing-id',
        username: 'existing-user',
        exp: 12345,
      };

      const result = jwtCallback?.({ token, user: null } as any);

      expect(result).toEqual(token);
    });
  });

  describe('Session callback', () => {
    const sessionCallback = authOptions.callbacks?.session;

    it('should add user data from token to session', () => {
      const session = {
        user: {
          email: 'test@example.com',
        },
        expires: '2024-12-31',
      };
      const token = {
        id: 'token-id',
        username: 'tokenuser',
      };

      const result = sessionCallback?.({ session, token } as any);

      expect(result).toEqual({
        user: {
          email: 'test@example.com',
          id: 'token-id',
          username: 'tokenuser',
        },
        expires: '2024-12-31',
      });
    });

    it('should handle session without user gracefully', () => {
      const session = {
        expires: '2024-12-31',
      };
      const token = {
        id: 'token-id',
        username: 'tokenuser',
      };

      const result = sessionCallback?.({ session, token } as any);

      expect(result).toEqual(session);
    });
  });

  describe('Auth configuration', () => {
    it('should have correct session strategy', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });

    it('should have correct session maxAge', () => {
      expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60); // 30 days
    });

    it('should have correct page configuration', () => {
      expect(authOptions.pages).toEqual({
        signIn: '/login',
        error: '/login',
      });
    });

    it('should have secret configured', () => {
      expect(authOptions.secret).toBeDefined();
      expect(typeof authOptions.secret).toBe('string');
    });
  });
});
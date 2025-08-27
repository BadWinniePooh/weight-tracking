import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { GET, POST } from '@/app/api/settings/route';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('next-auth/next');
jest.mock('@/lib/prisma');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const DEFAULT_LOSS_RATE = 0.0055;
const DEFAULT_CARB_FAT_RATIO = 0.6;
const DEFAULT_BUFFER_VALUE = 0.0075;

describe('/api/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
    });

    it('should return 404 when user is not found', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('User not found');
    });

    it('should return default settings when no settings exist', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' } as any);
      mockPrisma.userSettings.findUnique.mockResolvedValue(null);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.settings).toEqual({
        weightGoal: null,
        lossRate: DEFAULT_LOSS_RATE,
        carbFatRatio: DEFAULT_CARB_FAT_RATIO,
        bufferValue: DEFAULT_BUFFER_VALUE,
      });
    });

    it('should return existing settings with defaults applied', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' } as any);
      mockPrisma.userSettings.findUnique.mockResolvedValue({
        weightGoal: 80,
        lossRate: null,
        carbFatRatio: 0.7,
        bufferValue: null,
      } as any);

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.settings).toEqual({
        weightGoal: 80,
        lossRate: DEFAULT_LOSS_RATE,
        carbFatRatio: 0.7,
        bufferValue: DEFAULT_BUFFER_VALUE,
      });
    });
  });

  describe('POST', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          weightGoal: 80,
        }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
    });

    it('should return 404 when user is not found', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          weightGoal: 80,
        }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('User not found');
    });

    it('should create new settings successfully', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' } as any);
      
      const newSettings = {
        weightGoal: 80,
        lossRate: 0.006,
        carbFatRatio: 0.7,
        bufferValue: 0.008,
      };

      mockPrisma.userSettings.upsert.mockResolvedValue({
        id: 'settings-id',
        userId: 'user-id',
        ...newSettings,
      } as any);

      const mockRequest = {
        json: jest.fn().mockResolvedValue(newSettings),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Settings saved successfully');
      expect(responseData.settings).toEqual({
        id: 'settings-id',
        userId: 'user-id',
        ...newSettings,
      });

      expect(mockPrisma.userSettings.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        update: newSettings,
        create: {
          userId: 'user-id',
          ...newSettings,
        },
      });
    });

    it('should use default values when not provided', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' } as any);
      
      const partialSettings = {
        weightGoal: 80,
      };

      const expectedSettings = {
        weightGoal: 80,
        lossRate: DEFAULT_LOSS_RATE,
        carbFatRatio: DEFAULT_CARB_FAT_RATIO,
        bufferValue: DEFAULT_BUFFER_VALUE,
      };

      mockPrisma.userSettings.upsert.mockResolvedValue({
        id: 'settings-id',
        userId: 'user-id',
        ...expectedSettings,
      } as any);

      const mockRequest = {
        json: jest.fn().mockResolvedValue(partialSettings),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(mockPrisma.userSettings.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        update: expectedSettings,
        create: {
          userId: 'user-id',
          ...expectedSettings,
        },
      });
    });

    it('should return 500 when database operation fails', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      } as any);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id' } as any);
      mockPrisma.userSettings.upsert.mockRejectedValue(new Error('Database error'));

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          weightGoal: 80,
        }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to save settings');
    });
  });
});
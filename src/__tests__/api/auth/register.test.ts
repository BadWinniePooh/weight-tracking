import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    userSettings: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    entry: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockHash = hash as jest.MockedFunction<typeof hash>;

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully register a new user', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const { prisma } = require('@/lib/prisma');
    
    const requestData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestData),
    } as unknown as NextRequest;

    const mockUser = {
      id: 'user-id',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date(),
    };

    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(mockUser as any);
    mockHash.mockResolvedValue('hashed-password');

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(201);
    expect(responseData).toEqual(mockUser);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ username: 'testuser' }, { email: 'test@example.com' }],
      },
    });
    expect(mockHash).toHaveBeenCalledWith('password123', 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
  });

  it('should return 400 when required fields are missing', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const { prisma } = require('@/lib/prisma');
    
    const requestData = {
      username: 'testuser',
      // email missing
      password: 'password123',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestData),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.error).toBe('Missing required fields');
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('should return 409 when username already exists', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const { prisma } = require('@/lib/prisma');
    
    const requestData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestData),
    } as unknown as NextRequest;

    const existingUser = {
      id: 'existing-id',
      username: 'testuser',
      email: 'existing@example.com',
    };

    prisma.user.findFirst.mockResolvedValue(existingUser as any);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(409);
    expect(responseData.error).toBe('Username or email already exists');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should return 500 when database operation fails', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const { prisma } = require('@/lib/prisma');
    
    const requestData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestData),
    } as unknown as NextRequest;

    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockRejectedValue(new Error('Database error'));
    mockHash.mockResolvedValue('hashed-password');

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toBe('Failed to register user');
  });
});
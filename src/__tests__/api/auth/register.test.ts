import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { POST } from '@/app/api/auth/register/route';
import { prisma } from '@/lib/prisma';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('@/lib/prisma');

const mockHash = hash as jest.MockedFunction<typeof hash>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully register a new user', async () => {
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

    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(mockUser as any);
    mockHash.mockResolvedValue('hashed-password');

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(201);
    expect(responseData).toEqual(mockUser);
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ username: 'testuser' }, { email: 'test@example.com' }],
      },
    });
    expect(mockHash).toHaveBeenCalledWith('password123', 10);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
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
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('should return 409 when username already exists', async () => {
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

    mockPrisma.user.findFirst.mockResolvedValue(existingUser as any);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(409);
    expect(responseData.error).toBe('Username or email already exists');
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it('should return 409 when email already exists', async () => {
    const requestData = {
      username: 'newuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestData),
    } as unknown as NextRequest;

    const existingUser = {
      id: 'existing-id',
      username: 'existinguser',
      email: 'test@example.com',
    };

    mockPrisma.user.findFirst.mockResolvedValue(existingUser as any);

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(409);
    expect(responseData.error).toBe('Username or email already exists');
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it('should return 500 when database operation fails', async () => {
    const requestData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestData),
    } as unknown as NextRequest;

    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockRejectedValue(new Error('Database error'));
    mockHash.mockResolvedValue('hashed-password');

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toBe('Failed to register user');
  });

  it('should return 500 when password hashing fails', async () => {
    const requestData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestData),
    } as unknown as NextRequest;

    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockHash.mockRejectedValue(new Error('Hashing error'));

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toBe('Failed to register user');
  });
});
import { APIGatewayProxyEvent } from 'aws-lambda';

export type Role = 'admin' | 'operator' | 'viewer';

export interface AuthContext {
  userId: string;
  role: Role;
  email: string;
}

export const ROLE_PERMISSIONS: Record<Role, Set<string>> = {
  admin: new Set([
    'user:read',
    'user:write',
    'user:delete',
    'budget:read',
    'budget:write',
    'budget:delete',
    'expense:read',
    'expense:write',
    'expense:delete',
    'purchase:read',
    'purchase:write',
    'purchase:delete',
    'ingredient:read',
    'ingredient:write',
    'ingredient:delete',
    'distributor:read',
    'distributor:write',
    'distributor:delete',
    'supermarket:read',
    'supermarket:write',
    'supermarket:delete',
    'inventory:read',
    'inventory:write',
    'inventory:delete',
    'price:read',
    'price:write',
    'price:delete',
    'analysis:read',
    'analysis:write',
    'analysis:delete',
    'reduction:read',
    'reduction:write',
    'reduction:delete',
    'bulk:write',
    'audit:read',
  ]),
  operator: new Set([
    'user:read',
    'user:write',
    'budget:read',
    'budget:write',
    'expense:read',
    'expense:write',
    'purchase:read',
    'purchase:write',
    'ingredient:read',
    'ingredient:write',
    'distributor:read',
    'supermarket:read',
    'inventory:read',
    'inventory:write',
    'price:read',
    'analysis:read',
    'analysis:write',
    'reduction:read',
    'reduction:write',
    'bulk:write',
    'audit:read',
  ]),
  viewer: new Set([
    'user:read',
    'budget:read',
    'expense:read',
    'purchase:read',
    'ingredient:read',
    'distributor:read',
    'supermarket:read',
    'inventory:read',
    'price:read',
    'analysis:read',
    'reduction:read',
    'audit:read',
  ]),
};

export function extractAuthContext(event: APIGatewayProxyEvent): AuthContext {
  const authHeader = event.headers['Authorization'] || '';
  const token = authHeader.replace('Bearer ', '');

  // Mock JWT parsing - in production, use proper JWT verification
  try {
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return {
      userId: decoded.sub || 'unknown',
      role: (decoded.role || 'viewer') as Role,
      email: decoded.email || 'unknown@example.com',
    };
  } catch {
    return {
      userId: 'anonymous',
      role: 'viewer',
      email: 'anonymous@example.com',
    };
  }
}

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function requirePermission(role: Role, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(`Permission denied: ${permission}`);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
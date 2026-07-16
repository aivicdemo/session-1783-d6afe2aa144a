import { APIGatewayProxyEvent } from 'aws-lambda';

export type Role = 'admin' | 'operator' | 'viewer';

export interface RBACContext {
  role: Role;
  userId: string;
  timestamp: string;
}

export function extractRBACContext(event: APIGatewayProxyEvent): RBACContext {
  const authHeader = event.headers['Authorization'] || '';
  const role = (event.headers['X-Role'] || 'viewer') as Role;
  const userId = event.headers['X-User-Id'] || 'anonymous';
  const timestamp = new Date().toISOString();

  if (!['admin', 'operator', 'viewer'].includes(role)) {
    throw new Error('Invalid role');
  }

  return { role, userId, timestamp };
}

export function checkPermission(role: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(role);
}

export function requirePermission(role: Role, requiredRoles: Role[]): void {
  if (!checkPermission(role, requiredRoles)) {
    throw new ForbiddenError(`Role '${role}' is not permitted for this operation`);
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
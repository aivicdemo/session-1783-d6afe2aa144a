import { APIGatewayProxyEvent } from 'aws-lambda';

export type Role = 'admin' | 'operator' | 'viewer';

export interface AuthContext {
  userId: string;
  role: Role;
  timestamp: number;
}

export const extractAuthContext = (event: APIGatewayProxyEvent): AuthContext => {
  const authHeader = event.headers['Authorization'] || '';
  const roleHeader = event.headers['X-User-Role'] || 'viewer';
  const userIdHeader = event.headers['X-User-Id'] || 'unknown';

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const role = roleHeader as Role;
  if (!['admin', 'operator', 'viewer'].includes(role)) {
    throw new Error('Invalid role');
  }

  return {
    userId: userIdHeader,
    role,
    timestamp: Date.now(),
  };
};

export const checkPermission = (role: Role, requiredRoles: Role[]): boolean => {
  return requiredRoles.includes(role);
};

export const roleHierarchy: Record<Role, number> = {
  admin: 3,
  operator: 2,
  viewer: 1,
};

export const hasMinimumRole = (role: Role, minimumRole: Role): boolean => {
  return roleHierarchy[role] >= roleHierarchy[minimumRole];
};
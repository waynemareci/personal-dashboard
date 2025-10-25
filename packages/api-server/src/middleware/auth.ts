import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthUser;
}

/**
 * Authentication middleware factory
 */
export function createAuthMiddleware(options: { required?: boolean } = {}) {
  const { required = true } = options;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;
      
      if (!authHeader) {
        if (required) {
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Authorization header is required'
          });
        }
        return; // Optional auth, continue without user
      }

      // Parse Bearer token
      const token = authHeader.replace(/^Bearer\s+/i, '');
      if (!token) {
        if (required) {
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid authorization format. Use: Bearer <token>'
          });
        }
        return;
      }

      // Verify JWT token
      try {
        const decoded = await request.jwtVerify();
        
        // Attach user to request
        (request as any).user = {
          id: decoded.sub || decoded.userId,
          email: decoded.email,
          role: decoded.role || 'user',
          permissions: decoded.permissions || []
        };

        logger.debug(`User authenticated: ${(request as any).user.email}`);
      } catch (jwtError) {
        logger.warn(`JWT verification failed: ${jwtError}`);
        
        if (required) {
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid or expired token'
          });
        }
      }
    } catch (error) {
      logger.error('Authentication middleware error:', error);
      
      if (required) {
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Authentication system error'
        });
      }
    }
  };
}

/**
 * Role-based access control middleware
 */
export function requireRole(allowedRoles: string | string[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user as AuthUser;
    
    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(user.role)) {
      logger.warn(`Access denied for user ${user.email}. Required roles: ${roles.join(', ')}, User role: ${user.role}`);
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }
  };
}

/**
 * Permission-based access control middleware
 */
export function requirePermission(requiredPermissions: string | string[]) {
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user as AuthUser;
    
    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const hasPermission = permissions.some(permission => 
      user.permissions.includes(permission) || user.role === 'admin'
    );

    if (!hasPermission) {
      logger.warn(`Permission denied for user ${user.email}. Required: ${permissions.join(', ')}, User permissions: ${user.permissions.join(', ')}`);
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Required permissions not found'
      });
    }
  };
}

/**
 * WebSocket authentication middleware
 */
export async function authenticateWebSocket(request: FastifyRequest): Promise<AuthUser | null> {
  try {
    // Check for token in query params or headers
    const token = request.query?.token as string || 
                  request.headers.authorization?.replace(/^Bearer\s+/i, '');
    
    if (!token) {
      logger.warn('WebSocket connection attempted without token');
      return null;
    }

    // Verify JWT token
    const decoded = await request.jwtVerify();
    
    return {
      id: decoded.sub || decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
      permissions: decoded.permissions || []
    };
  } catch (error) {
    logger.warn('WebSocket authentication failed:', error);
    return null;
  }
}
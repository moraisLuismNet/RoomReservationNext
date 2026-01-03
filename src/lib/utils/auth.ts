import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export interface JWTPayload {
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  
  return jwt.sign(payload, secret as string, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}

export function withAuth(handler: Function, requiredRole?: string) {
  return async (request: NextRequest, context: any) => {
    try {
      const token = getTokenFromRequest(request);
      
      if (!token) {
        return NextResponse.json(
          { success: false, message: 'No token provided' },
          { status: 401 }
        );
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { success: false, message: 'Invalid token' },
          { status: 401 }
        );
      }
      
      if (requiredRole && decoded.role !== requiredRole) {
        return NextResponse.json(
          { success: false, message: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      // Add user info to request
      context.user = decoded;
      
      return handler(request, context);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 401 }
      );
    }
  };
}
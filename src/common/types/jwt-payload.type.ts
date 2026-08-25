export interface JwtPayload {
  sub: string;
  tenantId: string | null;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser extends JwtPayload {
  userId: string;
}

import { Request } from 'express';
import { AuthenticatedUser } from './jwt-payload.type';

export interface TenantContext {
  tenantId: string;
  tenantSlug?: string;
  planTier?: string;
}

export interface TenantRequest extends Request {
  tenantContext?: TenantContext;
  user?: AuthenticatedUser;
  correlationId?: string;
}

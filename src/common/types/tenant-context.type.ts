import { Request } from 'express';

export interface TenantContext {
  tenantId: string;
  tenantSlug?: string;
  planTier?: string;
}

export interface TenantRequest extends Request {
  tenantContext?: TenantContext;
  user?: any;
}

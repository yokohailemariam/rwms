export class TenantEntity {
  id: string;
  name: string;
  slug: string;
  status: string;
  planTier: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  static create(params: {
    id: string;
    name: string;
    slug: string;
    planTier?: string;
    settings?: Record<string, any>;
  }): TenantEntity {
    const entity = new TenantEntity();
    entity.id = params.id;
    entity.name = params.name;
    entity.slug = params.slug;
    entity.status = 'PROVISIONING';
    entity.planTier = params.planTier || 'STARTER';
    entity.settings = params.settings || {};
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    return entity;
  }

  activate(): void {
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  suspend(): void {
    this.status = 'SUSPENDED';
    this.updatedAt = new Date();
  }

  cancel(): void {
    this.status = 'CANCELLED';
    this.updatedAt = new Date();
  }
}

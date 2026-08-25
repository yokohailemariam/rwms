import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(
    req: Request & { tenantContext?: any; user?: any },
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const tenantIdFromHeader = req.headers['x-tenant-id'] as string;
    const tenantSlugFromHeader = req.headers['x-tenant-slug'] as string;

    if (req.tenantContext) {
      return next();
    }

    if (tenantIdFromHeader) {
      req.tenantContext = { tenantId: tenantIdFromHeader };
    } else if (tenantSlugFromHeader) {
      try {
        const tenant = await this.prisma.tenant.findUnique({
          where: { slug: tenantSlugFromHeader },
          select: { id: true, slug: true, planTier: true, status: true },
        });
        if (tenant) {
          req.tenantContext = {
            tenantId: tenant.id,
            tenantSlug: tenant.slug,
            planTier: tenant.planTier,
          };
        }
      } catch {
        // Continue without tenant context
      }
    }

    next();
  }
}

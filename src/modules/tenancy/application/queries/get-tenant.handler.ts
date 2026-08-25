import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTenantQuery } from './get-tenant.query';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { NotFoundException } from '../../../../common/exceptions/domain.exception';
import { ERROR_CODES } from '../../../../common/constants/error-codes.constant';

@QueryHandler(GetTenantQuery)
export class GetTenantHandler implements IQueryHandler<GetTenantQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTenantQuery) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: query.tenantId },
      include: { subscriptions: true },
    });

    if (!tenant) {
      throw new NotFoundException(
        ERROR_CODES.TENANT_NOT_FOUND,
        `Tenant not found`,
      );
    }

    return tenant;
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTenantCommand } from './create-tenant.command';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { OutboxService } from '../../../../infrastructure/outbox/outbox.service';
import { hashPassword } from '../../../../common/utils/hash.util';
import { ConflictException } from '../../../../common/exceptions/domain.exception';
import { ERROR_CODES } from '../../../../common/constants/error-codes.constant';
import { generateSecureToken } from '../../../../common/utils/crypto.util';
import { PlanTier } from '../../../../infrastructure/database/generated/prisma/client';

@CommandHandler(CreateTenantCommand)
export class CreateTenantHandler implements ICommandHandler<CreateTenantCommand> {
  private readonly logger = new Logger(CreateTenantHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateTenantCommand) {
    const { name, slug, ownerEmail, ownerFirstName, ownerLastName, planTier } =
      command;

    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(
        ERROR_CODES.TENANT_SLUG_TAKEN,
        `Tenant with slug '${slug}' already exists`,
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: ownerEmail },
    });
    if (existingUser) {
      throw new ConflictException(
        ERROR_CODES.CONFLICT,
        `User with email '${ownerEmail}' already exists`,
      );
    }

    const tempPassword = generateSecureToken(8);
    const passwordHash = await hashPassword(tempPassword);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          status: 'PROVISIONING',
          planTier: planTier as PlanTier,
          settings: {},
        },
      });

      const owner = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: ownerEmail,
          passwordHash,
          firstName: ownerFirstName,
          lastName: ownerLastName,
          role: 'OWNER',
          isActive: true,
        },
      });

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planTier: planTier as PlanTier,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          workerLimit:
            planTier === 'STARTER' ? 50 : planTier === 'GROWTH' ? 500 : 10000,
          kioskLimit:
            planTier === 'STARTER' ? 5 : planTier === 'GROWTH' ? 50 : 1000,
        },
      });

      await tx.leaveType.createMany({
        data: [
          {
            tenantId: tenant.id,
            name: 'Annual Leave',
            code: 'ANNUAL',
            daysAllowedPerYear: 21,
            isPaid: true,
            requiresApproval: true,
          },
          {
            tenantId: tenant.id,
            name: 'Sick Leave',
            code: 'SICK',
            daysAllowedPerYear: 10,
            isPaid: true,
            requiresApproval: false,
          },
          {
            tenantId: tenant.id,
            name: 'Maternity Leave',
            code: 'MATERNITY',
            daysAllowedPerYear: 90,
            isPaid: true,
            requiresApproval: true,
          },
        ],
      });

      return { tenant, owner, tempPassword };
    });

    await this.outbox.publish(
      result.tenant.id,
      'tenant.provisioned.v1',
      result.tenant.id,
      'Tenant',
      {
        tenantId: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        ownerEmail,
        planTier,
      },
    );

    return {
      tenant: result.tenant,
      owner: {
        id: result.owner.id,
        email: result.owner.email,
        firstName: result.owner.firstName,
        lastName: result.owner.lastName,
      },
      temporaryPassword:
        process.env.NODE_ENV !== 'production' ? result.tempPassword : undefined,
    };
  }
}

import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/infrastructure/database/generated/prisma/client';
import { Pool } from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ── Tenant ──────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Manufacturing Co.',
      slug: 'demo-company',
      status: 'ACTIVE',
      planTier: 'ENTERPRISE',
    },
  });
  console.log(`Tenant: ${tenant.name} [${tenant.id}]`);

  // ── Factory ──────────────────────────────────────────────────────────────────
  const factory = await prisma.factory.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'FAC-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Main Factory',
      code: 'FAC-001',
      address: 'Bole Road, Addis Ababa',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      timezone: 'Africa/Addis_Ababa',
    },
  });
  console.log(`Factory: ${factory.name} [${factory.id}]`);

  // ── Department ───────────────────────────────────────────────────────────────
  const dept = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'PROD-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      factoryId: factory.id,
      name: 'Production',
      code: 'PROD-001',
    },
  });
  console.log(`Department: ${dept.name} [${dept.id}]`);

  // ── Admin User ────────────────────────────────────────────────────────────────
  const passwordHash = await argon2.hash('Admin@1234', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.com',
      firstName: 'System',
      lastName: 'Admin',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`Admin user: ${adminUser.email} [${adminUser.id}]`);

  // ── Leave Types ───────────────────────────────────────────────────────────────
  const leaveTypes = [
    {
      code: 'ANNUAL',
      name: 'Annual Leave',
      daysAllowedPerYear: 21,
      isPaid: true,
    },
    { code: 'SICK', name: 'Sick Leave', daysAllowedPerYear: 10, isPaid: true },
    {
      code: 'UNPAID',
      name: 'Unpaid Leave',
      daysAllowedPerYear: 30,
      isPaid: false,
    },
  ];

  for (const lt of leaveTypes) {
    await prisma.leaveType.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: lt.code } },
      update: {},
      create: {
        tenantId: tenant.id,
        ...lt,
        isActive: true,
        requiresApproval: true,
      },
    });
  }
  console.log('Leave types seeded');

  // ── Shift Templates (only create if none exist) ────────────────────────────────
  const existingShifts = await prisma.shift.count({
    where: { tenantId: tenant.id },
  });
  if (existingShifts === 0) {
    await prisma.shift.createMany({
      data: [
        {
          tenantId: tenant.id,
          factoryId: factory.id,
          name: 'Morning Shift',
          startTime: '06:00',
          endTime: '14:00',
          durationMinutes: 480,
          isNightShift: false,
        },
        {
          tenantId: tenant.id,
          factoryId: factory.id,
          name: 'Afternoon Shift',
          startTime: '14:00',
          endTime: '22:00',
          durationMinutes: 480,
          isNightShift: false,
        },
        {
          tenantId: tenant.id,
          factoryId: factory.id,
          name: 'Night Shift',
          startTime: '22:00',
          endTime: '06:00',
          durationMinutes: 480,
          isNightShift: true,
        },
      ],
    });
    console.log('Shifts seeded');
  }

  // ── Demo Worker ───────────────────────────────────────────────────────────────
  const worker = await prisma.worker.upsert({
    where: {
      tenantId_employeeId: { tenantId: tenant.id, employeeId: 'EMP-0001' },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      factoryId: factory.id,
      departmentId: dept.id,
      employeeId: 'EMP-0001',
      firstName: 'Demo',
      lastName: 'Worker',
      hireDate: new Date('2023-01-01'),
      status: 'ACTIVE',
      salary: 1500,
      currency: 'USD',
    },
  });
  console.log('Demo worker seeded');

  // ── Leave Balances ────────────────────────────────────────────────────────────
  const leaveTypeRecords = await prisma.leaveType.findMany({
    where: { tenantId: tenant.id },
  });
  const currentYear = new Date().getFullYear();

  for (const lt of leaveTypeRecords) {
    await prisma.leaveBalance.upsert({
      where: {
        workerId_leaveTypeId_year: {
          workerId: worker.id,
          leaveTypeId: lt.id,
          year: currentYear,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        workerId: worker.id,
        leaveTypeId: lt.id,
        year: currentYear,
        totalDays: lt.daysAllowedPerYear,
      },
    });
  }
  console.log('Leave balances seeded');

  // ── Subscription ──────────────────────────────────────────────────────────────
  await prisma.subscription.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      planTier: 'ENTERPRISE',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      workerLimit: 500,
      kioskLimit: 20,
    },
  });
  console.log('Subscription seeded');

  console.log('\nSeed completed successfully!');
  console.log('Login: admin@demo.com / Admin@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

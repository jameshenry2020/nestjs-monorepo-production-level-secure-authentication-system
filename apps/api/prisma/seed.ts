import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create Permissions
  const permissions = [
    'manage_users',
    'view_dashboard',
    'edit_profile',
  ];

  const createdPermissions = [];
  for (const name of permissions) {
    const p = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdPermissions.push(p);
  }

  // Create Roles
  const roles = [
    {
      name: 'admin',
      permissions: ['manage_users', 'view_dashboard', 'edit_profile'],
    },
    {
      name: 'user',
      permissions: ['view_dashboard', 'edit_profile'],
    },
  ];

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        permissions: {
          set: [], // Clear existing permissions
          connect: roleData.permissions.map((pName) => ({ name: pName })),
        },
      },
      create: {
        name: roleData.name,
        permissions: {
          connect: roleData.permissions.map((pName) => ({ name: pName })),
        },
      },
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

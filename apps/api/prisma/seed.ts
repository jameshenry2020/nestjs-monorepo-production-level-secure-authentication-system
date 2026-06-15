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
    { name: 'settings.read', module: 'settings', description: 'To view platform settings' },
    { name: 'settings.update', module: 'settings', description: 'To update platform settings' },
    { name: 'project.read', module: 'project', description: 'To read projects' },
    { name: 'project.create', module: 'project', description: 'To create projects' },
    { name: 'organisation.read', module: 'organisation', description: 'To read organization details' },
    { name: 'organisation.update', module: 'organisation', description: 'To update organization details' },
    { name: 'users.manage', module: 'users', description: 'To manage system users' },
    { name: 'dashboard.view', module: 'dashboard', description: 'To view admin dashboard' },
    { name: 'profile.update', module: 'profile', description: 'To edit user profile' },
    
    // Organization-level Permissions
    { name: 'org.members.invite', module: 'org.members', description: 'To invite members to organization' },
    { name: 'org.members.update', module: 'org.members', description: 'To update organization member roles' },
    { name: 'org.members.delete', module: 'org.members', description: 'To remove members from organization' },
    { name: 'org.projects.create', module: 'org.projects', description: 'To create organization projects' },
    { name: 'org.projects.read', module: 'org.projects', description: 'To read organization projects' },
    { name: 'org.projects.update', module: 'org.projects', description: 'To update organization projects' },
    { name: 'org.projects.delete', module: 'org.projects', description: 'To delete organization projects' },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {
        module: perm.module,
        description: perm.description,
      },
      create: perm,
    });
    createdPermissions.push(p);
  }

  // Create Roles
  const roles = [
    {
      name: 'admin',
      permissions: ['users.manage', 'dashboard.view', 'profile.update', 'settings.read', 'settings.update', 'project.read', 'project.create'],
    },
    {
      name: 'user',
      permissions: ['dashboard.view', 'profile.update', 'settings.read', 'project.read', 'project.create'],
    },
  ];

  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: {
        name_organizationId: {
          name: roleData.name,
          organizationId: null,
        },
      },
      update: {},
      create: {
        name: roleData.name,
        organizationId: null,
      },
    });

    // Clear existing role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Find the permission records
    const permRecords = await prisma.permission.findMany({
      where: { name: { in: roleData.permissions } },
    });

    // Create the RolePermission join records
    await prisma.rolePermission.createMany({
      data: permRecords.map((p) => ({
        roleId: role.id,
        permissionId: p.id,
      })),
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

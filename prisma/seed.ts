import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@chatbox.ai';
  const password = 'admin-password-123';
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`Admin user ${email} already exists.`);
    return;
  }

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email,
      name: 'System Admin',
      passwordHash: hashedPassword,
      role: 'admin',
    },
  });

  // Create default organization for admin
  const slug = 'admin-org-' + Math.floor(Math.random() * 1000);
  const org = await prisma.organization.create({
    data: {
      name: 'System Administration Org',
      slug,
    },
  });

  // Create membership
  await prisma.member.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      role: 'owner',
    },
  });

  console.log('==================================================');
  console.log('ADMIN USER CREATED SUCCESSFULLY');
  console.log('==================================================');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('==================================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

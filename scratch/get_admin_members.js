const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({
    where: { id: 'cmrozddof0001uw90y0o4s75t' },
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  });
  console.log('--- SYSTEM ADMIN ORG MEMBERS ---');
  if (!org) {
    console.log('Organization not found');
  } else {
    org.members.forEach(m => {
      console.log(`User Name: ${m.user.name}`);
      console.log(`User Email: ${m.user.email}`);
      console.log(`Role: ${m.role}\n`);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

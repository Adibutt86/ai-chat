const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'shrn496@gmail.com' },
    include: {
      memberships: {
        include: {
          organization: {
            include: {
              agents: true,
              businessHours: true,
              services: true
            }
          }
        }
      }
    }
  });
  console.log('--- USER INQUIRY ---');
  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

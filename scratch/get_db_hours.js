const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hours = await prisma.businessHours.findMany({
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          agents: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
  console.log('--- DB BUSINESS HOURS ---');
  console.log(JSON.stringify(hours, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany({
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
  console.log('--- DB SERVICES ---');
  console.log(JSON.stringify(services, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

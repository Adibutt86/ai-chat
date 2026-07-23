const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hours = await prisma.businessHours.findMany({
    where: { organizationId: 'cmrp7qxoo0035uwy8l6jd7o1p' }
  });
  console.log('--- TESTER ONE ORG HOURS ---');
  console.log(JSON.stringify(hours, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doc = await prisma.document.findFirst({
    where: { name: 'FAQ: what is day today' }
  });
  console.log('--- FAQ DETAILS ---');
  console.log(JSON.stringify(doc, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

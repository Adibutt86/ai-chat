const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.document.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      createdAt: true
    }
  });
  console.log('--- INDEXED DOCUMENTS ---');
  console.log(JSON.stringify(docs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

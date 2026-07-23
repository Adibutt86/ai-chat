const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.document.findMany({
    where: { agentId: 'cmrqieu7v000njp04z0m2n4wy' }
  });
  console.log('--- LUNAR MEDIA DOCUMENTS ---');
  docs.forEach(d => {
    console.log(`Document ID: ${d.id}`);
    console.log(`Document Name: ${d.name}`);
    console.log(`Content:\n${d.content}\n`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

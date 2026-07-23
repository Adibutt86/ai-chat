const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.document.findMany({
    select: {
      id: true,
      name: true,
      agentId: true,
      agent: {
        select: {
          name: true,
          organization: {
            select: {
              name: true
            }
          }
        }
      },
      content: true
    }
  });
  console.log('--- RECENT DOCUMENTS ---');
  docs.forEach(d => {
    console.log(`ID: ${d.id}`);
    console.log(`Name: ${d.name}`);
    console.log(`Agent Name: ${d.agent?.name} (${d.agent?.organization?.name})`);
    console.log(`Agent ID: ${d.agentId}`);
    console.log(`Content Preview: ${d.content.substring(0, 300)}...\n`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

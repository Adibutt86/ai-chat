const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.message.findMany({
    where: {
      content: { contains: 'Jeans' }
    },
    include: {
      conversation: true
    }
  });
  console.log('--- MESSAGES WITH SHOP LINKS ---');
  console.log(JSON.stringify(messages, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

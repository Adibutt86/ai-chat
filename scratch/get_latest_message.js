const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const latestMessage = await prisma.message.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      conversation: true
    }
  });
  console.log('--- LATEST AI MESSAGE ---');
  console.log(JSON.stringify(latestMessage, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

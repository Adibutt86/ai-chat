const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.agent.findFirst().then(agent => {
  console.log('AGENT_ID:', agent ? agent.id : 'NONE');
}).catch(err => {
  console.error(err);
}).finally(() => {
  prisma.$disconnect();
});

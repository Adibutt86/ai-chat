const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doc = await prisma.document.findFirst({
    where: { name: 'PRICES Page' },
    include: {
      embeddings: true
    }
  });
  console.log('--- PRICES PAGE INDEXED EMBEDDINGS ---');
  if (!doc) {
    console.log('No PRICES Page document found!');
  } else {
    console.log(`Document ID: ${doc.id}`);
    console.log(`Number of Embeddings: ${doc.embeddings.length}`);
    doc.embeddings.forEach((e, idx) => {
      console.log(`\n--- Embedding ${idx + 1} ---`);
      console.log(e.chunkContent);
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

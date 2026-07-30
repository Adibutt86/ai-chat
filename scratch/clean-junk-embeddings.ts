import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up old binary/media embeddings from database...');
  
  const deletedEmbeddings = await prisma.embedding.deleteMany({
    where: {
      OR: [
        { chunkContent: { contains: '_NEXT/STATIC/MEDIA' } },
        { chunkContent: { contains: 'woff2' } },
        { chunkContent: { contains: 'WOFF' } },
        { chunkContent: { contains: 'chatbox-ai-widget.php' } },
        { chunkContent: { contains: 'ChatBox_AI_Widget_Plugin' } },
      ],
    },
  });

  const deletedWebsites = await prisma.website.deleteMany({
    where: {
      OR: [
        { url: { contains: '_next' } },
        { url: { contains: 'woff2' } },
        { url: { contains: 'download-wordpress-plugin' } },
      ],
    },
  });

  console.log(`Successfully deleted ${deletedEmbeddings.count} old junk embedding chunks.`);
  console.log(`Successfully deleted ${deletedWebsites.count} old junk website entries.`);
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

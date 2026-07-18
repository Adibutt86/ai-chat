import { prisma } from './db';
import { getEmbedding } from './ai';

/**
 * Custom memory vector database for embeddings, since Supabase or pgvector might not be initialized locally during development.
 * Offers standard cosine similarity vector search fallback.
 */
interface LocalEmbeddingCache {
  id: string;
  documentId: string;
  chunkContent: string;
  vector: number[];
}

const embeddingCache: LocalEmbeddingCache[] = [];
let isInitializing = false;

/**
 * Store document chunk and create embedding
 */
export async function indexDocumentChunk(
  documentId: string,
  chunkContent: string
): Promise<void> {
  const vector = await getEmbedding(chunkContent);
  
  // Store metadata in standard DB
  const emb = await prisma.embedding.create({
    data: {
      documentId,
      chunkContent,
    },
  });

  // Store vector in DB using pgvector
  try {
    const vectorSqlStr = `[${vector.join(',')}]`;
    await prisma.$executeRaw`
      UPDATE "Embedding"
      SET "embedding" = ${vectorSqlStr}::vector
      WHERE "id" = ${emb.id}
    `;
  } catch (err) {
    console.error("Error saving vector to database:", err);
  }

  // Store in cache for high-fidelity vector search queries
  embeddingCache.push({
    id: emb.id,
    documentId,
    chunkContent,
    vector,
  });
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Ensure database embeddings are loaded into the cache
 */
export async function ensureEmbeddingCache(agentId: string) {
  if (embeddingCache.length > 0 || isInitializing) return;
  isInitializing = true;
  try {
    const docs = await prisma.document.findMany({
      where: { agentId },
      include: { embeddings: true }
    });
    for (const doc of docs) {
      for (const emb of doc.embeddings) {
        if (!embeddingCache.some(c => c.id === emb.id)) {
          const vector = await getEmbedding(emb.chunkContent);
          embeddingCache.push({
            id: emb.id,
            documentId: emb.documentId,
            chunkContent: emb.chunkContent,
            vector
          });
        }
      }
    }
  } catch (err) {
    console.error("Error loading embeddings into cache:", err);
  } finally {
    isInitializing = false;
  }
}

/**
 * Filter out navigation links, footers, headers or general boilerplate.
 */
function isBoilerplate(content: string): boolean {
  const lower = content.toLowerCase();
  // Check for common navigation chains in headers/footers
  if (lower.includes('home about services prices') || lower.includes('sign in get started') || lower.includes('wp plugin contact')) {
    return true;
  }
  // Short menus / footer list patterns
  if (lower.includes('privacy policy') && lower.includes('terms of service') && lower.length < 150) {
    return true;
  }
  return false;
}

/**
 * Retrieve similar chunks for a specific agent
 */
export async function searchRelevantChunks(
  agentId: string,
  query: string,
  limit = 10
): Promise<{ chunkContent: string; score: number; documentId: string }[]> {
  // Self-healing: automatically index any documents missing embeddings
  try {
    const emptyDocs = await prisma.document.findMany({
      where: { agentId, embeddings: { none: {} } }
    });
    if (emptyDocs.length > 0) {
      for (const doc of emptyDocs) {
        const chunks = chunkText(doc.content, 300);
        for (const chunk of chunks) {
          await indexDocumentChunk(doc.id, chunk);
        }
      }
    }
  } catch (err) {
    console.error("Auto-repair embeddings failed:", err);
  }

  const queryVector = await getEmbedding(query);
  const vectorSqlStr = `[${queryVector.join(',')}]`;

  let rawMatches: { chunkContent: string; score: number; documentId: string }[] = [];
  let fetchedFromDb = false;

  try {
    // 1. Attempt pgvector similarity search directly in SQL for candidate matches
    const candidates = await prisma.$queryRaw<any[]>`
      SELECT 
        emb."id",
        emb."documentId",
        emb."chunkContent",
        (1 - (emb."embedding" <=> ${vectorSqlStr}::vector)) AS "rawScore",
        doc."url",
        doc."name"
      FROM "Embedding" emb
      JOIN "Document" doc ON emb."documentId" = doc."id"
      WHERE doc."agentId" = ${agentId} AND emb."embedding" IS NOT NULL
      ORDER BY emb."embedding" <=> ${vectorSqlStr}::vector ASC
      LIMIT 50
    `;

    if (candidates && candidates.length > 0) {
      fetchedFromDb = true;
      rawMatches = candidates.map(emb => {
        let score = Number(emb.rawScore) || 0;
        
        // Filter out boilerplate text
        if (isBoilerplate(emb.chunkContent)) {
          score -= 0.3;
        }

        // Prioritize FAQ, Services, Pricing, About, and Contact pages
        const urlLower = (emb.url || '').toLowerCase();
        const nameLower = (emb.name || '').toLowerCase();
        
        if (urlLower.includes('faq') || nameLower.includes('faq')) {
          score += 0.15;
        }
        if (urlLower.includes('services') || nameLower.includes('services')) {
          score += 0.1;
        }
        if (urlLower.includes('prices') || urlLower.includes('pricing') || nameLower.includes('prices') || nameLower.includes('pricing')) {
          score += 0.1;
        }
        if (urlLower.includes('about') || nameLower.includes('about')) {
          score += 0.05;
        }
        if (urlLower.includes('contact') || nameLower.includes('contact')) {
          score += 0.05;
        }
        
        return { chunkContent: emb.chunkContent, score, documentId: emb.documentId };
      });
    }
  } catch (err) {
    console.error("pgvector database search failed, falling back to in-memory cache:", err);
  }

  // 2. Fallback to in-memory cache search if pgvector didn't yield results or failed
  if (!fetchedFromDb) {
    await ensureEmbeddingCache(agentId);
    
    // Find documents associated with the agent
    const docs = await prisma.document.findMany({
      where: { agentId },
      select: { id: true, url: true, name: true },
    });
    
    const docsMap = new Map(docs.map(d => [d.id, d]));

    rawMatches = embeddingCache
      .filter(emb => docsMap.has(emb.documentId))
      .map(emb => {
        const doc = docsMap.get(emb.documentId)!;
        let score = cosineSimilarity(queryVector, emb.vector);
        
        // Filter out boilerplate text
        if (isBoilerplate(emb.chunkContent)) {
          score -= 0.3;
        }

        // Prioritize FAQ, Services, Pricing, About, and Contact pages
        const urlLower = (doc.url || '').toLowerCase();
        const nameLower = (doc.name || '').toLowerCase();
        
        if (urlLower.includes('faq') || nameLower.includes('faq')) {
          score += 0.15;
        }
        if (urlLower.includes('services') || nameLower.includes('services')) {
          score += 0.1;
        }
        if (urlLower.includes('prices') || urlLower.includes('pricing') || nameLower.includes('prices') || nameLower.includes('pricing')) {
          score += 0.1;
        }
        if (urlLower.includes('about') || nameLower.includes('about')) {
          score += 0.05;
        }
        if (urlLower.includes('contact') || nameLower.includes('contact')) {
          score += 0.05;
        }
        
        return { chunkContent: emb.chunkContent, score, documentId: emb.documentId };
      });
  }

  // Rank by similarity score
  const sortedMatches = rawMatches.sort((a, b) => b.score - a.score);

  // Merge duplicate or highly similar chunks
  const uniqueMatches: typeof sortedMatches = [];
  const seen = new Set<string>();
  
  for (const m of sortedMatches) {
    // Basic deduplication normalized prefix check
    const normalized = m.chunkContent.trim().toLowerCase().substring(0, 100);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueMatches.push(m);
    }
  }

  const finalMatches = uniqueMatches.slice(0, limit);

  // Fallback: If no matches in cache, look up text content directly from database
  if (finalMatches.length === 0) {
    const textDocs = await prisma.document.findMany({
      where: { agentId },
      take: 5,
    });
    return textDocs.map(d => ({ chunkContent: d.content, score: 0.5, documentId: d.id }));
  }

  return finalMatches;
}

/**
 * Text chunker helper to prevent circular dependency
 */
export function chunkText(text: string, chunkSize = 400): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  
  for (const word of words) {
    currentChunk.push(word);
    if (currentChunk.join(' ').length >= chunkSize) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  return chunks;
}

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
  const cleanChunk = chunkContent
    ? chunkContent
        .replace(/\u0000/g, '')
        .replace(/\x00/g, '')
        .replace(/[\uD800-\uDFFF]/g, '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    : '';

  const vector = await getEmbedding(cleanChunk);
  
  // Store metadata in standard DB
  const emb = await prisma.embedding.create({
    data: {
      documentId,
      chunkContent: cleanChunk,
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

export function clearEmbeddingCache() {
  embeddingCache.length = 0;
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
  // Filter out CSS stylesheets, code blocks, or RSS feeds
  if (lower.includes('.wc-block') || lower.includes('@media') || lower.includes('display:none') || lower.includes('background:') || lower.includes('!important') || lower.includes('{margin:') || lower.includes('{padding:')) {
    return true;
  }
  // Check for common navigation chains in headers/footers
  if (lower.includes('home about services prices') || lower.includes('sign in get started') || lower.includes('wp plugin contact') || lower.includes('aichat home home') || lower.includes('solutions for your business get free consultation')) {
    return true;
  }
  // Filter out template lorem ipsum, old template services, and partner ticker text
  if (lower.includes('phasellus') || lower.includes('vestibulum') || lower.includes('60/billed') || lower.includes('bug monitoring') || lower.includes('1000+ partners') || lower.includes('smmhelper') || lower.includes('cryptochain') || lower.includes('frd company')) {
    return true;
  }
  // Filter out raw numbered index dumps (e.g. 01 Instant Website Setup 02 Automated RAG Search...)
  if (/01\s+[A-Za-z]+.*02\s+[A-Za-z]+/.test(content)) {
    return true;
  }
  // Filter out raw help form copy
  if (lower.includes('fill out the help form') || lower.includes('engineers will get back to you')) {
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
): Promise<{ chunkContent: string; score: number; documentId: string; url?: string | null; name?: string | null }[]> {
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

  let rawMatches: { chunkContent: string; score: number; documentId: string; url: string | null; name: string | null }[] = [];
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
        const chunkLower = (emb.chunkContent || '').toLowerCase();
        const qLower = query.toLowerCase();

        // Heavy boost for actual pricing plan chunks when querying pricing/plans/base model
        if ((qLower.includes('price') || qLower.includes('plan') || qLower.includes('cost') || qLower.includes('pricing') || qLower.includes('base model')) &&
            (chunkLower.includes('starter') || chunkLower.includes('professional') || chunkLower.includes('enterprise') || chunkLower.includes('$19') || chunkLower.includes('$49') || chunkLower.includes('base model'))) {
          score += 0.45;
        }
        
        // Heavy boost for feature queries (Smart RAG, Multi-LLM, Lead Capture, Embed, etc.)
        if ((qLower.includes('smart rag') || qLower.includes('rag training') || qLower.includes('rag') || qLower.includes('multi-llm') || qLower.includes('lead capture') || qLower.includes('embed') || qLower.includes('knowledge base')) &&
            (chunkLower.includes('smart rag') || chunkLower.includes('rag') || chunkLower.includes('multi-llm') || chunkLower.includes('lead capture') || chunkLower.includes('embed') || chunkLower.includes('knowledge base'))) {
          score += 0.45;
        }

        // Heavy boost for customize widget / model settings queries
        if ((qLower.includes('customize') || qLower.includes('widget settings') || qLower.includes('model settings') || qLower.includes('agent properties')) &&
            (chunkLower.includes('customize') || chunkLower.includes('widget') || chunkLower.includes('setting') || chunkLower.includes('model'))) {
          score += 0.45;
        }

        if (urlLower.includes('faq') || nameLower.includes('faq')) {
          score += 0.15;
        }
        if (urlLower.includes('services') || nameLower.includes('services')) {
          score += 0.1;
        }
        if (urlLower.includes('prices') || urlLower.includes('pricing') || nameLower.includes('prices') || nameLower.includes('pricing')) {
          score += 0.2;
        }
        // Heavy boost for contact and location chunks when querying contact/office info
        if ((qLower.includes('contact') || qLower.includes('reach') || qLower.includes('email') || qLower.includes('support') || qLower.includes('office') || qLower.includes('location') || qLower.includes('address')) &&
            (chunkLower.includes('contact') || chunkLower.includes('support') || chunkLower.includes('email') || chunkLower.includes('office') || chunkLower.includes('location') || urlLower.includes('contact') || nameLower.includes('contact'))) {
          score += 0.45;
        }

        if (urlLower.includes('about') || nameLower.includes('about')) {
          score += 0.05;
        }
        if (urlLower.includes('contact') || nameLower.includes('contact')) {
          score += 0.2;
        }
        
        return { chunkContent: emb.chunkContent, score, documentId: emb.documentId, url: emb.url || null, name: emb.name || null };
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
        
        return { chunkContent: emb.chunkContent, score, documentId: emb.documentId, url: doc.url || null, name: doc.name || null };
      });
  }

  // Exclude CSS, JS, feed, or plugin asset documents from search matches
  rawMatches = rawMatches.filter(m => {
    const urlL = (m.url || '').toLowerCase();
    const nameL = (m.name || '').toLowerCase();
    return !urlL.includes('.css') && !urlL.includes('.js') && !urlL.includes('/feed') && !urlL.includes('wp-content/plugins') && !nameL.includes('.css');
  });

  // Rank by similarity score
  const sortedMatches = rawMatches.sort((a, b) => b.score - a.score);

  // Minimum similarity threshold check (Requirement #7)
  const MIN_SCORE_THRESHOLD = 0.10;
  const filteredMatches = sortedMatches.filter(m => m.score >= MIN_SCORE_THRESHOLD);

  // Merge duplicate or highly similar chunks (Requirement #13 & token optimization)
  const uniqueMatches: { chunkContent: string; score: number; documentId: string; url: string | null; name: string | null }[] = [];
  const seen = new Set<string>();
  
  for (const m of filteredMatches) {
    const normalized = m.chunkContent.trim().toLowerCase().substring(0, 120);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueMatches.push(m);
    }
  }

  // Retrieve top 6-8 relevant chunks (Requirement #6)
  return uniqueMatches.slice(0, Math.min(limit, 8));
}

export function chunkText(text: string, chunkSize = 800, overlap = 150): string[] {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (!cleanText) return [];
  if (cleanText.length <= chunkSize) return [cleanText];

  const chunks: string[] = [];
  let start = 0;

  while (start < cleanText.length) {
    let end = start + chunkSize;
    if (end < cleanText.length) {
      const lastSpace = cleanText.lastIndexOf(' ', end);
      if (lastSpace > start + chunkSize * 0.6) {
        end = lastSpace;
      }
    } else {
      end = cleanText.length;
    }

    const chunk = cleanText.substring(start, end).trim();
    if (chunk.length > 20) {
      chunks.push(chunk);
    }

    if (end >= cleanText.length) break;
    start = Math.max(start + 1, end - overlap);
  }

  return chunks;
}

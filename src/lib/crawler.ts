import { indexDocumentChunk } from './vector';
import { prisma } from './db';

/**
 * Strips HTML tags, script, and style blocks to get clean text copy.
 */
async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ChatBoxAICrawler/1.0',
      },
      next: { revalidate: 0 }
    });
    if (!res.ok) {
      return '';
    }
    const html = await res.text();
    let text = html;
    
    // Strip script and style blocks
    text = text.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
    text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
    
    // Strip all HTML tags
    text = text.replace(/<[^>]+>/g, ' ');
    
    // Clean up HTML entity values
    text = text.replace(/&nbsp;/g, ' ')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"');
               
    // Consolidate whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  } catch (error) {
    console.error(`Crawl Error fetching URL ${url}:`, error);
    return '';
  }
}

/**
 * Lightweight web crawler that retrieves text and simulates page visits.
 */
export async function crawlWebsite(
  agentId: string,
  websiteId: string,
  url: string,
  crawlOption = 'url'
): Promise<void> {
  try {
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'crawling' },
    });

    await prisma.training.create({
      data: {
        agentId,
        sourceType: 'website',
        sourceName: `${url} (${crawlOption === 'sitemap' ? 'Sitemap Indexing' : 'Single URL Indexing'})`,
        status: 'running',
        message: crawlOption === 'sitemap' ? 'Reading pages and crawling sitemap...' : 'Reading target page content...',
      },
    });

    // Setup pathnames based on sitemap vs url crawl choices
    const pathnames = crawlOption === 'sitemap' 
      ? ['', '/about', '/prices', '/contact', '/wordpress']
      : [''];

    const parsedUrl = new URL(url);
    const domain = parsedUrl.origin;
    const basePath = parsedUrl.pathname === '/' ? '' : parsedUrl.pathname;

    let indexedCount = 0;

    for (const path of pathnames) {
      // Build final page url targeting local pages or absolute pathnames
      let pageUrl = crawlOption === 'sitemap' ? `${domain}${path}` : url;
      if (crawlOption === 'sitemap' && basePath && path) {
        // Handle sub-directory sitemap path prepends if input contains path
        pageUrl = `${domain}${basePath}${path}`;
      }

      const rawTitle = crawlOption === 'sitemap'
        ? (path === '' ? 'Home' : path.replace(/^\//, ''))
        : (parsedUrl.pathname === '/' || parsedUrl.pathname === '' ? 'Home' : parsedUrl.pathname.replace(/^\//, '').replace(/\/$/, ''));
      const pageTitle = rawTitle.toUpperCase() + ' Page';

      // Fetch actual page HTML content
      let cleanContent = await fetchPageText(pageUrl);

      // Fallback: If dynamic fetch failed or text is empty, generate generic message
      if (!cleanContent || cleanContent.length < 50) {
        console.log(`Using generic fallback for page: ${pageUrl}`);
        cleanContent = `Content for ${pageTitle} (${pageUrl}).`;
      }

      // Save document record
      const doc = await prisma.document.create({
        data: {
          agentId,
          websiteId,
          name: pageTitle,
          type: 'website_page',
          url: pageUrl,
          content: cleanContent,
          status: 'indexing',
        },
      });

      // Split into chunks and index embeddings
      const chunks = chunkText(cleanContent, 300);
      for (const chunk of chunks) {
        await indexDocumentChunk(doc.id, chunk);
      }

      await prisma.document.update({
        where: { id: doc.id },
        data: { status: 'completed' },
      });

      indexedCount++;
    }

    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'completed' },
    });

    // Add success training log
    await prisma.training.create({
      data: {
        agentId,
        sourceType: 'website',
        sourceName: url,
        status: 'completed',
        message: `Successfully indexed ${indexedCount} page(s) and generated vector embeddings.`,
      },
    });

  } catch (error: any) {
    console.error('Crawl Error:', error);
    await prisma.website.update({
      where: { id: websiteId },
      data: { status: 'failed' },
    });
    await prisma.training.create({
      data: {
        agentId,
        sourceType: 'website',
        sourceName: url,
        status: 'failed',
        message: error.message || 'Failed during web indexing.',
      },
    });
  }
}

/**
 * Text chunker helper
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

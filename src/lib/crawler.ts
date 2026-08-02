import { indexDocumentChunk } from './vector';
import { prisma } from './db';

export function sanitizeUtf8(str: string): string {
  if (!str) return '';
  return str
    .replace(/\u0000/g, '')
    .replace(/\x00/g, '')
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

/**
 * Strict Public Page Filter
 * Verifies that a URL and HTML content represent a publicly published, live website page.
 * Blocks WordPress backend, draft, private, preview, scheduled, or admin pages.
 */
export function isPublicUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    const pathname = url.pathname.toLowerCase();
    const search = url.search.toLowerCase();

    // 1. Block WordPress backend, admin, authentication, and internal paths
    const forbiddenPaths = [
      '/wp-admin',
      '/wp-login.php',
      '/wp-json',
      '/wp-includes',
      '/wp-content/plugins',
      '/wp-cron.php',
      '/wp-config',
      '/xmlrpc.php',
      '/admin',
      '/dashboard',
      '/login',
      '/register',
      '/signup',
      '/cart',
      '/checkout',
      '/my-account',
      '/logout',
      '/preview',
      '/feed'
    ];

    if (forbiddenPaths.some(p => pathname.startsWith(p) || pathname.includes(p))) {
      return false;
    }

    // 2. Block query parameters indicating draft, preview, edit, or scheduled post states
    const forbiddenQueryParams = [
      'preview=',
      'preview_id=',
      'draft=',
      'post_status=draft',
      'post_status=private',
      'post_status=future',
      'action=edit',
      'action=elementor'
    ];

    if (forbiddenQueryParams.some(param => search.includes(param))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function isPublicPageContent(html: string, headers?: Headers, status?: number): boolean {
  if (status && status !== 200) {
    return false; // Only crawl HTTP 200 OK pages
  }

  if (headers) {
    const xRobots = headers.get('x-robots-tag') || '';
    if (xRobots.toLowerCase().includes('noindex') || xRobots.toLowerCase().includes('none')) {
      return false;
    }
  }

  if (!html) return false;

  const lowerHtml = html.toLowerCase();

  // Check noindex meta tag
  if (/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["']/i.test(html)) {
    return false;
  }

  // Block WordPress draft / private / preview body markers or login forms
  if (
    lowerHtml.includes('post-status-draft') ||
    lowerHtml.includes('post-status-private') ||
    lowerHtml.includes('post-status-future') ||
    lowerHtml.includes('<form name="loginform"') ||
    lowerHtml.includes('you must be logged in') ||
    lowerHtml.includes('protected: ') ||
    lowerHtml.includes('private: ') ||
    lowerHtml.includes('this post is password protected')
  ) {
    return false;
  }

  return true;
}

/**
 * Strips HTML tags, script, and style blocks to get clean text copy.
 */
async function fetchPageRawHtmlAndText(url: string): Promise<{ html: string; text: string }> {
  try {
    if (!isPublicUrl(url)) {
      console.log(`[Crawler Filter] Ignored non-public / backend URL: ${url}`);
      return { html: '', text: '' };
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 0 }
    });
    if (!res.ok || res.status !== 200) {
      return { html: '', text: '' };
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('text/html') && !contentType.toLowerCase().includes('text/plain') && !contentType.toLowerCase().includes('application/xhtml+xml')) {
      return { html: '', text: '' };
    }

    const html = await res.text();

    if (!isPublicPageContent(html, res.headers, res.status)) {
      console.log(`[Crawler Filter] Ignored non-public / draft page content at URL: ${url}`);
      return { html: '', text: '' };
    }

    let text = html;
    
    // Strip script, style, header, nav, footer, and svg blocks
    text = text.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
    text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
    text = text.replace(/<svg[^>]*>([\s\S]*?)<\/svg>/gi, '');
    text = text.replace(/<header[^>]*>([\s\S]*?)<\/header>/gi, '');
    text = text.replace(/<nav[^>]*>([\s\S]*?)<\/nav>/gi, '');
    text = text.replace(/<footer[^>]*>([\s\S]*?)<\/footer>/gi, '');

    // Insert newlines for structural elements & accordion items so accordion questions and answers stay separated
    text = text.replace(/<(div|details|summary|dt|dd|button)[^>]*class=["'][^"']*accordion[^"']*["'][^>]*>/gi, '\n');
    text = text.replace(/<\/(div|p|h1|h2|h3|h4|h5|h6|li|tr|section|article|header|footer|summary|button|details|dt|dd)>/gi, '\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    
    // Strip remaining HTML tags
    text = text.replace(/<[^>]+>/g, ' ');
    
    // Clean up HTML entity values
    text = text.replace(/&nbsp;/g, ' ')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .replace(/&#x27;/g, "'");
               
    // Consolidate duplicate empty lines while preserving structural spacing
    text = text.split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n');
    return { html: sanitizeUtf8(html), text: sanitizeUtf8(text) };
  } catch (error) {
    console.error(`Crawl Error fetching URL ${url}:`, error);
    return { html: '', text: '' };
  }
}

/**
 * Extract internal domain page links from HTML href attributes
 */
function extractInternalLinks(html: string, baseUrlStr: string): string[] {
  const links = new Set<string>();
  try {
    const baseUrl = new URL(baseUrlStr);
    const hrefRegex = /href=["']([^"']+)["']/gi;
    let match;

    while ((match = hrefRegex.exec(html)) !== null) {
      const rawHref = match[1]?.trim();
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        continue;
      }

      // Ignore static assets, Next.js internal bundles, API endpoints, CSS, JS, feeds, and WP plugin files
      if (/\.(png|jpg|jpeg|gif|svg|ico|css|js|pdf|zip|tar|gz|xml|json|woff|woff2|eot|ttf|mp3|mp4|webp)$/i.test(rawHref) ||
          rawHref.toLowerCase().includes('/_next/') ||
          rawHref.toLowerCase().includes('/api/') ||
          rawHref.toLowerCase().includes('/wp-content/') ||
          rawHref.toLowerCase().includes('/wp-includes/') ||
          rawHref.toLowerCase().includes('/feed') ||
          rawHref.toLowerCase().includes('/wp-json')) {
        continue;
      }

      try {
        const absoluteUrl = new URL(rawHref, baseUrl.origin);
        // Only crawl links on the exact same domain
        if (absoluteUrl.hostname === baseUrl.hostname) {
          const cleanUrl = absoluteUrl.origin + (absoluteUrl.pathname.endsWith('/') ? absoluteUrl.pathname.slice(0, -1) : absoluteUrl.pathname);
          if (isPublicUrl(cleanUrl)) {
            links.add(cleanUrl || absoluteUrl.origin);
          }
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    }
  } catch (err) {
    console.error('Error extracting internal links:', err);
  }
  return Array.from(links);
}

/**
 * Helper to discover and parse XML sitemaps (sitemap.xml, sitemap_index.xml, page-sitemap.xml, etc.)
 */
export async function fetchSitemapUrls(domain: string): Promise<string[]> {
  const discoveredUrls = new Set<string>();
  const sitemapCandidates = [
    `${domain}/sitemap.xml`,
    `${domain}/sitemap_index.xml`,
    `${domain}/page-sitemap.xml`,
    `${domain}/wp-sitemap.xml`,
    `${domain}/post-sitemap.xml`,
    `${domain}/product-sitemap.xml`,
    `${domain}/portfolio-sitemap.xml`,
  ];

  const processedSitemaps = new Set<string>();
  const sitemapQueue = [...sitemapCandidates];

  while (sitemapQueue.length > 0) {
    const sitemapUrl = sitemapQueue.shift()!;
    if (processedSitemaps.has(sitemapUrl)) continue;
    processedSitemaps.add(sitemapUrl);

    try {
      const res = await fetch(sitemapUrl, {
        headers: { 'User-Agent': 'ChatBoxAICrawler/1.0' },
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;

      const xml = await res.text();
      const locMatches = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/gi)).map(m => m[1].trim());

      for (const targetLoc of locMatches) {
        if (targetLoc.endsWith('.xml') || targetLoc.includes('-sitemap')) {
          if (!processedSitemaps.has(targetLoc)) {
            sitemapQueue.push(targetLoc);
          }
        } else {
          try {
            const locObj = new URL(targetLoc);
            const cleanUrl = locObj.origin + (locObj.pathname.endsWith('/') ? locObj.pathname.slice(0, -1) : locObj.pathname);
            if (isPublicUrl(cleanUrl)) {
              discoveredUrls.add(cleanUrl || locObj.origin);
            }
          } catch {}
        }
      }
    } catch (e) {
      // Ignore sitemap fetch errors
    }
  }

  return Array.from(discoveredUrls);
}

/**
 * Dynamic Multi-Page Web Crawler that crawls all internal sections and pages of a website.
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
        sourceName: `${url} (Crawling Website Sections & Pages)`,
        status: 'running',
        message: 'Discovering and indexing all sections & internal pages...',
      },
    });

    const parsedUrl = new URL(url);
    const domain = parsedUrl.origin;
    
    // Initialize crawl queue with starting URL
    const toCrawl: string[] = [];
    if (isPublicUrl(url)) toCrawl.push(url);

    // Automatically attempt XML sitemap discovery to get complete website coverage
    try {
      const sitemapLinks = await fetchSitemapUrls(domain);
      for (const link of sitemapLinks) {
        if (!toCrawl.includes(link) && isPublicUrl(link)) {
          toCrawl.push(link);
        }
      }
      console.log(`[Sitemap Crawler] Discovered ${sitemapLinks.length} URLs from XML sitemaps for domain ${domain}`);
    } catch (sitemapErr) {
      console.error('[Sitemap Crawler Error]', sitemapErr);
    }

    const crawledUrls = new Set<string>();
    let indexedCount = 0;
    const MAX_PAGES_LIMIT = 100; // Increased limit to crawl up to 100 pages for complete coverage

    while (toCrawl.length > 0 && crawledUrls.size < MAX_PAGES_LIMIT) {
      const targetPageUrl = toCrawl.shift()!;
      const normalizedTargetUrl = targetPageUrl.replace(/\/$/, '');
      
      if (!isPublicUrl(normalizedTargetUrl)) continue;
      if (crawledUrls.has(normalizedTargetUrl)) continue;
      crawledUrls.add(normalizedTargetUrl);

      // Fetch page HTML & clean text
      const pageData = await fetchPageRawHtmlAndText(targetPageUrl);
      if (!pageData.text || pageData.text.length < 50) continue;

      // Extract new internal section links discovered on this page
      if (crawledUrls.size < MAX_PAGES_LIMIT) {
        const internalLinks = extractInternalLinks(pageData.html, targetPageUrl);
        for (const link of internalLinks) {
          const normLink = link.replace(/\/$/, '');
          if (!crawledUrls.has(normLink) && !toCrawl.includes(link)) {
            toCrawl.push(link);
          }
        }
      }

      // Generate page section title
      const urlObj = new URL(targetPageUrl);
      const pathName = urlObj.pathname === '/' || urlObj.pathname === '' ? 'Home' : urlObj.pathname.replace(/^\//, '').replace(/\/$/, '').replace(/-/g, ' ');
      const pageTitle = pathName.toUpperCase() + ' Page';

      // Save document record in database
      const doc = await prisma.document.create({
        data: {
          agentId,
          websiteId,
          name: pageTitle,
          type: 'website_page',
          url: targetPageUrl,
          content: pageData.text,
          status: 'indexing',
        },
      });

      // Split into 800-char chunks (150-char overlap) and index vector embeddings concurrently
      const chunks = chunkText(pageData.text, 800);
      await Promise.all(chunks.map(chunk => indexDocumentChunk(doc.id, chunk)));

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

export function chunkText(text: string, chunkSize = 800, overlap = 150): string[] {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (!cleanText) return [];
  if (cleanText.length <= chunkSize) return [cleanText];

  const chunks: string[] = [];
  let start = 0;

  while (start < cleanText.length) {
    let end = start + chunkSize;
    
    // Adjust end to boundary space if possible
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

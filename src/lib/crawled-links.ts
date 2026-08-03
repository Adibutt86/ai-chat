import { prisma } from '@/lib/db';

export interface CrawledPageLink {
  name: string;
  url: string;
}

export interface CrawledWebsiteLinks {
  bookNowUrl: string | null;
  contactUsUrl: string | null;
  allPages: CrawledPageLink[];
}

/**
 * Extract and detect dynamic website navigation links, Book Now page, and Contact Us page
 * from an agent's crawled website documents.
 */
export async function getCrawledWebsiteLinks(agentId: string): Promise<CrawledWebsiteLinks> {
  // 1. Fetch crawled website documents for this agent
  const docs = await prisma.document.findMany({
    where: {
      agentId,
      url: { not: null }
    },
    select: {
      name: true,
      url: true,
      content: true
    }
  });

  // 2. Fetch base website URL if registered
  const website = await prisma.website.findFirst({
    where: { agentId }
  });
  const baseUrl = website?.url ? website.url.replace(/\/$/, '') : '';

  const allPages: CrawledPageLink[] = [];
  const seenUrls = new Set<string>();

  let bookNowUrl: string | null = null;
  let contactUsUrl: string | null = null;

  for (const doc of docs) {
    if (!doc.url || doc.url.trim() === '') continue;

    // Resolve relative path to absolute URL if website base URL is available
    let fullUrl = doc.url.trim();
    if (fullUrl.startsWith('/') && baseUrl) {
      fullUrl = `${baseUrl}${fullUrl}`;
    }

    if (seenUrls.has(fullUrl)) continue;
    seenUrls.add(fullUrl);

    const cleanTitle = doc.name ? doc.name.replace(/\s*Page$/i, '').trim() : 'Page';
    allPages.push({
      name: cleanTitle || 'Page',
      url: fullUrl
    });

    const urlLower = fullUrl.toLowerCase();
    const nameLower = (doc.name || '').toLowerCase();

    // Detect Book Now / Booking / Reservation page URL
    if (!bookNowUrl) {
      if (
        urlLower.includes('/book') ||
        urlLower.includes('/schedule') ||
        urlLower.includes('/reservation') ||
        urlLower.includes('/appointment') ||
        urlLower.includes('booking') ||
        nameLower.includes('book') ||
        nameLower.includes('reservation') ||
        nameLower.includes('schedule') ||
        nameLower.includes('appointment')
      ) {
        bookNowUrl = fullUrl;
      }
    }

    // Detect Contact Us / Reach Us / Get In Touch page URL
    if (!contactUsUrl) {
      if (
        urlLower.includes('/contact') ||
        urlLower.includes('/reach') ||
        urlLower.includes('/get-in-touch') ||
        urlLower.includes('/support') ||
        urlLower.includes('/inquiry') ||
        urlLower.includes('/enquiry') ||
        nameLower.includes('contact') ||
        nameLower.includes('touch') ||
        nameLower.includes('reach')
      ) {
        contactUsUrl = fullUrl;
      }
    }
  }

  // Secondary fallback: search document text content for explicit booking / contact landing pages
  if (!bookNowUrl) {
    const bookDoc = docs.find(d => d.url && d.content && (
      d.content.toLowerCase().includes('book appointment') ||
      d.content.toLowerCase().includes('book now') ||
      d.content.toLowerCase().includes('schedule now') ||
      d.content.toLowerCase().includes('make a reservation')
    ));
    if (bookDoc && bookDoc.url) {
      let bUrl = bookDoc.url.trim();
      if (bUrl.startsWith('/') && baseUrl) bUrl = `${baseUrl}${bUrl}`;
      bookNowUrl = bUrl;
    }
  }

  if (!contactUsUrl) {
    const contactDoc = docs.find(d => d.url && d.content && (
      d.content.toLowerCase().includes('contact us') ||
      d.content.toLowerCase().includes('get in touch') ||
      d.content.toLowerCase().includes('reach out to us')
    ));
    if (contactDoc && contactDoc.url) {
      let cUrl = contactDoc.url.trim();
      if (cUrl.startsWith('/') && baseUrl) cUrl = `${baseUrl}${cUrl}`;
      contactUsUrl = cUrl;
    }
  }

  return {
    bookNowUrl,
    contactUsUrl,
    allPages
  };
}

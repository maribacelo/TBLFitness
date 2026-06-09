import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = process.env.SEO_DIST ?? 'dist';
const canonicalUrl = 'https://maribacelo.github.io/TBLFitness/';
const sitemapUrl = `${canonicalUrl}sitemap.xml`;

const read = (file) => readFileSync(join(distDir, file), 'utf8');
const html = read('index.html');
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const attr = (tag, name) => {
  const match = tag.match(new RegExp(`${name}=(["'])(.*?)\\1`, 'i'));
  return match?.[2] ?? '';
};

assert(/^<!doctype html>/i.test(html), 'Missing <!doctype html>.');
assert(/<html\b[^>]*lang=["']pt-PT["']/i.test(html), 'Missing html lang="pt-PT".');
assert(/<title>[^<]+<\/title>/i.test(html), 'Missing title element.');
assert(/<meta\s+name=["']description["']\s+content=["'][^"']+["']/i.test(html), 'Missing meta description.');
assert(/<meta\s+name=["']robots["']\s+content=["']index,\s*follow["']/i.test(html), 'Missing index, follow robots meta.');
assert(!/noindex|nofollow/i.test(html), 'Unexpected noindex/nofollow found.');
assert(new RegExp(`<link\\s+rel=["']canonical["']\\s+href=["']${canonicalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(html), 'Canonical URL mismatch.');
assert(/<meta\s+property=["']og:title["']/i.test(html), 'Missing og:title.');
assert(/<meta\s+property=["']og:description["']/i.test(html), 'Missing og:description.');
assert(/<meta\s+property=["']og:image["']/i.test(html), 'Missing og:image.');
assert(/<meta\s+name=["']twitter:card["']/i.test(html), 'Missing twitter card.');
assert((html.match(/<h1\b/gi) ?? []).length === 1, 'Expected exactly one h1.');

const htmlEnd = html.toLowerCase().lastIndexOf('</html>');
assert(htmlEnd !== -1, 'Missing closing </html>.');
assert(html.slice(htmlEnd + '</html>'.length).trim() === '', 'HTML contains content after </html>.');

const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];
for (const image of imageTags) {
  assert(attr(image, 'alt').trim().length > 0, `Image without alt text: ${image.slice(0, 120)}`);
}

const jsonLdBlocks = Array.from(html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
assert(jsonLdBlocks.length > 0, 'Missing JSON-LD structured data.');

for (const [, rawJson] of jsonLdBlocks) {
  try {
    const data = JSON.parse(rawJson.trim());
    const graph = Array.isArray(data['@graph']) ? data['@graph'] : [data];
    const localBusiness = graph.find((entry) => {
      const type = entry?.['@type'];
      return type === 'LocalBusiness'
        || type === 'HealthClub'
        || type === 'ExerciseGym'
        || (Array.isArray(type) && (type.includes('HealthClub') || type.includes('ExerciseGym') || type.includes('LocalBusiness')));
    });

    assert(Boolean(localBusiness), 'JSON-LD missing LocalBusiness-compatible entity.');
    if (localBusiness) {
      assert(localBusiness.name === 'TBL Studio & Personal Training by Bernardo Lima', 'JSON-LD business name mismatch.');
      assert(localBusiness.url === canonicalUrl, 'JSON-LD business URL mismatch.');
      assert(localBusiness.telephone === '+351969698944', 'JSON-LD telephone mismatch.');
      assert(localBusiness.address?.streetAddress === 'Av. Alm. Gago Coutinho', 'JSON-LD street address mismatch.');
      assert(localBusiness.address?.postalCode === '1000-015', 'JSON-LD postal code mismatch.');
      assert(localBusiness.address?.addressCountry === 'PT', 'JSON-LD country mismatch.');
      assert(typeof localBusiness.geo?.latitude === 'number', 'JSON-LD latitude should be numeric.');
      assert(typeof localBusiness.geo?.longitude === 'number', 'JSON-LD longitude should be numeric.');
      assert(Array.isArray(localBusiness.openingHoursSpecification), 'JSON-LD missing opening hours.');
    }
  } catch (error) {
    failures.push(`Invalid JSON-LD: ${error.message}`);
  }
}

assert(robots.includes(`Sitemap: ${sitemapUrl}`), 'robots.txt sitemap URL mismatch.');
assert(sitemap.includes(`<loc>${canonicalUrl}</loc>`), 'sitemap.xml canonical URL mismatch.');

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('SEO audit passed.');

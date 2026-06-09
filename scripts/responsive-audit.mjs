import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';

const baseUrl = process.env.RESPONSIVE_URL ?? 'http://127.0.0.1:4321/';
const chromePath = process.env.CHROME_PATH
  ?? (existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined);

const devices = [
  ['iPhone SE', 375, 667],
  ['iPhone XR', 414, 896],
  ['iPhone 12 Pro', 390, 844],
  ['iPhone 14 Pro Max', 430, 932],
  ['Pixel 7', 412, 915],
  ['Samsung Galaxy S8+', 360, 740],
  ['Samsung Galaxy S20 Ultra', 412, 915],
  ['iPad Mini', 768, 1024],
  ['iPad Air', 820, 1180],
  ['iPad Pro', 1024, 1366],
  ['Surface Pro 7', 912, 1368],
  ['Surface Duo', 540, 720],
  ['Galaxy Z Fold 5', 344, 882],
  ['Asus Zenbook Fold', 853, 1280],
  ['Samsung Galaxy A51/71', 412, 914],
  ['Nest Hub', 1024, 600],
  ['Nest Hub Max', 1280, 800],
];

mkdirSync('tmp/responsive', { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
  args: ['--no-sandbox'],
});

const auditViewport = async (page, label) => page.evaluate((currentLabel) => {
  const viewportWidth = window.innerWidth;
  const maxDocWidth = Math.max(
    document.documentElement.scrollWidth,
    document.body.scrollWidth,
  );

  const visibleElements = Array.from(document.body.querySelectorAll('*'))
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0
        && rect.height > 0
        && style.display !== 'none'
        && style.visibility !== 'hidden';
    });

  const offscreen = visibleElements
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        className: String(element.className || ''),
        id: element.id || '',
        text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ?? '',
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      };
    })
    .filter((item) => item.left < -1 || item.right > viewportWidth + 1);

  const clippedText = visibleElements
    .filter((element) => {
      const style = window.getComputedStyle(element);
      const allowsScroll = ['auto', 'scroll'].includes(style.overflowX);
      return !allowsScroll && element.scrollWidth > element.clientWidth + 2;
    })
    .map((element) => ({
      tag: element.tagName.toLowerCase(),
      className: String(element.className || ''),
      id: element.id || '',
      text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ?? '',
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    .filter((item) => item.clientWidth > 0);

  return {
    label: currentLabel,
    viewportWidth,
    docOverflow: Math.max(0, maxDocWidth - viewportWidth),
    offscreen,
    clippedText,
  };
}, label);

const ensureClean = (result) => {
  const hasProblems = result.docOverflow > 1
    || result.offscreen.length > 0
    || result.clippedText.length > 0;
  if (hasProblems) {
    throw new Error(JSON.stringify(result, null, 2));
  }
};

const run = async () => {
  const failures = [];

  for (const [name, width, height] of devices) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
      isMobile: width < 768,
      hasTouch: width < 1100,
    });

    try {
      await page.goto(baseUrl, { waitUntil: 'networkidle' });

      ensureClean(await auditViewport(page, `${name} initial`));

      const menuButton = page.locator('#menuToggle');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        ensureClean(await auditViewport(page, `${name} mobile menu`));
        await menuButton.click();
      }

      await page.locator('#quiz').scrollIntoViewIfNeeded();
      await page.locator('[data-formato]').first().click();
      ensureClean(await auditViewport(page, `${name} quiz contexto`));
      await page.locator('[data-contexto]').first().click();
      await page.locator('[data-contexto]').first().click();
      await page.locator('[data-contexto]').first().click();
      ensureClean(await auditViewport(page, `${name} quiz resultado`));

      await page.locator('#localizacao').scrollIntoViewIfNeeded();
      await page.locator('#localizacao iframe').waitFor({ state: 'visible' });
      ensureClean(await auditViewport(page, `${name} localizacao`));

      console.log(`ok ${name} ${width}x${height}`);
    } catch (error) {
      const screenshot = `tmp/responsive/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      await page.screenshot({ path: screenshot, fullPage: true });
      failures.push({ name, width, height, screenshot, error: error.message });
      console.error(`fail ${name} ${width}x${height}`);
    } finally {
      await page.close();
    }
  }

  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exitCode = 1;
  }
};

await run();
await browser.close();

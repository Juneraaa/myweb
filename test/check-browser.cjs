const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

(async () => {
  const base = process.env.SITE_URL || "http://127.0.0.1:4000";
  const browser = await chromium.launch();
  const failedLocal = [];
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 }, deviceScaleFactor: 1 });
  page.on("response", (r) => {
    // Cloudflare Speed Brain can decline speculative prefetches; the actual navigation still succeeds.
    const declinedPrefetch = r.request().headers()["sec-purpose"] === "prefetch" && r.headers()["cf-speculation-refused"];
    if (r.url().startsWith(base) && r.status() >= 400 && !declinedPrefetch) failedLocal.push(`${r.status()} ${r.url()}`);
  });
  fs.mkdirSync("output/playwright", { recursive: true });
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    await page.locator(".profile img").evaluate((img) => img.decode());
    const desktop = await page.evaluate(() => ({
      headingSize: parseFloat(getComputedStyle(document.querySelector("h1")).fontSize),
      bodyWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      imageWidth: document.querySelector(".profile img").naturalWidth,
      profileWidth: document.querySelector(".profile").getBoundingClientRect().width,
      profileFloat: getComputedStyle(document.querySelector(".profile")).cssFloat,
    }));
    assert(desktop.headingSize >= 30, "Theme typography is missing");
    assert(desktop.imageWidth > 0, "Profile image failed to load");
    assert(desktop.profileWidth <= 350 && desktop.profileFloat === "right", "Theme profile layout is missing");
    assert(desktop.bodyWidth <= desktop.viewportWidth, "Desktop overflows horizontally");
    await page.screenshot({ path: "output/playwright/home-desktop.png", fullPage: true });
    await page.goto(base + "/cv/", { waitUntil: "networkidle" });
    const cv = await page.locator("article").innerText();
    assert(cv.includes("复旦大学") && cv.includes("中国海洋大学"), "Education content is missing");
    await page.screenshot({ path: "output/playwright/education-desktop.png", fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base, { waitUntil: "networkidle" });
    await page.locator(".profile img").evaluate((img) => img.decode());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Mobile overflows horizontally");
    await page.screenshot({ path: "output/playwright/home-mobile.png", fullPage: true });
    await page.locator(".navbar-toggler").click();
    await page.locator('.nav-link[href="/cv/"]').waitFor({ state: "visible" });
    await page.locator('.nav-link[href="/cv/"]').click();
    await page.waitForURL("**/cv/");
    assert((await page.locator("article").innerText()).includes("复旦大学"), "Mobile navigation did not load the education page");
    assert.deepEqual(failedLocal, [], "Local assets returned HTTP errors");
    console.log(JSON.stringify({ desktop, mobileMenu: "passed", localAssetErrors: failedLocal, screenshots: "output/playwright" }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

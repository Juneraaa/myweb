const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve("_site");
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
const cv = fs.readFileSync(path.join(root, "cv/index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets/css/main.css"), "utf8");
assert(!/@use\s|@forward\s/.test(css), "Sass modules were not compiled; use Dart Sass (jekyll-sass-converter 3.x)");
assert(css.includes(".profile") && css.includes("body"), "Theme CSS is incomplete");
assert(home.includes("苏普军"), "Homepage must contain the owner's name");
assert(home.includes("集成电路"), "Homepage must contain the research area");
for (const school of ["复旦大学", "中国海洋大学"]) {
  assert(cv.includes(school), `Education page is missing ${school}`);
}
assert(home.includes("/assets/css/main.css"), "Missing theme stylesheet");
assert(home.includes("/assets/css/tailwind.css"), "Missing layout stylesheet");
assert(!home.includes('title="Rss icon"'), "Empty blog should not have an RSS link");
for (const html of [home, cv, fs.readFileSync(path.join(root, "404.html"), "utf8")]) {
  for (const match of html.matchAll(/(?:src|href)=["'](\/[^"'?#]*)(?:[?#][^"']*)?["']/g)) {
    const url = match[1];
    if (url.startsWith("//")) continue;
    const target = path.join(root, decodeURIComponent(url));
    const file = url.endsWith("/") ? path.join(target, "index.html") : target;
    assert(fs.existsSync(file), `Broken local URL: ${url}`);
  }
}
for (const demo of ["people", "teaching", "publications", "blog", "projects"]) {
  assert(!fs.existsSync(path.join(root, demo, "index.html")), `Demo page was published: ${demo}`);
}
console.log("Homepage, education, theme assets and local links passed.");

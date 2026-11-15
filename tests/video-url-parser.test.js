const fs = require("node:fs");
const vm = require("node:vm");
const cases = [
  ["https://www.youtube.com/watch?v=n-GdnNRrEGc", "youtube", "n-GdnNRrEGc"],
  ["https://m.youtube.com/watch?v=n-GdnNRrEGc&t=13s", "youtube", "n-GdnNRrEGc"],
  ["https://youtu.be/2UnGAE8j0iU?si=abc", "youtube", "2UnGAE8j0iU"],
  ["https://youtube.com/shorts/abc123", "youtube", "abc123"],
  ["https://youtube-nocookie.com/embed/xyz789", "youtube", "xyz789"],
  ["https://vimeo.com/123456789", "vimeo", "123456789"],
  ["https://vimeo.com/123456789/abcdef123456", "vimeo", "123456789", "abcdef123456"],
  ["https://player.vimeo.com/video/123456789?h=abcdef123456", "vimeo", "123456789", "abcdef123456"]
];
for (const [file, fnName, nextName] of [
  ["app.js", "function parsePortfolioVideo", "function showLightbox"],
  ["admin.js", "function parseVideoUrl", "async function getVimeoThumbnail"]
]) {
  const source = fs.readFileSync(file, "utf8");
  const start = source.indexOf(fnName);
  const end = source.indexOf(nextName, start);
  if (start < 0 || end < 0) throw new Error("Could not locate parser in " + file);
  const parser = source.slice(start, end);
  const context = { window: { URL }, URL: "https://qtwjrnicbkfuexnisivx.supabase.co" };
  vm.createContext(context);
  vm.runInContext(parser, context, { filename: file });
  const parse = context[file === "app.js" ? "parsePortfolioVideo" : "parseVideoUrl"];
  for (const [url, provider, id, hash] of cases) {
    const result = parse(url);
    if (!result || result.provider !== provider || result.id !== id || (hash && result.hash !== hash)) {
      throw new Error(file + " failed to parse " + url + ": " + JSON.stringify(result));
    }
    if (file === "admin.js" && !result.embed) throw new Error("Missing admin embed URL for " + url);
  }
}
console.log("Video URL parser tests passed for public site and admin.");

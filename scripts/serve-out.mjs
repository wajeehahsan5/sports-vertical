// Serves out/ like Hostinger does (folder → index.html, 404.html), to check a static build locally.
// npm run build && node scripts/serve-out.mjs   → http://localhost:3230
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".ttf": "font/ttf", ".woff2": "font/woff2", ".txt": "text/plain" };

createServer(async (req, res) => {
  let file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(await readFile(file));
  } catch {
    res.writeHead(404, { "content-type": TYPES[".html"] }).end(await readFile(path.join(root, "404.html")).catch(() => "Not found"));
  }
}).listen(Number(process.env.PORT) || 3230, () => console.log("out/ on http://localhost:" + (Number(process.env.PORT) || 3230)));

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const exportRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../out");
const port = Number(process.env.PORT ?? 4187);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`Invalid PORT: ${port}`);
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};
await stat(resolve(exportRoot, "index.html"));
createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  } catch {
    response.writeHead(400);
    response.end("Invalid URL");
    return;
  }
  const requestedFile = resolve(exportRoot, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!requestedFile.startsWith(`${exportRoot}${sep}`)) {
    response.writeHead(403);
    response.end();
    return;
  }
  let fileInfo;
  try {
    fileInfo = await stat(requestedFile);
  } catch (error) {
    if (error.code !== "ENOENT" && error.code !== "ENOTDIR") {
      console.error("Cannot read static file:", error.code);
      response.writeHead(500);
      response.end();
      return;
    }
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  if (!fileInfo.isFile()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": mimeTypes[extname(requestedFile)] ?? "application/octet-stream",
    "Content-Length": fileInfo.size,
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  const fileStream = createReadStream(requestedFile);
  fileStream.on("error", (error) => {
    console.error("Static file stream failed:", error.code);
    response.destroy(error);
  });
  fileStream.pipe(response);
}).listen(port, "127.0.0.1", () =>
  console.log(`WYRPLAY static homepage: http://127.0.0.1:${port}`),
);

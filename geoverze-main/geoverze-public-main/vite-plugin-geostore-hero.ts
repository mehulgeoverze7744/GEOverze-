import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

const VIDEO_URL = "/geostore-hero.mp4";
const VIDEO_RELATIVE = path.join("public", "geostore-hero.mp4");

function sendVideo(filePath: string, req: IncomingMessage, res: ServerResponse) {
  const stat = fs.statSync(filePath);
  const range = req.headers.range;
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-cache");

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? Number(match[1]) : 0;
    const end = match?.[2] ? Number(match[2]) : stat.size - 1;
    if (start >= stat.size || end >= stat.size || start > end) {
      res.statusCode = 416;
      res.setHeader("Content-Range", `bytes */${stat.size}`);
      res.end();
      return;
    }
    res.statusCode = 206;
    res.setHeader("Content-Range", `bytes ${start}-${end}/${stat.size}`);
    res.setHeader("Content-Length", String(end - start + 1));
    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Length", String(stat.size));
  fs.createReadStream(filePath).pipe(res);
}

function attachHeroMiddleware(server: ViteDevServer) {
  const filePath = path.resolve(server.config.root, VIDEO_RELATIVE);

  server.middlewares.use((req, res, next) => {
    const url = req.url?.split("?")[0] ?? "";
    if (url !== VIDEO_URL) {
      next();
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(`GEOstore hero video missing: ${filePath}`);
      return;
    }

    sendVideo(filePath, req, res);
  });
}

/** Serves public/geostore-hero.mp4 at /geostore-hero.mp4 before the SPA 404. */
export function geostoreHeroAssetPlugin(): Plugin {
  return {
    name: "geostore-hero-public-asset",
    configureServer: attachHeroMiddleware,
    configurePreviewServer: attachHeroMiddleware,
  };
}

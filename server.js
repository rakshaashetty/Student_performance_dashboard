const http = require("http");
const fs = require("fs");
const path = require("path");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const root = __dirname;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function resolvePath(urlPath) {
  const safePath = decodeURIComponent(urlPath.split("?")[0]);
  const target = safePath === "/" ? "/index.html" : safePath;
  const fullPath = path.normalize(path.join(root, target));

  if (!fullPath.startsWith(root)) {
    return null;
  }

  return fullPath;
}

const server = http.createServer((req, res) => {
  const fullPath = resolvePath(req.url || "/");

  if (!fullPath) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(fullPath, (statError, stats) => {
    if (statError) {
      send(res, 404, "Not found");
      return;
    }

    const filePath = stats.isDirectory() ? path.join(fullPath, "index.html") : fullPath;

    fs.readFile(filePath, (readError, data) => {
      if (readError) {
        send(res, 404, "Not found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      send(res, 200, data, contentTypes[ext] || "application/octet-stream");
    });
  });
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});

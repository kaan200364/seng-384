const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const publicDir = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  let filePath = path.join(publicDir, req.url === "/" ? "index.html" : req.url);

  if (!path.extname(filePath)) {
    filePath = path.join(publicDir, "index.html");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      fs.readFile(path.join(publicDir, "index.html"), (fallbackErr, fallbackContent) => {
        if (fallbackErr) {
          res.writeHead(500);
          res.end("Server Error");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(fallbackContent, "utf-8");
        }
      });
    } else {
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
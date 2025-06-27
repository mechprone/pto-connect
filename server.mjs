import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  let filePath = path.join(distPath, req.url === "/" ? "index.html" : req.url);
  
  // If file does not exist, serve index.html for client-side routing
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distPath, "index.html");
  }
  
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || "application/octet-stream";
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500);
      res.end("Server Error");
      return;
    }
    
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content, "utf-8");
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});

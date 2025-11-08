const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
    // Parse URL and remove query string
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    let requestPath = parsedUrl.pathname;
    
    // Default to index.html for root path
    if (requestPath === '/') {
        requestPath = '/index.html';
    }
    
    // Remove leading slash and construct file path
    const safePath = requestPath.replace(/^\/+/, '');
    const filePath = path.resolve(PUBLIC_DIR, safePath);
    
    // Security: Ensure the resolved path is within PUBLIC_DIR
    const relativePath = path.relative(PUBLIC_DIR, filePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 - Forbidden</h1>', 'utf-8');
        return;
    }
    
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            // Send binary files without encoding, text files with 'utf-8'
            if (contentType.startsWith('text/') || contentType === 'application/json' || contentType === 'application/javascript') {
                res.end(content, 'utf-8');
            } else {
                res.end(content);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`✓ OSINT Lab Pro server running on http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
});

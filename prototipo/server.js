// Servidor estático simples — só pra abrir o timer na rede local da academia.
// Uso: node server.js   → http://localhost:5173
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5173;
const TIPOS = {
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.ico':'image/x-icon',
};

http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const arquivo = path.join(__dirname, rel === '/' ? 'index.html' : rel);

  // não deixa sair da pasta do projeto
  if (!arquivo.startsWith(__dirname)) { res.writeHead(403).end('403'); return; }

  fs.readFile(arquivo, (err, buf) => {
    if (err) { res.writeHead(404, {'Content-Type':'text/plain'}).end('404'); return; }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(arquivo).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(buf);
  });
}).listen(PORT, () => console.log(`timer rodando em http://localhost:${PORT}`));

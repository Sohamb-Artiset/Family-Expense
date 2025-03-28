const http = require('http');
const httpProxy = require('http-proxy');
const cors = require('cors');

const proxy = httpProxy.createProxyServer({});

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const server = http.createServer((req, res) => {
  cors(corsOptions)(req, res, () => {
    proxy.web(req, res, {
      target: 'https://twkxcgljyfccaxhelmun.supabase.co',
      changeOrigin: true,
      secure: true,
    }, (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      });
      res.end('Proxy error occurred.');
    });
  });
});

proxy.on('proxyRes', function (proxyRes, req, res) {
  proxyRes.headers['Access-Control-Allow-Origin'] = '*';
});

const port = 3001;
server.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});

const path = require('path');
const fs = require('fs');
const YAML = require('yaml');

let config = {
  development: {},
};
if (fs.existsSync('./config.yml')) {
  config = fs.readFileSync('./config.yml', 'utf8');
  config = YAML.parse(config);
}

const manipulateResponse = (body) => {
  let response = body;

  if (['-nolr', '--no-livereload'].every((flag) => process.argv.indexOf(flag) !== -1)) {
    const liveReload = fs.readFileSync(path.join(__dirname, 'livereload.js'));

    response = response.replace('</head>', `<script>${liveReload}</script></head>`);
  }

  response = response.replace(/\/\/cdn.shopify.com\/s\/files\/[0-9]*\/[0-9]*\/[0-9]*\/[0-9]*\/[a-z]*\/[0-9]*\/assets\/([A-Za-z0-9_.]+)\?(v=)?[0-9]*/g, '/assets/$1');
  response = response.replace('</head>', '<style>#preview-bar-iframe { display: none; }</style></head>');

  return response;
};

module.exports = {
  open: `?preview_theme_id=${config.development.theme_id}`,

  devMiddleware: {
    publicPath: '/assets/',
  },

  static: {
    directory: path.join(config.development.directory ?? 'src', 'assets/'),
    watch: true,
  },

  proxy: {
    '**': {
      target: `https://${config.development.store}`,
      secure: false,
      changeOrigin: true,
      selfHandleResponse: true,
      onProxyReq: (proxyRes) => {
        proxyRes.setHeader('accept-encoding', 'identity');
      },
      onProxyRes: (proxyRes, req, res) => {
        if (req.path.startsWith('/assets/')) {
          try {
            const filePath = path.join(config.development.directory ?? 'src', req.path);
            res.end(fs.readFileSync(filePath));
          } catch (e) {
            res.statusCode = 404;
            res.end();
          }

          return;
        }

        res.statusCode = proxyRes.statusCode;

        Object.keys(proxyRes.headers).forEach((key) => {
          res.setHeader(key, proxyRes.headers[key]);
        });

        if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400) {
          const redirect = new URL(proxyRes.headers.location);
          redirect.protocol = 'http:';
          redirect.host = 'localhost:8080';

          res.setHeader('location', redirect.toString());
        }

        let body = [];
        proxyRes.on('data', (chunk) => {
          body.push(chunk);
        });

        proxyRes.on('end', () => {
          body = Buffer.concat(body).toString();
          res.end(manipulateResponse(body));
        });
      },
    },
  },
};

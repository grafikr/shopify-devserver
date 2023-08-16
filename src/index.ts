import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { Options } from "http-proxy-middleware";

module.exports = (env) => {
  let config = {
    development: {},
  };

  if (fs.existsSync('./config.yml')) {
    config = YAML.parse(fs.readFileSync('./config.yml', 'utf8'));
  }

  let target;
  try {
    target = new URL(config.development.store);
    target.protocol = 'https';
  } catch (e) {
    target = new URL(`https://${config.development.store}`);
  }

  const manipulateResponse = (body: string) => {
    let response = body;

    if (!env?.NOLR) {
      const liveReload = fs.readFileSync(path.join(__dirname, 'livereload.js'));

      response = response.replace('</head>', `<script>${liveReload}</script></head>`);
    }

    response = response.replace(/\/\/[A-Za-z0-9-_.]+\/cdn\/shop\/t\/[0-9]+\/assets\/([A-Za-z0-9_.]+)\?v=[0-9]*/g, '/assets/$1');

    return response;
  };

  return {
    open: `?preview_theme_id=${config.development.theme_id}&pb=0`,

    devMiddleware: {
      publicPath: '/assets/',
    },

    static: {
      directory: path.join(config.development.directory ?? 'src', 'assets/'),
      watch: true,
    },

    proxy: {
      '**': <Options>{
        target,
        secure: false,
        changeOrigin: true,
        selfHandleResponse: true,

        onProxyReq: (proxyRes) => {
          proxyRes.setHeader('accept-encoding', 'identity');
        },

        onProxyRes: (proxyRes, req, res) => {
          const REGEX = /\/cdn\/shop\/t\/[0-9]*\/assets\/([A-Za-z0-9_.]+)\?v=[0-9]*/;

          if (REGEX.test(req.path)) {
            try {
              const filePath = path.join(config.development.directory ?? 'src', 'assets', path.basename(req.path));
              res.end(fs.readFileSync(filePath));
            } catch (e) {
              // Do nothing
            }
          }

          if (proxyRes.statusCode) {
            res.statusCode = proxyRes.statusCode;
          }

          Object.keys(proxyRes.headers).forEach((key) => {
            const value = proxyRes.headers[key];

            if (value) {
              res.setHeader(key, value);
            }
          });

          if (proxyRes.headers.location) {
            const redirect = new URL(proxyRes.headers.location);
            redirect.protocol = 'http:';
            redirect.host = 'localhost:8080';

            res.setHeader('location', redirect.toString());
          }

          const body = new Array<any>();
          proxyRes.on('data', (chunk) => {
            body.push(chunk);
          });

          proxyRes.on('end', () => {
            res.end(manipulateResponse(
              Buffer.concat(body).toString()
            ));
          });
        },
      },
    },
  };
};
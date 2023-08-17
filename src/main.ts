import path from 'path';
import fs from 'fs';
import { Options } from 'http-proxy-middleware';
import getConfig from './util/get-config';
import getTarget from './util/get-target';

module.exports = () => {
  const config = getConfig();
  const target = getTarget(config);

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

        onProxyReq: (proxyReq) => {
          proxyReq.setHeader('accept-encoding', 'identity');
        },

        onProxyRes: (proxyRes, req, res) => {
          const REGEX = /\/cdn\/shop\/t\/[0-9]*\/assets\/([A-Za-z0-9_.]+)\?v=[0-9]*/;

          if (REGEX.test(req.path)) {
            try {
              const filePath = path.join(config.development.directory ?? 'src', 'assets', path.basename(req.path));
              res.end(fs.readFileSync(filePath));

              return;
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

          const chunks = new Array<any>();
          proxyRes.on('data', (chunk) => {
            chunks.push(chunk);
          });

          proxyRes.on('end', () => {
            const body = Buffer.concat(chunks)
              .toString()
              .replace(/\/\/[A-Za-z0-9-_.]+\/cdn\/shop\/t\/[0-9]+\/assets\/([A-Za-z0-9_.]+)\?v=[0-9]*/g, '/assets/$1');

            res.end(body);
          });
        },
      },
    },
  };
};

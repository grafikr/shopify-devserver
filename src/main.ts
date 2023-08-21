import path from 'path';
import { Configuration } from 'webpack-dev-server';
import getConfig from './util/get-config';
import getTarget from './util/get-target';

const config = getConfig();
const target = getTarget(config);

const devServer = <Configuration>{
  open: `?preview_theme_id=${config.theme_id}`,

  devMiddleware: {
    publicPath: '/assets/',
  },

  static: {
    directory: path.join(config.development.directory ?? 'src', 'assets/'),
    watch: true,
  },

  proxy: {
    '**': {
      target,
      secure: false,
      changeOrigin: true,
      selfHandleResponse: true,

      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('accept-encoding', 'identity');
      },

      onProxyRes: (proxyRes, _req, res) => {
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
            .replace(
              /\/\/[A-Za-z0-9-_.]+\/cdn\/shop\/t\/[0-9]+\/assets\/([A-Za-z0-9_.]+)\?v=[0-9]*/g,
              '/assets/$1',
            );

          res.end(body);
        });
      },
    },
  },
}

module.exports = devServer

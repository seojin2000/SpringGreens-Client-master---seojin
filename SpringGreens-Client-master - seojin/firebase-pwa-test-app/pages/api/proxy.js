import { createProxyMiddleware } from 'http-proxy-middleware';

export const config = {
  api: {
    bodyParser: false,
  },
}

const proxy = createProxyMiddleware({
  target: 'http://ec2-3-37-50-217.ap-northeast-2.compute.amazonaws.com:9090',
  changeOrigin: true,
});

export default function handler(req, res) {
  proxy(req, res, (result) => {
    if (result instanceof Error) {
      throw result;
    }
    throw new Error(`Request '${req.url}' is not proxied! We should never reach here!`);
  });
}
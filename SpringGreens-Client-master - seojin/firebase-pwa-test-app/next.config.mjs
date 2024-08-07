/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://ec2-3-37-50-217.ap-northeast-2.compute.amazonaws.com:9090/api/:path*',
      },
    ];
  },
  images: {
    domains: ['ec2-3-37-50-217.ap-northeast-2.compute.amazonaws.com'],
  },
};

export default nextConfig;
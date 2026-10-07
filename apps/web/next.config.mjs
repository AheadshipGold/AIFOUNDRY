/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ['@aifoundry/design-system'],
  async rewrites() {
    return [
      {
        source: '/api/:path((?!v1|auth).*)',
        destination: '/api/v1/:path',
      },
    ];
  },
};

export default config;

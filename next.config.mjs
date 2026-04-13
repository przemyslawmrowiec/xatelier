import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {unoptimized: true},
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default withNextIntl(nextConfig);
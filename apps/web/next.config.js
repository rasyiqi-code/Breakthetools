/** @type {import('next').NextConfig} */
const path = require('path')
const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {
  reactStrictMode: true,
  // Set outputFileTracingRoot untuk menghilangkan warning workspace root
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Jangan gunakan output standalone di Windows untuk menghindari error symlink
  // output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // External packages yang tidak bisa di-bundle (native modules)
  serverExternalPackages: ['canvas', 'jsdom', '@tobyg74/tiktok-api-dl', 'qrcode'],
  transpilePackages: [
    '@breaktools/text-tools',
    '@breaktools/image-tools',
    '@breaktools/generator-tools',
    '@breaktools/pdf-tools',
    '@breaktools/downloader-tools',
    '@breaktools/ui',
    '@breaktools/calculator-tools',
    '@breaktools/seo-tools',
    '@breaktools/fun-tools',
    '@breaktools/time-tools',
  ],
  webpack: (config, { isServer }) => {
    // Redirect next-intl ke react-intl wrapper untuk SEMUA build (server dan client)
    // Ini diperlukan karena tool packages di-transpile dan di-bundle
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-intl$': path.resolve(__dirname, './src/lib/react-intl-wrapper.tsx'), // $ berarti exact match, tidak termasuk sub-module
    }

    // Ignore canvas dan modul native lainnya untuk client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        crypto: false,
      }

      // Ignore @tobyg74/tiktok-api-dl di client-side (hanya digunakan di API routes)
      // Pastikan alias next-intl tetap ada untuk packages
      config.resolve.alias = {
        ...config.resolve.alias,
        '@tobyg74/tiktok-api-dl': false,
        canvas: false,
        'next-intl$': path.resolve(__dirname, './src/lib/react-intl-wrapper.tsx'),
      }
    }

    // Externalize canvas dan modul native untuk server-side
    if (isServer) {
      config.externals = config.externals || []
      // Pastikan canvas dan qrcode tidak di-bundle di server-side
      config.externals.push(({ request }, callback) => {
        if (request && (request.includes('canvas') || request === 'qrcode')) {
          return callback(null, `commonjs ${request}`)
        }
        callback()
      })
    }

    return config
  },
}

module.exports = withNextIntl(nextConfig)


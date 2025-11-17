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
  webpack: (config, { isServer, webpack }) => {
    // Redirect next-intl ke react-intl wrapper untuk SEMUA build (server dan client)
    // Ini diperlukan karena tool packages di-transpile dan di-bundle
    const reactIntlWrapperPath = path.resolve(__dirname, './src/lib/react-intl-wrapper.tsx')

    // Setup base alias
    if (!config.resolve.alias) {
      config.resolve.alias = {}
    }

    // Alias next-intl untuk packages (exact match dan tanpa $ untuk sub-modules)
    // Pastikan selalu di-set baik di server maupun client
    config.resolve.alias['next-intl$'] = reactIntlWrapperPath
    config.resolve.alias['next-intl'] = reactIntlWrapperPath

    // Gunakan NormalModuleReplacementPlugin untuk memastikan alias bekerja di production
    // Ini lebih robust daripada hanya menggunakan resolve.alias
    if (!config.plugins) {
      config.plugins = []
    }
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^next-intl$/,
        reactIntlWrapperPath
      )
    )

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
      // Pastikan alias next-intl tetap ada untuk packages (jangan di-overwrite)
      config.resolve.alias['@tobyg74/tiktok-api-dl'] = false
      config.resolve.alias['canvas'] = false

      // Pastikan alias next-intl tetap ada (jangan ter-overwrite)
      if (!config.resolve.alias['next-intl$']) {
        config.resolve.alias['next-intl$'] = reactIntlWrapperPath
      }
      if (!config.resolve.alias['next-intl']) {
        config.resolve.alias['next-intl'] = reactIntlWrapperPath
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


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
  // Optimasi kompresi
  compress: true,
  // Optimasi images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Optimasi headers untuk performa
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },
  // External packages yang tidak bisa di-bundle (native modules atau server-only)
  serverExternalPackages: [
    'canvas', 
    'jsdom', 
    '@tobyg74/tiktok-api-dl', 
    'qrcode',
    'exceljs',
    'jszip',
    '@xmldom/xmldom',
    'epub-gen',
    'ejs',
    'mammoth',
    'archiver',
    'fs-extra',
  ],
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
    '@breaktools/converter-tools',
  ],
  webpack: (config, { isServer }) => {
    // Ensure next-intl is resolved correctly for transpiled packages
    // This ensures all packages use the same instance of next-intl
    if (!config.resolve.alias) {
      config.resolve.alias = {}
    }

    // Resolve next-intl to the same module for all packages (both server and client)
    // This is critical for context sharing between transpiled packages and the main app
    // Use exact match ($) to only resolve 'next-intl' import, not sub-modules like 'next-intl/routing'
    try {
      const nextIntlPath = require.resolve('next-intl', { paths: [__dirname] })
      // Use $ for exact match - only matches 'next-intl' import, not 'next-intl/routing' etc
      config.resolve.alias['next-intl$'] = nextIntlPath
    } catch (e) {
      // Fallback: let webpack resolve it normally
      console.warn('Could not resolve next-intl path, using default resolution')
    }

    if (!isServer) {
      // For client-side, ensure next-intl is not externalized
      // and all packages can access the same context
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        crypto: false,
      }

      // Ignore @tobyg74/tiktok-api-dl di client-side (hanya digunakan di API routes)
      config.resolve.alias['@tobyg74/tiktok-api-dl'] = false
      config.resolve.alias['canvas'] = false

      // Ignore server-only packages di client-side (tidak kompatibel dengan webpack/browser)
      // Package-package ini menggunakan Node.js APIs yang tidak tersedia di browser
      const serverOnlyPackages = [
        'epub-gen',
        'ejs',
        'mammoth',
        'jszip',
        'exceljs',
        '@xmldom/xmldom',
        'archiver',
        'fs-extra',
        'graceful-fs',
        'fs.realpath',
        'glob',
        'rimraf',
        'jsonfile',
      ]
      
      serverOnlyPackages.forEach(pkg => {
        config.resolve.alias[pkg] = false
      })
      
      // jspdf dan jspdf-autotable bisa digunakan di client-side, jadi jangan di-ignore

      // Ensure next-intl is bundled for client-side
      // This allows all packages to share the same context instance
      // Note: Next.js sudah memiliki optimasi code splitting internal yang optimal
      // Dynamic imports di ToolPageClient akan otomatis membuat separate chunks
    }

    // Externalize canvas dan modul native untuk server-side
    // Tapi JANGAN externalize next-intl untuk memastikan context tersedia untuk transpiled packages
    if (isServer) {
      config.externals = config.externals || []
      // Externalize server-only packages untuk server-side
      const serverOnlyPatterns = [
        'canvas',
        'qrcode',
        'epub-gen',
        'ejs',
        'mammoth',
        'jszip',
        'exceljs',
        '@xmldom/xmldom',
        'archiver',
        'fs-extra',
        'graceful-fs',
        'fs.realpath',
        'glob',
        'rimraf',
        'jsonfile',
      ]
      
      config.externals.push(({ request }, callback) => {
        if (!request) {
          return callback()
        }
        
        // Check if request matches any server-only pattern
        const isServerOnly = serverOnlyPatterns.some(pattern => 
          request === pattern || request.includes(pattern)
        )
        
        if (isServerOnly) {
          return callback(null, `commonjs ${request}`)
        }
        
        // Jangan externalize next-intl untuk memastikan context tersedia
        if (request === 'next-intl') {
          return callback()
        }
        
        callback()
      })
    }

    return config
  },
}

module.exports = withNextIntl(nextConfig)


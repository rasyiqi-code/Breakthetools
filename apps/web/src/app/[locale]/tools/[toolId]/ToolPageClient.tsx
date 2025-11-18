'use client'

import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { toolCategories } from '@/config/tools'

// Lazy load ToolArticle untuk mengurangi initial bundle size
const ToolArticle = dynamic(() => import('@/components/seo/ToolArticle').then(mod => ({ default: mod.ToolArticle })), {
  ssr: false,
})

// Loading component untuk dynamic imports
const ToolLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
      <div className="text-neutral-500">Memuat tool...</div>
    </div>
  </div>
)

// Dynamic imports untuk semua tools - hanya load saat diperlukan
// Text Tools
const WordCounter = dynamic(() => import('@breaktools/text-tools').then(mod => ({ default: mod.WordCounter })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const TextDiff = dynamic(() => import('@breaktools/text-tools').then(mod => ({ default: mod.TextDiff })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const TextCleaner = dynamic(() => import('@breaktools/text-tools').then(mod => ({ default: mod.TextCleaner })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const CaseConverter = dynamic(() => import('@breaktools/text-tools').then(mod => ({ default: mod.CaseConverter })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const LoremIpsum = dynamic(() => import('@breaktools/text-tools').then(mod => ({ default: mod.LoremIpsum })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ReadabilityAnalyzer = dynamic(() => import('@breaktools/text-tools').then(mod => ({ default: mod.ReadabilityAnalyzer })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const KeywordDensity = dynamic(() => import('@breaktools/text-tools').then(mod => ({ default: mod.KeywordDensity })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const MarkdownEditor = dynamic(() => import('@breaktools/text-tools').then(mod => ({ default: mod.MarkdownEditor })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const RegexTester = dynamic(() => import('@breaktools/text-tools').then(mod => ({ default: mod.RegexTester })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const TextToSlug = dynamic(() => import('@breaktools/text-tools').then(mod => ({ default: mod.TextToSlug })), {
  ssr: false,
  loading: () => <ToolLoading />
})

// Generator Tools
const QRCodeGenerator = dynamic(() => import('@breaktools/generator-tools').then(mod => ({ default: mod.QRCodeGenerator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PasswordGenerator = dynamic(() => import('@breaktools/generator-tools').then(mod => ({ default: mod.PasswordGenerator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const UUIDGenerator = dynamic(() => import('@breaktools/generator-tools').then(mod => ({ default: mod.UUIDGenerator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const HashGenerator = dynamic(() => import('@breaktools/generator-tools').then(mod => ({ default: mod.HashGenerator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ColorPicker = dynamic(() => import('@breaktools/generator-tools').then(mod => ({ default: mod.ColorPicker })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const GradientGenerator = dynamic(() => import('@breaktools/generator-tools').then(mod => ({ default: mod.GradientGenerator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ColorConverter = dynamic(() => import('@breaktools/generator-tools').then(mod => ({ default: mod.ColorConverter })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const RandomNumberGenerator = dynamic(() => import('@breaktools/generator-tools').then(mod => ({ default: mod.RandomNumberGenerator })), {
  ssr: false,
  loading: () => <ToolLoading />
})

// Developer Tools (from UI package)
const JSONFormatter = dynamic(() => import('@breaktools/ui').then(mod => ({ default: mod.JSONFormatter })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const Base64EncoderDecoder = dynamic(() => import('@breaktools/ui').then(mod => ({ default: mod.Base64EncoderDecoder })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const URLEncoderDecoder = dynamic(() => import('@breaktools/ui').then(mod => ({ default: mod.URLEncoderDecoder })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const JWTDecoder = dynamic(() => import('@breaktools/ui').then(mod => ({ default: mod.JWTDecoder })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PasswordStrengthChecker = dynamic(() => import('@breaktools/ui').then(mod => ({ default: mod.PasswordStrengthChecker })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const AESEncryption = dynamic(() => import('@breaktools/ui').then(mod => ({ default: mod.AESEncryption })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const HTMLEntityEncoder = dynamic(() => import('@breaktools/ui').then(mod => ({ default: mod.HTMLEntityEncoder })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const CSVJSONConverter = dynamic(() => import('@breaktools/ui').then(mod => ({ default: mod.CSVJSONConverter })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const CodeFormatter = dynamic(() => import('@breaktools/ui').then(mod => ({ default: mod.CodeFormatter })), {
  ssr: false,
  loading: () => <ToolLoading />
})

// Calculator Tools
const KPRCalculator = dynamic(() => import('@breaktools/calculator-tools').then(mod => ({ default: mod.KPRCalculator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const BMICalculator = dynamic(() => import('@breaktools/calculator-tools').then(mod => ({ default: mod.BMICalculator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const DiscountCalculator = dynamic(() => import('@breaktools/calculator-tools').then(mod => ({ default: mod.DiscountCalculator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const CompoundInterestCalculator = dynamic(() => import('@breaktools/calculator-tools').then(mod => ({ default: mod.CompoundInterestCalculator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const AspectRatioCalculator = dynamic(() => import('@breaktools/calculator-tools').then(mod => ({ default: mod.AspectRatioCalculator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const AgeCalculator = dynamic(() => import('@breaktools/calculator-tools').then(mod => ({ default: mod.AgeCalculator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PercentageCalculator = dynamic(() => import('@breaktools/calculator-tools').then(mod => ({ default: mod.PercentageCalculator })), {
  ssr: false,
  loading: () => <ToolLoading />
})

// SEO Tools
const IPChecker = dynamic(() => import('@breaktools/seo-tools').then(mod => ({ default: mod.IPChecker })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const MetaTagExtractor = dynamic(() => import('@breaktools/seo-tools').then(mod => ({ default: mod.MetaTagExtractor })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const HTTPHeaderChecker = dynamic(() => import('@breaktools/seo-tools').then(mod => ({ default: mod.HTTPHeaderChecker })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const DNSChecker = dynamic(() => import('@breaktools/seo-tools').then(mod => ({ default: mod.DNSChecker })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const SiteDownChecker = dynamic(() => import('@breaktools/seo-tools').then(mod => ({ default: mod.SiteDownChecker })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const SSLChecker = dynamic(() => import('@breaktools/seo-tools').then(mod => ({ default: mod.SSLChecker })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const WHOISChecker = dynamic(() => import('@breaktools/seo-tools').then(mod => ({ default: mod.WHOISChecker })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const URLParser = dynamic(() => import('@breaktools/seo-tools').then(mod => ({ default: mod.URLParser })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const TechStackAnalyzer = dynamic(() => import('@breaktools/seo-tools').then(mod => ({ default: mod.TechStackAnalyzer })), {
  ssr: false,
  loading: () => <ToolLoading />
})

// Fun Tools
const FancyTextGenerator = dynamic(() => import('@breaktools/fun-tools').then(mod => ({ default: mod.FancyTextGenerator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const RandomNameGenerator = dynamic(() => import('@breaktools/fun-tools').then(mod => ({ default: mod.RandomNameGenerator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const CoinFlip = dynamic(() => import('@breaktools/fun-tools').then(mod => ({ default: mod.CoinFlip })), {
  ssr: false,
  loading: () => <ToolLoading />
})

// Time Tools
const StopwatchTimer = dynamic(() => import('@breaktools/time-tools').then(mod => ({ default: mod.StopwatchTimer })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const TimeZoneConverter = dynamic(() => import('@breaktools/time-tools').then(mod => ({ default: mod.TimeZoneConverter })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const DateCalculator = dynamic(() => import('@breaktools/time-tools').then(mod => ({ default: mod.DateCalculator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const UnixTimestampConverter = dynamic(() => import('@breaktools/time-tools').then(mod => ({ default: mod.UnixTimestampConverter })), {
  ssr: false,
  loading: () => <ToolLoading />
})

// PDF Tools
const PDFMerger = dynamic(() => import('@breaktools/pdf-tools').then(mod => ({ default: mod.PDFMerger })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PDFSplitter = dynamic(() => import('@breaktools/pdf-tools').then(mod => ({ default: mod.PDFSplitter })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PDFCompressor = dynamic(() => import('@breaktools/pdf-tools').then(mod => ({ default: mod.PDFCompressor })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ImageToPDF = dynamic(() => import('@breaktools/pdf-tools').then(mod => ({ default: mod.ImageToPDF })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PDFToImages = dynamic(() => import('@breaktools/pdf-tools').then(mod => ({ default: mod.PDFToImages })), {
  ssr: false,
  loading: () => <ToolLoading />
})

// Converter Tools
const PDFToText = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.PDFToText })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PDFToHTML = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.PDFToHTML })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PDFToExcel = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.PDFToExcel })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PDFToEPUB = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.PDFToEPUB })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PDFToWord = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.PDFToWord })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const WordToPDF = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.WordToPDF })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const WordToHTML = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.WordToHTML })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const WordToMarkdown = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.WordToMarkdown })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ExcelToPDF = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.ExcelToPDF })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ExcelToCSV = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.ExcelToCSV })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const CSVToExcel = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.CSVToExcel })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PowerPointToPDF = dynamic(() => import('@breaktools/converter-tools').then(mod => ({ default: mod.PowerPointToPDF })), {
  ssr: false,
  loading: () => <ToolLoading />
})

// Image Tools
const ImageConverter = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.ImageConverter })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ImageCompressor = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.ImageCompressor })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ImageResizer = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.ImageResizer })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ImageCropper = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.ImageCropper })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ColorPaletteExtractor = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.ColorPaletteExtractor })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const PlaceholderGenerator = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.PlaceholderGenerator })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ImageToASCII = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.ImageToASCII })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const SVGOptimizer = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.SVGOptimizer })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const BackgroundRemover = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.BackgroundRemover })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ColorPsychology = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.ColorPsychology })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const DigitalRuler = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.DigitalRuler })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const WatermarkMaker = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.WatermarkMaker })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const ImageRotatorFlip = dynamic(() => import('@breaktools/image-tools').then(mod => ({ default: mod.ImageRotatorFlip })), {
  ssr: false,
  loading: () => <ToolLoading />
})

// Downloader Tools
const YouTubeDownloader = dynamic(() => import('@breaktools/downloader-tools').then(mod => ({ default: mod.YouTubeDownloader })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const TikTokDownloader = dynamic(() => import('@breaktools/downloader-tools').then(mod => ({ default: mod.TikTokDownloader })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const InstagramDownloader = dynamic(() => import('@breaktools/downloader-tools').then(mod => ({ default: mod.InstagramDownloader })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const TwitterDownloader = dynamic(() => import('@breaktools/downloader-tools').then(mod => ({ default: mod.TwitterDownloader })), {
  ssr: false,
  loading: () => <ToolLoading />
})
const FacebookDownloader = dynamic(() => import('@breaktools/downloader-tools').then(mod => ({ default: mod.FacebookDownloader })), {
  ssr: false,
  loading: () => <ToolLoading />
})

// Mapping semua tool components
const toolComponents: Record<string, React.ComponentType> = {
  // Text Tools
  'word-counter': WordCounter,
  'text-diff': TextDiff,
  'text-cleaner': TextCleaner,
  'case-converter': CaseConverter,
  'lorem-ipsum': LoremIpsum,
  'readability-analyzer': ReadabilityAnalyzer,
  'keyword-density': KeywordDensity,
  'markdown-editor': MarkdownEditor,
  'regex-tester': RegexTester,
  'text-to-slug': TextToSlug,

  // Generator Tools
  'qr-code': QRCodeGenerator,
  'password-generator': PasswordGenerator,
  'uuid-generator': UUIDGenerator,
  'hash-generator': HashGenerator,
  'color-picker': ColorPicker,
  'gradient-generator': GradientGenerator,
  'color-converter': ColorConverter,
  'random-number-generator': RandomNumberGenerator,

  // Developer Tools
  'json-formatter': JSONFormatter,
  'base64-encoder': Base64EncoderDecoder,
  'url-encoder': URLEncoderDecoder,
  'jwt-decoder': JWTDecoder,
  'password-strength': PasswordStrengthChecker,
  'aes-encryption': AESEncryption,
  'html-entity-encoder': HTMLEntityEncoder,
  'csv-json-converter': CSVJSONConverter,
  'code-formatter': CodeFormatter,

  // Calculator Tools
  'kpr-calculator': KPRCalculator,
  'bmi-calculator': BMICalculator,
  'discount-calculator': DiscountCalculator,
  'compound-interest': CompoundInterestCalculator,
  'aspect-ratio': AspectRatioCalculator,
  'age-calculator': AgeCalculator,
  'percentage-calculator': PercentageCalculator,

  // SEO Tools
  'ip-checker': IPChecker,
  'meta-extractor': MetaTagExtractor,
  'http-header': HTTPHeaderChecker,
  'dns-checker': DNSChecker,
  'site-down-checker': SiteDownChecker,
  'ssl-checker': SSLChecker,
  'whois-checker': WHOISChecker,
  'url-parser': URLParser,
  'tech-stack-analyzer': TechStackAnalyzer,

  // Fun Tools
  'fancy-text': FancyTextGenerator,
  'random-name': RandomNameGenerator,
  'coin-flip': CoinFlip,

  // Time Tools
  'stopwatch-timer': StopwatchTimer,
  'time-zone': TimeZoneConverter,
  'date-calculator': DateCalculator,
  'unix-timestamp-converter': UnixTimestampConverter,

  // Image Tools
  'image-converter': ImageConverter,
  'image-compressor': ImageCompressor,
  'image-resizer': ImageResizer,
  'image-cropper': ImageCropper,
  'color-palette': ColorPaletteExtractor,
  'placeholder-generator': PlaceholderGenerator,
  'image-to-ascii': ImageToASCII,
  'svg-optimizer': SVGOptimizer,
  'background-remover': BackgroundRemover,
  'color-psychology': ColorPsychology,
  'digital-ruler': DigitalRuler,
  'watermark-maker': WatermarkMaker,
  'image-rotator-flip': ImageRotatorFlip,

  // PDF Tools
  'pdf-merger': PDFMerger,
  'pdf-splitter': PDFSplitter,
  'pdf-compressor': PDFCompressor,
  'image-to-pdf': ImageToPDF,
  'pdf-to-images': PDFToImages,

  // Converter Tools
  'pdf-to-text': PDFToText,
  'pdf-to-html': PDFToHTML,
  'pdf-to-excel': PDFToExcel,
  'pdf-to-epub': PDFToEPUB,
  'pdf-to-word': PDFToWord,
  'word-to-pdf': WordToPDF,
  'word-to-html': WordToHTML,
  'word-to-markdown': WordToMarkdown,
  'excel-to-pdf': ExcelToPDF,
  'excel-to-csv': ExcelToCSV,
  'csv-to-excel': CSVToExcel,
  'powerpoint-to-pdf': PowerPointToPDF,

  // Downloader Tools
  'youtube-downloader': YouTubeDownloader,
  'tiktok-downloader': TikTokDownloader,
  'instagram-downloader': InstagramDownloader,
  'twitter-downloader': TwitterDownloader,
  'facebook-downloader': FacebookDownloader,
}

export function ToolPageClient() {
  const [mounted, setMounted] = useState(false)
  const params = useParams()
  const toolId = params?.toolId as string

  // Pastikan hanya render setelah client-side mount untuk menghindari error saat static generation
  useEffect(() => {
    setMounted(true)
  }, [])

  const ToolComponent = toolComponents[toolId]

  if (!ToolComponent) {
    notFound()
  }

  const allTools = toolCategories.flatMap(cat => cat.tools)
  const tool = allTools.find(t => t.id === toolId)

  // Render placeholder saat static generation atau sebelum mount
  if (!mounted) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-neutral-500">Loading...</div>
        </div>
      </div>
    )
  }

  // Render ToolComponent setelah mount karena:
  // 1. page.tsx adalah Client Component ('use client')
  // 2. IntlProvider tersedia di parent layout setelah mount
  // 3. Client Component dalam tree yang sama dengan provider bisa akses context
  return (
    <div className="animate-in fade-in duration-300">
      <ToolComponent />
      {tool && (
        <ToolArticle toolId={toolId} toolName={tool.name} />
      )}
    </div>
  )
}


'use client'

import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import dynamicImport from 'next/dynamic'
import { toolCategories } from '@/config/tools'
import { ToolArticle } from '@/components/seo/ToolArticle'

// Text Tools
import {
  WordCounter,
  TextDiff,
  TextCleaner,
  CaseConverter,
  LoremIpsum,
  ReadabilityAnalyzer,
  KeywordDensity,
  MarkdownEditor,
  RegexTester,
  TextToSlug
} from '@breaktools/text-tools'

// Generator Tools
import {
  PasswordGenerator,
  UUIDGenerator,
  HashGenerator,
  ColorPicker,
  GradientGenerator,
  ColorConverter,
  RandomNumberGenerator
} from '@breaktools/generator-tools'
// Dynamic import untuk QRCodeGenerator karena menggunakan qrcode package yang memerlukan canvas
const QRCodeGenerator = dynamicImport(
  () => import('@breaktools/generator-tools').then(mod => ({ default: mod.QRCodeGenerator })),
  { ssr: false }
)

// Developer Tools (from UI package)
import {
  JSONFormatter,
  Base64EncoderDecoder,
  URLEncoderDecoder,
  JWTDecoder,
  PasswordStrengthChecker,
  AESEncryption,
  HTMLEntityEncoder,
  CSVJSONConverter,
  CodeFormatter
} from '@breaktools/ui'

// Calculator Tools
import {
  KPRCalculator,
  BMICalculator,
  DiscountCalculator,
  CompoundInterestCalculator,
  AspectRatioCalculator,
  AgeCalculator,
  PercentageCalculator
} from '@breaktools/calculator-tools'

// SEO Tools
import {
  IPChecker,
  MetaTagExtractor,
  HTTPHeaderChecker,
  DNSChecker,
  SiteDownChecker,
  SSLChecker,
  WHOISChecker,
  URLParser,
  TechStackAnalyzer
} from '@breaktools/seo-tools'

// Fun Tools
import {
  FancyTextGenerator,
  RandomNameGenerator,
  CoinFlip
} from '@breaktools/fun-tools'

// Time Tools
import {
  StopwatchTimer,
  TimeZoneConverter,
  DateCalculator,
  UnixTimestampConverter
} from '@breaktools/time-tools'

// PDF Tools
import {
  PDFMerger,
  PDFSplitter,
  PDFCompressor,
  ImageToPDF,
  PDFToImages
} from '@breaktools/pdf-tools'

// Image Tools
import {
  ImageConverter,
  ImageCompressor,
  ImageResizer,
  ImageCropper,
  ColorPaletteExtractor,
  PlaceholderGenerator,
  ImageToASCII,
  SVGOptimizer,
  BackgroundRemover,
  ColorPsychology,
  DigitalRuler,
  WatermarkMaker,
  ImageRotatorFlip
} from '@breaktools/image-tools'

// Downloader Tools
import {
  YouTubeDownloader,
  TikTokDownloader,
  InstagramDownloader,
  TwitterDownloader,
  FacebookDownloader
} from '@breaktools/downloader-tools'

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
  'qrcode-generator': QRCodeGenerator,
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


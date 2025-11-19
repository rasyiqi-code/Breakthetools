'use client'

import { notFound } from 'next/navigation'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { toolCategories } from '@/config/tools'
import { ErrorBoundary } from '@/components/ErrorBoundary'

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

// Helper function untuk safe dynamic import dengan error handling
const safeDynamicImport = (importFn: () => Promise<any>, componentName: string) => {
  return dynamic(
    () =>
      importFn()
        .then((mod) => {
          if (!mod || !mod[componentName]) {
            throw new Error(`Component ${componentName} not found in module`)
          }
          return { default: mod[componentName] }
        })
        .catch((error) => {
          console.error(`Error loading ${componentName}:`, error)
          // Return a fallback component that shows error
          return {
            default: () => (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="text-4xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Failed to load tool
                  </h3>
                  <p className="text-neutral-600">
                    {error.message || 'An error occurred while loading this tool'}
                  </p>
                </div>
              </div>
            ),
          }
        }),
    {
      ssr: false,
      loading: () => <ToolLoading />,
    }
  )
}

// Dynamic imports untuk semua tools - hanya load saat diperlukan
// Text Tools
const WordCounter = safeDynamicImport(
  () => import('@breaktools/text-tools'),
  'WordCounter'
)
const TextDiff = safeDynamicImport(() => import('@breaktools/text-tools'), 'TextDiff')
const TextCleaner = safeDynamicImport(() => import('@breaktools/text-tools'), 'TextCleaner')
const CaseConverter = safeDynamicImport(() => import('@breaktools/text-tools'), 'CaseConverter')
const LoremIpsum = safeDynamicImport(() => import('@breaktools/text-tools'), 'LoremIpsum')
const ReadabilityAnalyzer = safeDynamicImport(() => import('@breaktools/text-tools'), 'ReadabilityAnalyzer')
const KeywordDensity = safeDynamicImport(() => import('@breaktools/text-tools'), 'KeywordDensity')
const MarkdownEditor = safeDynamicImport(() => import('@breaktools/text-tools'), 'MarkdownEditor')
const RegexTester = safeDynamicImport(() => import('@breaktools/text-tools'), 'RegexTester')
const TextToSlug = safeDynamicImport(() => import('@breaktools/text-tools'), 'TextToSlug')

// Generator Tools
const QRCodeGenerator = safeDynamicImport(() => import('@breaktools/generator-tools'), 'QRCodeGenerator')
const PasswordGenerator = safeDynamicImport(() => import('@breaktools/generator-tools'), 'PasswordGenerator')
const UUIDGenerator = safeDynamicImport(() => import('@breaktools/generator-tools'), 'UUIDGenerator')
const HashGenerator = safeDynamicImport(() => import('@breaktools/generator-tools'), 'HashGenerator')
const ColorPicker = safeDynamicImport(() => import('@breaktools/generator-tools'), 'ColorPicker')
const GradientGenerator = safeDynamicImport(() => import('@breaktools/generator-tools'), 'GradientGenerator')
const ColorConverter = safeDynamicImport(() => import('@breaktools/generator-tools'), 'ColorConverter')
const RandomNumberGenerator = safeDynamicImport(() => import('@breaktools/generator-tools'), 'RandomNumberGenerator')

// Developer Tools (from UI package)
const JSONFormatter = safeDynamicImport(() => import('@breaktools/ui'), 'JSONFormatter')
const Base64EncoderDecoder = safeDynamicImport(() => import('@breaktools/ui'), 'Base64EncoderDecoder')
const URLEncoderDecoder = safeDynamicImport(() => import('@breaktools/ui'), 'URLEncoderDecoder')
const JWTDecoder = safeDynamicImport(() => import('@breaktools/ui'), 'JWTDecoder')
const PasswordStrengthChecker = safeDynamicImport(() => import('@breaktools/ui'), 'PasswordStrengthChecker')
const AESEncryption = safeDynamicImport(() => import('@breaktools/ui'), 'AESEncryption')
const HTMLEntityEncoder = safeDynamicImport(() => import('@breaktools/ui'), 'HTMLEntityEncoder')
const CSVJSONConverter = safeDynamicImport(() => import('@breaktools/ui'), 'CSVJSONConverter')
const CodeFormatter = safeDynamicImport(() => import('@breaktools/ui'), 'CodeFormatter')

// Calculator Tools
const KPRCalculator = safeDynamicImport(() => import('@breaktools/calculator-tools'), 'KPRCalculator')
const BMICalculator = safeDynamicImport(() => import('@breaktools/calculator-tools'), 'BMICalculator')
const DiscountCalculator = safeDynamicImport(() => import('@breaktools/calculator-tools'), 'DiscountCalculator')
const CompoundInterestCalculator = safeDynamicImport(() => import('@breaktools/calculator-tools'), 'CompoundInterestCalculator')
const AspectRatioCalculator = safeDynamicImport(() => import('@breaktools/calculator-tools'), 'AspectRatioCalculator')
const AgeCalculator = safeDynamicImport(() => import('@breaktools/calculator-tools'), 'AgeCalculator')
const PercentageCalculator = safeDynamicImport(() => import('@breaktools/calculator-tools'), 'PercentageCalculator')

// SEO Tools
const IPChecker = safeDynamicImport(() => import('@breaktools/seo-tools'), 'IPChecker')
const MetaTagExtractor = safeDynamicImport(() => import('@breaktools/seo-tools'), 'MetaTagExtractor')
const HTTPHeaderChecker = safeDynamicImport(() => import('@breaktools/seo-tools'), 'HTTPHeaderChecker')
const DNSChecker = safeDynamicImport(() => import('@breaktools/seo-tools'), 'DNSChecker')
const SiteDownChecker = safeDynamicImport(() => import('@breaktools/seo-tools'), 'SiteDownChecker')
const SSLChecker = safeDynamicImport(() => import('@breaktools/seo-tools'), 'SSLChecker')
const WHOISChecker = safeDynamicImport(() => import('@breaktools/seo-tools'), 'WHOISChecker')
const URLParser = safeDynamicImport(() => import('@breaktools/seo-tools'), 'URLParser')
const TechStackAnalyzer = safeDynamicImport(() => import('@breaktools/seo-tools'), 'TechStackAnalyzer')

// Fun Tools
const FancyTextGenerator = safeDynamicImport(() => import('@breaktools/fun-tools'), 'FancyTextGenerator')
const RandomNameGenerator = safeDynamicImport(() => import('@breaktools/fun-tools'), 'RandomNameGenerator')
const CoinFlip = safeDynamicImport(() => import('@breaktools/fun-tools'), 'CoinFlip')

// Time Tools
const StopwatchTimer = safeDynamicImport(() => import('@breaktools/time-tools'), 'StopwatchTimer')
const TimeZoneConverter = safeDynamicImport(() => import('@breaktools/time-tools'), 'TimeZoneConverter')
const DateCalculator = safeDynamicImport(() => import('@breaktools/time-tools'), 'DateCalculator')
const UnixTimestampConverter = safeDynamicImport(() => import('@breaktools/time-tools'), 'UnixTimestampConverter')

// PDF Tools
const PDFMerger = safeDynamicImport(() => import('@breaktools/pdf-tools'), 'PDFMerger')
const PDFSplitter = safeDynamicImport(() => import('@breaktools/pdf-tools'), 'PDFSplitter')
const PDFCompressor = safeDynamicImport(() => import('@breaktools/pdf-tools'), 'PDFCompressor')
const ImageToPDF = safeDynamicImport(() => import('@breaktools/pdf-tools'), 'ImageToPDF')
const PDFToImages = safeDynamicImport(() => import('@breaktools/pdf-tools'), 'PDFToImages')

// Converter Tools
const PDFToText = safeDynamicImport(() => import('@breaktools/converter-tools'), 'PDFToText')
const PDFToHTML = safeDynamicImport(() => import('@breaktools/converter-tools'), 'PDFToHTML')
const PDFToExcel = safeDynamicImport(() => import('@breaktools/converter-tools'), 'PDFToExcel')
const PDFToEPUB = safeDynamicImport(() => import('@breaktools/converter-tools'), 'PDFToEPUB')
const PDFToWord = safeDynamicImport(() => import('@breaktools/converter-tools'), 'PDFToWord')
const WordToPDF = safeDynamicImport(() => import('@breaktools/converter-tools'), 'WordToPDF')
const WordToHTML = safeDynamicImport(() => import('@breaktools/converter-tools'), 'WordToHTML')
const WordToMarkdown = safeDynamicImport(() => import('@breaktools/converter-tools'), 'WordToMarkdown')
const ExcelToPDF = safeDynamicImport(() => import('@breaktools/converter-tools'), 'ExcelToPDF')
const ExcelToCSV = safeDynamicImport(() => import('@breaktools/converter-tools'), 'ExcelToCSV')
const CSVToExcel = safeDynamicImport(() => import('@breaktools/converter-tools'), 'CSVToExcel')
const PowerPointToPDF = safeDynamicImport(() => import('@breaktools/converter-tools'), 'PowerPointToPDF')

// Image Tools
const ImageConverter = safeDynamicImport(() => import('@breaktools/image-tools'), 'ImageConverter')
const ImageCompressor = safeDynamicImport(() => import('@breaktools/image-tools'), 'ImageCompressor')
const ImageResizer = safeDynamicImport(() => import('@breaktools/image-tools'), 'ImageResizer')
const ImageCropper = safeDynamicImport(() => import('@breaktools/image-tools'), 'ImageCropper')
const ColorPaletteExtractor = safeDynamicImport(() => import('@breaktools/image-tools'), 'ColorPaletteExtractor')
const PlaceholderGenerator = safeDynamicImport(() => import('@breaktools/image-tools'), 'PlaceholderGenerator')
const ImageToASCII = safeDynamicImport(() => import('@breaktools/image-tools'), 'ImageToASCII')
const SVGOptimizer = safeDynamicImport(() => import('@breaktools/image-tools'), 'SVGOptimizer')
const BackgroundRemover = safeDynamicImport(() => import('@breaktools/image-tools'), 'BackgroundRemover')
const ColorPsychology = safeDynamicImport(() => import('@breaktools/image-tools'), 'ColorPsychology')
const DigitalRuler = safeDynamicImport(() => import('@breaktools/image-tools'), 'DigitalRuler')
const WatermarkMaker = safeDynamicImport(() => import('@breaktools/image-tools'), 'WatermarkMaker')
const ImageRotatorFlip = safeDynamicImport(() => import('@breaktools/image-tools'), 'ImageRotatorFlip')

// Downloader Tools
const YouTubeDownloader = safeDynamicImport(() => import('@breaktools/downloader-tools'), 'YouTubeDownloader')
const TikTokDownloader = safeDynamicImport(() => import('@breaktools/downloader-tools'), 'TikTokDownloader')
const InstagramDownloader = safeDynamicImport(() => import('@breaktools/downloader-tools'), 'InstagramDownloader')
const TwitterDownloader = safeDynamicImport(() => import('@breaktools/downloader-tools'), 'TwitterDownloader')
const FacebookDownloader = safeDynamicImport(() => import('@breaktools/downloader-tools'), 'FacebookDownloader')

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
  const params = useParams()
  const toolId = params?.toolId as string

  const ToolComponent = toolComponents[toolId]

  if (!ToolComponent) {
    notFound()
  }

  const allTools = toolCategories.flatMap(cat => cat.tools)
  const tool = allTools.find(t => t.id === toolId)

  return (
    <ErrorBoundary>
      <div className="animate-in fade-in duration-300">
        <ToolComponent />
        {tool && (
          <ToolArticle toolId={toolId} toolName={tool.name} />
        )}
      </div>
    </ErrorBoundary>
  )
}


import {
  FileText,
  Image,
  Wand2,
  FileCode,
  Calculator,
  Globe,
  Clock,
  Sparkles,
  Download,
  LucideIcon
} from 'lucide-react'

export interface Tool {
  id: string
  name: string
  description: string
  component?: string
}

export interface ToolCategory {
  id: string
  name: string
  description: string
  icon: LucideIcon
  tools: Tool[]
}

export const toolCategories: ToolCategory[] = [
  {
    id: 'text-tools',
    name: 'Text Tools',
    description: 'Alat untuk memproses dan menganalisis teks',
    icon: FileText,
    tools: [
      {
        id: 'word-counter',
        name: 'Penghitung Kata',
        description: 'Hitung jumlah kata, karakter, dan paragraf dalam teks'
      },
      {
        id: 'text-diff',
        name: 'Text Diff Checker',
        description: 'Bandingkan dua teks dan lihat perbedaannya'
      },
      {
        id: 'text-cleaner',
        name: 'Text Cleaner',
        description: 'Bersihkan teks dari spasi berlebih dan duplikasi'
      },
      {
        id: 'case-converter',
        name: 'Case Converter',
        description: 'Ubah format huruf (UPPERCASE, lowercase, Title Case, dll)'
      },
      {
        id: 'lorem-ipsum',
        name: 'Lorem Ipsum Generator',
        description: 'Generate teks placeholder untuk desain'
      },
      {
        id: 'readability-analyzer',
        name: 'Readability Analyzer',
        description: 'Analisis tingkat keterbacaan teks menggunakan Flesch-Kincaid'
      },
      {
        id: 'keyword-density',
        name: 'Keyword Density Checker',
        description: 'Analisis kepadatan kata kunci dalam teks untuk SEO'
      },
      {
        id: 'markdown-editor',
        name: 'Markdown Editor',
        description: 'Editor Markdown dengan preview real-time'
      },
      {
        id: 'regex-tester',
        name: 'Regex Tester',
        description: 'Test dan debug regular expression dengan live preview'
      },
      {
        id: 'text-to-slug',
        name: 'Text to Slug Converter',
        description: 'Convert text menjadi URL-friendly slug'
      }
    ]
  },
  {
    id: 'image-tools',
    name: 'Image Tools',
    description: 'Alat untuk edit dan konversi gambar',
    icon: Image,
    tools: [
      {
        id: 'image-converter',
        name: 'Image Converter',
        description: 'Konversi format gambar (JPG, PNG, WebP, dll)'
      },
      {
        id: 'image-compressor',
        name: 'Image Compressor',
        description: 'Kompres gambar tanpa kehilangan kualitas'
      },
      {
        id: 'image-resizer',
        name: 'Image Resizer',
        description: 'Ubah ukuran gambar dengan mudah'
      },
      {
        id: 'image-cropper',
        name: 'Image Cropper',
        description: 'Potong gambar sesuai kebutuhan'
      },
      {
        id: 'color-palette',
        name: 'Color Palette Extractor',
        description: 'Ekstrak palet warna dominan dari gambar'
      },
      {
        id: 'placeholder-generator',
        name: 'Placeholder Image Generator',
        description: 'Generate gambar placeholder untuk prototyping'
      },
      {
        id: 'image-to-ascii',
        name: 'Image to ASCII Art',
        description: 'Konversi gambar menjadi seni ASCII'
      },
      {
        id: 'svg-optimizer',
        name: 'SVG Optimizer',
        description: 'Optimalkan dan bersihkan kode SVG'
      },
      {
        id: 'background-remover',
        name: 'Background Remover',
        description: 'Hapus background dari gambar dengan mudah - 100% client-side'
      },
      {
        id: 'color-psychology',
        name: 'Color Psychology & Composition',
        description: 'Analisis psikologi warna dan komposisi dari gambar'
      },
      {
        id: 'digital-ruler',
        name: 'Digital Ruler',
        description: 'Penggaris digital untuk mengukur di layar dengan presisi'
      },
      {
        id: 'watermark-maker',
        name: 'Watermark Maker',
        description: 'Tambahkan watermark ke gambar dengan mudah'
      },
      {
        id: 'image-rotator-flip',
        name: 'Image Rotator & Flip',
        description: 'Putar dan balik gambar dengan mudah'
      }
    ]
  },
  {
    id: 'generator-tools',
    name: 'Generator Tools',
    description: 'Generate berbagai data dan kode',
    icon: Wand2,
    tools: [
      {
        id: 'qr-code',
        name: 'QR Code Generator',
        description: 'Buat QR Code dari URL atau teks'
      },
      {
        id: 'password-generator',
        name: 'Password Generator',
        description: 'Generate password kuat dan acak'
      },
      {
        id: 'uuid-generator',
        name: 'UUID Generator',
        description: 'Generate UUID/GUID untuk development'
      },
      {
        id: 'hash-generator',
        name: 'Hash Generator',
        description: 'Generate hash MD5, SHA-256, dll'
      },
      {
        id: 'color-picker',
        name: 'Color Picker',
        description: 'Pilih warna dan dapatkan kode HEX, RGB, HSL'
      },
      {
        id: 'gradient-generator',
        name: 'CSS Gradient Generator',
        description: 'Buat gradient CSS dengan visual'
      },
      {
        id: 'color-converter',
        name: 'Color Converter',
        description: 'Konversi warna antara HEX, RGB, HSL, dan CMYK'
      },
      {
        id: 'random-number-generator',
        name: 'Random Number Generator',
        description: 'Generate angka acak dengan range dan jumlah yang bisa disesuaikan'
      }
    ]
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    description: 'Tools untuk developer',
    icon: FileCode,
    tools: [
      {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format dan validasi JSON'
      },
      {
        id: 'base64-encoder',
        name: 'Base64 Encoder/Decoder',
        description: 'Encode dan decode Base64'
      },
      {
        id: 'url-encoder',
        name: 'URL Encoder/Decoder',
        description: 'Encode dan decode URL'
      },
      {
        id: 'jwt-decoder',
        name: 'JWT Decoder',
        description: 'Decode dan inspect JWT token'
      },
      {
        id: 'password-strength',
        name: 'Password Strength Checker',
        description: 'Cek kekuatan password secara real-time - 100% client-side'
      },
      {
        id: 'aes-encryption',
        name: 'AES Encryption / Decryption',
        description: 'Enkripsi dan dekripsi teks menggunakan AES-256 - 100% client-side'
      },
      {
        id: 'html-entity-encoder',
        name: 'HTML Entity Encoder/Decoder',
        description: 'Encode dan decode HTML entities'
      },
      {
        id: 'csv-json-converter',
        name: 'CSV ↔ JSON Converter',
        description: 'Konversi antara format CSV dan JSON'
      },
      {
        id: 'code-formatter',
        name: 'Code Formatter',
        description: 'Format dan beautify kode HTML, CSS, JavaScript, dan JSON'
      }
    ]
  },
  {
    id: 'calculator-tools',
    name: 'Calculator Tools',
    description: 'Kalkulator spesialis untuk berbagai kebutuhan',
    icon: Calculator,
    tools: [
      {
        id: 'kpr-calculator',
        name: 'Kalkulator KPR / Cicilan',
        description: 'Hitung cicilan bulanan untuk KPR atau pinjaman'
      },
      {
        id: 'bmi-calculator',
        name: 'Kalkulator BMI',
        description: 'Hitung Body Mass Index untuk mengetahui status berat badan'
      },
      {
        id: 'discount-calculator',
        name: 'Kalkulator Diskon',
        description: 'Hitung harga setelah diskon dan jumlah yang dihemat'
      },
      {
        id: 'compound-interest',
        name: 'Kalkulator Bunga Majemuk',
        description: 'Hitung pertumbuhan investasi dengan compound interest'
      },
      {
        id: 'aspect-ratio',
        name: 'Kalkulator Aspect Ratio',
        description: 'Hitung dimensi berdasarkan aspect ratio atau sebaliknya'
      },
      {
        id: 'age-calculator',
        name: 'Kalkulator Umur',
        description: 'Hitung umur dari tanggal lahir dengan detail lengkap'
      },
      {
        id: 'percentage-calculator',
        name: 'Kalkulator Persentase',
        description: 'Hitung persentase, perubahan persentase, dan reverse percentage'
      }
    ]
  },
  {
    id: 'seo-tools',
    name: 'SEO & Web Tools',
    description: 'Tools untuk SEO dan utilitas web',
    icon: Globe,
    tools: [
      {
        id: 'ip-checker',
        name: "What's My IP?",
        description: 'Cek alamat IP publik dan User Agent browser'
      },
      {
        id: 'meta-extractor',
        name: 'Meta Tag Extractor',
        description: 'Ekstrak meta tags, Open Graph, dan informasi SEO dari website'
      },
      {
        id: 'http-header',
        name: 'HTTP Header Checker',
        description: 'Cek HTTP response headers dari website'
      },
      {
        id: 'dns-checker',
        name: 'DNS Record Checker',
        description: 'Cek catatan DNS (A, CNAME, MX, TXT) dari domain'
      },
      {
        id: 'site-down-checker',
        name: 'Site Down Checker',
        description: 'Cek apakah website down atau tidak dapat diakses'
      },
      {
        id: 'ssl-checker',
        name: 'SSL Certificate Checker',
        description: 'Cek informasi sertifikat SSL dari domain'
      },
      {
        id: 'whois-checker',
        name: 'WHOIS Checker',
        description: 'Cek informasi registrasi domain (WHOIS data)'
      },
      {
        id: 'url-parser',
        name: 'URL Parser & Builder',
        description: 'Parse URL menjadi komponen atau build URL dari komponen'
      },
      {
        id: 'tech-stack-analyzer',
        name: 'Tech Stack Analyzer & Composer',
        description: 'Analyze atau compose tech stack dari website - Berguna untuk developer'
      }
    ]
  },
  {
    id: 'fun-tools',
    name: 'Fun & Creative',
    description: 'Generator kreatif dan tools menyenangkan',
    icon: Sparkles,
    tools: [
      {
        id: 'fancy-text',
        name: 'Fancy Text Generator',
        description: 'Generate teks dengan style unik untuk social media'
      },
      {
        id: 'random-name',
        name: 'Random Name Generator',
        description: 'Generate nama acak untuk testing atau kreativitas'
      },
      {
        id: 'coin-flip',
        name: 'Lempar Koin',
        description: 'Putar koin virtual untuk mengambil keputusan acak'
      }
    ]
  },
  {
    id: 'time-tools',
    name: 'Time & Date Tools',
    description: 'Tools untuk waktu, tanggal, dan zona waktu',
    icon: Clock,
    tools: [
      {
        id: 'stopwatch-timer',
        name: 'Stopwatch & Timer',
        description: 'Stopwatch digital dengan fungsi lap dan timer countdown'
      },
      {
        id: 'time-zone',
        name: 'Time Zone Converter',
        description: 'Konversi waktu antar zona waktu di seluruh dunia'
      },
      {
        id: 'date-calculator',
        name: 'Kalkulator Durasi',
        description: 'Hitung jumlah hari, jam, dan menit antara dua tanggal'
      },
      {
        id: 'unix-timestamp-converter',
        name: 'Unix Timestamp Converter',
        description: 'Konversi antara Unix timestamp dan format tanggal - Penting untuk developer'
      }
    ]
  },
  {
    id: 'pdf-tools',
    name: 'PDF Tools',
    description: 'Alat untuk memproses dan memanipulasi file PDF',
    icon: FileText,
    tools: [
      {
        id: 'pdf-merger',
        name: 'PDF Merger',
        description: 'Gabungkan multiple file PDF menjadi satu'
      },
      {
        id: 'pdf-splitter',
        name: 'PDF Splitter',
        description: 'Split atau extract halaman dari PDF'
      },
      {
        id: 'pdf-compressor',
        name: 'PDF Compressor',
        description: 'Kompres ukuran file PDF tanpa kehilangan kualitas signifikan'
      },
      {
        id: 'image-to-pdf',
        name: 'Image to PDF',
        description: 'Konversi gambar menjadi file PDF'
      },
      {
        id: 'pdf-to-images',
        name: 'PDF to Images',
        description: 'Ekstrak halaman PDF menjadi gambar'
      },
      {
        id: 'pdf-to-text',
        name: 'PDF to Text',
        description: 'Extract text dari PDF ke file .txt'
      },
      {
        id: 'pdf-to-html',
        name: 'PDF to HTML',
        description: 'Convert PDF pages ke format HTML'
      },
      {
        id: 'pdf-to-excel',
        name: 'PDF to Excel',
        description: 'Extract tables dari PDF ke Excel (terbatas untuk PDF dengan tabel terstruktur)'
      },
      {
        id: 'pdf-to-epub',
        name: 'PDF to EPUB',
        description: 'Convert PDF ke format EPUB untuk e-reader'
      },
      {
        id: 'pdf-to-word',
        name: 'PDF to Word',
        description: 'Convert PDF ke dokumen Word (.docx)'
      },
      {
        id: 'word-to-pdf',
        name: 'Word to PDF',
        description: 'Convert dokumen Word (.docx) ke PDF'
      },
      {
        id: 'word-to-html',
        name: 'Word to HTML',
        description: 'Convert dokumen Word (.docx) ke HTML'
      },
      {
        id: 'word-to-markdown',
        name: 'Word to Markdown',
        description: 'Convert dokumen Word (.docx) ke Markdown'
      },
      {
        id: 'excel-to-pdf',
        name: 'Excel to PDF',
        description: 'Convert spreadsheet Excel ke PDF'
      },
      {
        id: 'excel-to-csv',
        name: 'Excel to CSV',
        description: 'Convert Excel spreadsheet ke CSV'
      },
      {
        id: 'csv-to-excel',
        name: 'CSV to Excel',
        description: 'Convert file CSV ke Excel spreadsheet'
      },
      {
        id: 'powerpoint-to-pdf',
        name: 'PowerPoint to PDF',
        description: 'Convert presentasi PowerPoint ke PDF'
      }
    ]
  },
  {
    id: 'downloader-tools',
    name: 'Downloader Tools',
    description: 'Download media dari berbagai platform social media',
    icon: Download,
    tools: [
      {
        id: 'youtube-downloader',
        name: 'YouTube Downloader',
        description: 'Download video dan audio dari YouTube dengan berbagai kualitas'
      },
      {
        id: 'tiktok-downloader',
        name: 'TikTok Downloader',
        description: 'Download video dan audio dari TikTok'
      },
      {
        id: 'instagram-downloader',
        name: 'Instagram Downloader',
        description: 'Download foto, video, reels, dan stories dari Instagram'
      },
      {
        id: 'twitter-downloader',
        name: 'Twitter/X Downloader',
        description: 'Download video dan gambar dari Twitter/X'
      },
      {
        id: 'facebook-downloader',
        name: 'Facebook Downloader',
        description: 'Download video dari Facebook'
      }
    ]
  }
]


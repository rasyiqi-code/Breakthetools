import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Inter } from 'next/font/google'
import '../globals.css'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { messages } from '@/lib/messages'
import { IntlProviderWrapper } from '@/components/IntlProviderWrapper'

const inter = Inter({ subsets: ['latin'] })

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as any)) {
        notFound()
    }

    // Get messages for current locale
    const localeMessages = messages[locale as keyof typeof messages] || messages.en

    return (
        <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <body className={inter.className}>
                <IntlProviderWrapper 
                    locale={locale} 
                    messages={localeMessages}
                >
                    <div className="min-h-screen bg-neutral-50">
                        <Header />
                        <div className="flex">
                            <Sidebar />
                            <main className="flex-1 px-[5px] sm:px-[5px] py-4 sm:py-6 lg:py-8 w-full lg:w-auto">
                                {children}
                            </main>
                        </div>
                    </div>
                </IntlProviderWrapper>
            </body>
        </html>
    )
}

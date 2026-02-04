import Image from "next/image"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { routing } from "@/i18n/routing"
import { useLocale } from "next-intl"

export default function NavBar() {

    const t = useTranslations("HomePage")
    const locale = useLocale()
    const otherLocale = routing.locales.find((l) => l !== locale)

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <Image src="/logo.svg" alt={`${t('title')} Logo`} width={32} height={32} className="group-hover:rotate-12 transition-transform duration-300" />
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">{t('title')}</h1>
                </Link>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/privacy" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">{t('nav.privacy')}</Link>
                        <Link href="/terms" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">{t('nav.terms')}</Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            locale={otherLocale}
                            className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase"
                        >
                            {otherLocale}
                        </Link>
                    </div>
                </div>

            </div>


        </header>
    )
}
"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { useTranslations } from "next-intl"

export default function TermsPage() {
    const t = useTranslations("Terms")
    const tHome = useTranslations("HomePage")

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 font-sans">
            <header className="max-w-4xl mx-auto p-6 md:p-10">
                <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                    <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                    <span className="font-bold text-slate-900 dark:text-white">{tHome('title')}</span>
                </Link>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">{t('title')}</h1>
                <p className="text-slate-500 dark:text-slate-400">{t('lastUpdated')}: {new Date().toLocaleDateString()}</p>
            </header>

            <main className="max-w-4xl mx-auto p-6 md:p-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800 mb-20 shadow-xl">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('acceptance.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('acceptance.content')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('usage.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('usage.content')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('disclaimer.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('disclaimer.content')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('liability.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('liability.content')}
                        </p>
                    </section>
                </div>
            </main>

            <footer className="max-w-4xl mx-auto p-6 md:p-10 border-t border-slate-200 dark:border-slate-800 text-center">
                <Link href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">← {t('back')}</Link>
            </footer>
        </div>
    );
}

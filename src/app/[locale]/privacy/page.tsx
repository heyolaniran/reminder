"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { useTranslations } from "next-intl"
import NavBar from "@/components/nav-bar"

export default function PrivacyPage() {
    const t = useTranslations("Privacy")
    const tHome = useTranslations("HomePage")

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 font-sans">
            <NavBar />
            <header className="max-w-4xl mx-auto p-6 md:p-10 mt-16">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">{t('title')}</h1>
                <p className="text-slate-500 dark:text-slate-400">{t('lastUpdated')}: {new Date().toLocaleDateString()}</p>
            </header>

            <main className="max-w-4xl mx-auto p-6 md:p-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800 mb-20 shadow-xl">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('introduction.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('introduction.content')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('data.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('data.content')}
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
                            <li>{t('data.points.0')}</li>
                            <li>{t('data.points.1')}</li>
                            <li>{t('data.points.2')}</li>
                            <li>{t('data.points.3')}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('storage.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('storage.content')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('thirdParty.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('thirdParty.content')}
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
                            <li>{t('thirdParty.points.0')}</li>
                            <li>{t('thirdParty.points.1')}</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('rights.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('rights.content')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('contact.title')}</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            {t('contact.content')}
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

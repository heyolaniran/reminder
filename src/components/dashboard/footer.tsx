"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"

export default function Footer() {
    const tCommon = useTranslations("Common")
    const tFooter = useTranslations("Footer")
    return (
        <footer className="relative z-10 pt-20 pb-12 flex flex-col items-center justify-center gap-4 text-slate-400">
            <p className="text-sm font-medium">{tCommon('poweredBy')} Calendrian</p>
            <div className="flex items-center gap-4 text-xs">
                <Link href="/" className="hover:text-slate-900 transition-colors">{tCommon('home')}</Link>
                <span className="text-slate-200">|</span>
                <Link href="/privacy" className="hover:text-slate-900 transition-colors">{tFooter('privacy')}</Link>
            </div>
        </footer>
    )
}
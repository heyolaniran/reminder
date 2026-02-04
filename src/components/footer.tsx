import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
    const tFooter = useTranslations("Footer")

    return (
        <footer className="relative z-10 pb-12 flex flex-col items-center justify-center gap-4 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
                <span className="font-semibold">{new Date().getFullYear()}</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <p className="text-sm">
                    {tFooter('shapedBy')} <Link href="https://x.com/heyolaniran" target="_blank" className="font-medium text-slate-900 dark:text-white hover:underline decoration-indigo-500 underline-offset-4">Olaniran</Link>
                </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
                <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">{tFooter('privacy')}</Link>
                <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">{tFooter('terms')}</Link>
            </div>
        </footer>
    )
}
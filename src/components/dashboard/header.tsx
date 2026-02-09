"use client"
import Link from "next/link"
import { ArrowLeft, Fingerprint, RefreshCw, Lock, Calendar as CalendarIcon2 } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { toast } from "sonner"
export default function Header({ visitorToken, isLoading, setIsAuthorized, fetchEvents }: { visitorToken: string, isLoading: boolean, setIsAuthorized: (value: boolean) => void, fetchEvents: () => void }) {
    const t = useTranslations("Dashboard");


    const handleLogout = () => {
        setIsAuthorized(false)
        localStorage.removeItem('dashboard_authorized')
        localStorage.removeItem('auth_visitor_id')
        localStorage.removeItem('dashboard_access_key')
        toast.info(t('header.loggedOut') || "Logged out of dashboard")
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('header.back')}
                </Link>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {t('header.titlePart1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] to-[#DB4437]">{t('header.titlePart2')}</span>
                </h1>
                <p className="text-slate-500 text-lg">{t('description')}</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Fingerprint className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            readOnly
                            className="pl-9 w-[180px] bg-white/50 backdrop-blur-sm"
                            placeholder={t('header.visitorId')}
                            value={visitorToken}
                        />
                    </div>

                </div>
                <Button variant="outline" onClick={handleLogout} title={t('header.lock')}>
                    <Lock className="h-4 w-4 mr-2" />
                    {t('header.lock')}
                </Button>
                <Button variant="outline" onClick={fetchEvents} disabled={isLoading}>
                    {isLoading ? <Image alt="logo" src="/logo.svg" width={16} height={16} className="h-4 w-4 animate-spin mr-2" /> : <CalendarIcon2 className="h-4 w-4 mr-2" />}
                    {t('header.refresh')}
                </Button>
                {typeof window !== 'undefined' && localStorage.getItem('google_refresh_token') ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="px-4 md:block lg:hidden py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                {t('header.googleConnected')}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    localStorage.removeItem('google_refresh_token')
                                    window.location.reload()
                                }}
                                className="text-red-500 flex items-center gap-1 hover:text-red-700 hover:bg-red-50"
                            >
                                <img src="https://www.google.com/favicon.ico" className="w-4 h-4 mr-2" alt="Google" />
                                {t('header.googleDisconnect')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 hidden">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => window.location.href = '/api/auth/login'}
                                className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                            >
                                <img src="https://www.google.com/favicon.ico" className="w-4 h-4 mr-2" alt="Google" />
                                {t('header.googleConnect')}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { LayoutDashboardIcon } from "@/components/animate-ui/icons/layout-dashboard"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { checkKnownUserHook } from "@/hooks/check-known-user"
import { Sparkles } from "./animate-ui/icons/sparkles"

export default function Hero() {

    const t = useTranslations("HomePage")
    const [isKnown, setIsKnown] = useState(false);
    // check if the user is known 

    const handleKnwownUser = async () => {
        const visitorId = localStorage.getItem('auth_visitor_id') || localStorage.getItem('visitor_id')

        const isKnownUser = await checkKnownUserHook(visitorId!);
        if (isKnownUser) {
            setIsKnown(true)
        }
    }

    useEffect(() => {
        handleKnwownUser();
    }, [])


    return (
        <div className="flex flex-col justify-center space-y-6 md:pr-8">
            <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-full w-fit shadow-sm border">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t('badge')}</span>
            </div>
            <div className="flex items-center">
                <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    <span className="inline-flex items-center gap-1">
                        <Image src={'/logo.svg'} alt="" className="w-[48px] h-[48px]" width={48} height={48} />
                        {t('heroTitle1')}
                    </span> <br />
                    {t('heroTitle2')} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] to-[#DB4437]">{t('heroTitle3')}</span>
                </h2>
            </div>


            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                {t('heroDescription')}
            </p>

            <div className="flex items-center space-x-12 pt-6">
                <div className="flex flex-col">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">100%</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">{t('stats.deliveryRate')}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">0s</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">{t('stats.setupTime')}</span>
                </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
                <div className="flex flex-col gap-3">
                    <AnimateIcon animateOnHover="default" asChild>
                        <Button variant="ghost" className="w-fit inline-flex items-center gap-2 text-slate-500 hover:text-slate-900">
                            {isKnown ? (
                                <>
                                    <LayoutDashboardIcon animate="path" size={16} />
                                    <Link href="/dashboard">
                                        {t('dashboard')}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Sparkles animate="path" size={16} />
                                    <Link href="/dashboard">
                                        {t('premium')}
                                    </Link>
                                </>
                            )}
                        </Button>
                    </AnimateIcon>
                </div>
            </div>

        </div>
    )
}
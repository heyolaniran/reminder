"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarIcon2, Users, Info } from "lucide-react"
import { useTranslations } from "next-intl"

export default function HeaderStats({ totalEvents, totalRecipients }: { totalEvents: number, totalRecipients: number }) {
    const t = useTranslations("Dashboard")
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-lg border-slate-200/60 transition-all hover:shadow-xl">
                <CardHeader className="pb-2">
                    <CardDescription>{t('stats.totalEvents')}</CardDescription>
                    <CardTitle className="text-4xl font-black">{totalEvents}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center text-xs text-slate-400">
                        <CalendarIcon2 className="h-3 w-3 mr-1" />
                        {t('stats.totalEventsDesc')}
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-lg border-slate-200/60 transition-all hover:shadow-xl">
                <CardHeader className="pb-2">
                    <CardDescription>{t('stats.totalOutreach')}</CardDescription>
                    <CardTitle className="text-4xl font-black">{totalRecipients}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center text-xs text-slate-400">
                        <Users className="h-3 w-3 mr-1" />
                        {t('stats.totalOutreachDesc')}
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-lg border-slate-200/60 transition-all hover:shadow-xl bg-gradient-to-br from-indigo-50/50 to-white">
                <CardHeader className="pb-2">
                    <CardDescription>{t('stats.avgRecipients')}</CardDescription>
                    <CardTitle className="text-4xl font-black">
                        {totalEvents > 0 ? (totalRecipients / totalEvents).toFixed(1) : 0}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center text-xs text-slate-400">
                        <Info className="h-3 w-3 mr-1" />
                        {t('stats.avgRecipientsDesc')}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
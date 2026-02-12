"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CalendarIcon, ExternalLink, Info, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "../ui/button";
import { Mail, Loader2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function EventDetails({ event, handleRemindPending, isLoadingStats, eventStats }: {
    event: { id: string, start: string, end: string, location: string, htmlLink: string, summary: string, isScheduled?: boolean, scheduledFor?: string, status?: string },
    handleRemindPending: () => void,
    isLoadingStats: boolean,
    eventStats: {
        accepted: { count: number, emails: string[] },
        tentative: { count: number, emails: string[] },
        declined: { count: number, emails: string[] },
        needsAction: { count: number, emails: string[] },
        isScheduled?: boolean,
        scheduledStatus?: string
    } | null
}) {
    const t = useTranslations("Dashboard");

    const isScheduled = event.isScheduled || eventStats?.isScheduled;
    const scheduledStatus = eventStats?.scheduledStatus || event.status;

    return (
        <Card className="shadow-2xl border-indigo-100 bg-white sticky top-8">
            <CardHeader className="bg-indigo-50/30 border-b border-indigo-50">
                <CardTitle className="text-xl">{t('details.title')}</CardTitle>
                <CardDescription>{event.summary}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                    <div className="flex items-start text-sm gap-3">
                        <CalendarIcon className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                            <p className="font-semibold text-slate-900">{format(new Date(event.start), "PPPP")}</p>
                            <p className="text-slate-500">{format(new Date(event.start), "p")} — {format(new Date(event.end), "p")}</p>
                        </div>
                    </div>
                    {event.location && (
                        <div className="flex items-start text-sm gap-3">
                            <Info className="h-4 w-4 text-slate-400 mt-0.5" />
                            <p className="text-slate-600">{event.location}</p>
                        </div>
                    )}

                    {isScheduled && (
                        <div className="flex items-start text-sm gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
                            <div>
                                <p className="text-amber-800 font-bold text-xs uppercase tracking-wider">{t('details.statusPending')}</p>
                                <p className="text-amber-700 text-xs">{t('details.scheduledFor', { date: format(new Date(event.scheduledFor || event.start), "MMM d, p") })}</p>
                            </div>
                        </div>
                    )}

                    {!isScheduled && event.htmlLink !== '#' && (
                        <div className="pt-2">
                            <Link href={event.htmlLink} target="_blank" className="text-indigo-600 hover:text-indigo-800 text-xs font-bold inline-flex items-center group">
                                {t('details.viewGoogle')}
                                <ExternalLink className="ml-1 h-3 w-3 group-hover:translate-y--0.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    )}
                </div>

                {isLoadingStats ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                        <p className="text-xs text-slate-400 font-medium">{t('details.loadingStats')}</p>
                    </div>
                ) : eventStats ? (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        {isScheduled && scheduledStatus === 'pending' ? (
                            <div className="py-8 border-2 border-dashed border-amber-100 rounded-xl flex flex-col items-center justify-center text-amber-600 px-6 text-center">
                                <Clock className="h-8 w-8 opacity-20 mb-2" />
                                <p className="text-xs font-medium">{t('details.statusPending')}</p>
                                <p className="text-[10px] text-amber-500 mt-1">{t('details.engagementDesc')}</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">{t('details.accepted')}</p>
                                        <p className="text-3xl font-black text-green-700">{eventStats.accepted.count}</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">{t('details.tentative')}</p>
                                        <p className="text-3xl font-black text-blue-700">{eventStats.tentative.count}</p>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                        <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mb-1">{t('details.declined')}</p>
                                        <p className="text-3xl font-black text-red-700">{eventStats.declined.count}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('details.noResponse')}</p>
                                        <p className="text-3xl font-black text-slate-700">{eventStats.needsAction.count}</p>
                                    </div>
                                </div>

                                {eventStats.needsAction.count > 0 && !isScheduled && (
                                    <Button
                                        onClick={handleRemindPending}
                                        className="w-full bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold"
                                    >
                                        <Mail className="mr-2 h-4 w-4" />
                                        {t('details.remindPending')}
                                    </Button>
                                )}

                                <div className="space-y-4">
                                    {eventStats.accepted.emails.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-wider">
                                                <CheckCircle2 className="h-3 w-3" />
                                                {t('details.addedToCalendar')} ({eventStats.accepted.emails.length})
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {eventStats.accepted.emails.map((email: string) => (
                                                    <span key={email} className="text-[10px] px-2 py-0.5 bg-green-50 border border-green-100 rounded-full text-green-700">{email}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {eventStats.needsAction.emails.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <Loader2 className="h-3 w-3" />
                                                {t('details.pendingResponse')} ({eventStats.needsAction.emails.length})
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {eventStats.needsAction.emails.map((email: string) => (
                                                    <span key={email} className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-full text-slate-600">{email}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {eventStats.declined.emails.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider">
                                                <XCircle className="h-3 w-3" />
                                                {t('details.declinedEmails')} ({eventStats.declined.emails.length})
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {eventStats.declined.emails.map((email: string) => (
                                                    <span key={email} className="text-[10px] px-2 py-0.5 bg-red-50 border border-red-100 rounded-full text-red-700">{email}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="py-12 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 px-6 text-center">
                        <Info className="h-8 w-8 opacity-20 mb-2" />
                        <p className="text-xs">{t('details.statsError')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
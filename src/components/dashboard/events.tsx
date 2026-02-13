"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar as CalendarIcon2, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"

interface EventsProps {
    events: any[]
    isLoading: boolean
    selectedEvent: any
    handleSelectEvent: (event: any) => void
}

export default function Events({ events, isLoading, selectedEvent, handleSelectEvent }: EventsProps) {
    const t = useTranslations("Dashboard")

    return (
        <Card className="lg:col-span-2 shadow-xl border-slate-200/60 overflow-hidden">
            <CardHeader>
                <CardTitle>{t('table.title')}</CardTitle>
                <CardDescription>{t('table.description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Image alt="logo" src="/logo.svg" width={16} height={16} className="h-8 w-8 animate-spin text-slate-300" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <CalendarIcon2 className="h-12 w-12 opacity-20" />
                        <p>{t('table.empty')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('table.colSummary')}</TableHead>
                                    <TableHead>{t('table.colDate')}</TableHead>
                                    <TableHead>{t('table.colStatus')}</TableHead>
                                    <TableHead className="text-center">{t('table.colRecipients')}</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.map((event) => (
                                    <TableRow
                                        key={event.id}
                                        className={`cursor-pointer transition-colors ${selectedEvent?.id === event.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                                        onClick={() => handleSelectEvent(event)}
                                    >
                                        <TableCell className="font-bold text-slate-900">
                                            <div className="flex flex-col">
                                                <span>{event.summary || "Untitled Event"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {format(new Date(event.isScheduled ? event.scheduledFor : event.start), "MMM d, yyyy • p")}
                                            {event.userTimezone && <span className="ml-2 text-[10px] opacity-70 font-mono hidden md:inline">({event.userTimezone})</span>}
                                        </TableCell>
                                        <TableCell>
                                            {event.isScheduled ? (
                                                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    event.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {event.status === 'pending' ? <Clock className="w-3 h-3 mr-1" /> :
                                                        event.status === 'failed' ? <AlertCircle className="w-3 h-3 mr-1" /> :
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                    {event.status === 'pending' ? t('table.statusScheduled') :
                                                        event.status === 'failed' ? t('table.statusFailed') :
                                                            t('table.statusSent')}
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    {t('table.statusSent')}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center font-medium bg-slate-50/50">{event.attendeeCount}</TableCell>
                                        <TableCell>
                                            <ChevronRight className={`h-4 w-4 transition-transform ${selectedEvent?.id === event.id ? 'translate-x-1 text-indigo-500' : 'text-slate-300'}`} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
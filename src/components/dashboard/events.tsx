"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar as CalendarIcon2 } from "lucide-react"
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
                                        <TableCell className="font-bold text-slate-900">{event.summary || "Untitled Event"}</TableCell>
                                        <TableCell className="text-slate-500 text-sm">{format(new Date(event.start), "MMM d, yyyy • p")}</TableCell>
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
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { format } from "date-fns"
import {
    CalendarIcon,
    ArrowLeft,
    Loader2,
    ChevronRight,
    Users,
    Calendar as CalendarIcon2,
    CheckCircle2,
    XCircle,
    Info,
    ExternalLink,
    Mail
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Dashboard() {
    const [events, setEvents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [eventStats, setEventStats] = useState<any>(null)
    const [isLoadingStats, setIsLoadingStats] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        setIsLoading(true)
        try {
            const refreshToken = localStorage.getItem('google_refresh_token')
            const visitorToken = localStorage.getItem('visitor_id')

            const url = new URL('/api/events', window.location.origin)
            if (refreshToken && refreshToken !== 'null') {
                url.searchParams.append('refreshToken', refreshToken)
            }
            if (visitorToken) {
                url.searchParams.append('visitorToken', visitorToken)
            }

            const response = await fetch(url.toString())
            const data = await response.json()
            if (data.success) {
                setEvents(data.events)
            } else {
                toast.error(data.error || "Failed to fetch events")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred while fetching events")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchEventStats = async (eventId: string) => {
        setIsLoadingStats(true)
        try {
            const refreshToken = localStorage.getItem('google_refresh_token')
            const url = new URL('/api/stats', window.location.origin)
            url.searchParams.append('eventId', eventId)
            if (refreshToken && refreshToken !== 'null') {
                url.searchParams.append('refreshToken', refreshToken)
            }

            const response = await fetch(url.toString())
            const data = await response.json()
            if (data.success) {
                setEventStats(data.stats)
            } else {
                toast.error(data.error || "Failed to fetch event statistics")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred while fetching statistics")
        } finally {
            setIsLoadingStats(false)
        }
    }

    const handleSelectEvent = (event: any) => {
        setSelectedEvent(event)
        setEventStats(null)
        fetchEventStats(event.id)
    }

    const handleRemindPending = () => {
        if (!eventStats || eventStats.needsAction.emails.length === 0) return

        sessionStorage.setItem('pending_followup_emails', JSON.stringify(eventStats.needsAction.emails))
        toast.success(`Prepared ${eventStats.needsAction.emails.length} recipients for follow-up`)
        router.push('/')
    }

    // Calculate aggregated stats
    const totalEvents = events.length
    const totalRecipients = events.reduce((acc, curr) => acc + curr.attendeeCount, 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50/10 via-white to-purple-50/10 font-sans p-4 md:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="max-w-6xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] to-[#DB4437]">Insights</span>
                        </h1>
                        <p className="text-slate-500 text-lg">Track your audience engagement across all events.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={fetchEvents} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarIcon2 className="h-4 w-4 mr-2" />}
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Aggregated Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-lg border-slate-200/60 transition-all hover:shadow-xl">
                        <CardHeader className="pb-2">
                            <CardDescription>Total Events</CardDescription>
                            <CardTitle className="text-4xl font-black">{totalEvents}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-xs text-slate-400">
                                <CalendarIcon2 className="h-3 w-3 mr-1" />
                                Created through Calendrian
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg border-slate-200/60 transition-all hover:shadow-xl">
                        <CardHeader className="pb-2">
                            <CardDescription>Total Outreach</CardDescription>
                            <CardTitle className="text-4xl font-black">{totalRecipients}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-xs text-slate-400">
                                <Users className="h-3 w-3 mr-1" />
                                Unique calendar invites sent
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg border-slate-200/60 transition-all hover:shadow-xl bg-gradient-to-br from-indigo-50/50 to-white">
                        <CardHeader className="pb-2">
                            <CardDescription>Avg Recipients</CardDescription>
                            <CardTitle className="text-4xl font-black">
                                {totalEvents > 0 ? (totalRecipients / totalEvents).toFixed(1) : 0}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-xs text-slate-400">
                                <Info className="h-3 w-3 mr-1" />
                                Per event performance
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Events Table */}
                    <Card className="lg:col-span-2 shadow-xl border-slate-200/60 overflow-hidden">
                        <CardHeader>
                            <CardTitle>Recent Events</CardTitle>
                            <CardDescription>List of all events tagged with Calendrian.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="h-64 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                                </div>
                            ) : events.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
                                    <CalendarIcon2 className="h-12 w-12 opacity-20" />
                                    <p>No events found. Send your first reminder!</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Event Summary</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-center">Recipients</TableHead>
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

                    {/* Detail Sidebar / Stats */}
                    <div className="space-y-6">
                        {selectedEvent ? (
                            <Card className="shadow-2xl border-indigo-100 bg-white sticky top-8">
                                <CardHeader className="bg-indigo-50/30 border-b border-indigo-50">
                                    <CardTitle className="text-xl">Event Details</CardTitle>
                                    <CardDescription>{selectedEvent.summary}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-start text-sm gap-3">
                                            <CalendarIcon className="h-4 w-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-slate-900">{format(new Date(selectedEvent.start), "PPPP")}</p>
                                                <p className="text-slate-500">{format(new Date(selectedEvent.start), "p")} — {format(new Date(selectedEvent.end), "p")}</p>
                                            </div>
                                        </div>
                                        {selectedEvent.location && (
                                            <div className="flex items-start text-sm gap-3">
                                                <Info className="h-4 w-4 text-slate-400 mt-0.5" />
                                                <p className="text-slate-600">{selectedEvent.location}</p>
                                            </div>
                                        )}
                                        <div className="pt-2">
                                            <Link href={selectedEvent.htmlLink} target="_blank" className="text-indigo-600 hover:text-indigo-800 text-xs font-bold inline-flex items-center group">
                                                View in Google Calendar
                                                <ExternalLink className="ml-1 h-3 w-3 group-hover:translate-y--0.5 group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>

                                    {isLoadingStats ? (
                                        <div className="py-12 flex flex-col items-center justify-center space-y-3">
                                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                            <p className="text-xs text-slate-400 font-medium">Loading engagement stats...</p>
                                        </div>
                                    ) : eventStats ? (
                                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">Accepted</p>
                                                    <p className="text-3xl font-black text-green-700">{eventStats.accepted.count}</p>
                                                </div>
                                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Tentative</p>
                                                    <p className="text-3xl font-black text-blue-700">{eventStats.tentative.count}</p>
                                                </div>
                                                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mb-1">Declined</p>
                                                    <p className="text-3xl font-black text-red-700">{eventStats.declined.count}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">No Response</p>
                                                    <p className="text-3xl font-black text-slate-700">{eventStats.needsAction.count}</p>
                                                </div>
                                            </div>

                                            {eventStats.needsAction.count > 0 && (
                                                <Button
                                                    onClick={handleRemindPending}
                                                    className="w-full bg-[#4285F4] hover:bg-[#4285F4]/90 text-white font-bold"
                                                >
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Remind Pending Only
                                                </Button>
                                            )}

                                            <div className="space-y-4">
                                                {eventStats.accepted.emails.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-wider">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Added to Calendar ({eventStats.accepted.emails.length})
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
                                                            Pending Response ({eventStats.needsAction.emails.length})
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
                                                            Declined ({eventStats.declined.emails.length})
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {eventStats.declined.emails.map((email: string) => (
                                                                <span key={email} className="text-[10px] px-2 py-0.5 bg-red-50 border border-red-100 rounded-full text-red-700">{email}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-12 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 px-6 text-center">
                                            <Info className="h-8 w-8 opacity-20 mb-2" />
                                            <p className="text-xs">Failed to load statistics for this event.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                    <ChevronRight className="h-8 w-8 opacity-20" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">See Engagement</h4>
                                    <p className="text-sm">Select an event from the list to see detailed statistics and attendee responses.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="relative z-10 pt-20 pb-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                <p className="text-sm font-medium">Powered by Calendrian Enterprise Analytics</p>
                <div className="flex items-center gap-4 text-xs">
                    <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                    <span className="text-slate-200">|</span>
                    <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
                </div>
            </footer>
        </div>
    )
}

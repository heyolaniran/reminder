"use client"


import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import Unauthorized from "@/components/dashboard/unauthorized"
import Header from "@/components/dashboard/header"
import HeaderStats from "@/components/dashboard/header-stats"
import Events from "@/components/dashboard/events"
import NoSelectedEvent from "@/components/no-selected-event"
import EventDetails from "@/components/dashboard/event-details"
import Footer from "@/components/dashboard/footer"
import { toast } from "sonner"
import Image from "next/image"

export default function WrapperDashboard() {
    const t = useTranslations("Dashboard")

    const [events, setEvents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [eventStats, setEventStats] = useState<any>(null)
    const [isLoadingStats, setIsLoadingStats] = useState(false)
    const [visitorToken, setVisitorToken] = useState<string>("")
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // if the visitor is connected use the auth visitor id, else use the simple visitor id
        const storedToken = localStorage.getItem('visitor_id') || ""
        setVisitorToken(storedToken)

        const authorized = localStorage.getItem('dashboard_authorized') === 'true' && localStorage.getItem('dashboard_access_key')
        if (authorized) {
            setIsAuthorized(true)
        }
        setIsCheckingAuth(false)
    }, [])


    useEffect(() => {
        if (isAuthorized && visitorToken !== undefined) {
            fetchEvents()
        }
    }, [visitorToken, isAuthorized])

    const fetchEvents = async () => {
        setIsLoading(true)
        try {
            const refreshToken = localStorage.getItem('google_refresh_token')
            const currentToken = localStorage.getItem('auth_visitor_id') || localStorage.getItem('visitor_id')
            const accessKey = localStorage.getItem('dashboard_access_key')

            const url = new URL('/api/events', window.location.origin)
            if (refreshToken && refreshToken !== 'null') {
                url.searchParams.append('refreshToken', refreshToken)
            }
            if (currentToken) {
                url.searchParams.append('visitorToken', currentToken)
            }

            const response = await fetch(url.toString(), {
                headers: {
                    'x-access-key': accessKey || ''
                }
            })
            const data = await response.json()
            if (data.success) {
                setEvents(data.events)
            } else {
                toast.error(data.error || t('table.fetchError') || "Failed to fetch events")
            }
        } catch (error) {
            console.error(error)
            toast.error(t('table.fetchAnError') || "An error occurred while fetching events")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchEventStats = async (eventId: string) => {
        setIsLoadingStats(true)
        try {
            const refreshToken = localStorage.getItem('google_refresh_token')
            const accessKey = localStorage.getItem('dashboard_access_key')

            const url = new URL('/api/stats', window.location.origin)
            url.searchParams.append('eventId', eventId)
            if (refreshToken && refreshToken !== 'null') {
                url.searchParams.append('refreshToken', refreshToken)
            }

            const response = await fetch(url.toString(), {
                headers: {
                    'x-access-key': accessKey || ''
                }
            })
            const data = await response.json()
            if (data.success) {
                setEventStats(data.stats)
            } else {
                toast.error(data.error || t('details.fetchStatsError') || "Failed to fetch event statistics")
            }
        } catch (error) {
            console.error(error)
            toast.error(t('details.fetchStatsAnError') || "An error occurred while fetching statistics")
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
        toast.success(t('details.preparedFollowup', { count: eventStats.needsAction.emails.length }) || `Prepared ${eventStats.needsAction.emails.length} recipients for follow-up`)
        router.push('/')
    }

    const totalEvents = events.length
    const totalRecipients = events.reduce((acc, curr) => acc + curr.attendeeCount, 0)


    if (isCheckingAuth) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <Image className="animate-spin" src="/logo.svg" alt="Logo" width={32} height={32} />
            </div>
        )
    }

    if (!isAuthorized) {
        return (
            <Unauthorized visitorToken={visitorToken} setIsAuthorized={setIsAuthorized} />
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50/10 via-white to-purple-50/10 font-sans p-4 md:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="max-w-6xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <Header visitorToken={visitorToken} isLoading={isLoading} setIsAuthorized={setIsAuthorized} fetchEvents={fetchEvents} />

                {/* Aggregated Stats Cards */}
                <HeaderStats totalEvents={totalEvents} totalRecipients={totalRecipients} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Events Table */}
                    <Events events={events} isLoading={isLoading} selectedEvent={selectedEvent} handleSelectEvent={handleSelectEvent} />

                    {/* Detail Sidebar / Stats */}
                    <div className="space-y-6">
                        {selectedEvent ? (
                            <EventDetails
                                event={selectedEvent}
                                eventStats={eventStats}
                                isLoadingStats={isLoadingStats}
                                handleRemindPending={handleRemindPending}
                            />
                        ) : (
                            <NoSelectedEvent />
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
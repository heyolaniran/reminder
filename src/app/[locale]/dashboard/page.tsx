"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
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
    Mail,
    Fingerprint,
    RefreshCw,
    Lock,
    Unlock,
    ShieldAlert,
    X,
    QrCode,
    Zap,
    Copy
} from "lucide-react"
import { Link, useRouter } from "@/i18n/routing"
import Image from "next/image"
import { useTranslations } from "next-intl"

export default function Dashboard() {
    const t = useTranslations("Dashboard")
    const tCommon = useTranslations("Common")
    const tFooter = useTranslations("Footer")

    const [events, setEvents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [eventStats, setEventStats] = useState<any>(null)
    const [isLoadingStats, setIsLoadingStats] = useState(false)
    const [visitorToken, setVisitorToken] = useState<string>("")
    const [isUpdatingToken, setIsUpdatingToken] = useState(false)
    const [isLoginPending, setIsLoginPending] = useState(false)
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [entryKey, setEntryKey] = useState("")
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [currentInvoice, setCurrentInvoice] = useState<string>("")
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false)
    const [paymentInPending, setPaymentInPending] = useState(true)
    const [isSettled, setIsSettled] = useState(false)
    const [preimage, setPreimage] = useState<string>("")
    const router = useRouter()

    useEffect(() => {
        const storedToken = localStorage.getItem('visitor_id') || ""
        setVisitorToken(storedToken)

        const authorized = localStorage.getItem('dashboard_authorized') === 'true' && localStorage.getItem('dashboard_access_key')
        if (authorized) {
            setIsAuthorized(true)
        }
        setIsCheckingAuth(false)
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoginPending(true)
        try {
            const response = await fetch(`/api/payments?masterKey=${entryKey}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                setIsAuthorized(true)
                localStorage.setItem('dashboard_authorized', 'true')
                localStorage.setItem('dashboard_access_key', entryKey)
                localStorage.setItem('visitor_id', data.data[0].visitorId)
                toast.success(t('restricted.accessGranted') || "Access Granted")
            } else {
                toast.error(t('restricted.invalidKey') || "Invalid Access Key")
            }
        } catch (error) {
            console.error(error)
            toast.error(tCommon('error') || "An error occurred")
        } finally {
            setIsLoginPending(false)
        }
    }

    const handleLogout = () => {
        setIsAuthorized(false)
        localStorage.removeItem('dashboard_authorized')
        localStorage.removeItem('dashboard_access_key')
        toast.info(t('header.loggedOut') || "Logged out of dashboard")
    }

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (showPaymentModal && paymentInPending && !isSettled) {
            const verifyLink = localStorage.getItem('payment_verify_link');
            if (verifyLink) {
                interval = setInterval(async () => {
                    try {
                        const response = await fetch(verifyLink);
                        const data = await response.json();

                        if (data.settled) {
                            setIsSettled(true);
                            setPaymentInPending(false);
                            setPreimage(data.preimage);

                            await fetch('/api/payments', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    verifyLink: verifyLink,
                                    masterKey: data.preimage,
                                }),
                            });
                            toast.success(t('payment.settled') || "Payment settled! Your masterKey is ready.");
                            clearInterval(interval);
                        }
                    } catch (error) {
                        console.error("Polling error:", error);
                    }
                }, 3000);
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [showPaymentModal, paymentInPending, isSettled]);

    useEffect(() => {
        if (isAuthorized && visitorToken !== undefined) {
            fetchEvents()
        }
    }, [visitorToken, isAuthorized])

    const fetchEvents = async () => {
        setIsLoading(true)
        try {
            const refreshToken = localStorage.getItem('google_refresh_token')
            const currentToken = visitorToken || localStorage.getItem('visitor_id')
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

    const handleInvoiceGeneration = async () => {
        setIsGeneratingInvoice(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_LN_CALLBACK}?amount=${process.env.NEXT_PUBLIC_AMOUNT}`)
            const data = await response.json()
            const { pr, verify } = data;
            setCurrentInvoice(pr);

            await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pr,
                    verify,
                    visitorId: visitorToken,
                }),
            })

            localStorage.setItem('payment_verify_link', verify)
            setIsGeneratingInvoice(false)
            setShowPaymentModal(true)
        } catch (error) {
            console.error(error)
            toast.error(tCommon('error') || "An error occurred")
            setIsGeneratingInvoice(false)
        }
    }

    const totalEvents = events.length
    const totalRecipients = events.reduce((acc, curr) => acc + curr.attendeeCount, 0)

    const handleUpdateToken = (e: React.FormEvent) => {
        e.preventDefault()
        localStorage.setItem('visitor_id', visitorToken)
        toast.success(t('header.visitorIdUpdated') || "Visitor ID updated")
        fetchEvents()
    }

    if (isCheckingAuth) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            </div>
        )
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full shadow-2xl border-slate-200">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center">
                            <ShieldAlert className="h-8 w-8 text-slate-400" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black">{t('restricted.title')}</CardTitle>
                            <CardDescription>{t('restricted.description')}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="password"
                                        placeholder={t('restricted.placeholder')}
                                        className="pl-10"
                                        value={entryKey}
                                        onChange={(e) => setEntryKey(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-slate-900 group">
                                {isLoginPending ? t('restricted.unlocking') : t('restricted.unlock')}
                                {isLoginPending && <Image src={'/logo.svg'} className="animate-spin" alt="logo" width={16} height={16} />}
                                {!isLoginPending && <Unlock className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
                            </Button>
                        </form>
                    </CardContent>
                    <div className="p-6 pt-0 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-50 mt-4">
                        <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors order-2 sm:order-1 flex items-center gap-1">
                            <ArrowLeft className="h-3 w-3" />
                            {t('restricted.back')}
                        </Link>

                        <Button
                            variant={'ghost'}
                            className="w-full sm:w-auto text-center inline-flex items-center gap-2 text-slate-600 group order-1 sm:order-2 hover:bg-slate-50 transition-all rounded-lg h-12"
                            onClick={handleInvoiceGeneration}
                        >
                            {t('restricted.pay')}
                            {isGeneratingInvoice && (
                                <Image src={'/logo.svg'} className="animate-spin" alt="logo" width={16} height={16} />
                            )}
                        </Button>
                    </div>
                </Card>

                <AnimatePresence>
                    {showPaymentModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowPaymentModal(false)}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] cursor-pointer"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[101] p-4"
                            >
                                <Card className="shadow-2xl border-slate-200 overflow-hidden">
                                    <CardHeader className="text-center pt-8">
                                        <div className="mx-auto h-16 w-16 flex items-center justify-center mb-2">
                                            <Image src={'/logo.svg'} alt="Calendrian" className={paymentInPending && !isSettled ? "animate-spin" : ""} width={64} height={64} />
                                        </div>
                                        <CardTitle className="text-2xl font-black">
                                            {isSettled ? t('payment.success') : t('payment.amount')}
                                        </CardTitle>
                                        <CardDescription>
                                            {isSettled ? t('payment.successDesc') : t('payment.support')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col items-center space-y-8 pb-10">
                                        {isSettled ? (
                                            <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex flex-col items-center gap-4">
                                                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-bold text-green-700">{t('payment.preimage')}</p>
                                                        <p className="text-[10px] text-green-600 uppercase tracking-widest mt-1">{t('payment.keepSafe')}</p>
                                                    </div>
                                                    <div className="w-full bg-white p-3 rounded-md border border-green-200 break-all font-mono text-[10px] text-green-800 text-center select-all">
                                                        {preimage}
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-md"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(preimage);
                                                        toast.success(t('payment.copiedPreimage') || "Preimage copied to clipboard");
                                                    }}
                                                >
                                                    {t('payment.copyPreimage')}
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[248px]">
                                                    {!isSettled && (
                                                        <div className="mb-4 flex justify-end items-center gap-2 cursor-pointer">
                                                            <Copy className="text-slate-500 w-4 h-4" onClick={() => { navigator.clipboard.writeText(currentInvoice); toast.success(t('payment.copiedInvoice') || "Invoice copied to clipboard") }} />
                                                            <p className="text-xs text-slate-500">{t('payment.copyInvoice')}</p>
                                                        </div>
                                                    )}
                                                    {isGeneratingInvoice ? (
                                                        <div className="flex flex-col items-center gap-3">
                                                            <Image src={'/logo.svg'} className="animate-spin" alt="logo" width={16} height={16} />
                                                            <p className="text-xs text-slate-400 font-medium">{t('payment.generating')}</p>
                                                        </div>
                                                    ) : currentInvoice ? (
                                                        <QRCodeSVG
                                                            value={currentInvoice}
                                                            size={200}
                                                            level="H"
                                                        />
                                                    ) : (
                                                        <p className="text-xs text-slate-400">{t('payment.failedQR')}</p>
                                                    )}
                                                </div>

                                                <div className="w-full space-y-4">
                                                    <Button
                                                        className="w-full bg-[#FBBC05] hover:bg-[#FBBC05] text-white font-bold py-4 text-lg rounded-md transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                                                        onClick={() => currentInvoice && window.open(`lightning:${currentInvoice}`)}
                                                        disabled={!currentInvoice || isGeneratingInvoice}
                                                    >
                                                        {t('payment.payInWallet')}
                                                    </Button>
                                                    <p className="text-xs text-center text-slate-400">
                                                        {tCommon('poweredBy')} Calendrian
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50/10 via-white to-purple-50/10 font-sans p-4 md:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="max-w-6xl mx-auto relative z-10 space-y-8">
                {/* Header */}
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
                        <form onSubmit={handleUpdateToken} className="flex items-center gap-2">
                            <div className="relative">
                                <Fingerprint className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    className="pl-9 w-[180px] bg-white/50 backdrop-blur-sm"
                                    placeholder={t('header.visitorId')}
                                    value={visitorToken}
                                    onChange={(e) => setVisitorToken(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="ghost" size="icon" className="text-slate-500" title={t('header.updateId')}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </form>
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
                            <div className="flex flex-col gap-3">
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

                {/* Aggregated Stats Cards */}
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Events Table */}
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

                    {/* Detail Sidebar / Stats */}
                    <div className="space-y-6">
                        {selectedEvent ? (
                            <Card className="shadow-2xl border-indigo-100 bg-white sticky top-8">
                                <CardHeader className="bg-indigo-50/30 border-b border-indigo-50">
                                    <CardTitle className="text-xl">{t('details.title')}</CardTitle>
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
                                                {t('details.viewGoogle')}
                                                <ExternalLink className="ml-1 h-3 w-3 group-hover:translate-y--0.5 group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>

                                    {isLoadingStats ? (
                                        <div className="py-12 flex flex-col items-center justify-center space-y-3">
                                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                            <p className="text-xs text-slate-400 font-medium">{t('details.loadingStats')}</p>
                                        </div>
                                    ) : eventStats ? (
                                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
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

                                            {eventStats.needsAction.count > 0 && (
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
                                        </div>
                                    ) : (
                                        <div className="py-12 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 px-6 text-center">
                                            <Info className="h-8 w-8 opacity-20 mb-2" />
                                            <p className="text-xs">{t('details.statsError')}</p>
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
                                    <h4 className="font-bold text-slate-900 mb-1">{t('details.engagementTitle')}</h4>
                                    <p className="text-sm">{t('details.engagementDesc')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="relative z-10 pt-20 pb-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                <p className="text-sm font-medium">{tCommon('poweredBy')} Calendrian</p>
                <div className="flex items-center gap-4 text-xs">
                    <Link href="/" className="hover:text-slate-900 transition-colors">{tCommon('home')}</Link>
                    <span className="text-slate-200">|</span>
                    <Link href="/privacy" className="hover:text-slate-900 transition-colors">{tFooter('privacy')}</Link>
                </div>
            </footer>
        </div>
    )
}

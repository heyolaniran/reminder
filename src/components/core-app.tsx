import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"
import { Button } from './ui/button'
import { useEffect, useState } from "react"
import { UploadCloud, FileSpreadsheet, CalendarIcon, Mail, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import Papa from 'papaparse'
import { toast } from "sonner"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { format } from "date-fns"
import { Textarea } from "./ui/textarea"
import Link from "next/link"
import { EventDetails } from "@/types/event-details-type"
import { fetchStats } from "@/hooks/fetchStats"
import { sendReminder } from "@/hooks/sendReminder"
export default function Core() {
    const [step, setStep] = useState<'upload' | 'configure' | 'preview' | 'success'>('upload')
    const [fileName, setFileName] = useState<string | null>(null)
    const [csvData, setCsvData] = useState<any[]>([])
    const [eventDetails, setEventDetails] = useState<EventDetails>({
        title: '',
        startDate: new Date(),
        endDate: new Date(),
        location: '',
        description: ''
    })
    const [lastEventId, setLastEventId] = useState<string | null>(null)
    const [stats, setStats] = useState<any>({})
    const [showStats, setShowStats] = useState(false)
    const [isLoadingStats, setIsLoadingStats] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [eventLink, setEventLink] = useState<string | null>(null)

    // translations
    const t = useTranslations('Home')
    const tSteps = useTranslations("Steps")
    const tToasts = useTranslations("Toasts")
    const tCommon = useTranslations("Common")
    const tErrors = useTranslations("Errors")

    // Check for pending follow-up and ensure visitor token
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // 1. Ensure visitor token
            if (!localStorage.getItem('visitor_id')) {
                const newToken = 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
                localStorage.setItem('visitor_id', newToken);
            }

            // 2. Check for pending follow-up
            const storedPending = sessionStorage.getItem('pending_followup_emails')
            if (storedPending) {
                try {
                    const emails = JSON.parse(storedPending)
                    if (Array.isArray(emails) && emails.length > 0) {
                        setCsvData(emails)
                        setStep('configure')
                        toast.success(tToasts('loadedPending', { count: emails.length }))
                    }
                } catch (e) {
                    console.error("Failed to parse pending emails", e)
                } finally {
                    sessionStorage.removeItem('pending_followup_emails')
                }
            }
        }
    }, [tToasts])




    // handle File Upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)

        Papa.parse(file, {
            complete: (results) => {
                const emails: string[] = []

                // Robust scanning: check every cell in every row for an email-like pattern
                results.data.forEach((row: any) => {
                    // row is an array (if header: false) or object (if header: true). 
                    // Object.values works for both, but since we set header: false, it's just an array of strings.
                    const values = Array.isArray(row) ? row : Object.values(row)

                    values.forEach((v: any) => {
                        if (typeof v === 'string' && v.includes('@') && v.includes('.')) {
                            // Basic cleanup to remove whitespace which might occur in CSVs
                            const cleanEmail = v.trim()
                            // Simple regex check to reduce false positives
                            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
                                emails.push(cleanEmail)
                            }
                        }
                    })
                })

                const uniqueEmails = [...new Set(emails)]

                // Restriction: Max 100 recipients
                if (uniqueEmails.length > 100) {
                    toast.warning(tToasts('limitExceeded'))
                    const limitedEmails = uniqueEmails.slice(0, 100)
                    setCsvData(limitedEmails)
                } else {
                    setCsvData(uniqueEmails)
                }

                if (uniqueEmails.length === 0) {
                    toast.error(tToasts('noEmails'))
                } else if (uniqueEmails.length <= 100) {
                    toast.success(tToasts('foundRecipients', { count: uniqueEmails.length }))
                }
            },
            header: false, // Set to false to handle simple lists like the user's test.csv
            skipEmptyLines: true
        })
    }

    // Fetch the stats for a specific event reminder
    const handleFetchStats = async () => {
        // Not last event reminder submitted
        if (!lastEventId) return

        setIsLoadingStats(true)
        try {

            const data = await fetchStats(lastEventId);

            if (data.success) {
                setStats(data.stats)
                setShowStats(true)
            } else {
                toast.error(data.error || tToasts('statsError'))
            }
        } catch (error) {
            console.error(error)
            toast.error(tToasts('statsError'))
        } finally {
            setIsLoadingStats(false)
        }
    }

    // send the reminder
    const handleSend = async () => {
        setIsSending(true)
        try {

            // send the reminder

            const data = await sendReminder(csvData, eventDetails);

            setStep("success")
            setEventLink(data.link)
            setLastEventId(data.eventId)
            toast.success(tToasts('invitesSent'))
        } catch (error) {
            console.error(error)
            toast.error(tToasts('sendError'))
        } finally {
            setIsSending(false)
        }
    }

    return (
        <>
            <Card className="shadow-2xl border-slate-200/60 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl transition-all duration-300">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">
                        {step === 'upload' && tSteps('upload.title')}
                        {step === 'configure' && tSteps('configure.title')}
                        {step === 'preview' && tSteps('preview.title')}
                        {step === 'success' && tSteps('success.title')}
                    </CardTitle>
                    <CardDescription>
                        {step === 'upload' && tSteps('upload.description')}
                        {step === 'configure' && tSteps('configure.description')}
                        {step === 'preview' && tSteps('preview.description')}
                        {step === 'success' && tSteps('success.description')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="min-h-[300px] flex flex-col justify-center">

                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-indigo-100 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                />
                                <div className="h-16 w-16 bg-[#4285F4] dark:bg-slate-800 text-white dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    {fileName ? <FileSpreadsheet className="h-8 w-8" /> : <UploadCloud className="h-8 w-8" />}
                                </div>
                                {fileName ? (
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{fileName}</p>
                                        <p className="text-sm text-slate-500">{tSteps('upload.recipientsFound', { count: csvData.length })}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{tSteps('upload.placeholder')}</p>
                                        <p className="text-sm text-slate-500 mt-1">{tSteps('upload.hint')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'configure' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{tSteps('configure.form.title')}</Label>
                                <Input
                                    placeholder={tSteps('configure.form.titlePlaceholder')}
                                    value={eventDetails.title}
                                    onChange={(e) => setEventDetails({ ...eventDetails, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2 flex flex-col">
                                    <Label>{tSteps('configure.form.startDate')}</Label>
                                    <Input
                                        type="datetime-local"
                                        value={format(eventDetails.startDate, "yyyy-MM-dd'T'HH:mm")}
                                        onChange={(e) => {
                                            const date = new Date(e.target.value)
                                            if (!isNaN(date.getTime())) {
                                                setEventDetails({ ...eventDetails, startDate: date })
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{tSteps('configure.form.location')}</Label>
                                    <Input
                                        placeholder={tSteps('configure.form.locationPlaceholder')}
                                        value={eventDetails.location}
                                        onChange={(e) => setEventDetails({ ...eventDetails, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2 flex flex-col">
                                    <Label>{tSteps('configure.form.endDate')}</Label>
                                    <Input
                                        type="datetime-local"
                                        value={format(eventDetails.endDate, "yyyy-MM-dd'T'HH:mm")}
                                        onChange={(e) => {
                                            const date = new Date(e.target.value)
                                            if (!isNaN(date.getTime())) {
                                                setEventDetails({ ...eventDetails, endDate: date })
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{tSteps('configure.form.description')}</Label>
                                <Textarea
                                    placeholder={tSteps('configure.form.descriptionPlaceholder')}
                                    value={eventDetails.description}
                                    onChange={(e) => setEventDetails({ ...eventDetails, description: e.target.value })}
                                    className="resize-none h-20"
                                />
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                                <div className="flex items-start space-x-4">
                                    <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{eventDetails.title || "Untitled Event"}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            {format(eventDetails.startDate, "PPP p")} - {format(eventDetails.endDate, "p")} • {eventDetails.location || "No Location"}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 border-t border-slate-200 dark:border-slate-700 pt-3">
                                            {eventDetails.description || "No description provided."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    <span className="font-medium text-indigo-900 dark:text-indigo-200">{tSteps('preview.totalRecipients')}</span>
                                </div>
                                <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">{csvData.length}</span>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center text-center py-8">
                            <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{tSteps('success.title')}</h3>
                            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                                {tSteps('success.summary', { count: csvData.length })}
                            </p>
                            <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                                <Button onClick={handleFetchStats} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoadingStats}>
                                    {isLoadingStats ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : tSteps('success.statsButton')}
                                </Button>
                                <Button asChild variant="ghost" className="w-full text-slate-500">
                                    <Link href="/dashboard">
                                        {tSteps('success.dashboardButton')}
                                    </Link>
                                </Button>
                                <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                                    {tSteps('success.anotherButton')}
                                </Button>
                            </div>

                            {showStats && stats && (
                                <div className="mt-8 w-full text-left space-y-4 border-t pt-6 animate-in slide-in-from-bottom duration-500">
                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{tSteps('success.engagementTitle')}</h4>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                                            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">{tSteps('success.accepted')}</p>
                                            <p className={`text-2xl font-black text-green-700 dark:text-green-300 ${localStorage.getItem('dashboard_access_key') ? '' : 'select-none blur-[10px]'}`}>{stats.accepted.count}</p>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">{tSteps('success.tentative')}</p>
                                            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{stats.tentative.count}</p>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                            <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">{tSteps('success.declined')}</p>
                                            <p className={`text-2xl font-black text-red-700 dark:text-green-300 ${localStorage.getItem('dashboard_access_key') ? '' : 'select-none blur-[10px]'}`}>{stats.declined.count}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{tSteps('success.noResponse')}</p>
                                            <p className="text-2xl font-black text-slate-700 dark:text-white">{stats.needsAction.count}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-4">
                                        {stats.needsAction.emails.length > 0 && (
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{tSteps('success.waiting')}</p>
                                                <div className={`flex flex-wrap gap-1 ${localStorage.getItem('dashboard_access_key') ? '' : 'select-none blur-[4px]'}`}>
                                                    {stats.needsAction.emails.map((email: string) => (
                                                        <span key={email} className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-700 border rounded-full text-slate-600 dark:text-slate-400">{email}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {stats.accepted.emails.length > 0 && (
                                            <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                                <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">{tSteps('success.success')}</p>
                                                <div className={`flex flex-wrap gap-1 ${localStorage.getItem('dashboard_access_key') ? '' : 'blur-[3px] cursor-pointer select-none'}`}>
                                                    {stats.accepted.emails.map((email: string) => (
                                                        <span key={email} className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-700 border border-green-200 dark:border-green-800 rounded-full text-green-600 dark:text-green-400">{email}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </CardContent>

                {step !== 'success' && (
                    <CardFooter className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (step === 'configure') setStep('upload')
                                if (step === 'preview') setStep('configure')
                            }}
                            disabled={step === 'upload' || isSending}
                        >
                            {tCommon('back')}
                        </Button>

                        <Button
                            className="bg-[#34A853] hover:bg-[#34A853]/80 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                            onClick={() => {
                                if (step === 'upload') {
                                    if (csvData.length > 0) setStep('configure')
                                    else toast.error(tToasts('uploadCsv'))
                                } else if (step === 'configure') {
                                    if (eventDetails.title) setStep('preview')
                                    else toast.error(tToasts('enterTitle'))
                                } else if (step === 'preview') {
                                    handleSend()
                                }
                            }}
                            disabled={(step === 'upload' && csvData.length === 0) || isSending}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tCommon('sending')}
                                </>
                            ) : (
                                <>
                                    {step === 'preview' ? tSteps('preview.blastButton') : tCommon('next')}
                                    {step !== 'preview' && <ArrowRight className="ml-2 h-4 w-4" />}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </>
    )
}
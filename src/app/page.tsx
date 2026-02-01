"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, UploadCloud, CheckCircle2, Loader2, ArrowRight, FileSpreadsheet, Mail, Calendar as CalendarIcon2 } from "lucide-react"
import Papa from "papaparse"
import Image from "next/image"
import Link from "next/link"

// Add declaration for Umami
declare global {
  interface Window {
    umami: {
      track: (eventName: string, eventData?: Record<string, any>) => void
    }
  }
}

export default function Home() {
  const [step, setStep] = useState<"upload" | "configure" | "preview" | "success">("upload")
  const [csvData, setCsvData] = useState<string[]>([])
  const [fileName, setFileName] = useState<string | null>(null)

  // Check for successful connection on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userEmail = localStorage.getItem('google_user_email')
      // We can track this if it's the first time we see it, or just generally
      // Ideally we'd have a flag 'just_connected' in URL or state, but for now 
      // let's check if the URL param exists which we added in callback
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('connected') === 'true' && userEmail) {
        if (window.umami) {
          window.umami.track('google_connected', { email: userEmail })
          // Clean up URL
          window.history.replaceState({}, '', '/')
        } else {
          // Retry if umami not loaded yet
          setTimeout(() => {
            if (window.umami) window.umami.track('google_connected', { email: userEmail })
            window.history.replaceState({}, '', '/')
          }, 2000)
        }
      }
    }
  })

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
            toast.success(`Loaded ${emails.length} pending recipients for follow-up!`)
          }
        } catch (e) {
          console.error("Failed to parse pending emails", e)
        } finally {
          sessionStorage.removeItem('pending_followup_emails')
        }
      }
    }
  }, [])

  const [eventDetails, setEventDetails] = useState({
    title: "",
    description: "",
    location: "",
    startDate: new Date(),
    endDate: new Date(),
    name: "",
    email: "",
  })

  const [isSending, setIsSending] = useState(false)

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
          toast.warning("Limit exceeded: Only the first 100 recipients were kept.")
          const limitedEmails = uniqueEmails.slice(0, 100)
          setCsvData(limitedEmails)
        } else {
          setCsvData(uniqueEmails)
        }

        if (uniqueEmails.length === 0) {
          toast.error("No valid emails found in the CSV. Please check the file format.")
        } else if (uniqueEmails.length <= 100) {
          toast.success(`Found ${uniqueEmails.length} recipients`)
        }
      },
      header: false, // Set to false to handle simple lists like the user's test.csv
      skipEmptyLines: true
    })
  }

  const [eventLink, setEventLink] = useState<string | null>(null)
  const [lastEventId, setLastEventId] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const handleSend = async () => {
    setIsSending(true)
    try {
      const refreshToken = localStorage.getItem('google_refresh_token')
      const userEmail = localStorage.getItem('google_user_email')

      const visitorToken = localStorage.getItem('visitor_id')

      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: csvData,
          eventDetails: eventDetails,
          refreshToken: refreshToken,
          visitorToken: visitorToken
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send invites')
      }

      const data = await response.json()
      setStep("success")
      setEventLink(data.link)
      setLastEventId(data.eventId)
      toast.success("Invites sent successfully!")

      // Track successful send
      if (window.umami) {
        window.umami.track('event_sent', {
          recipients_count: csvData.length,
          organizer_email: userEmail || 'unknown',
          visitor_token: visitorToken
        })
      }

    } catch (error) {
      console.error(error)
      toast.error("Something went wrong. Check your configuration.")
    } finally {
      setIsSending(false)
    }
  }

  const fetchStats = async () => {
    if (!lastEventId) return

    setIsLoadingStats(true)
    try {
      const refreshToken = localStorage.getItem('google_refresh_token')
      const url = new URL('/api/stats', window.location.origin)
      url.searchParams.append('eventId', lastEventId)
      if (refreshToken && refreshToken !== 'null') {
        url.searchParams.append('refreshToken', refreshToken)
      }

      const response = await fetch(url.toString())
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
        setShowStats(true)
      } else {
        toast.error(data.error || "Failed to fetch statistics")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch statistics")
    } finally {
      setIsLoadingStats(false)
    }
  }

  return (
    <div className=" bg-gradient-to-br from-yellow-50/10 via-white to-purple-50/10">
      <main className="min-h-screen dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 font-sans">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">

          {/* Left Side: Hero / Info */}
          <div className="flex flex-col justify-center space-y-6 md:pr-8">
            <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-full w-fit shadow-sm border">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">No Login Required</span>
            </div>
            <div className="flex items-center">
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                <span className="inline-flex items-center">
                  <Image src={'/logo.svg'} alt="C" className="w-[48px] h-[48px]" width={48} height={48} />
                  onvert
                </span> reminders to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] to-[#DB4437]">Active Presence</span>
              </h1>
            </div>


            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload your CSV list and instantly send reminders to thousands of phones. The easiest way to notify your audience without an app.
            </p>

            <div className="flex items-center space-x-8 pt-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">100%</span>
                <span className="text-sm text-slate-500">Delivery Rate</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">0s</span>
                <span className="text-sm text-slate-500">Setup Time</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              {typeof window !== 'undefined' && localStorage.getItem('google_refresh_token') ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      ✓ Connected to Google Calendar
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        localStorage.removeItem('google_refresh_token')
                        window.location.reload()
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Disconnect
                    </Button>
                  </div>
                  <Button asChild variant="outline" className="w-fit">
                    <Link href="/dashboard">
                      <CalendarIcon2 className="mr-2 h-4 w-4" />
                      View Events Dashboard
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-slate-500">Connect your Google Calendar to send custom reminders</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => window.location.href = '/api/auth/login'}
                      className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                    >
                      <img src="https://www.google.com/favicon.ico" className="w-4 h-4 mr-2" alt="Google" />
                      Connect Google Calendar
                    </Button>
                    <Button asChild variant="ghost" className="text-slate-500 hover:text-slate-900">
                      <Link href="/dashboard">
                        View Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: App Interface */}
          <Card className="shadow-2xl border-slate-200/60 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl transition-all duration-300">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">
                {step === 'upload' && "Upload Audience"}
                {step === 'configure' && "Event Details"}
                {step === 'preview' && "Review & Send"}
                {step === 'success' && "Sent Successfully!"}
              </CardTitle>
              <CardDescription>
                {step === 'upload' && "Start by uploading your list of recipients."}
                {step === 'configure' && "Customize the notification they will receive."}
                {step === 'preview' && "Double check everything before blasting."}
                {step === 'success' && "Your event requests are on their way."}
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
                        <p className="text-sm text-slate-500">{csvData.length} recipients found</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Click or Drag CSV here</p>
                        <p className="text-sm text-slate-500 mt-1">Supports Gmail addresses</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 'configure' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Event Title</Label>
                    <Input
                      placeholder="e.g. Exclusive Product Launch"
                      value={eventDetails.title}
                      onChange={(e) => setEventDetails({ ...eventDetails, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 flex flex-col">
                      <Label>Start Date & Time</Label>
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
                      <Label>Location (Optional)</Label>
                      <Input
                        placeholder="Online / Chicago"
                        value={eventDetails.location}
                        onChange={(e) => setEventDetails({ ...eventDetails, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2 flex flex-col">
                      <Label>End Date & Time</Label>
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
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Join us for..."
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
                      <span className="font-medium text-indigo-900 dark:text-indigo-200">Total Recipients</span>
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
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sent Successfully!</h3>
                  <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                    We've sent calendar notifications to {csvData.length} devices. They should see it pop up shortly.
                  </p>
                  <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                    <Button onClick={fetchStats} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoadingStats}>
                      {isLoadingStats ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "View Real-time Statistics"}
                    </Button>
                    <Button asChild variant="ghost" className="w-full text-slate-500">
                      <Link href="/dashboard">
                        Go to Statistics Dashboard
                      </Link>
                    </Button>
                    <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                      Send Another
                    </Button>
                  </div>

                  {showStats && stats && (
                    <div className="mt-8 w-full text-left space-y-4 border-t pt-6 animate-in slide-in-from-bottom duration-500">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">Attendee Response Summary</h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                          <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">Accepted</p>
                          <p className="text-2xl font-black text-green-700 dark:text-green-300">{stats.accepted.count}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Tentative</p>
                          <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{stats.tentative.count}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                          <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Declined</p>
                          <p className="text-2xl font-black text-red-700 dark:text-red-300">{stats.declined.count}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">No Response</p>
                          <p className="text-2xl font-black text-slate-700 dark:text-white">{stats.needsAction.count}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mt-4">
                        {stats.needsAction.emails.length > 0 && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Waiting for response from:</p>
                            <div className="flex flex-wrap gap-1">
                              {stats.needsAction.emails.map((email: string) => (
                                <span key={email} className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-700 border rounded-full text-slate-600 dark:text-slate-400">{email}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {stats.accepted.emails.length > 0 && (
                          <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                            <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Successfully added by:</p>
                            <div className="flex flex-wrap gap-1">
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
                  Back
                </Button>

                <Button
                  className="bg-[#34A853] hover:bg-[#34A853]/80 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                  onClick={() => {
                    if (step === 'upload') {
                      if (csvData.length > 0) setStep('configure')
                      else toast.error("Please upload a CSV with emails") // Should use toast
                    } else if (step === 'configure') {
                      if (eventDetails.title) setStep('preview')
                      else toast.error("Please enter a title")
                    } else if (step === 'preview') {
                      handleSend()
                    }
                  }}
                  disabled={(step === 'upload' && csvData.length === 0) || isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      {step === 'preview' ? 'Blast Notification' : 'Next Step'}
                      {step !== 'preview' && <ArrowRight className="ml-2 h-4 w-4" />}
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
      <footer className="relative z-10 pb-12 flex flex-col items-center justify-center gap-4 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{new Date().getFullYear()}</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <p className="text-sm">
            Shaped by <Link href="https://x.com/heyolaniran" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-900 dark:text-white hover:underline decoration-indigo-500 underline-offset-4">Olaniran</Link>
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>

  )
}

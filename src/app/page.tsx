"use client"

import { useState, useRef } from "react"
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
import { CalendarIcon, UploadCloud, CheckCircle2, Loader2, ArrowRight, FileSpreadsheet, Mail } from "lucide-react"
import Papa from "papaparse"

export default function Home() {
  const [step, setStep] = useState<"upload" | "configure" | "preview" | "success">("upload")
  const [csvData, setCsvData] = useState<string[]>([])
  const [fileName, setFileName] = useState<string | null>(null)

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
        setCsvData(uniqueEmails)

        if (uniqueEmails.length === 0) {
          toast.error("No valid emails found in the CSV. Please check the file format.")
        } else {
          toast.success(`Found ${uniqueEmails.length} recipients`)
        }
      },
      header: false, // Set to false to handle simple lists like the user's test.csv
      skipEmptyLines: true
    })
  }

  const [eventLink, setEventLink] = useState<string | null>(null)

  const handleSend = async () => {
    setIsSending(true)
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: csvData,
          eventDetails: eventDetails,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send invites')
      }

      const data = await response.json()
      setStep("success")
      setEventLink(data.link)
      toast.success("Invites sent successfully!")

    } catch (error) {
      console.error(error)
      toast.error("Something went wrong. Check your configuration.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">

        {/* Left Side: Hero / Info */}
        <div className="flex flex-col justify-center space-y-6 md:pr-8">
          <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-full w-fit shadow-sm border">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">No Login Required</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Convert reminders to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Active Presence</span>
          </h1>

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
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">Free</span>
              <span className="text-sm text-slate-500">To Start</span>
            </div>
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
                  <div className="h-16 w-16 bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !eventDetails.startDate && "text-muted-foreground")}>
                          {eventDetails.startDate ? format(eventDetails.startDate, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={eventDetails.startDate}
                          onSelect={(date) => date && setEventDetails({ ...eventDetails, startDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Organizer Name</Label>
                    <Input
                      placeholder="Your Company / Name"
                      value={eventDetails.name}
                      onChange={(e) => setEventDetails({ ...eventDetails, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Organizer Email</Label>
                    <Input
                      placeholder="you@example.com"
                      value={eventDetails.email}
                      onChange={(e) => setEventDetails({ ...eventDetails, email: e.target.value })}
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
                        {format(eventDetails.startDate, "PPP")} • {eventDetails.location || "No Location"}
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
                <Button onClick={() => window.location.reload()} variant="outline" className="mr-2">
                  Send Another
                </Button>
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
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
  )
}

"use client"
import { useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import Link from "next/link"
import NavBar from "@/components/nav-bar"
import Hero from "@/components/hero-section"
import Core from "@/components/core-app"
import Footer from "@/components/footer"
import FAQ from "@/components/faq"

export default function Calendrian() {
    const tFooter = useTranslations("Footer")
    const locale = useLocale()
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
    }, [])


    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50/10 via-white to-purple-50/10 flex flex-col">
            <NavBar />

            <main className="flex-grow pt-24 pb-12 p-4 font-sans relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 mb-20">
                    {/* Left Side: Hero / Info */}
                    <Hero />

                    {/* Right Side: App Interface */}
                    <Core />
                </div>

                <FAQ />
            </main>
            <Footer />
        </div>
    )
}
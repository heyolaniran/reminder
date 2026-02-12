"use client"

import { useTranslations } from "next-intl"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

export default function FAQ() {
    const t = useTranslations("FAQ")

    return (
        <section className="mt-24 md:mt-32 max-w-4xl mx-auto px-4 pb-20">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-2 mb-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <HelpCircle className="w-6 h-6" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                    {t('title')}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                    {t('description')}
                </p>
            </div>

            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="what-is" className="border-b border-slate-200 dark:border-slate-800 px-6">
                        <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-6">
                            {t('questions.whatIsCalendrian.question')}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-300 text-md leading-relaxed pb-6">
                            {t('questions.whatIsCalendrian.answer')}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="no-login" className="border-b border-slate-200 dark:border-slate-800 px-6">
                        <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-6">
                            {t('questions.noLogin.question')}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-300 text-md leading-relaxed pb-6">
                            {t('questions.noLogin.answer')}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="pop" className="border-b border-slate-200 dark:border-slate-800 px-6">
                        <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-6">
                            {t('questions.proofOfPayment.question')}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-300 text-md leading-relaxed pb-6">
                            {t('questions.proofOfPayment.answer')}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="reminders" className="border-b border-slate-200 dark:border-slate-800 px-6">
                        <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-6">
                            {t('questions.sendReminders.question')}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-300 text-md leading-relaxed pb-6">
                            {t('questions.sendReminders.answer')}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="privacy" className="border-b border-slate-200 dark:border-slate-800 px-6">
                        <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-6">
                            {t('questions.dataPrivacy.question')}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-300 text-md leading-relaxed pb-6">
                            {t('questions.dataPrivacy.answer')}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="premium" className="px-6 border-b-0">
                        <AccordionTrigger className="text-left text-lg font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 py-6">
                            {t('questions.premium.question')}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 dark:text-slate-300 text-md leading-relaxed pb-6">
                            {t('questions.premium.answer')}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    )
}

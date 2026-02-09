"use client"

import { Button } from "../ui/button"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export default function LoginFooter({ visitorToken, setShowPaymentModal, setCurrentInvoice, isGeneratingInvoice, setIsGeneratingInvoice }: { visitorToken: string, setShowPaymentModal: React.Dispatch<React.SetStateAction<boolean>>, setCurrentInvoice: React.Dispatch<React.SetStateAction<string>>, isGeneratingInvoice: boolean, setIsGeneratingInvoice: React.Dispatch<React.SetStateAction<boolean>> }) {
    const t = useTranslations("Dashboard")
    const tCommon = useTranslations("Common")
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

    return (
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
    )
}

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, ShieldAlert } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "motion/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Unlock } from "lucide-react"
import { toast } from "sonner"
import { CheckCircle2 } from "lucide-react"
import { Copy } from "lucide-react"
import { CopyCheck } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import LoginForm from "./login-form"
import LoginFooter from "./login-footer"
import PaymentBox from "./payment-box"


export default function Unauthorized({ visitorToken, setIsAuthorized }: { visitorToken: string, setIsAuthorized: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false)
    const t = useTranslations("Dashboard");
    const tCommon = useTranslations("Common");

    const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
    const [currentInvoice, setCurrentInvoice] = useState<string>("");

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
                    <LoginForm setIsAuthorized={setIsAuthorized} />
                </CardContent>
                <LoginFooter visitorToken={visitorToken} setShowPaymentModal={setShowPaymentModal} setCurrentInvoice={setCurrentInvoice} isGeneratingInvoice={isGeneratingInvoice} setIsGeneratingInvoice={setIsGeneratingInvoice} />
            </Card>

            <PaymentBox showPaymentModal={showPaymentModal} setShowPaymentModal={setShowPaymentModal} currentInvoice={currentInvoice} isGeneratingInvoice={isGeneratingInvoice} />
        </div>
    )
}
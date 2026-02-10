"use client"

import { AnimatePresence } from "framer-motion"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Copy, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function PaymentBox({ showPaymentModal, setShowPaymentModal, currentInvoice, isGeneratingInvoice }: { showPaymentModal: boolean, setShowPaymentModal: React.Dispatch<React.SetStateAction<boolean>>, currentInvoice: string, isGeneratingInvoice: boolean }) {
    const t = useTranslations("Dashboard")
    const tCommon = useTranslations("Common")

    const [paymentInPending, setPaymentInPending] = useState(false)
    const [isSettled, setIsSettled] = useState(false)
    const [preimage, setPreimage] = useState("")

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (showPaymentModal && !isSettled) {
            setPaymentInPending(true);
            const verifyLink = localStorage.getItem('payment_verify_link');
            if (verifyLink) {
                interval = setInterval(async () => {
                    try {
                        const response = await fetch(verifyLink);
                        const data = await response.json();
                        // console.log("Payment verification response:", data);

                        if (data.settled) {
                            setIsSettled(true);
                            setPaymentInPending(false);
                            // Blink/Galoy might return preimage, payment_preimage, or secret
                            const validPreimage = data.preimage || data.payment_preimage || data.secret || "Preimage not found";
                            setPreimage(validPreimage);

                            await fetch('/api/payments', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    verifyLink: verifyLink,
                                    masterKey: validPreimage,
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
    }, [showPaymentModal, isSettled]);

    return (
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
                                                <div className="mb-4 flex justify-end items-center cursor-pointer">
                                                    <div className="py-0 inline-flex gap-2" onClick={() => { navigator.clipboard.writeText(currentInvoice); toast.success(t('payment.copiedInvoice') || "Invoice copied to clipboard") }} >
                                                        <Copy className="text-slate-500 w-4 h-4" />
                                                        <p className="text-xs text-slate-500">{t('payment.copyInvoice')}</p>
                                                    </div>
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
    )
}
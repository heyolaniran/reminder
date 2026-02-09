import { t } from "@/constants"
import { useState } from "react"
import { Lock, Unlock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

export default function LoginForm({ setIsAuthorized }: { setIsAuthorized: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [entryKey, setEntryKey] = useState<string>("");
    const [isLoginPending, setIsLoginPending] = useState<boolean>(false);
    const t = useTranslations("Dashboard")
    const tCommon = useTranslations("Common")

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
                localStorage.setItem('auth_visitor_id', data.data[0].visitorId);
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
    return (
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
    )
}
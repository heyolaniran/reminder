import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";


export default function NoSelectedEvent() {
    const t = useTranslations("Dashboard")
    return (
        <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                <ChevronRight className="h-8 w-8 opacity-20" />
            </div>
            <div>
                <h4 className="font-bold text-slate-900 mb-1">{t('details.engagementTitle')}</h4>
                <p className="text-sm">{t('details.engagementDesc')}</p>
            </div>
        </div>
    )
}
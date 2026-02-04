import { useTranslations } from "next-intl"

const t = useTranslations('Home')
const tSteps = useTranslations("Steps")
const tToasts = useTranslations("Toasts")
const tCommon = useTranslations("Common")
const tErrors = useTranslations("Errors")

export { t, tSteps, tToasts, tCommon, tErrors }

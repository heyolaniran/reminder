"use client"
import Image from "next/image";


export default function Loading() {
    return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <Image className="animate-spin" src="/logo.svg" alt="Logo" width={32} height={32} />
        </div>
    )
}
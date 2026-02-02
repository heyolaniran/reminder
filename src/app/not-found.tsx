import Link from 'next/link';
import { Button } from '../components/ui/button';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50/10 via-white to-purple-50/10 flex flex-col items-center justify-center p-4 text-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="relative z-10 space-y-4">

                <Image src="/404.svg" alt="404" width={600} height={600} className='mx-auto' />

                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        You got lost but you are still in your safe place
                    </p>
                </div>

                <div className="pt-1">
                    <Link href="/">
                        <Button className="text-slate-500 gap-2" variant={'link'} size={'lg'}>
                            <ArrowLeft className='animate-pulse w-4 h-4' />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 font-sans">
            <header className="max-w-4xl mx-auto p-6 md:p-10">
                <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                    <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                    <span className="font-bold text-slate-900 dark:text-white">Calendrian</span>
                </Link>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">General Conditions</h1>
                <p className="text-slate-500 dark:text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
            </header>

            <main className="max-w-4xl mx-auto p-6 md:p-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800 mb-20 shadow-xl">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            By accessing or using Calendrian, you agree to be bound by these General Conditions and our Privacy Policy. If you do not agree, you may not use the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Description of Service</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            Calendrian is a tool designed to help users send calendar event invitations to a list of recipients via the Google Calendar API. We provide the interface to facilitate bulk invitation sending for legitimate purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Anti-Spam Policy</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            <strong>Spamming is strictly prohibited.</strong> You agree to only send invitations to individuals who have consented to receive them or where you have an existing relationship. Unauthorized or malicious use of this tool to harass or spam users will result in immediate termination of access.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. User Responsibility</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            You are responsible for:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
                            <li>The accuracy of the recipient list you upload.</li>
                            <li>The content of the invitations you send.</li>
                            <li>Ensuring your use complies with Google's API Terms of Service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. Limitation of Liability</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            Calendrian is provided "as is" without warranties of any kind. We are not liable for any account suspensions by Google, delivery failures, or damages resulting from the use of this tool.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">6. Termination</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including breach of terms.
                        </p>
                    </section>
                </div>
            </main>

            <footer className="max-w-4xl mx-auto p-6 md:p-10 border-t border-slate-200 dark:border-slate-800 text-center">
                <Link href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">← Back to App</Link>
            </footer>
        </div>
    );
}

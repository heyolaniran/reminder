import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 font-sans">
            <header className="max-w-4xl mx-auto p-6 md:p-10">
                <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
                    <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                    <span className="font-bold text-slate-900 dark:text-white">Calendrian</span>
                </Link>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
                <p className="text-slate-500 dark:text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
            </header>

            <main className="max-w-4xl mx-auto p-6 md:p-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800 mb-20 shadow-xl">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Introduction</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            Welcome to Calendrian. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. The Data We Collect</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            We collect data to provide a better service to our users. This includes:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
                            <li><strong>Google Account Information:</strong> To send invitations, we request access to your Google Calendar. This includes your email address and an OAuth Refresh Token.</li>
                            <li><strong>Usage Information:</strong> We use Umami Analytics to track anonymous usage data to improve our service (e.g., how many events are sent).</li>
                            <li><strong>Recipient Information:</strong> When you upload a CSV, we temporarily process recipient emails to send invitations. We do not store these emails on our servers permanently.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. How We Store Your Data</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            <strong>We take a local-first approach to privacy.</strong> Your Google Refresh Token and your email address are stored directly in your browser's <code>localStorage</code>. This means we do not store your credentials on our database. When you perform an action, the token is sent to our API only to fulfill the request.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Third-Party Services</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            Our service interacts with:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
                            <li><strong>Google Calendar API:</strong> To create and manage calendar events.</li>
                            <li><strong>Umami Analytics:</strong> For privacy-friendly, cookieless tracking of application usage.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. Your Rights</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            You can disconnect your Google Account at any time by clicking the "Disconnect" button on the homepage, which will clear all credentials from your local storage.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">6. Contact Us</h2>
                        <p className="text-slate-600 dark:text-slate-300">
                            If you have any questions about this privacy policy, please contact us via X (formerly Twitter) @heyolaniran.
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

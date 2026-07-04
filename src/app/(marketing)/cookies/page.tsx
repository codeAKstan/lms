import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Cookies Policy",
    description: "Cookies Policy for Clean Technology Hub LMS - Learn how we use cookies and similar technologies.",
};

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-16">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookies Policy</h1>
                    <p className="text-sm text-muted-foreground mb-8">Last updated: February 13, 2026</p>

                    <div className="prose prose-gray max-w-none">
                        <p className="text-lg text-gray-700 mb-8">
                            This Cookies Policy explains how Clean Technology Hub uses cookies and similar technologies to recognize you when you visit our Learning Management System. It explains what these technologies are, why we use them, and your rights to control our use of them.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. What Are Cookies?</h2>
                        <p className="text-gray-700 mb-4">
                            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                        </p>
                        <p className="text-gray-700 mb-4">
                            Cookies can be &quot;persistent&quot; or &quot;session&quot; cookies:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                            <li><strong>Persistent cookies:</strong> Remain on your device until deleted or they reach their expiration date</li>
                            <li><strong>Session cookies:</strong> Are deleted when you close your browser</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Why We Use Cookies</h2>
                        <p className="text-gray-700 mb-4">
                            We use cookies for several important reasons:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                            <li><strong>Essential Operations:</strong> To enable core platform functionality like authentication and course access</li>
                            <li><strong>Security:</strong> To protect your account and prevent unauthorized access</li>
                            <li><strong>Preferences:</strong> To remember your settings and preferences</li>
                            <li><strong>Performance:</strong> To analyze how you use our platform and improve user experience</li>
                            <li><strong>Analytics:</strong> To understand usage patterns and optimize our services</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Types of Cookies We Use</h2>

                        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Strictly Necessary Cookies</h3>
                        <p className="text-gray-700 mb-4">
                            These cookies are essential for the platform to function properly. They enable you to navigate the site and use its features, such as accessing secure areas. Without these cookies, services like course enrollment and progress tracking cannot be provided.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <p className="text-sm font-semibold text-gray-800 mb-2">Examples:</p>
                            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                                <li>Authentication cookies (keeping you logged in)</li>
                                <li>Security cookies (protecting against CSRF attacks)</li>
                                <li>Load balancing cookies</li>
                            </ul>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.2 Performance and Analytics Cookies</h3>
                        <p className="text-gray-700 mb-4">
                            These cookies collect information about how you use our platform, such as which pages you visit most often and if you receive error messages. This data helps us improve the platform&apos;s performance and user experience.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <p className="text-sm font-semibold text-gray-800 mb-2">Examples:</p>
                            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                                <li>Page view tracking</li>
                                <li>User journey analysis</li>
                                <li>Error tracking and reporting</li>
                                <li>Platform performance monitoring</li>
                            </ul>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.3 Functionality Cookies</h3>
                        <p className="text-gray-700 mb-4">
                            These cookies allow our platform to remember choices you make (such as your username, language, or region) and provide enhanced, more personalized features.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <p className="text-sm font-semibold text-gray-800 mb-2">Examples:</p>
                            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                                <li>Language preferences</li>
                                <li>Display preferences (dark mode, font size)</li>
                                <li>Video player settings</li>
                                <li>Course progress state</li>
                            </ul>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.4 Targeting and Advertising Cookies (If Applicable)</h3>
                        <p className="text-gray-700 mb-4">
                            Currently, we do not use advertising cookies. If this changes in the future, we will update this policy and seek your consent where required.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Third-Party Cookies</h2>
                        <p className="text-gray-700 mb-4">
                            In addition to our own cookies, we may use cookies from trusted third-party services:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                            <li><strong>Supabase:</strong> For authentication and database services</li>
                            <li><strong>Analytics Providers:</strong> To understand platform usage and improve user experience</li>
                            <li><strong>Payment Processing:</strong> Paystack may use cookies for secure payment processing</li>
                        </ul>
                        <p className="text-gray-700 mb-4">
                            These third parties have their own privacy policies and cookie policies. We recommend reviewing them for detailed information.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. How to Control Cookies</h2>

                        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Browser Controls</h3>
                        <p className="text-gray-700 mb-4">
                            Most web browsers allow you to control cookies through their settings. You can:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                            <li>View cookies stored on your device</li>
                            <li>Delete cookies individually or all at once</li>
                            <li>Block third-party cookies</li>
                            <li>Block all cookies (not recommended as it may affect platform functionality)</li>
                            <li>Set preferences to be notified when cookies are set</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Browser-Specific Instructions</h3>
                        <p className="text-gray-700 mb-4">
                            For specific instructions on managing cookies, refer to your browser&apos;s help documentation:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                            <li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                            <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                            <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                            <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Impact of Blocking Cookies</h3>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
                            <p className="text-gray-800 font-semibold mb-2">⚠️ Important Note</p>
                            <p className="text-gray-700">
                                If you choose to block or delete cookies, some features of our platform may not function properly. Specifically, you may not be able to:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                                <li>Stay logged in to your account</li>
                                <li>Access enrolled courses</li>
                                <li>Save your progress</li>
                                <li>Use certain interactive features</li>
                            </ul>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Other Tracking Technologies</h2>
                        <p className="text-gray-700 mb-4">
                            In addition to cookies, we may use other tracking technologies:
                        </p>
                        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                            <li><strong>Local Storage:</strong> To store user preferences and application data</li>
                            <li><strong>Session Storage:</strong> For temporary data during your browsing session</li>
                            <li><strong>Web Beacons:</strong> Small graphics used in emails to track open rates (if applicable)</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Updates to This Policy</h2>
                        <p className="text-gray-700 mb-4">
                            We may update this Cookies Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. We will notify you of any significant changes by posting the updated policy on this page with a new &quot;Last updated&quot; date.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Your Consent</h2>
                        <p className="text-gray-700 mb-4">
                            By continuing to use our platform, you consent to our use of cookies as described in this policy. For essential cookies required for platform operation, consent is implied through your use of the service.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Contact Us</h2>
                        <p className="text-gray-700 mb-4">
                            If you have any questions about our use of cookies or this Cookies Policy, please contact us:
                        </p>
                        <div className="bg-gray-50 p-6 rounded-lg mb-4">
                            <p className="text-gray-700 mb-2"><strong>Email:</strong> info@cleantechnologyhub.org</p>
                            <p className="text-gray-700 mb-2"><strong>Phone:</strong> +234 809 602 4444</p>
                            <p className="text-gray-700"><strong>Address:</strong> 1, Sarki Tafida St. Guzape, Abuja FCT, Nigeria</p>
                        </div>

                        <div className="bg-primary/5 border-l-4 border-primary p-6 rounded mt-8">
                            <p className="text-gray-800">
                                <strong>Related Policies:</strong> For more information about how we handle your personal data, please see our <Link href="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

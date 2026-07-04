import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy for Clean Technology Hub LMS - Operating under the Nigeria Data Protection Act 2023.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-16">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        CLEAN TECHNOLOGY HUB (CTH)
                    </h1>
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-6">
                        ONLINE LEARNING PLATFORM – PRIVACY POLICY
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground mb-8 border-b border-gray-100 pb-6">
                        <span className="font-medium">Effective Date: February 16, 2026</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="font-medium">Last Updated: February 16, 2026</span>
                    </div>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">1. INTRODUCTION</h3>
                            <p>
                                Clean Technology Hub Ltd/GTE (“CTH”, “we”, “us”, or “our”) operates an online learning platform (the “Platform”).
                                This Privacy Policy explains how we collect, use, store, and protect your personal data when you access or use our Platform.
                            </p>
                            <p className="mt-2">
                                We are committed to protecting your privacy and ensuring that your personal data is processed in accordance with the
                                <strong> Nigeria Data Protection Act 2023 (NDPA)</strong> and applicable international data protection standards.
                            </p>
                            <p className="mt-2">
                                By using the Platform, you agree to the practices described in this Privacy Policy.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">2. DEFINITIONS</h3>
                            <p>For the purpose of this Privacy Policy:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li><strong>“Personal Data”</strong> means any information that can identify an individual directly.</li>
                                <li><strong>“User”</strong> means any person who registers on or uses the Platform.</li>
                                <li><strong>“Platform”</strong> means the CTH online learning website, applications, and associated services.</li>
                                <li><strong>“Processing”</strong> means any operation performed on personal data such as collection, storage, use, or deletion.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">3. DATA CONTROLLER</h3>
                            <p>Clean Technology Hub Ltd/GTE is the Data Controller responsible for your personal data.</p>
                            <div className="bg-gray-50 p-4 rounded-lg mt-3 border border-gray-100">
                                <h4 className="font-semibold mb-2">Contact Details:</h4>
                                <ul className="space-y-1 text-sm">
                                    <li className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                                        <span>No. 1 Sarki Tafida Street, Guzape, Abuja, Nigeria</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Mail className="w-4 h-4 mt-0.5 text-primary" />
                                        <a href="mailto:info@cleantechnologyhub.org" className="hover:underline text-primary">info@cleantechnologyhub.org</a>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 mt-0.5 text-primary" />
                                        <a href="tel:+2348096024444" className="hover:underline text-primary">+234 809 602 4444</a>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">4. PERSONAL DATA WE COLLECT</h3>
                            <p>We may collect the following categories of personal data:</p>

                            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.1 Information You Provide</h4>
                            <p>When you register or use the Platform, we may collect:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Full name</li>
                                <li>Email address</li>
                                <li>Phone number</li>
                                <li>Date of birth</li>
                                <li>Gender</li>
                                <li>Educational background</li>
                                <li>Professional information</li>
                                <li>Profile photos</li>
                                <li>Billing and payment details</li>
                                <li>Course preferences</li>
                            </ul>

                            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.2 Automatically Collected Information</h4>
                            <p>When you use the Platform, we may collect:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>IP address</li>
                                <li>Device information</li>
                                <li>Browser type</li>
                                <li>Usage data</li>
                                <li>Log files</li>
                                <li>Cookies and analytics data</li>
                            </ul>

                            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">4.3 Third-Party Information</h4>
                            <p>We may receive data from:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Payment processors</li>
                                <li>Partner organizations</li>
                                <li>Training sponsors</li>
                                <li>Referring institutions</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">5. PURPOSE OF DATA COLLECTION</h3>
                            <p>We process your personal data for the following purposes:</p>
                            <ul className="list-none space-y-2 mt-2">
                                <li>5.1 To create and manage your user account</li>
                                <li>5.2 To provide access to courses and learning materials</li>
                                <li>5.3 To process payments and issue invoices</li>
                                <li>5.4 To issue certificates and verify completion</li>
                                <li>5.5 To communicate important updates</li>
                                <li>5.6 To improve Platform functionality</li>
                                <li>5.7 To comply with legal and regulatory requirements</li>
                                <li>5.8 To prevent fraud and ensure security</li>
                            </ul>
                            <p className="mt-2 italic">We only collect data that is necessary for these legitimate purposes.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">6. LEGAL BASIS FOR PROCESSING</h3>
                            <p>CTH processes personal data based on:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>User consent</li>
                                <li>Performance of a contract (course enrollment)</li>
                                <li>Legal obligations</li>
                                <li>Legitimate business interests</li>
                                <li>Public interest purposes</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">7. DATA SHARING AND DISCLOSURE</h3>
                            <p>We may share your personal data with:</p>

                            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.1 Service Providers</h4>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Payment processors</li>
                                <li>Email communication providers</li>
                                <li>Cloud hosting services</li>
                                <li>Learning management system providers</li>
                            </ul>

                            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.2 Legal and Regulatory Authorities</h4>
                            <p>Where required by law or regulation.</p>

                            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.3 Partners and Sponsors</h4>
                            <p>Where courses are funded or organized in partnership with third parties, limited data may be shared for reporting and certification purposes.</p>
                            <p className="mt-2 font-medium">CTH does not sell personal data to third parties.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">8. DATA RETENTION</h3>
                            <ul className="list-none space-y-2">
                                <li>8.1 Personal data is retained only for as long as necessary to fulfill the purposes for which it was collected.</li>
                                <li>8.2 Course records and certificates may be retained for long-term verification purposes.</li>
                                <li>8.3 Users may request deletion of their personal data, subject to legal or contractual obligations.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">9. DATA SECURITY</h3>
                            <p>CTH implements appropriate technical and organizational measures to protect your data, including:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Secure servers</li>
                                <li>Encrypted connections</li>
                                <li>Access controls</li>
                                <li>Restricted data access</li>
                                <li>Regular security monitoring</li>
                            </ul>
                            <p className="mt-2 text-sm text-gray-500">While we strive to protect your data, no system can guarantee 100% security.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">10. YOUR RIGHTS</h3>
                            <p>Under the <strong>Nigeria Data Protection Act 2023</strong>, you have the right to:</p>
                            <ul className="list-none space-y-2 mt-2">
                                <li>10.1 Access your personal data</li>
                                <li>10.2 Request correction of inaccurate data</li>
                                <li>10.3 Request deletion of your data</li>
                                <li>10.4 Object to certain processing activities</li>
                                <li>10.5 Withdraw consent at any time</li>
                                <li>10.6 Request data portability</li>
                                <li>10.7 Lodge complaints with the Nigeria Data Protection Commission</li>
                            </ul>
                            <p className="mt-3">
                                To exercise any of these rights, contact us at: <a href="mailto:info@cleantechnologyhub.org" className="text-primary hover:underline">info@cleantechnologyhub.org</a>
                            </p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">11. COOKIES AND TRACKING TECHNOLOGIES</h3>
                            <p>The Platform uses cookies to:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Improve user experience</li>
                                <li>Analyze Platform usage</li>
                                <li>Enable essential functionality</li>
                            </ul>
                            <p className="mt-2">You may control cookies through your browser settings. Disabling cookies may affect Platform functionality.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">12. INTERNATIONAL DATA TRANSFERS</h3>
                            <p>Where necessary, personal data may be transferred outside Nigeria to trusted service providers. Such transfers will only occur with adequate safeguards in place.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">13. CHILDREN’S PRIVACY</h3>
                            <p>The Platform is not primarily intended for children under 18. Where minors participate with parental consent, CTH will take reasonable steps to protect their data in accordance with applicable laws.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">14. THIRD-PARTY LINKS</h3>
                            <p>The Platform may contain links to external websites. CTH is not responsible for the privacy practices of such third-party platforms.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">15. DATA BREACH PROCEDURE</h3>
                            <p>In the event of a data breach:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>CTH will notify affected users promptly</li>
                                <li>Appropriate corrective actions will be taken</li>
                                <li>The Nigeria Data Protection Commission will be notified where required</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">16. CHANGES TO THIS POLICY</h3>
                            <p>CTH may update this Privacy Policy from time to time. Updated versions will be posted on the Platform with a revised effective date. Continued use of the Platform signifies acceptance of the updated policy.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">17. CERTIFICATION</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Certificates are issued upon successful completion of course requirements, including assessments where applicable.</li>
                                <li>Certificates are digital unless otherwise stated.</li>
                                <li>CTH reserves the right to withhold certification where academic integrity is compromised.</li>
                                <li>Certificates are for professional development purposes and do not replace statutory or regulatory certifications unless explicitly stated.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">18. INTELLECTUAL PROPERTY</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>All course content, materials, videos, texts, logos, and certificates are the intellectual property of CTH or its licensors.</li>
                                <li>Participants are granted a limited, non-transferable, non-commercial license to access course materials for personal learning only.</li>
                                <li>Reproduction, distribution, resale, recording, or public sharing of content without written consent is strictly prohibited.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">19. CODE OF CONDUCT</h3>
                            <p>Participants agree to:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Engage respectfully with facilitators and fellow learners.</li>
                                <li>Refrain from harassment, hate speech, plagiarism, or disruptive conduct.</li>
                                <li>Not share login credentials or course materials with third parties.</li>
                            </ul>
                            <p className="mt-2 font-medium text-amber-600">CTH may suspend or terminate access for violations, without refund.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">20. GOVERNING LAW AND DISPUTE RESOLUTION</h3>
                            <p>These Terms shall be governed by the laws of the Federal Republic of Nigeria. Any dispute arising shall first be resolved amicably. Where unresolved, disputes shall be subject to the exclusive jurisdiction of Nigerian courts.</p>
                        </section>

                        <section className="mb-8 border-t border-gray-100 pt-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">21. CONTACT INFORMATION</h3>
                            <p className="mb-4">For questions, complaints, or requests regarding this Privacy Policy, please contact:</p>
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <p className="font-semibold text-lg text-primary mb-2">Data Protection Officer</p>
                                <p className="font-medium">Clean Technology Hub Ltd/GTE</p>
                                <div className="space-y-2 mt-4 text-sm">
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        No. 1 Sarki Tafida Street, Guzape, Abuja
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <a href="mailto:info@cleantechnologyhub.org" className="hover:underline text-primary">info@cleantechnologyhub.org</a>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <a href="tel:+2348096024444" className="hover:underline text-primary">+234 809 602 4444</a>
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

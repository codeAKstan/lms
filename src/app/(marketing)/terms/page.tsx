import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms and Conditions",
    description: "Terms and Conditions for Clean Technology Hub LMS - User agreements and guidelines for using our platform.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-16">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                        TERMS AND CONDITIONS FOR REGISTRATION AND PARTICIPATION
                    </h1>
                    <h2 className="text-lg md:text-xl font-semibold text-primary mb-6">
                        CLEAN TECHNOLOGY HUB ONLINE LEARNING PLATFORM
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground mb-8 border-b border-gray-100 pb-6">
                        <span className="font-medium">Effective Date: February 16, 2026</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="font-medium">Last Updated: February 16, 2026</span>
                    </div>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">1. INTRODUCTION</h3>
                            <ul className="list-none space-y-2">
                                <li>
                                    <strong>1.1</strong> These Terms and Conditions (“Terms”) govern access to and use of the Clean Technology Hub Online Learning Platform (the “Platform”), including registration, course enrollment, payments, participation in learning activities, assessments, and certification.
                                </li>
                                <li>
                                    <strong>1.2</strong> By registering an account, enrolling in a course, making payment, or otherwise using the Platform, you confirm that you have read, understood, and agree to be bound by these Terms.
                                </li>
                                <li>
                                    <strong>1.3</strong> If you do not agree with these Terms, you must not register or use the Platform.
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">2. DEFINITIONS</h3>
                            <p>For the purpose of these Terms:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li><strong>“CTH”</strong> means Clean Technology Hub Ltd/GTE.</li>
                                <li><strong>“Platform”</strong> means the CTH online learning system, website, mobile applications, and associated services.</li>
                                <li><strong>“User” or “Participant”</strong> means any individual registered on the Platform.</li>
                                <li><strong>“Course”</strong> means any learning program offered through the Platform.</li>
                                <li><strong>“Content”</strong> means all materials including videos, texts, presentations, assessments, and resources provided on the Platform.</li>
                                <li><strong>“Account”</strong> means the personal profile created by a User to access the Platform.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">3. ELIGIBILITY AND GLOBAL PARTICIPATION</h3>
                            <ul className="list-none space-y-2">
                                <li><strong>3.1</strong> The Platform is open to participants globally, subject to applicable laws.</li>
                                <li>
                                    <strong>3.2</strong> By registering, you confirm that:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>You are at least 18 years old; or</li>
                                        <li>If under 18, you have obtained parental or legal guardian consent.</li>
                                    </ul>
                                </li>
                                <li><strong>3.3</strong> CTH reserves the right to suspend or deny access where participation would violate any applicable law or regulation.</li>
                                <li><strong>3.4</strong> CTH shall not be liable for any false declarations regarding age or eligibility.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">4. REGISTRATION AND ACCOUNT RESPONSIBILITY</h3>
                            <ul className="list-none space-y-2">
                                <li><strong>4.1</strong> Users must provide accurate, complete, and up-to-date information during registration.</li>
                                <li><strong>4.2</strong> You are responsible for maintaining the confidentiality of your login credentials.</li>
                                <li><strong>4.3</strong> All activities conducted through your account are deemed to have been performed by you.</li>
                                <li><strong>4.4</strong> You must immediately notify CTH of any unauthorized access or security breach.</li>
                                <li>
                                    <strong>4.5</strong> CTH reserves the right to suspend or terminate accounts that:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Contain false information</li>
                                        <li>Are used for fraudulent purposes</li>
                                        <li>Breach these Terms</li>
                                    </ul>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">5. COURSES, CONTENT, AND LEARNING EXPERIENCE</h3>
                            <ul className="list-none space-y-2">
                                <li>
                                    <strong>5.1</strong> Courses may be delivered as:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Self-paced programs</li>
                                        <li>Instructor-led courses</li>
                                        <li>Live virtual sessions</li>
                                        <li>Blended learning formats</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>5.2</strong> CTH reserves the right to modify course content, facilitators, schedules, and delivery formats where reasonably necessary.
                                </li>
                                <li>
                                    <strong>5.3</strong> Completion of any course does not guarantee employment, external certification, or professional licensing unless expressly stated in writing.
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">6. FEES AND PAYMENT</h3>
                            <ul className="list-none space-y-2">
                                <li><strong>6.1</strong> Certain courses are offered free of charge, while others require payment.</li>
                                <li><strong>6.2</strong> All applicable fees are clearly displayed at the point of enrollment.</li>
                                <li><strong>6.3</strong> Payments are processed through approved third-party payment processors.</li>
                                <li>
                                    <strong>6.4</strong> Fees are exclusive of transaction charges, taxes, currency conversion costs, and bank charges.
                                </li>
                                <li><strong>6.5</strong> Enrollment is confirmed only after successful payment.</li>
                                <li><strong>6.6</strong> CTH reserves the right to cancel enrollments resulting from failed, reversed, or fraudulent payments.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">7. REFUND POLICY</h3>
                            <p className="mb-3">CTH operates a transparent and fair refund policy as follows:</p>

                            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.1 Refund Eligibility</h4>
                            <div className="pl-4 border-l-2 border-gray-100 space-y-4">
                                <div>
                                    <p className="font-medium text-gray-900">Before Course Commencement</p>
                                    <ul className="list-disc pl-6 mt-1 text-sm">
                                        <li>Refunds may be requested within seven (7) days of payment</li>
                                        <li>Provided the course has not started and no materials have been accessed</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">After Course Commencement</p>
                                    <ul className="list-disc pl-6 mt-1 text-sm">
                                        <li>No refunds will be granted once the course has commenced, or</li>
                                        <li>Learning materials have been accessed</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Live Sessions and Cohort Programs</p>
                                    <p className="text-sm mt-1">No refunds shall be granted once the program has started.</p>
                                </div>
                            </div>

                            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.2 Refund Processing</h4>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Approved refunds will be processed within fourteen (14) business days</li>
                                <li>Refunds will be made to the original payment method</li>
                                <li>Transaction or processing fees are non-refundable</li>
                            </ul>

                            <p className="mt-3 text-sm"><strong>7.3</strong> CTH reserves the right to refuse refund requests that do not meet these criteria.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">8. CERTIFICATION</h3>
                            <ul className="list-none space-y-2">
                                <li><strong>8.1</strong> Certificates are issued only upon successful completion of all course requirements.</li>
                                <li><strong>8.2</strong> Certificates are issued digitally unless otherwise stated.</li>
                                <li>
                                    <strong>8.3</strong> CTH may withhold certification where:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Academic integrity is compromised</li>
                                        <li>Misconduct is established</li>
                                        <li>Program requirements are not met</li>
                                    </ul>
                                </li>
                                <li><strong>8.4</strong> Certificates are for professional development purposes and do not replace statutory qualifications unless explicitly stated.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">9. INTELLECTUAL PROPERTY</h3>
                            <ul className="list-none space-y-2">
                                <li>
                                    <strong>9.1</strong> All Platform Content, including videos, texts, logos, designs, course materials, and certificates remain the intellectual property of CTH or its licensors.
                                </li>
                                <li><strong>9.2</strong> Participants are granted a limited, non-transferable, non-commercial license solely for personal learning.</li>
                                <li>
                                    <strong>9.3</strong> The following are strictly prohibited without written consent:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Copying or reproducing materials</li>
                                        <li>Recording live sessions</li>
                                        <li>Sharing content with third parties</li>
                                        <li>Uploading materials to external platforms</li>
                                        <li>Reselling or redistributing content</li>
                                    </ul>
                                </li>
                            </ul>
                            <p className="mt-2 text-amber-600 font-medium">Violation may result in account termination and legal action.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">10. CODE OF CONDUCT</h3>
                            <p>Participants agree to:</p>
                            <ul className="list-none space-y-2 mt-2">
                                <li><strong>10.1</strong> Engage respectfully with facilitators and other learners</li>
                                <li><strong>10.2</strong> Refrain from harassment, hate speech, or abusive behavior</li>
                                <li><strong>10.3</strong> Avoid plagiarism or academic dishonesty</li>
                                <li><strong>10.4</strong> Not share login credentials</li>
                                <li><strong>10.5</strong> Not disrupt learning activities</li>
                            </ul>
                            <p className="mt-2 text-amber-600 font-medium">CTH may suspend or terminate access for violations without refund.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">11. DATA PROTECTION AND PRIVACY</h3>
                            <ul className="list-none space-y-2">
                                <li><strong>11.1</strong> CTH processes personal data in accordance with the Nigeria Data Protection Act 2023 and global best practices.</li>
                                <li>
                                    <strong>11.2</strong> Personal data is collected solely for:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Account management</li>
                                        <li>Course delivery</li>
                                        <li>Certification</li>
                                        <li>Communication</li>
                                        <li>Regulatory compliance</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>11.3</strong> Users have the right to access their personal data, request corrections, request deletion where applicable, and opt out of marketing communications.
                                </li>
                                <li><strong>11.4</strong> CTH has taken steps to ensure compliance with the Nigeria Data Protection Commission (NDPC).</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">12. THIRD-PARTY TOOLS</h3>
                            <ul className="list-none space-y-2">
                                <li>
                                    <strong>12.1</strong> The Platform may integrate third-party services such as payment processors, video conferencing tools, and learning management systems.
                                </li>
                                <li><strong>12.2</strong> CTH is not responsible for disruptions or failures caused by third-party providers beyond its reasonable control.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">13. DISCLAIMER AND LIMITATION OF LIABILITY</h3>
                            <ul className="list-none space-y-2">
                                <li><strong>13.1</strong> The Platform and all courses are provided on an “as is” and “as available” basis.</li>
                                <li>
                                    <strong>13.2</strong> CTH does not guarantee uninterrupted access, error-free services, specific learning outcomes, or employment opportunities.
                                </li>
                                <li>
                                    <strong>13.3</strong> To the fullest extent permitted by law:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>CTH shall not be liable for indirect or consequential losses</li>
                                        <li>Total liability shall not exceed the amount paid by the User for the relevant course</li>
                                    </ul>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">14. FORCE MAJEURE</h3>
                            <p>CTH shall not be liable for failure to perform due to events beyond reasonable control, including internet failures, power outages, government restrictions, natural disasters, or public emergencies.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">15. SUSPENSION AND TERMINATION</h3>
                            <p>CTH may suspend or terminate access where:</p>
                            <ul className="list-none space-y-2 mt-2">
                                <li><strong>15.1</strong> These Terms are breached</li>
                                <li><strong>15.2</strong> Fraud or misconduct is suspected</li>
                                <li><strong>15.3</strong> Required by law</li>
                            </ul>
                            <p className="mt-2 text-sm">Termination does not entitle the user to a refund except as provided in Section 7.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">16. DISPUTE RESOLUTION</h3>
                            <ul className="list-none space-y-2">
                                <li><strong>16.1</strong> Any dispute shall first be resolved amicably through dialogue.</li>
                                <li><strong>16.2</strong> Where unresolved, disputes shall be referred to mediation or arbitration in Abuja, Nigeria.</li>
                                <li><strong>16.3</strong> If arbitration fails, the matter shall be subject to the exclusive jurisdiction of Nigerian courts.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">17. AMENDMENTS</h3>
                            <ul className="list-none space-y-2">
                                <li><strong>17.1</strong> CTH may amend these Terms from time to time.</li>
                                <li><strong>17.2</strong> Updated Terms will be posted on the Platform and take effect from the date of publication.</li>
                                <li><strong>17.3</strong> Continued use of the Platform constitutes acceptance of the updated Terms.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">18. ENTIRE AGREEMENT</h3>
                            <p>These Terms constitute the entire agreement between CTH and the User regarding use of the Platform.</p>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">19. SEVERABILITY</h3>
                            <p>If any provision of these Terms is found to be invalid, the remaining provisions shall remain in full force and effect.</p>
                        </section>

                        <section className="mb-8 border-t border-gray-100 pt-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">20. CONTACT INFORMATION</h3>
                            <p className="mb-4">For enquiries, complaints, or support, please contact:</p>
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <p className="font-semibold text-lg text-primary mb-2">Clean Technology Hub (CTH)</p>
                                <div className="space-y-2 mt-4 text-sm">
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        No. 1 Sarki Tafida Street, Guzape, Abuja, Nigeria
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

                        <div className="bg-primary/5 border-l-4 border-primary p-6 rounded mt-8">
                            <p className="text-gray-800 font-semibold">
                                By using Clean Technology Hub, you acknowledge that you have read and understood these Terms and Conditions and agree to be bound by them.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

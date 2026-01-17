import React from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

const TermsConditions = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-2xl rounded-xl border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    Terms and Conditions for GEHUDOCSI
                </h1>
                <p className="text-center text-gray-500 mb-8">
                    by Qik Innovations Pvt Ltd
                </p>

                <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to GEHUDOCSI</h2>
                        <p>
                            These Terms and Conditions govern your use of GEHUDOCSI, a SaaS
                            solution developed and maintained by Qik Innovations Private Limited
                            ("Company", "we", "us", or "our"). GEHUDOCSI provides digital
                            signature solutions through its website and associated applications.
                        </p>
                        <p className="mt-2">
                            By accessing or using GEHUDOCSI in any way, including using the
                            services and resources available or enabled via GEHUDOCSI
                            (collectively, the "Services"), clicking on a button or taking similar
                            action to signify your affirmative acceptance of these Terms, you
                            hereby represent that:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>
                                You have read, understand, and agree to be bound by these Terms and
                                Conditions and any future amendments and additions to these Terms as
                                published from time to time at www.gehudocsi.com.
                            </li>
                            <li>
                                You are of legal age in the jurisdiction in which you reside to form
                                a binding contract with the Company.
                            </li>
                            <li>
                                If you are agreeing to these Terms on behalf of a business or an
                                entity, you represent and warrant that you have the authority to
                                bind that business or entity to these Terms and your agreement to
                                these Terms will be treated as the agreement of such business or
                                entity.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Accounts and Membership</h2>
                        <p>
                            You must register for an account to access most features of GEHUDOCSI.
                            When you register for an account, you must provide accurate and
                            complete information, and keep your account information updated. Each
                            account is personal and must not be shared with others.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Services</h2>
                        <p>
                            GEHUDOCSI offers both a free tier and a paid professional version.
                            The free tier provides unlimited digital signatures per month. The
                            paid professional version offers advanced features, with different
                            plans tailored to meet various professional needs.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Free Trial</h2>
                        <p>
                            In case you opt for free trial of GEHUDOCSI professional plan, the
                            duration of the free trial will be specified at registration. Unless
                            you cancel before the end of the free trial period, you will
                            automatically be billed the subscription fee for the next billing
                            cycle.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Subscriptions and Billing</h2>
                        <p>
                            Subscriptions to paid Services are billed in advance on a periodic
                            basis (such as monthly or annually), as specified at the time of
                            purchase. Payments are non-refundable except as expressly provided in
                            these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">5. Cancellation and Termination</h2>
                        <p>
                            You are free to stop using our Services at any time. We also reserve
                            the right to suspend or end the Services at any time at our discretion
                            and without notice. If we suspend or terminate your account because of
                            your breach of these Terms, you will not be entitled to any refund.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">6. Use of Services</h2>
                        <p>
                            You agree to use the Services only for lawful purposes, in compliance
                            with all applicable law, regulations, and policies of Qik Innovations
                            Private Limited.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">7. Intellectual Property Rights</h2>
                        <p>
                            The Services and all materials therein or transferred thereby,
                            including, but not limited to, software, images, text, graphics,
                            logos, patents, trademarks, service marks, copyrights, and other
                            intellectual property are the exclusive property of Qik Innovations
                            Private Limited. Except as explicitly provided herein, nothing in
                            these Terms shall be deemed to create a license in or under any such
                            intellectual property rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">8. User Content</h2>
                        <p>
                            You may upload documents, data, or other materials to the Service
                            ("User Content"). You retain all rights in, and are solely responsible
                            for, the User Content you upload. However, by uploading or entering
                            any user content, you grant Qik Innovations Private Limited a
                            worldwide, non-exclusive, royalty-free license to use, reproduce,
                            display, perform, adapt, modify, publish, and distribute such content
                            in connection with the Services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">9. Privacy</h2>
                        <p>
                            Our Privacy Policy explains how we treat your personal data and
                            protect your privacy when you use our Services. By using our Services,
                            you agree that we can use such data in accordance with our privacy
                            policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">10. Modification</h2>
                        <p>
                            We may modify these Terms at any time. If we make changes that are
                            material, we will provide you with notice through the Service or by
                            other means to provide you the opportunity to review the changes
                            before they become effective. Your continued use of the Service after
                            we publish or send a notice about our changes to these Terms means
                            that you are consenting to the updated Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">11. Disclaimers</h2>
                        <p>
                            The Service is provided "AS IS" and "AS AVAILABLE" without any
                            warranties, express or implied, including but not limited to, the
                            implied warranties of merchantability, fitness for a particular
                            purpose, or non-infringement. We do not warrant that the Service will
                            be uninterrupted or error-free.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">12. Limitation of Liability</h2>
                        <p>
                            Qik Innovations shall not be liable for any indirect, incidental,
                            special, consequential or punitive damages, including loss of profits,
                            data, or other intangible losses, arising out of or in connection with
                            your use of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">13. Indemnification</h2>
                        <p>
                            You agree to indemnify and hold harmless Qik Innovations and its
                            officers, directors, employees, and agents from any claims, damages,
                            liabilities, costs, or expenses (including reasonable attorneys' fees)
                            arising from your use of the Service or violation of these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">14. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the
                            laws of the jurisdiction in which Qik Innovations Pvt Ltd is
                            registered, without regard to its conflict of laws rules.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">15. Contact Information</h2>
                        <p>If you have any questions about these Terms, please contact us at:</p>
                        <div className="mt-2">
                            <p className="font-semibold">Qik Innovations Pvt Ltd</p>
                            <a href="mailto:legal@gehudocsi.com" className="text-indigo-600 hover:text-indigo-500">
                                legal@gehudocsi.com
                            </a>
                        </div>
                    </section>

                    <section className="mt-8 pt-6 border-t border-gray-200">
                        <p className="mb-4">
                            By using GEHUDOCSI, you agree to these Terms. Please read them
                            carefully before using the Service.
                        </p>
                        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                            <p>All rights reserved © 2025 GEHUDOCSI</p>
                            <div className="space-x-4 mt-2 md:mt-0">
                                <span className="cursor-pointer hover:text-gray-900">Terms and conditions</span>
                                <span className="cursor-pointer hover:text-gray-900">Privacy Policy</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsConditions;

import { motion } from 'framer-motion'

export default function Terms({ onBack }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="w-full text-left max-h-[80vh] overflow-y-auto"
        >
            <button
                onClick={onBack}
                className="mb-4 sm:mb-6 text-[10px] sm:text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-mono flex items-center gap-2"
            >
                <span>←</span>
                <span>Back</span>
            </button>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-2">Terms of Service</h1>
            <p className="text-gray-500 text-sm mb-6">Last updated: January 2026</p>

            <div className="space-y-8 text-sm sm:text-base text-gray-400 font-light leading-relaxed">

                {/* Agreement */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Agreement to Terms</h2>
                    <p>
                        By accessing or using AirNode ("the Service"), you agree to be bound by these Terms of Service.
                        If you disagree with any part of these terms, you may not access the Service.
                    </p>
                </section>

                {/* Description */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Service Description</h2>
                    <p className="mb-3">
                        AirNode is a peer-to-peer file transfer and anonymous chat application. The Service enables:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>Direct file transfers between devices using WebRTC technology</li>
                        <li>Anonymous text chat through an encrypted lobby system</li>
                        <li>Private peer-to-peer encrypted messaging</li>
                    </ul>
                    <p className="mt-3">
                        All communications are encrypted end-to-end. We do not have access to the contents of your
                        files or messages.
                    </p>
                </section>

                {/* Acceptable Use */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Acceptable Use</h2>
                    <p className="mb-3">You agree to use the Service only for lawful purposes. You must NOT:</p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>Transfer illegal content including but not limited to: child exploitation material, malware, stolen data, or pirated copyrighted content</li>
                        <li>Use the Service to harass, threaten, or harm others</li>
                        <li>Attempt to circumvent, disable, or otherwise interfere with security features</li>
                        <li>Use automated scripts, bots, or scrapers to access the Service</li>
                        <li>Impersonate others or misrepresent your affiliation with any person or entity</li>
                        <li>Interfere with or disrupt the Service or servers</li>
                    </ul>
                </section>

                {/* Anonymity */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Anonymity & Responsibility</h2>
                    <p className="mb-3">
                        While AirNode provides anonymous communication features, <strong className="text-white">anonymity
                            does not mean impunity</strong>. You remain legally responsible for your actions.
                    </p>
                    <p>
                        We may cooperate with law enforcement if required by valid legal process, though our
                        privacy-first architecture means we have minimal data to provide.
                    </p>
                </section>

                {/* Consent-Based Connections */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Consent-Based Connections</h2>
                    <p className="mb-3">
                        AirNode implements a <strong className="text-white">connection request system</strong> for your safety.
                        Before any peer-to-peer connection is established:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>You must explicitly accept or decline incoming connection requests</li>
                        <li>Connection requests display the sender's identifier for transparency</li>
                        <li>Requests automatically expire after 30 seconds if not responded to</li>
                        <li>You can decline any request without explanation</li>
                    </ul>
                    <p className="mt-3">
                        This system is designed to prevent unwanted connections and potential malicious file transfers.
                        <strong className="text-white"> Never accept connection requests from unknown or suspicious users.</strong>
                    </p>
                </section>

                {/* No Warranty */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Disclaimer of Warranties</h2>
                    <p className="mb-3">
                        The Service is provided <strong className="text-white">"AS IS"</strong> and
                        <strong className="text-white"> "AS AVAILABLE"</strong> without warranties of any kind,
                        either express or implied, including but not limited to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>Merchantability or fitness for a particular purpose</li>
                        <li>Uninterrupted, timely, secure, or error-free operation</li>
                        <li>Accuracy or reliability of any information obtained through the Service</li>
                        <li>Correction of any defects or errors</li>
                    </ul>
                </section>

                {/* Limitation of Liability */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Limitation of Liability</h2>
                    <p className="mb-3">
                        To the maximum extent permitted by law, the developers and operators of AirNode shall not
                        be liable for any:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>Direct, indirect, incidental, special, consequential, or punitive damages</li>
                        <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                        <li>Damages resulting from unauthorized access to or alteration of your transmissions or data</li>
                        <li>Damages resulting from any content transferred through the Service</li>
                    </ul>
                </section>

                {/* Data Loss */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Data Loss & Transfer Failures</h2>
                    <p>
                        We are not responsible for failed transfers, corrupted files, or data loss.
                        P2P connections depend on network conditions beyond our control. Always keep
                        backups of important files and verify transfers after completion.
                    </p>
                </section>

                {/* Security */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Security</h2>
                    <p className="mb-3">
                        While we implement strong encryption (AES-256-GCM, DTLS), no system is 100% secure.
                        You acknowledge that:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li>You are responsible for the security of your own device</li>
                        <li>Sharing Peer IDs with untrusted parties may expose you to unwanted connections</li>
                        <li>We cannot guarantee protection against sophisticated attacks or vulnerabilities</li>
                    </ul>
                </section>

                {/* Third Party */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Third-Party Services</h2>
                    <p>
                        The Service relies on third-party infrastructure (PeerJS, Firebase, STUN servers).
                        We are not responsible for the availability, security, or policies of these services.
                        Their use is subject to their respective terms of service.
                    </p>
                </section>

                {/* Modifications */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Modifications to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Continued use of the Service
                        after changes constitutes acceptance of the new terms. We recommend reviewing this
                        page periodically.
                    </p>
                </section>

                {/* Termination */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Termination</h2>
                    <p>
                        We may terminate or suspend access to the Service immediately, without prior notice,
                        for any reason including breach of these Terms. Since we don't have user accounts,
                        termination typically means blocking specific Peer IDs or IP ranges.
                    </p>
                </section>

                {/* Governing Law */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with applicable laws,
                        without regard to conflict of law provisions. Any disputes shall be resolved through
                        binding arbitration or in the courts of the applicable jurisdiction.
                    </p>
                </section>

                {/* Contact */}
                <section className="border-t border-white/10 pt-6">
                    <h2 className="text-white text-lg font-serif mb-3">Contact</h2>
                    <p>
                        For questions about these Terms, please contact us through the project's GitHub repository.
                    </p>
                </section>

            </div>
        </motion.div>
    )
}

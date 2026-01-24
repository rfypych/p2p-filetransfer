import { motion } from 'framer-motion'

export default function Privacy({ onBack }) {
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

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-2">Privacy Policy</h1>
            <p className="text-gray-500 text-sm mb-6">Last updated: January 2026</p>

            <div className="space-y-8 text-sm sm:text-base text-gray-400 font-light leading-relaxed">

                {/* Introduction */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Our Privacy Commitment</h2>
                    <p className="mb-3">
                        AirNode is built with <strong className="text-white">privacy-first architecture</strong>.
                        We believe your files and conversations belong to you—not us, not advertisers, not anyone else.
                    </p>
                    <p>
                        This application uses peer-to-peer (P2P) technology and end-to-end encryption (E2EE)
                        to ensure your data never passes through our servers in readable form.
                    </p>
                </section>

                {/* Data We DON'T Collect */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Data We Do NOT Collect</h2>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li><strong className="text-gray-300">File Contents</strong> — Your files transfer directly between devices via WebRTC. We never see, store, or process your files.</li>
                        <li><strong className="text-gray-300">Message Contents</strong> — All P2P chat messages are encrypted with AES-256-GCM. Even we cannot read them.</li>
                        <li><strong className="text-gray-300">Personal Information</strong> — No names, emails, phone numbers, or accounts required.</li>
                        <li><strong className="text-gray-300">IP Addresses</strong> — We don't log connection IPs. WebRTC connections are peer-to-peer.</li>
                        <li><strong className="text-gray-300">Usage Analytics</strong> — No Google Analytics, no tracking pixels, no behavioral profiling.</li>
                    </ul>
                </section>

                {/* What We Use */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Technical Infrastructure</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-gray-300 font-medium mb-1">Signaling Server (PeerJS)</h3>
                            <p>
                                Used only to establish initial P2P connections. Peer IDs are randomly generated
                                and ephemeral—deleted when you close the browser. No persistent records.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-gray-300 font-medium mb-1">Firebase Realtime Database</h3>
                            <p>
                                Used for the Anonymous Lobby feature. Stores encrypted messages and temporary
                                presence data. All message content is encrypted client-side before storage.
                                Lobby entries auto-delete when users disconnect.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-gray-300 font-medium mb-1">STUN/TURN Servers</h3>
                            <p>
                                Standard WebRTC infrastructure to help establish peer connections. These servers
                                only relay encrypted connection metadata, never file contents.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Encryption */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Encryption Standards</h2>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li><strong className="text-gray-300">P2P Messages:</strong> AES-256-GCM with per-session key exchange</li>
                        <li><strong className="text-gray-300">File Transfer:</strong> DTLS 1.2+ (WebRTC built-in encryption)</li>
                        <li><strong className="text-gray-300">Lobby Chat:</strong> AES-256-GCM encrypted before Firebase storage</li>
                        <li><strong className="text-gray-300">Key Derivation:</strong> PBKDF2 with 100,000 iterations</li>
                    </ul>
                </section>

                {/* Local Storage */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Local Browser Storage</h2>
                    <p>
                        We may store minimal preferences (like theme settings) in your browser's localStorage.
                        This data never leaves your device and can be cleared anytime through your browser settings.
                    </p>
                </section>

                {/* Third Parties */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Third-Party Services</h2>
                    <p className="mb-3">We use the following third-party services:</p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                        <li><strong className="text-gray-300">PeerJS Cloud:</strong> Signaling server for WebRTC connections</li>
                        <li><strong className="text-gray-300">Firebase:</strong> Encrypted lobby data storage</li>
                        <li><strong className="text-gray-300">Google STUN:</strong> NAT traversal for P2P connections</li>
                    </ul>
                    <p className="mt-3 text-gray-500 text-xs">
                        These services handle only connection metadata, never your actual file or message contents.
                    </p>
                </section>

                {/* Your Rights */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Your Rights</h2>
                    <p>
                        Since we don't collect personal data, there's nothing to request access to or delete.
                        Your privacy is protected by design, not by policy compliance.
                    </p>
                </section>

                {/* Contact */}
                <section className="border-t border-white/10 pt-6">
                    <h2 className="text-white text-lg font-serif mb-3">Questions?</h2>
                    <p>
                        If you have questions about this privacy policy or our practices,
                        feel free to reach out via the project's GitHub repository.
                    </p>
                </section>

            </div>
        </motion.div>
    )
}

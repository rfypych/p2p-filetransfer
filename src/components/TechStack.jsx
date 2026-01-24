import { motion } from 'framer-motion'
import {
    SiReact,
    SiVite,
    SiTailwindcss,
    SiFramer,
    SiWebrtc,
    SiFirebase,
    SiPeerlist
} from 'react-icons/si'
import { FaLock, FaGithub, FaArrowLeft } from 'react-icons/fa'

const techStack = [
    {
        name: 'React',
        description: 'A JavaScript library for building user interfaces with a component-based architecture.',
        Icon: SiReact,
        color: 'text-cyan-400',
        link: 'https://react.dev'
    },
    {
        name: 'Vite',
        description: 'Next generation frontend tooling with lightning fast HMR and optimized builds.',
        Icon: SiVite,
        color: 'text-yellow-400',
        link: 'https://vitejs.dev'
    },
    {
        name: 'Tailwind CSS',
        description: 'A utility-first CSS framework for rapidly building custom user interfaces.',
        Icon: SiTailwindcss,
        color: 'text-sky-400',
        link: 'https://tailwindcss.com'
    },
    {
        name: 'Framer Motion',
        description: 'A production-ready motion library for React with simple declarative syntax.',
        Icon: SiFramer,
        color: 'text-pink-400',
        link: 'https://www.framer.com/motion'
    },
    {
        name: 'WebRTC',
        description: 'Real-time communication protocol enabling peer-to-peer data transfer without servers.',
        Icon: SiWebrtc,
        color: 'text-green-400',
        link: 'https://webrtc.org'
    },
    {
        name: 'PeerJS',
        description: 'Simplifies WebRTC peer-to-peer data, video, and audio calls with a simple API.',
        Icon: SiPeerlist,
        color: 'text-blue-400',
        link: 'https://peerjs.com'
    },
    {
        name: 'Firebase',
        description: 'Google\'s platform for real-time database, authentication, and cloud functions.',
        Icon: SiFirebase,
        color: 'text-orange-400',
        link: 'https://firebase.google.com'
    },
    {
        name: 'AES-256-GCM',
        description: 'Military-grade encryption standard for secure end-to-end communication.',
        Icon: FaLock,
        color: 'text-emerald-400',
        link: 'https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto'
    },
]

export default function TechStack({ onBack }) {
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

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-2">Tech Stack</h1>
            <p className="text-gray-500 text-sm mb-6">The technologies powering AirNode</p>

            <div className="space-y-8 text-sm sm:text-base text-gray-400 font-light leading-relaxed">

                {/* Introduction */}
                <section>
                    <p>
                        AirNode is built with modern, privacy-focused technologies to ensure fast, secure,
                        and reliable peer-to-peer communication. All code is open source and available on GitHub.
                    </p>
                </section>

                {/* Tech Grid */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-4">Core Technologies</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {techStack.map((tech) => (
                            <a
                                key={tech.name}
                                href={tech.link}
                                target="_blank"
                                rel="noreferrer"
                                className="group p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg bg-white/5 ${tech.color} group-hover:scale-110 transition-transform`}>
                                        <tech.Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
                                            {tech.name}
                                        </h3>
                                        <p className="text-gray-500 text-xs leading-relaxed">
                                            {tech.description}
                                        </p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Architecture */}
                <section>
                    <h2 className="text-white text-lg font-serif mb-3">Architecture Overview</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-gray-300 font-medium mb-1">Frontend</h3>
                            <p>
                                Single-page application built with React and Vite. Styled with Tailwind CSS
                                and animated with Framer Motion. No backend server needed for core functionality.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-gray-300 font-medium mb-1">P2P Connection</h3>
                            <p>
                                WebRTC establishes direct peer-to-peer connections. PeerJS provides the signaling
                                layer for connection negotiation. Files transfer directly between browsers.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-gray-300 font-medium mb-1">Encryption</h3>
                            <p>
                                All messages are encrypted with AES-256-GCM using the Web Crypto API.
                                Session keys are exchanged securely when peers connect. File transfers use
                                DTLS (WebRTC's built-in encryption).
                            </p>
                        </div>
                        <div>
                            <h3 className="text-gray-300 font-medium mb-1">Lobby System</h3>
                            <p>
                                Firebase Realtime Database provides the lobby infrastructure for anonymous users
                                to discover each other. All stored messages are encrypted client-side before storage.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Open Source */}
                <section className="border-t border-white/10 pt-6">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/5 rounded-xl">
                        <FaGithub className="w-8 h-8 text-white" />
                        <div>
                            <h3 className="text-white font-medium">Open Source</h3>
                            <p className="text-gray-400 text-sm">
                                View the source code, contribute, or report issues on{' '}
                                <a
                                    href="https://github.com/rfypych/p2p-filetransfer"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    GitHub
                                </a>
                            </p>
                        </div>
                    </div>
                </section>

            </div>
        </motion.div>
    )
}

import { motion } from 'framer-motion'

// Cloud Logo Component
const CloudLogo = () => (
    <motion.svg
        className="w-28 h-28 md:w-36 md:h-36"
        viewBox="0 0 120 100"
        fill="none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 1.2, bounce: 0.3 }}
    >
        <defs>
            <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <filter id="cloudGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Cloud body */}
        <motion.path
            d="M95 50 
         C105 50 112 42 112 33 
         C112 24 105 16 95 16
         C95 6 85 -2 72 -2
         C62 -2 54 4 50 13
         C46 10 40 8 34 8
         C20 8 8 20 8 35
         C8 50 20 62 34 62
         L92 62
         C98 62 105 56 105 50
         Z"
            fill="url(#cloudGradient)"
            filter="url(#cloudGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.95 }}
            transition={{ duration: 1.5, delay: 0.2 }}
        />

        {/* Upload arrow */}
        <motion.g
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
        >
            <motion.path
                d="M60 25 L60 48"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
            />
            <motion.path
                d="M50 35 L60 25 L70 35"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 1.2 }}
            />
        </motion.g>

        {/* Connection nodes */}
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
        >
            <motion.circle
                cx="30" cy="80" r="5"
                fill="#6366f1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
                cx="60" cy="88" r="5"
                fill="#8b5cf6"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.circle
                cx="90" cy="80" r="5"
                fill="#22d3ee"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            />

            {/* Connection lines */}
            <motion.line x1="30" y1="80" x2="60" y2="88" stroke="url(#cloudGradient)" strokeWidth="2" opacity="0.4" />
            <motion.line x1="60" y1="88" x2="90" y2="80" stroke="url(#cloudGradient)" strokeWidth="2" opacity="0.4" />
            <motion.line x1="60" y1="62" x2="60" y2="88" stroke="url(#cloudGradient)" strokeWidth="2" opacity="0.3" strokeDasharray="4 4" />
        </motion.g>
    </motion.svg>
)

const Hero = ({ onSendClick, onReceiveClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-full flex flex-col items-center justify-center px-4 py-8 md:py-12"
        >
            {/* Floating decorative elements */}
            <motion.div
                className="absolute top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none"
                animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"
                animate={{ y: [0, 20, 0], scale: [1.1, 1, 1.1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Cloud Logo */}
            <motion.div
                className="relative mb-4 md:mb-6"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <CloudLogo />
                {/* Glow behind logo */}
                <motion.div
                    className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.2, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            </motion.div>

            {/* Title */}
            <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-2 md:mb-4"
            >
                <span className="gradient-text">AirNode</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-lg md:text-2xl text-slate-400 text-center mb-1 md:mb-2"
            >
                Secure P2P File Share
            </motion.p>

            <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs md:text-base text-slate-500 text-center max-w-sm md:max-w-md mb-8 md:mb-12 px-4"
            >
                Transfer files instantly between devices. No servers, no limits, maximum privacy.
            </motion.p>

            {/* Feature badges */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12 px-4"
            >
                {['No Upload', 'Encrypted', 'Unlimited'].map((feature, i) => (
                    <motion.span
                        key={feature}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9 + i * 0.1, type: "spring" }}
                        className="px-3 md:px-4 py-1.5 md:py-2 rounded-full glass text-xs md:text-sm text-slate-300 flex items-center gap-2"
                    >
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-success animate-pulse" />
                        {feature}
                    </motion.span>
                ))}
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full max-w-sm sm:max-w-none sm:w-auto px-4"
            >
                <motion.button
                    onClick={onSendClick}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold text-base md:text-lg overflow-hidden w-full sm:w-auto"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2 md:gap-3">
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Send File
                    </span>
                    <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                    />
                </motion.button>

                <motion.button
                    onClick={onReceiveClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-6 md:px-8 py-3 md:py-4 rounded-xl glass glow-hover text-white font-semibold text-base md:text-lg flex items-center justify-center gap-2 md:gap-3 w-full sm:w-auto"
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Receive File
                </motion.button>
            </motion.div>

            {/* How it works */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-12 md:mt-20 w-full max-w-4xl px-4"
            >
                <h2 className="text-xl md:text-2xl font-semibold text-center mb-6 md:mb-8 text-slate-300">How it works</h2>
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                    {[
                        { icon: "🔗", title: "Connect", desc: "Share link or QR" },
                        { icon: "📁", title: "Select", desc: "Choose files" },
                        { icon: "⚡", title: "Transfer", desc: "Direct P2P" }
                    ].map((step, i) => (
                        <motion.div
                            key={step.title}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.3 + i * 0.15 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="glass rounded-xl md:rounded-2xl p-3 md:p-6 text-center glow-hover transition-all cursor-default"
                        >
                            <div className="text-2xl md:text-4xl mb-2 md:mb-4">{step.icon}</div>
                            <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">{step.title}</h3>
                            <p className="text-slate-400 text-xs md:text-sm hidden sm:block">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="mt-12 md:mt-20 text-center text-slate-500 text-xs md:text-sm px-4"
            >
                <p>Powered by WebRTC • No data stored on servers</p>
            </motion.footer>
        </motion.div>
    )
}

export default Hero

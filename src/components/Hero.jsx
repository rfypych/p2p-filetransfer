import { motion } from 'framer-motion'

// Modernized Cloud Logo with subtle glass morphism and smoother animation
const CloudLogo = () => (
    <motion.svg
        className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl"
        viewBox="0 0 120 100"
        fill="none"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
        <defs>
            <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" /> {/* Indigo-400 */}
                <stop offset="100%" stopColor="#c084fc" /> {/* Purple-400 */}
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Cloud Body */}
        <motion.path
            d="M95 50 C105 50 112 42 112 33 C112 24 105 16 95 16 C95 6 85 -2 72 -2 C62 -2 54 4 50 13 C46 10 40 8 34 8 C20 8 8 20 8 35 C8 50 20 62 34 62 L92 62 C98 62 105 56 105 50 Z"
            fill="url(#cloudGradient)"
            filter="url(#glow)"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Connection Dots - symbolizing P2P */}
        <motion.g>
            <motion.circle cx="40" cy="35" r="3" fill="white" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} />
            <motion.circle cx="80" cy="30" r="3" fill="white" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
            <motion.line x1="40" y1="35" x2="80" y2="30" stroke="white" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5" />
        </motion.g>
    </motion.svg>
)

const Hero = ({ onSendClick, onReceiveClick }) => {
    return (
        <div className="relative min-h-full flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">

            {/* Background Ambient Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Content Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
            >
                <div className="mb-8">
                    <CloudLogo />
                </div>

                <motion.h1
                    className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    AirNode
                </motion.h1>

                <motion.p
                    className="text-lg md:text-2xl text-slate-400 font-medium mb-12 max-w-2xl leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Seamlessly transfer files directly between devices. <br className="hidden md:block" />
                    <span className="text-slate-500">No servers. No limits. Just P2P.</span>
                </motion.p>

                {/* Main Actions */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
                    <motion.button
                        onClick={onSendClick}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(99, 102, 241, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 border border-white/10 flex items-center justify-center gap-3 transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Send File
                    </motion.button>

                    <motion.button
                        onClick={onReceiveClick}
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-white/5 backdrop-blur-md text-white rounded-2xl font-bold text-lg border border-white/10 hover:border-white/20 flex items-center justify-center gap-3 transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Receive File
                    </motion.button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
                    {[
                        { title: "Direct P2P", desc: "Data flows directly between devices.", icon: "⚡" },
                        { title: "Secure", desc: "End-to-end encrypted connection.", icon: "🔒" },
                        { title: "Private", desc: "No file ever touches our servers.", icon: "🛡️" }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="p-6 rounded-2xl bg-surface-light/50 border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm"
                        >
                            <div className="text-3xl mb-3">{feature.icon}</div>
                            <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                            <p className="text-slate-400 text-sm">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <footer className="absolute bottom-4 text-slate-600 text-xs text-center w-full">
                AirNode © {new Date().getFullYear()} • Open Source
            </footer>
        </div>
    )
}

export default Hero

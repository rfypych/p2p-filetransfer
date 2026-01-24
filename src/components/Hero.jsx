import { motion } from 'framer-motion'

const Hero = ({ onSendClick, onReceiveClick, onAnonymousClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start text-left"
        >
            <div className="mb-6 sm:mb-8 md:mb-12">
                <span className="block text-xs sm:text-sm font-mono text-gray-500 mb-3 sm:mb-4 tracking-widest uppercase">
                    Direct • Encrypted • Unlimited
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-tight text-white tracking-tight mb-4 sm:mb-6">
                    Simplicity <br />
                    <span className="italic text-gray-400">in Transfer.</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-400 font-light max-w-xl leading-relaxed">
                    A minimal peer-to-peer file sharing tool designed for privacy.
                    No clouds, no accounts, just pure data flow.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                    onClick={onSendClick}
                    className="group relative px-6 py-3 sm:px-8 sm:py-4 border border-white text-white text-sm sm:text-base font-medium tracking-wide overflow-hidden transition-all hover:bg-white hover:text-black"
                >
                    <span className="relative z-10">Start Sending</span>
                </button>

                <button
                    onClick={onReceiveClick}
                    className="group px-6 py-3 sm:px-8 sm:py-4 border border-transparent text-gray-400 hover:text-white transition-colors flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
                >
                    <span>Receive a File</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </div>

            {/* Anonymous Mode Button */}
            <div className="mt-4 sm:mt-6 w-full sm:w-auto">
                <button
                    onClick={onAnonymousClick}
                    className="w-full sm:w-auto px-6 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded text-sm transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="text-lg">🕵️</span>
                    <span>Start Anonymous Chat</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">→</span>
                </button>
            </div>

            {/* Editorial Features List */}
            <div className="mt-8 sm:mt-12 md:mt-16 w-full border-t border-white/10 pt-4 sm:pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {[
                    { number: '01', title: 'Privacy First', desc: 'End-to-end encrypted WebRTC.' },
                    { number: '02', title: 'No Limits', desc: 'Any file size, directly.' },
                    { number: '03', title: 'Universal', desc: 'Works on any browser.' }
                ].map((item) => (
                    <div key={item.number} className="group">
                        <span className="text-[10px] sm:text-xs font-mono text-gray-600 mb-1 block">{item.number}</span>
                        <h3 className="font-serif text-base sm:text-lg text-gray-200 mb-0.5">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

export default Hero

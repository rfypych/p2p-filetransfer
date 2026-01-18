import { motion } from 'framer-motion'

const Hero = ({ onSendClick, onReceiveClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start text-left"
        >
            <div className="mb-16">
                <span className="block text-xs font-mono text-gray-500 mb-6 tracking-widest uppercase">
                    Direct • Encrypted • Unlimited
                </span>
                <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.9] text-white tracking-tight mb-8">
                    Simplicity <br />
                    <span className="italic text-gray-400">in Transfer.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 font-light max-w-xl leading-relaxed">
                    A minimal peer-to-peer file sharing tool designed for privacy.
                    No clouds, no accounts, just pure data flow.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                <button
                    onClick={onSendClick}
                    className="group relative px-8 py-4 border border-white text-white font-medium tracking-wide overflow-hidden transition-all hover:bg-white hover:text-black"
                >
                    <span className="relative z-10">Start Sending</span>
                </button>

                <button
                    onClick={onReceiveClick}
                    className="group px-8 py-4 border border-transparent text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    <span>Receive a File</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </div>

            {/* Editorial Features List */}
            <div className="mt-32 w-full border-t border-white/10 pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { number: '01', title: 'Privacy First', desc: 'End-to-end encrypted WebRTC channel.' },
                    { number: '02', title: 'No Limits', desc: 'Send files of any size, directly.' },
                    { number: '03', title: 'Universal', desc: 'Works on any device with a browser.' }
                ].map((item) => (
                    <div key={item.number} className="group">
                        <span className="text-xs font-mono text-gray-600 mb-2 block">{item.number}</span>
                        <h3 className="font-serif text-xl text-gray-200 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

export default Hero

import { motion } from 'framer-motion'
import { formatFileSize } from '../utils/fileUtils'

const TransferComplete = ({ mode, file, onReset }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
        >
            <div className="w-full max-w-md text-center">
                {/* Success animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="relative mx-auto mb-8"
                >
                    {/* Confetti-like rings */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute inset-0 rounded-full border-2 border-success"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2 + i * 0.5, opacity: 0 }}
                            transition={{
                                duration: 1.5,
                                delay: 0.5 + i * 0.2,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                        />
                    ))}

                    {/* Main circle */}
                    <motion.div
                        className="w-32 h-32 mx-auto rounded-full bg-success/20 flex items-center justify-center relative"
                        animate={{
                            boxShadow: [
                                '0 0 0 0 rgba(16, 185, 129, 0.4)',
                                '0 0 40px 20px rgba(16, 185, 129, 0.1)',
                                '0 0 0 0 rgba(16, 185, 129, 0.4)'
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <motion.svg
                            className="w-16 h-16 text-success"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <motion.path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            />
                        </motion.svg>
                    </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold mb-2"
                >
                    {mode === 'send' ? 'File Sent!' : 'File Received!'}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-slate-400 mb-8"
                >
                    {mode === 'send'
                        ? 'Your file has been successfully transferred'
                        : 'Your file has been downloaded successfully'
                    }
                </motion.p>

                {/* File info card */}
                {file && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass rounded-2xl p-6 mb-8"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                                📁
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{file.name}</h4>
                                <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <motion.button
                        onClick={onReset}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold"
                    >
                        {mode === 'send' ? 'Send Another File' : 'Receive Another File'}
                    </motion.button>

                    <motion.a
                        href="/"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 rounded-xl glass text-white font-semibold"
                    >
                        Back to Home
                    </motion.a>
                </motion.div>

                {/* Footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-sm text-slate-500"
                >
                    🔒 Transfer completed with end-to-end encryption
                </motion.p>
            </div>
        </motion.div>
    )
}

export default TransferComplete

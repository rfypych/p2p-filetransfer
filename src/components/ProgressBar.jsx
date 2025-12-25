import { motion } from 'framer-motion'
import { formatFileSize, formatSpeed, formatTime } from '../utils/fileUtils'

const ProgressBar = ({ progress, speed, fileName, fileSize }) => {
    const bytesTransferred = (progress / 100) * fileSize
    const remainingBytes = fileSize - bytesTransferred
    const eta = speed > 0 ? remainingBytes / speed : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full glass rounded-2xl p-6"
        >
            {/* File info */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-medium truncate">{fileName}</h4>
                        <p className="text-sm text-slate-400">{formatFileSize(fileSize)}</p>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold gradient-text">{Math.round(progress)}%</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
                <motion.div
                    className="absolute inset-y-0 left-0 progress-bar-animated rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
                {/* Shimmer effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {formatSpeed(speed)}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(bytesTransferred)} / {formatFileSize(fileSize)}</span>
                </div>
                <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {eta > 0 ? formatTime(eta) : 'Calculating...'}
                </span>
            </div>

            {/* Chunks visualization */}
            <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: 20 }, (_, i) => {
                        const chunkProgress = (i + 1) * 5
                        const isComplete = progress >= chunkProgress
                        const isActive = progress >= chunkProgress - 5 && progress < chunkProgress

                        return (
                            <motion.div
                                key={i}
                                className={`w-4 h-2 rounded-sm transition-all ${isComplete ? 'bg-primary' :
                                        isActive ? 'bg-primary/50 animate-pulse' :
                                            'bg-slate-700'
                                    }`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.02 }}
                            />
                        )
                    })}
                </div>
            </div>
        </motion.div>
    )
}

export default ProgressBar

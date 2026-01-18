import { motion } from 'framer-motion'
import { formatFileSize, formatSpeed } from '../utils/fileUtils'

const ProgressBar = ({ progress, speed, fileName, fileSize }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full mt-8 p-6 border border-border bg-surface"
        >
            <div className="flex justify-between items-end mb-4 font-mono text-xs uppercase tracking-widest text-secondary">
                <span>Transferring...</span>
                <span>{Math.round(progress)}%</span>
            </div>

            {/* Ultra minimal progress line */}
            <div className="w-full h-[1px] bg-border relative overflow-hidden">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-primary transition-width duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex justify-between items-start mt-4">
                <div>
                    <h4 className="font-serif text-lg text-primary mb-1 tracking-tight">{fileName}</h4>
                    <p className="text-xs text-secondary font-mono">{formatFileSize(fileSize)}</p>
                </div>
                <div className="text-right">
                    <p className="font-mono text-xs text-secondary">{formatSpeed(speed)}</p>
                </div>
            </div>
        </motion.div>
    )
}

export default ProgressBar

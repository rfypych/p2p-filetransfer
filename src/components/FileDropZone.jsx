import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatFileSize } from '../utils/fileUtils'

const FileDropZone = ({ onFileSelect, selectedFile, disabled }) => {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        if (!disabled) setIsDragging(true)
    }, [disabled])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)
        if (disabled) return

        const files = e.dataTransfer.files
        if (files.length > 0) {
            onFileSelect(files[0])
        }
    }, [disabled, onFileSelect])

    const handleFileChange = useCallback((e) => {
        const files = e.target.files
        if (files.length > 0) {
            onFileSelect(files[0])
        }
    }, [onFileSelect])

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return '🖼️'
        if (type.startsWith('video/')) return '🎬'
        if (type.startsWith('audio/')) return '🎵'
        if (type.includes('pdf')) return '📄'
        if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦'
        if (type.includes('text') || type.includes('document')) return '📝'
        return '📁'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden
                  ${isDragging
                        ? 'border-primary bg-primary/20 scale-[1.02] shadow-[0_0_40px_rgba(99,102,241,0.2)]'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }
                  ${disabled ? 'opacity-50 pointer-events-none grayscale' : 'cursor-pointer'}
                  ${selectedFile ? 'p-6' : 'p-16'}
                `}
            >
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={disabled}
                />

                <AnimatePresence mode="wait">
                    {!selectedFile ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center text-center"
                        >
                            <motion.div
                                animate={isDragging ? { scale: 1.1, y: -10 } : { scale: 1, y: 0 }}
                                className="mb-8 relative"
                            >
                                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-colors ${isDragging ? 'bg-primary text-white' : 'bg-surface-light text-primary'}`}>
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                {isDragging && (
                                    <motion.div
                                        layoutId="drop-glow"
                                        className="absolute inset-0 bg-primary/50 blur-xl -z-10 rounded-full"
                                    />
                                )}
                            </motion.div>
                            <h3 className="text-2xl font-bold mb-3 text-white">
                                {isDragging ? 'Drop it like it\'s hot!' : 'Drag & drop file here'}
                            </h3>
                            <p className="text-slate-400 mb-6 text-lg">or click to browse from device</p>
                            <div className="flex gap-4 text-xs font-mono text-slate-500 bg-surface/50 px-4 py-2 rounded-full">
                                <span>Any Format</span>
                                <span>•</span>
                                <span>Unlimited Size</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="selected"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-6 relative z-20"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-surface-light flex items-center justify-center text-4xl shadow-lg border border-white/5">
                                {getFileIcon(selectedFile.type)}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <h4 className="font-bold text-lg text-white truncate mb-1">{selectedFile.name}</h4>
                                <p className="text-slate-400 font-mono">{formatFileSize(selectedFile.size)}</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation() // Prevent file dialog
                                    e.nativeEvent.stopImmediatePropagation(); // Ensure input doesn't trigger
                                    // Hack: the input is covering everything, we need to temporarily disable it or use z-index
                                }}
                                // Actually, z-index of input is 10. We need this button to be higher.
                                className="p-3 rounded-xl bg-surface hover:text-error transition-colors relative z-30"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default FileDropZone

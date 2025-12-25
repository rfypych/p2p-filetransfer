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
          relative rounded-2xl border-2 border-dashed transition-all duration-300
          ${isDragging
                        ? 'border-primary bg-primary/10 scale-[1.02]'
                        : 'border-slate-700 hover:border-slate-600'
                    }
          ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
          ${selectedFile ? 'p-6' : 'p-12'}
        `}
            >
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                                className="mb-6"
                            >
                                <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center">
                                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                            </motion.div>
                            <h3 className="text-xl font-semibold mb-2">
                                {isDragging ? 'Drop to upload' : 'Drag & drop your file'}
                            </h3>
                            <p className="text-slate-400 mb-4">or click to browse</p>
                            <p className="text-xs text-slate-500">Any file type • Unlimited size</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="selected"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-xl glass flex items-center justify-center text-3xl">
                                {getFileIcon(selectedFile.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{selectedFile.name}</h4>
                                <p className="text-sm text-slate-400">{formatFileSize(selectedFile.size)}</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onFileSelect(null)
                                }}
                                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

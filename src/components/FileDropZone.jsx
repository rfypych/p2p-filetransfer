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
        if (e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0])
        }
    }, [disabled, onFileSelect])

    const handleFileChange = useCallback((e) => {
        if (e.target.files.length > 0) {
            onFileSelect(e.target.files[0])
        }
    }, [onFileSelect])

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
                  relative w-full transition-all duration-300 group
                  ${disabled ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}
                `}
            >
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    disabled={disabled}
                />

                {/* Minimal Layout */}
                <div className={`
                    border border-white/10 p-8 md:p-12 transition-all duration-300
                    ${isDragging ? 'bg-white/5 border-white/30' : 'hover:border-white/20'}
                `}>
                    <AnimatePresence mode="wait">
                        {!selectedFile ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-start"
                            >
                                <span className="font-mono text-xs text-gray-500 mb-2 uppercase tracking-widest">
                                    File Input
                                </span>
                                <h3 className="font-serif text-3xl text-white mb-2 group-hover:underline decoration-1 underline-offset-4">
                                    Drop file here
                                </h3>
                                <p className="text-sm text-gray-500">
                                    or click to browse local storage
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="selected"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-start w-full"
                            >
                                <div className="flex justify-between items-start w-full mb-2">
                                    <div>
                                        <span className="font-mono text-xs text-gray-500 mb-1 block uppercase tracking-widest">
                                            Ready to send
                                        </span>
                                        <h3 className="font-serif text-2xl text-white break-all">
                                            {selectedFile.name}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onFileSelect(null)
                                        }}
                                        className="text-xs text-gray-500 hover:text-white uppercase tracking-widest relative z-30"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="w-full h-px bg-white/20 my-4" />
                                <div className="flex justify-between w-full font-mono text-xs text-gray-400">
                                    <span>{selectedFile.type || 'Unknown Type'}</span>
                                    <span>{formatFileSize(selectedFile.size)}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}

export default FileDropZone

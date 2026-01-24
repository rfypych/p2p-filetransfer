import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, duration)
        return () => clearTimeout(timer)
    }, [duration, onClose])

    const bgColor = {
        info: 'bg-blue-600/90',
        success: 'bg-green-600/90',
        warning: 'bg-yellow-600/90',
        error: 'bg-red-600/90'
    }[type]

    const icon = {
        info: '💬',
        success: '✓',
        warning: '⚠',
        error: '✕'
    }[type]

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 min-w-[280px] backdrop-blur-sm border border-white/10`}
        >
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-medium">{message}</span>
        </motion.div>
    )
}

export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}

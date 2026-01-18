import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

const ConnectionPanel = ({ mode, peerId, connectionState, remotePeerId, error }) => {
    const [copied, setCopied] = useState(false)

    const shareUrl = peerId
        ? `${window.location.origin}${window.location.pathname}?connect=${peerId}`
        : ''

    const handleCopy = useCallback(async () => {
        if (!shareUrl) return
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }, [shareUrl])

    const getStatusConfig = () => {
        switch (connectionState) {
            case 'waiting':
                return { color: 'bg-warning', text: 'Waiting for connection...', pulse: true }
            case 'connecting':
                return { color: 'bg-blue-500', text: 'Connecting...', pulse: true }
            case 'connected':
                return { color: 'bg-success', text: `Connected${remotePeerId ? ` to ${remotePeerId.slice(0, 6)}...` : ''}`, pulse: false }
            case 'transferring':
                return { color: 'bg-primary', text: 'Transferring...', pulse: true }
            case 'error':
                return { color: 'bg-error', text: error || 'Connection failed', pulse: false }
            default:
                return { color: 'bg-slate-500', text: 'Initializing...', pulse: true }
        }
    }

    const status = getStatusConfig()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-3 bg-surface-light/50 px-4 py-2 rounded-full border border-white/5">
                    <div className={`w-2.5 h-2.5 rounded-full ${status.color} ${status.pulse ? 'animate-pulse' : ''} shadow-[0_0_8px_currentColor]`} />
                    <span className="text-slate-300 text-sm font-medium tracking-wide">{status.text}</span>
                </div>
                <motion.a
                    href="/"
                    whileHover={{ x: -4 }}
                    className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </motion.a>
            </div>

            {/* Main Card */}
            <div className="glass rounded-3xl p-6 md:p-8 glow border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />

                {/* Sender Waiting Mode */}
                {mode === 'send' && connectionState === 'waiting' && (
                    <div className="flex flex-col items-center gap-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="bg-white p-4 rounded-2xl shadow-xl"
                        >
                            {peerId ? (
                                <QRCodeSVG
                                    value={shareUrl}
                                    size={180}
                                    level="H"
                                    includeMargin={false}
                                    className="rounded-lg"
                                />
                            ) : (
                                <div className="w-[180px] h-[180px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-400 rounded-full animate-spin" />
                                </div>
                            )}
                        </motion.div>

                        <div className="w-full text-center max-w-md">
                            <h3 className="text-2xl font-bold mb-2 text-white">Scan to Connect</h3>
                            <p className="text-slate-400 mb-6">
                                Share the link below or ask receiver to scan this code.
                            </p>

                            <div className="flex gap-3 w-full">
                                <div className="flex-1 min-w-0 bg-surface-light border border-white/10 rounded-xl px-4 py-3 flex items-center">
                                    <p className="text-sm text-slate-300 truncate font-mono">
                                        {shareUrl || 'Generating secure link...'}
                                    </p>
                                </div>
                                <motion.button
                                    onClick={handleCopy}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!peerId}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${copied
                                        ? 'bg-success text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                        : 'bg-primary hover:bg-primary-light text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                                        }`}
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copied
                                        </>
                                    ) : (
                                        'Copy'
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Receiver Mode or Connecting States */}
                {(mode === 'receive' || (mode === 'send' && connectionState !== 'waiting')) && (
                    <div className="text-center py-8">
                        {/* Spinner or Success Icon */}
                        <div className="relative mb-6 mx-auto w-20 h-20 flex items-center justify-center">
                            {(connectionState === 'connecting' || connectionState === 'waiting' || connectionState === 'idle') && (
                                <>
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-4 border-primary/30"
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                </>
                            )}

                            {connectionState === 'connected' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-full h-full rounded-full bg-success/20 flex items-center justify-center border border-success/40"
                                >
                                    <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                            )}

                            {connectionState === 'error' && (
                                <div className="w-full h-full rounded-full bg-error/20 flex items-center justify-center border border-error/40">
                                    <svg className="w-10 h-10 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <h3 className="text-2xl font-bold mb-2 text-white">
                            {connectionState === 'connecting' || connectionState === 'idle' || connectionState === 'waiting' ? 'Establishing Link...' :
                                connectionState === 'connected' ? 'Secure Link Active!' :
                                    connectionState === 'error' ? 'Connection Failed' : 'Please wait...'}
                        </h3>
                        <p className="text-slate-400">
                            {connectionState === 'connecting' || connectionState === 'idle' || connectionState === 'waiting' ? 'Connecting to peer securely...' :
                                connectionState === 'connected' ? (mode === 'send' ? 'Ready to send files.' : 'Waiting for sender to start...') :
                                    connectionState === 'error' ? error : 'Synchronizing...'}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default ConnectionPanel

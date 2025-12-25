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
                return {
                    color: 'bg-yellow-500',
                    text: 'Waiting for connection...',
                    pulse: true
                }
            case 'connecting':
                return {
                    color: 'bg-blue-500',
                    text: 'Connecting...',
                    pulse: true
                }
            case 'connected':
                return {
                    color: 'bg-success',
                    text: `Connected${remotePeerId ? ` to ${remotePeerId.slice(0, 6)}...` : ''}`,
                    pulse: false
                }
            case 'transferring':
                return {
                    color: 'bg-primary',
                    text: 'Transferring...',
                    pulse: true
                }
            case 'error':
                return {
                    color: 'bg-error',
                    text: error || 'Connection failed',
                    pulse: false
                }
            default:
                return {
                    color: 'bg-slate-500',
                    text: 'Initializing...',
                    pulse: true
                }
        }
    }

    const status = getStatusConfig()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
                    <span className="text-slate-300 text-sm md:text-base truncate">{status.text}</span>
                </div>
                <motion.a
                    href="/"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-slate-400 hover:text-white transition-colors text-sm flex-shrink-0 ml-2"
                >
                    ← Back
                </motion.a>
            </div>

            {/* Connection card */}
            <div className="glass rounded-2xl p-4 md:p-6 glow overflow-hidden">
                {mode === 'send' && connectionState === 'waiting' && (
                    <div className="flex flex-col items-center gap-6">
                        {/* QR Code */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.4 }}
                            className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl"
                        >
                            {peerId ? (
                                <QRCodeSVG
                                    value={shareUrl}
                                    size={160}
                                    level="H"
                                    includeMargin={false}
                                    bgColor="#ffffff"
                                    fgColor="#0a0a0f"
                                />
                            ) : (
                                <div className="w-[160px] h-[160px] bg-slate-200 animate-pulse rounded" />
                            )}
                        </motion.div>

                        {/* Share info */}
                        <div className="w-full text-center">
                            <h3 className="text-xl md:text-2xl font-bold mb-2">Share this link</h3>
                            <p className="text-slate-400 text-sm md:text-base mb-4">
                                Scan QR code or share link with receiver
                            </p>

                            {/* Link input - Fixed overflow */}
                            <div className="flex gap-2 w-full">
                                <div className="flex-1 min-w-0 px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-surface border border-slate-700 overflow-hidden">
                                    <p className="text-xs md:text-sm text-slate-400 truncate">
                                        {shareUrl || 'Generating link...'}
                                    </p>
                                </div>
                                <motion.button
                                    onClick={handleCopy}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={!peerId}
                                    className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold transition-all flex-shrink-0 text-sm md:text-base ${copied
                                        ? 'bg-success text-white'
                                        : 'bg-primary hover:bg-primary-light text-white'
                                        }`}
                                >
                                    {copied ? '✓' : 'Copy'}
                                </motion.button>
                            </div>

                            {/* Connection ID */}
                            {peerId && (
                                <p className="mt-3 md:mt-4 text-xs text-slate-500">
                                    Your ID: <code className="text-primary">{peerId}</code>
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {mode === 'receive' && (
                    <div className="text-center py-6 md:py-8">
                        {/* Fixed animation - always animate when waiting or connecting */}
                        {(connectionState === 'connecting' || connectionState === 'waiting' || connectionState === 'idle') && (
                            <motion.div
                                className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        )}

                        {connectionState === 'connected' && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center"
                            >
                                <svg className="w-7 h-7 md:w-8 md:h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                        )}

                        {connectionState === 'error' && (
                            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-error/20 flex items-center justify-center">
                                <svg className="w-7 h-7 md:w-8 md:h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        )}

                        <h3 className="text-lg md:text-xl font-semibold mb-2">
                            {connectionState === 'connecting' || connectionState === 'idle' || connectionState === 'waiting' ? 'Connecting...' :
                                connectionState === 'connected' ? 'Connected!' :
                                    connectionState === 'error' ? 'Connection Failed' : 'Please wait...'}
                        </h3>
                        <p className="text-slate-400 text-sm md:text-base">
                            {connectionState === 'connecting' || connectionState === 'idle' || connectionState === 'waiting' ? 'Establishing secure connection...' :
                                connectionState === 'connected' ? 'Waiting for file from sender...' :
                                    connectionState === 'error' ? error : 'Please wait...'}
                        </p>
                    </div>
                )}

                {connectionState === 'connected' && mode === 'send' && (
                    <div className="text-center py-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center"
                        >
                            <svg className="w-7 h-7 md:w-8 md:h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>
                        <h3 className="text-lg md:text-xl font-semibold text-success mb-2">Connected!</h3>
                        <p className="text-slate-400 text-sm md:text-base">You can now select a file to send</p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default ConnectionPanel

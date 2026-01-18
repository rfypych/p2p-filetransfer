import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

const ConnectionPanel = ({ mode, peerId, connectionState, error }) => {
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

    // Simple status text mapping
    const getStatusText = () => {
        switch (connectionState) {
            case 'waiting': return 'Waiting for receiver...'
            case 'connecting': return 'Establishing handshake...'
            case 'connected': return 'Secure connection active.'
            case 'transferring': return 'Transfer in progress...'
            case 'error': return error || 'Connection failed.'
            default: return 'Initializing...'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
        >
            {/* Status Line */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                        connectionState === 'connected' ? 'bg-white' :
                        connectionState === 'error' ? 'bg-red-500' : 'bg-gray-500 animate-pulse'
                    }`} />
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-400">
                        {getStatusText()}
                    </span>
                </div>
                <a href="/" className="text-xs text-gray-500 hover:text-white transition-colors duration-300 uppercase tracking-widest">
                    Cancel
                </a>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start animate-slide-up">

                {/* Mode: SENDER Waiting */}
                {mode === 'send' && connectionState === 'waiting' && (
                    <>
                        {/* QR Code */}
                        <div className="bg-white p-2 w-fit shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-transform duration-500 hover:scale-[1.02] flex-shrink-0">
                            {peerId ? (
                                <QRCodeSVG value={shareUrl} size={140} />
                            ) : (
                                <div className="w-[140px] h-[140px] bg-gray-100 animate-pulse" />
                            )}
                        </div>

                        {/* Text & Link */}
                        <div className="flex-1 space-y-6 w-full text-center md:text-left">
                            <div>
                                <h3 className="font-serif text-3xl text-white mb-2 tracking-tight">Scan to Connect</h3>
                                <p className="text-gray-500 font-light leading-relaxed">
                                    Ask the receiver to scan the QR code or share the link below.
                                </p>
                            </div>

                            {/* Link Container */}
                            <div
                                className="group flex items-center justify-between border-b border-white/20 pb-2 hover:border-white transition-colors duration-300 cursor-pointer w-full"
                                onClick={handleCopy}
                            >
                                <span className="font-mono text-sm text-gray-300 truncate mr-4 selection:bg-white selection:text-black min-w-0 flex-1 text-left">
                                    {shareUrl || 'Generating ID...'}
                                </span>
                                <span className="text-xs uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors duration-300 shrink-0">
                                    {copied ? 'Copied' : 'Copy Link'}
                                </span>
                            </div>
                        </div>
                    </>
                )}

                {/* Other States (Connecting, Receiver, Error) */}
                {(mode === 'receive' || (mode === 'send' && connectionState !== 'waiting')) && (
                    <div className="w-full py-12 text-center md:text-left">
                        <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 tracking-tight">
                            {connectionState === 'connected' ? 'Ready.' :
                             connectionState === 'error' ? 'Failed.' : 'Connecting...'}
                        </h2>
                        <p className="text-gray-500 text-lg font-light max-w-lg leading-relaxed mx-auto md:mx-0">
                            {connectionState === 'connected'
                                ? (mode === 'send' ? 'Drag and drop files below to begin transfer.' : 'Waiting for sender to start.')
                                : (connectionState === 'error' ? 'Please refresh and try again.' : 'Establishing a secure peer-to-peer data channel.')
                            }
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default ConnectionPanel

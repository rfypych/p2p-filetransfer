import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

const ConnectionPanel = ({ mode, peerId, connectionState, error }) => {
    const [copied, setCopied] = useState(false)
    const [copiedCode, setCopiedCode] = useState(false)
    const canShare = typeof navigator !== 'undefined' && !!navigator.share;

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

    const handleCopyCode = useCallback(async () => {
        if (!peerId) return
        try {
            await navigator.clipboard.writeText(peerId)
            setCopiedCode(true)
            setTimeout(() => setCopiedCode(false), 2000)
        } catch (err) {
            console.error('Failed to copy code:', err)
        }
    }, [peerId])

    const handleShare = useCallback(async (e) => {
        e.stopPropagation();
        if (!shareUrl) return;
        try {
            await navigator.share({
                title: 'AirNode File Transfer',
                text: 'Connect to AirNode to receive files:',
                url: shareUrl
            });
        } catch (err) {
            console.error('Failed to share:', err);
        }
    }, [shareUrl]);

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
            <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                        connectionState === 'connected' ? 'bg-primary' :
                        connectionState === 'error' ? 'bg-red-500' : 'bg-secondary animate-pulse'
                    }`} />
                    <span className="font-mono text-xs uppercase tracking-widest text-secondary">
                        {getStatusText()}
                    </span>
                </div>
                <a href="/" className="text-xs text-secondary hover:text-primary transition-colors duration-300 uppercase tracking-widest">
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
                                <div className="w-[140px] h-[140px] bg-surface animate-pulse" />
                            )}
                        </div>

                        {/* Text & Link */}
                        <div className="flex-1 space-y-6 w-full text-center md:text-left">
                            <div>
                                <h3 className="font-serif text-3xl text-primary mb-2 tracking-tight">Scan to Connect</h3>
                                <p className="text-secondary font-light leading-relaxed">
                                    Ask the receiver to scan the QR code or share the link below.
                                </p>
                            </div>

                            {/* Link Container with Copy & Share */}
                            <div className="flex flex-col gap-2 w-full">
                                <div
                                    className="group flex items-center justify-between border-b border-secondary/20 pb-2 hover:border-border transition-colors duration-300 cursor-pointer w-full"
                                    onClick={handleCopy}
                                >
                                    <span className="font-mono text-sm text-secondary truncate mr-4 selection:bg-primary selection:text-background min-w-0 flex-1 text-left group-hover:text-primary transition-colors">
                                        {shareUrl || 'Generating ID...'}
                                    </span>

                                    <div className="flex items-center gap-4 shrink-0">
                                        {/* Native Share Button (Mobile mostly) */}
                                        {canShare && (
                                            <button
                                                onClick={handleShare}
                                                className="text-secondary hover:text-primary transition-colors duration-300"
                                                title="Share Link"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="18" cy="5" r="3"></circle>
                                                    <circle cx="6" cy="12" r="3"></circle>
                                                    <circle cx="18" cy="19" r="3"></circle>
                                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                                </svg>
                                            </button>
                                        )}

                                        <span className="text-xs uppercase tracking-widest text-secondary group-hover:text-primary transition-colors duration-300">
                                            {copied ? 'Copied' : 'Copy'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Manual Code Entry Display */}
                            <div className="pt-2 w-full">
                                <p className="text-xs text-secondary uppercase tracking-widest mb-2 text-center md:text-left">Or use connection code</p>
                                <div
                                    className="group flex items-center justify-between md:justify-start gap-4 cursor-pointer p-3 bg-surface rounded border border-transparent hover:border-border transition-colors"
                                    onClick={handleCopyCode}
                                >
                                    <span className="font-serif text-2xl text-primary tracking-wide">
                                        {peerId || '...'}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest text-secondary group-hover:text-primary transition-colors">
                                        {copiedCode ? 'Copied' : 'Click to Copy'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Other States (Connecting, Receiver, Error) */}
                {(mode === 'receive' || (mode === 'send' && connectionState !== 'waiting')) && (
                    <div className="w-full py-12 text-center md:text-left">
                        <h2 className="font-serif text-4xl md:text-5xl text-primary mb-4 tracking-tight">
                            {connectionState === 'connected' ? 'Ready.' :
                             connectionState === 'error' ? 'Failed.' : 'Connecting...'}
                        </h2>
                        <p className="text-secondary text-lg font-light max-w-lg leading-relaxed mx-auto md:mx-0">
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

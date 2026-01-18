import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ReceiveOptions = ({ onConnect, onBack }) => {
    const [method, setMethod] = useState(null) // null | 'scan' | 'manual'
    const [connectionId, setConnectionId] = useState('')
    const [scanError, setScanError] = useState(null)
    const [isScanning, setIsScanning] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const scannerRef = useRef(null)
    const hasConnectedRef = useRef(false)

    // Handle manual ID submission
    const handleSubmitId = useCallback(() => {
        const id = connectionId.trim()
        if (id) {
            onConnect(id)
        }
    }, [connectionId, onConnect])

    // Stop scanner safely
    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                // Check if scanner is in a state that can be stopped
                // Html5Qrcode.getState() returns:
                // 0: UNKNOWN, 1: NOT_STARTED, 2: SCANNING, 3: PAUSED
                // However, we just try/catch because the library can be finicky
                await scannerRef.current.stop()
            } catch (err) {
                 // Ignore "Scanner is not running" or similar errors
                 // eslint-disable-next-line no-console
                 console.log('Scanner stop ignored:', err)
            }
            // Clear instance (we create new one each time to be safe)
            try {
                // If possible clear it
                scannerRef.current.clear()
            } catch (e) { /* ignore */ }
            scannerRef.current = null
        }
        setIsScanning(false)
        setCameraReady(false)
    }, [])

    // Start QR scanner
    const startScanner = useCallback(async () => {
        if (scannerRef.current || hasConnectedRef.current) return

        setScanError(null)
        setIsScanning(true)
        setCameraReady(false)

        try {
            const { Html5Qrcode } = await import('html5-qrcode')

            // Wait for DOM element
            await new Promise(resolve => setTimeout(resolve, 100))

            const readerElement = document.getElementById('qr-reader')
            if (!readerElement) {
                // If element is missing (e.g. user navigated away quickly), just stop
                setIsScanning(false)
                return
            }

            const scanner = new Html5Qrcode('qr-reader', { verbose: false })
            scannerRef.current = scanner

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText) => {
                    if (hasConnectedRef.current) return
                    hasConnectedRef.current = true

                    // Extract connection ID from URL or use as-is
                    let connectId = decodedText
                    try {
                        const url = new URL(decodedText)
                        const id = url.searchParams.get('connect')
                        if (id) connectId = id
                    } catch {
                        // Not a URL, use as connection ID directly
                    }

                    // Stop scanner first, then connect
                    stopScanner().then(() => {
                        onConnect(connectId)
                    })
                },
                () => {
                    // QR code not detected yet - silent
                }
            )

            setCameraReady(true)
        } catch (err) {
            console.error('Scanner error:', err)

            let errorMessage = 'Failed to access camera'
            if (err.message?.includes('Permission')) {
                errorMessage = 'Camera permission denied. Please allow camera access.'
            } else if (err.message?.includes('NotFound') || err.message?.includes('not found')) {
                errorMessage = 'No camera found on this device'
            } else if (err.message?.includes('NotAllowed')) {
                errorMessage = 'Camera access not allowed. Check browser settings.'
            } else if (err.name === 'NotReadableError') {
                errorMessage = 'Camera is being used by another application'
            }

            setScanError(errorMessage)
            setIsScanning(false)
            setCameraReady(false)
        }
    }, [onConnect, stopScanner])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Force stop on unmount
            if (scannerRef.current) {
                // We use the raw stop logic here to avoid dependency cycle if we used stopScanner
                // But since stopScanner is useCallback with empty deps (mostly), it's fine?
                // Actually stopScanner depends on nothing.
            }
            // We can't await in cleanup, so we fire and forget
            // But we must call the method that handles the ref logic
        }
    }, [])

    // Separate effect for cleanup that calls the async function
    useEffect(() => {
        return () => {
             // We can't await this, but we trigger it
             // eslint-disable-next-line
             stopScanner().catch(e => {})
        }
    }, [stopScanner])


    // Start scanner when scan method selected (with delay to prevent shaking)
    useEffect(() => {
        if (method === 'scan') {
            const timer = setTimeout(() => {
                startScanner()
            }, 300)
            return () => clearTimeout(timer)
        } else {
             // Stop is handled by unmount or mode switch logic,
             // but if method changes to 'manual', we should stop.
             stopScanner()
        }
    }, [method, startScanner, stopScanner])

    // Handle back button - stop scanner
    const handleBack = useCallback(() => {
        stopScanner()
        if (method) {
            setMethod(null)
        } else {
            onBack()
        }
    }, [method, onBack, stopScanner])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-full flex items-center justify-center p-4"
        >
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-bold">Receive File</h2>
                    <motion.button
                        onClick={handleBack}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        &larr; Back
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                    {/* Method selection */}
                    {!method && (
                        <motion.div
                            key="methods"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <p className="text-slate-400 text-center mb-6">
                                Choose how to connect to sender
                            </p>

                            {/* Scan QR Option */}
                            <motion.button
                                onClick={() => setMethod('scan')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full glass rounded-2xl p-6 text-left glow-hover transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                        <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Scan QR Code</h3>
                                        <p className="text-sm text-slate-400">Use camera to scan sender&apos;s QR</p>
                                    </div>
                                </div>
                            </motion.button>

                            {/* Manual ID Option */}
                            <motion.button
                                onClick={() => setMethod('manual')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full glass rounded-2xl p-6 text-left glow-hover transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                                        <svg className="w-7 h-7 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Enter ID Manually</h3>
                                        <p className="text-sm text-slate-400">Type the connection ID</p>
                                    </div>
                                </div>
                            </motion.button>
                        </motion.div>
                    )}

                    {/* QR Scanner */}
                    {method === 'scan' && (
                        <motion.div
                            key="scanner"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            <div className="glass rounded-2xl p-4">
                                {/* Scanner container with fixed size */}
                                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-900">
                                    {/* Loading state */}
                                    {isScanning && !cameraReady && !scanError && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-slate-400 text-sm">Starting camera...</p>
                                        </div>
                                    )}

                                    {/* QR Reader element */}
                                    <div
                                        id="qr-reader"
                                        className="w-full h-full"
                                        style={{ minHeight: '280px' }}
                                    />

                                    {/* Scan frame overlay */}
                                    {cameraReady && (
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                            <div className="w-56 h-56 border-2 border-primary rounded-lg relative">
                                                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                                                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                                                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Error state */}
                            {scanError && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center p-4 rounded-xl bg-error/10 border border-error/30"
                                >
                                    <p className="text-sm text-error mb-3">{scanError}</p>
                                    <button
                                        onClick={() => {
                                            setScanError(null)
                                            hasConnectedRef.current = false
                                            startScanner()
                                        }}
                                        className="px-4 py-2 rounded-lg bg-error/20 text-error text-sm hover:bg-error/30 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            )}

                            {/* Instructions */}
                            {cameraReady && !scanError && (
                                <p className="text-center text-slate-400 text-sm">
                                    Point camera at the QR code
                                </p>
                            )}

                            {/* Switch to manual */}
                            <motion.button
                                onClick={() => {
                                    stopScanner()
                                    setMethod('manual')
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 rounded-xl glass text-slate-300 text-sm"
                            >
                                Enter ID manually instead
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Manual ID Input */}
                    {method === 'manual' && (
                        <motion.div
                            key="manual"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="glass rounded-2xl p-6">
                                <label className="block text-sm text-slate-400 mb-3">
                                    Connection ID
                                </label>
                                <input
                                    type="text"
                                    value={connectionId}
                                    onChange={(e) => setConnectionId(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitId()}
                                    placeholder="Enter ID (e.g. ABC123)"
                                    autoFocus
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    className="w-full px-4 py-3 rounded-xl bg-surface border border-slate-700 focus:border-primary focus:outline-none text-lg tracking-widest text-center uppercase transition-colors"
                                    maxLength={10}
                                />
                            </div>

                            <motion.button
                                onClick={handleSubmitId}
                                disabled={!connectionId.trim()}
                                whileHover={{ scale: connectionId.trim() ? 1.02 : 1 }}
                                whileTap={{ scale: connectionId.trim() ? 0.98 : 1 }}
                                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${connectionId.trim()
                                    ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                Connect
                            </motion.button>

                            <motion.button
                                onClick={() => setMethod('scan')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 rounded-xl glass text-slate-300 text-sm"
                            >
                                Scan QR code instead
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default ReceiveOptions

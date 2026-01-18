import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ReceiveOptions = ({ onConnect, onBack }) => {
    const [method, setMethod] = useState(null)
    const [connectionId, setConnectionId] = useState('')
    const [scanError, setScanError] = useState(null)
    const [isScanning, setIsScanning] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const scannerRef = useRef(null)
    const hasConnectedRef = useRef(false)

    // ... (Keep existing logic for scanner/manual input) ...
    // Re-implementing simplified logic hooks

    const handleSubmitId = useCallback(() => {
        const id = connectionId.trim()
        if (id) onConnect(id)
    }, [connectionId, onConnect])

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try { await scannerRef.current.stop() } catch { /* ignore */ }
            try { scannerRef.current.clear() } catch { /* ignore */ }
            scannerRef.current = null
        }
        setIsScanning(false)
        setCameraReady(false)
    }, [])

    const startScanner = useCallback(async () => {
        if (scannerRef.current || hasConnectedRef.current) return
        setScanError(null)
        setIsScanning(true)
        setCameraReady(false)
        try {
            const { Html5Qrcode } = await import('html5-qrcode')
            await new Promise(r => setTimeout(r, 100))
            const readerElement = document.getElementById('qr-reader')
            if (!readerElement) { setIsScanning(false); return }
            const scanner = new Html5Qrcode('qr-reader', { verbose: false })
            scannerRef.current = scanner
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                (decodedText) => {
                    if (hasConnectedRef.current) return
                    hasConnectedRef.current = true
                    let connectId = decodedText
                    try {
                        const url = new URL(decodedText)
                        const id = url.searchParams.get('connect')
                        if (id) connectId = id
                    } catch { /* ignore */ }
                    stopScanner().then(() => onConnect(connectId))
                },
                () => {}
            )
            setCameraReady(true)
        } catch {
            setScanError('Camera access failed.')
            setIsScanning(false)
            setCameraReady(false)
        }
    }, [onConnect, stopScanner])

    useEffect(() => {
        return () => { stopScanner().catch(() => {}) }
    }, [stopScanner])

    useEffect(() => {
        if (method === 'scan') {
            const timer = setTimeout(startScanner, 300)
            return () => clearTimeout(timer)
        } else {
            stopScanner()
        }
    }, [method, startScanner, stopScanner])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg mx-auto"
        >
            <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-4">
                <h2 className="font-serif text-3xl text-white">Receive File</h2>
                <button
                    onClick={() => method ? setMethod(null) : onBack()}
                    className="text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                >
                    &larr; Back
                </button>
            </div>

            <AnimatePresence mode="wait">
                {!method && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-0 border-t border-white/10"
                    >
                        {[
                            { id: 'scan', label: 'Scan QR Code', desc: 'Use camera' },
                            { id: 'manual', label: 'Enter ID Manually', desc: 'Type code' }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setMethod(opt.id)}
                                className="group flex justify-between items-center py-6 border-b border-white/10 hover:bg-white/5 transition-colors text-left"
                            >
                                <div>
                                    <h3 className="font-serif text-xl text-gray-200 mb-1 group-hover:pl-2 transition-all">{opt.label}</h3>
                                    <p className="font-mono text-xs text-gray-600 uppercase tracking-widest group-hover:pl-2 transition-all">{opt.desc}</p>
                                </div>
                                <span className="text-gray-600 group-hover:text-white transition-colors">→</span>
                            </button>
                        ))}
                    </motion.div>
                )}

                {method === 'scan' && (
                    <motion.div key="scan" className="w-full">
                        <div className="relative w-full aspect-square bg-black border border-white/10 mb-6">
                            <div id="qr-reader" className="w-full h-full" />
                            {isScanning && !cameraReady && (
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono uppercase tracking-widest text-gray-500">
                                    Initializing Camera...
                                </div>
                            )}
                            {scanError && (
                                <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4 text-center">
                                    {scanError}
                                </div>
                            )}
                        </div>
                        <p className="text-center font-mono text-xs text-gray-500 uppercase tracking-widest">
                            Point camera at sender&apos;s QR Code
                        </p>
                    </motion.div>
                )}

                {method === 'manual' && (
                    <motion.div key="manual" className="w-full">
                        <div className="mb-8">
                            <label className="block font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">
                                Connection ID
                            </label>
                            <input
                                type="text"
                                value={connectionId}
                                onChange={(e) => setConnectionId(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitId()}
                                placeholder="ABC1234"
                                autoFocus
                                className="w-full bg-transparent border-b border-white/20 py-4 text-3xl font-serif text-white placeholder-gray-800 focus:outline-none focus:border-white transition-colors rounded-none"
                            />
                        </div>
                        <button
                            onClick={handleSubmitId}
                            disabled={!connectionId.trim()}
                            className="w-full py-4 bg-white text-black font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Connect
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ReceiveOptions

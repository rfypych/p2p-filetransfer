import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import FileDropZone from './components/FileDropZone'
import ConnectionPanel from './components/ConnectionPanel'
import ProgressBar from './components/ProgressBar'
import TransferComplete from './components/TransferComplete'
import ReceiveOptions from './components/ReceiveOptions'
import { useP2P } from './hooks/useP2P'

function App() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [mode, setMode] = useState('home') // 'home' | 'send' | 'receive-options' | 'receive'
    const hasAutoConnected = useRef(false)

    const {
        status: connectionState,
        peerId,
        remotePeerId,
        progress: transferProgress,
        speed: transferSpeed,
        receivedFile,
        error,
        initialize,
        connect,
        sendFile,
        reset
    } = useP2P()

    const handleSendMode = useCallback(() => {
        setMode('send')
        initialize()
    }, [initialize])

    const handleReceiveOptionsMode = useCallback(() => {
        setMode('receive-options')
    }, [])

    const handleReceiveMode = useCallback((id) => {
        setMode('receive')
        connect(id)
    }, [connect])

    const handleFileSelect = useCallback((file) => {
        setSelectedFile(file)
        if (connectionState === 'connected') {
            sendFile(file)
        }
    }, [connectionState, sendFile])

    const handleReset = useCallback(() => {
        setSelectedFile(null)
        setMode('home')
        reset()
    }, [reset])

    // Check if we have a peer ID in the URL (receiver mode)
    useEffect(() => {
        if (hasAutoConnected.current) return;

        const urlParams = new URLSearchParams(window.location.search)
        const connectId = urlParams.get('connect')
        if (connectId) {
            hasAutoConnected.current = true;
            setTimeout(() => {
                handleReceiveMode(connectId)
            }, 0)
        }
    }, [handleReceiveMode])

    const isTransferComplete = (mode === 'send' && transferProgress === 100 && connectionState === 'connected') ||
                               (mode === 'receive' && receivedFile);

    return (
        // Minimalist container
        <div className="min-h-screen bg-background text-gray-300 font-sans selection:bg-white selection:text-black flex flex-col">

            {/* Header / Nav */}
            <header className="px-6 py-8 md:px-12 md:py-10 flex justify-between items-center border-b border-white/5">
                <div
                    className="font-serif text-2xl tracking-tight text-white cursor-pointer"
                    onClick={() => setMode('home')}
                >
                    AirNode.
                </div>
                <div className="text-xs tracking-widest uppercase text-gray-500 hidden sm:block">
                    P2P File Transfer
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:px-12 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {mode === 'home' && (
                        <Hero
                            key="hero"
                            onSendClick={handleSendMode}
                            onReceiveClick={handleReceiveOptionsMode}
                        />
                    )}

                    {mode === 'receive-options' && (
                        <ReceiveOptions
                            key="receive-options"
                            onConnect={handleReceiveMode}
                            onBack={() => setMode('home')}
                        />
                    )}

                    {(mode === 'send' || mode === 'receive') && !isTransferComplete && (
                        <div key="transfer" className="w-full space-y-12">
                            <ConnectionPanel
                                mode={mode}
                                peerId={peerId}
                                connectionState={connectionState}
                                remotePeerId={remotePeerId}
                                error={error}
                            />

                            {mode === 'send' && connectionState === 'connected' && (
                                <FileDropZone
                                    onFileSelect={handleFileSelect}
                                    selectedFile={selectedFile}
                                    disabled={connectionState === 'transferring'}
                                />
                            )}

                            {(connectionState === 'transferring' || transferProgress > 0) && (
                                <ProgressBar
                                    progress={transferProgress}
                                    speed={transferSpeed}
                                    fileName={selectedFile?.name || receivedFile?.name || 'File'}
                                    fileSize={selectedFile?.size || receivedFile?.size || 0}
                                />
                            )}
                        </div>
                    )}

                    {isTransferComplete && (
                        <TransferComplete
                            key="complete"
                            mode={mode}
                            file={mode === 'send' ? selectedFile : receivedFile}
                            onReset={handleReset}
                        />
                    )}
                </AnimatePresence>
            </main>

            {/* Minimal Footer */}
            <footer className="px-6 py-8 md:px-12 border-t border-white/5 text-xs text-gray-600 flex justify-between items-center">
                <span>&copy; {new Date().getFullYear()} AirNode</span>
                <span>Serverless WebRTC</span>
            </footer>
        </div>
    )
}

export default App

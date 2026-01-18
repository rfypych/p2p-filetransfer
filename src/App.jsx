import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
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
        // Wrapper for scrolling logic: h-screen overflow-y-auto to allow scrolling within the fixed body
        <div className="h-screen w-full overflow-y-auto overflow-x-hidden bg-background text-secondary font-sans selection:bg-primary selection:text-background flex flex-col transition-colors duration-300">

            {/* Header / Nav */}
            <Header onLogoClick={() => setMode('home')} />

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:px-12 flex flex-col justify-center relative min-h-screen">

                {/* Subtle vertical divider for large screens */}
                <div className="hidden lg:block absolute left-12 top-0 bottom-0 w-[1px] bg-border pointer-events-none transition-colors duration-300" />

                <div className="lg:pl-16 w-full pb-12">
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
                                    <div className="animate-fade-in border-t border-border pt-12 transition-colors duration-300">
                                        <FileDropZone
                                            onFileSelect={handleFileSelect}
                                            selectedFile={selectedFile}
                                            disabled={connectionState === 'transferring'}
                                        />
                                    </div>
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
                </div>
            </main>

            {/* Minimal Footer with different background tone */}
            <footer className="px-6 py-8 md:px-12 bg-surface border-t border-border text-xs text-secondary flex justify-between items-center transition-colors duration-300 hover:text-primary">
                <span>&copy; {new Date().getFullYear()} AirNode</span>
                <span>Serverless WebRTC</span>
            </footer>
        </div>
    )
}

export default App

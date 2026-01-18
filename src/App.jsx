import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import FileDropZone from './components/FileDropZone'
import ConnectionPanel from './components/ConnectionPanel'
import ProgressBar from './components/ProgressBar'
import TransferComplete from './components/TransferComplete'
import ReceiveOptions from './components/ReceiveOptions'
import Particles from './components/Particles'
import { useP2P } from './hooks/useP2P'

function App() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [mode, setMode] = useState('home') // 'home' | 'send' | 'receive-options' | 'receive'
    const hasAutoConnected = useRef(false)

    const {
        status: connectionState, // Map status to connectionState
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
            // Delay slightly to ensure component mounted and avoid sync state update warning
            setTimeout(() => {
                handleReceiveMode(connectId)
            }, 0)
        }
    }, [handleReceiveMode])

    // Detect completion via receivedFile for Receiver,
    // BUT for Sender we need to know when transfer is done.
    // The P2PClient resets to 'connected' after send.
    // We might need a 'complete' state wrapper in the component or listen to 100% progress.
    // Let's use a derived state for "Complete View".

    const isTransferComplete = (mode === 'send' && transferProgress === 100 && connectionState === 'connected') ||
                               (mode === 'receive' && receivedFile);

    return (
        <div className="h-full bg-background bg-grid bg-radial-glow relative overflow-hidden text-white font-sans">
            <Particles />

            <div className="relative z-10 h-full overflow-y-auto">
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
                        <div key="transfer" className="min-h-full flex items-center justify-center p-4">
                            <div className="w-full max-w-2xl space-y-6">
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
        </div>
    )
}

export default App

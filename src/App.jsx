import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import FileDropZone from './components/FileDropZone'
import ConnectionPanel from './components/ConnectionPanel'
import ProgressBar from './components/ProgressBar'
import TransferComplete from './components/TransferComplete'
import ReceiveOptions from './components/ReceiveOptions'
import Particles from './components/Particles'
import { usePeer } from './hooks/usePeer'

function App() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [mode, setMode] = useState('home') // 'home' | 'send' | 'receive-options' | 'receive'

    const {
        peerId,
        connectionState,
        remotePeerId,
        transferProgress,
        transferSpeed,
        receivedFile,
        error,
        createPeer,
        connectToPeer,
        sendFile,
        resetTransfer
    } = usePeer()

    const handleSendMode = useCallback(() => {
        setMode('send')
        createPeer()
    }, [createPeer])

    const handleReceiveOptionsMode = useCallback(() => {
        setMode('receive-options')
    }, [])

    const handleReceiveMode = useCallback((id) => {
        setMode('receive')
        connectToPeer(id)
    }, [connectToPeer])

    const handleFileSelect = useCallback((file) => {
        setSelectedFile(file)
        if (connectionState === 'connected') {
            sendFile(file)
        }
    }, [connectionState, sendFile])

    const handleReset = useCallback(() => {
        setSelectedFile(null)
        setMode('home')
        resetTransfer()
    }, [resetTransfer])

    // Check if we have a peer ID in the URL (receiver mode)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const connectId = urlParams.get('connect')
        if (connectId) {
            handleReceiveMode(connectId)
        }
    }, [handleReceiveMode])

    return (
        <div className="h-full bg-background bg-grid bg-radial-glow relative overflow-hidden">
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

                    {(mode === 'send' || mode === 'receive') && connectionState !== 'complete' && (
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

                    {connectionState === 'complete' && (
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

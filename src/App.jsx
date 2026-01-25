import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Hero from './components/Hero'
import FileDropZone from './components/FileDropZone'
import ConnectionPanel from './components/ConnectionPanel'
import ProgressBar from './components/ProgressBar'
import TransferComplete from './components/TransferComplete'
import ReceiveOptions from './components/ReceiveOptions'
import Privacy from './components/Privacy'
import Terms from './components/Terms'
import TechStack from './components/TechStack'
import Footer from './components/Footer'
import Lobby from './components/Lobby'
import AnonymousChat from './components/AnonymousChat'
import { ToastContainer } from './components/Toast'
import { useP2P } from './hooks/useP2P'
import { addToLobby, subscribeToLobby, removeFromLobby, sendGlobalMessage, subscribeToGlobalMessages, updateHeartbeat, sendConnectionRequest, subscribeToConnectionRequests, respondToConnectionRequest, cancelConnectionRequest, listenForRequestResponse } from './services/firebase'

function App() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [mode, setMode] = useState('home') // 'home' | 'send' | 'receive-options' | 'receive' | 'privacy' | 'terms' | 'techstack' | 'anonymous'
    const hasAutoConnected = useRef(false)

    // Anonymous Mode / Lobby State
    const [lobbyKey, setLobbyKey] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [globalMessages, setGlobalMessages] = useState([])
    const [toasts, setToasts] = useState([])
    const prevConnectionState = useRef(null)
    const prevRemotePeerId = useRef(null)
    const [showPrivateChat, setShowPrivateChat] = useState(false) // Debounced UI state
    const privateChatTimeoutRef = useRef(null)

    // Connection Request State
    const [incomingRequest, setIncomingRequest] = useState(null)
    const [pendingRequest, setPendingRequest] = useState(null)

    // Toast helpers (declared early for use in handlers)
    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

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
        sendMessage,
        messages,
        reset,
        disconnect
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

    const handleAnonymousMode = useCallback(() => {
        setMode('anonymous')
        reset()
        initialize()
    }, [initialize, reset])

    const handleFileSelect = useCallback((file) => {
        setSelectedFile(file)
        if (connectionState === 'connected') {
            sendFile(file)
        }
    }, [connectionState, sendFile])

    const handleReset = useCallback(() => {
        setSelectedFile(null)
        setMode('home')
        if (lobbyKey) {
            removeFromLobby(lobbyKey)
            setLobbyKey(null)
        }
        reset()
    }, [reset, lobbyKey])

    const handleNextPeer = useCallback(() => {
        // Disconnect from current peer but stay in lobby
        disconnect()
    }, [disconnect])

    // Lobby Logic: Join & Subscribe
    useEffect(() => {
        if (mode === 'anonymous' && peerId) {
            // 1. Join Lobby
            if (!lobbyKey) {
                let active = true;
                // Generate a random username or use ID
                const username = "User_" + peerId.substring(0, 4);

                addToLobby(peerId, username).then(key => {
                    if (active) setLobbyKey(key);
                    else removeFromLobby(key);
                }).catch(console.error);

                return () => { active = false; };
            }
        }
    }, [mode, peerId, lobbyKey]);

    // Lobby Subscriptions (Users & Messages) + Heartbeat
    // Lobby Subscriptions (Messages & Users) - Load immediately
    useEffect(() => {
        if (mode === 'anonymous') {
            const unsubMsg = subscribeToGlobalMessages(setGlobalMessages);
            const unsubUsers = subscribeToLobby(setOnlineUsers);

            return () => {
                unsubMsg();
                unsubUsers();
            };
        }
    }, [mode]);

    // Lobby Presence (Heartbeat) - Requires LobbyKey (after PeerID)
    useEffect(() => {
        if (mode === 'anonymous' && lobbyKey) {
            // Send heartbeat every 30 seconds to stay visible
            const heartbeatInterval = setInterval(() => {
                updateHeartbeat(lobbyKey);
            }, 30000);

            // Send initial heartbeat
            updateHeartbeat(lobbyKey);

            return () => {
                clearInterval(heartbeatInterval);
            };
        }
    }, [mode, lobbyKey]);

    // Cleanup lobby on unmount or mode change
    useEffect(() => {
        return () => {
            if (lobbyKey) removeFromLobby(lobbyKey);
        };
    }, [lobbyKey]);

    // Handle Global Message Send
    const handleSendGlobalMessage = useCallback((text) => {
        if (peerId) {
            const username = `User_${peerId}`;
            return sendGlobalMessage(text, peerId, username);
        }
    }, [peerId]);

    // Connection Request Handlers
    const handleRequestConnect = useCallback(async (targetPeerId) => {
        if (!peerId || pendingRequest) return;

        const username = `User_${peerId}`;
        const result = await sendConnectionRequest(peerId, targetPeerId, username);

        if (result.success) {
            setPendingRequest({ toId: targetPeerId, requestKey: result.requestKey });
            addToast('Connection request sent...', 'info');

            // Listen for response
            const unsubscribe = listenForRequestResponse(targetPeerId, result.requestKey, (response) => {
                unsubscribe();
                if (response.accepted) {
                    addToast('Request accepted! Connecting...', 'success');
                    connect(targetPeerId);
                } else {
                    addToast('Connection declined', 'warning');
                }
                setPendingRequest(null);
            });

            // Auto-cancel after 30 seconds
            setTimeout(() => {
                if (pendingRequest?.toId === targetPeerId) {
                    cancelConnectionRequest(targetPeerId, result.requestKey);
                    setPendingRequest(null);
                    addToast('Request timed out', 'warning');
                }
            }, 30000);
        } else {
            addToast('Failed to send request', 'error');
        }
    }, [peerId, pendingRequest, connect, addToast]);

    const handleAcceptRequest = useCallback(async () => {
        if (!incomingRequest || !peerId) return;

        await respondToConnectionRequest(peerId, incomingRequest.key, true);
        addToast('Connection accepted - waiting for peer to connect...', 'success');
        // Don't call connect() here - the SENDER will initiate the connection
        // after receiving the "accepted" response via listenForRequestResponse
        setIncomingRequest(null);
    }, [incomingRequest, peerId, addToast]);

    const handleDeclineRequest = useCallback(async () => {
        if (!incomingRequest || !peerId) return;

        await respondToConnectionRequest(peerId, incomingRequest.key, false);
        addToast('Request declined', 'info');
        setIncomingRequest(null);
    }, [incomingRequest, peerId, addToast]);

    // Subscribe to incoming connection requests
    useEffect(() => {
        if (mode === 'anonymous' && peerId && !showPrivateChat) {
            const unsubscribe = subscribeToConnectionRequests(peerId, (request) => {
                setIncomingRequest(request);
            });
            return unsubscribe;
        }
    }, [mode, peerId, showPrivateChat]);

    // Connection status change notifications (with debounce for mobile)
    const disconnectTimeoutRef = useRef(null)
    useEffect(() => {
        if (mode === 'anonymous') {
            // 'connected' and 'transferring' are both active states
            const isActiveConnection = connectionState === 'connected' || connectionState === 'transferring'
            const wasActiveConnection = prevConnectionState.current === 'connected' || prevConnectionState.current === 'transferring'

            // Connected - clear any pending disconnect notification
            if (isActiveConnection && remotePeerId) {
                if (disconnectTimeoutRef.current) {
                    clearTimeout(disconnectTimeoutRef.current)
                    disconnectTimeoutRef.current = null
                }
                // Only show toast when first connecting (not when transitioning to transferring)
                if (!wasActiveConnection) {
                    addToast(`Connected to ${remotePeerId}`, 'success')
                }
            }
            // Disconnected - debounce to avoid flicker on mobile file picker
            if (wasActiveConnection && !isActiveConnection && prevRemotePeerId.current) {
                const peerId = prevRemotePeerId.current
                disconnectTimeoutRef.current = setTimeout(() => {
                    addToast(`${peerId} disconnected`, 'warning')
                    disconnectTimeoutRef.current = null
                }, 1500) // Wait 1.5s before showing disconnect
            }
            // Connection error
            if (connectionState === 'error' && prevConnectionState.current !== 'error') {
                addToast('Connection failed - User may be offline', 'error')
            }
        }
        prevConnectionState.current = connectionState
        prevRemotePeerId.current = remotePeerId

        return () => {
            if (disconnectTimeoutRef.current) {
                clearTimeout(disconnectTimeoutRef.current)
            }
        }
    }, [connectionState, remotePeerId, mode, addToast])

    // Debounced UI state for private chat (prevents flicker on mobile file picker)
    useEffect(() => {
        if (mode === 'anonymous') {
            // 'transferring' is also an active connection state
            const isActiveConnection = connectionState === 'connected' || connectionState === 'transferring'

            if (isActiveConnection) {
                // Immediately show private chat when connected/transferring
                if (privateChatTimeoutRef.current) {
                    clearTimeout(privateChatTimeoutRef.current)
                    privateChatTimeoutRef.current = null
                }
                setShowPrivateChat(true)
            } else if (showPrivateChat) {
                // Delay hiding private chat to avoid flicker
                privateChatTimeoutRef.current = setTimeout(() => {
                    setShowPrivateChat(false)
                    privateChatTimeoutRef.current = null
                }, 800) // Wait 800ms before switching to lobby
            }
        } else {
            setShowPrivateChat(false)
        }

        return () => {
            if (privateChatTimeoutRef.current) {
                clearTimeout(privateChatTimeoutRef.current)
            }
        }
    }, [connectionState, mode, showPrivateChat])

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
        // Layout: Fixed viewport, no scroll, responsive padding
        <div className="h-full w-full bg-[#050505] text-gray-300 font-sans selection:bg-white selection:text-black flex flex-col overflow-hidden">

            {/* Header / Nav */}
            <Header onLogoClick={handleReset} />

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-6 sm:px-8 md:px-12 flex flex-col justify-center relative overflow-hidden">

                {/* Subtle vertical divider for large screens */}
                <div className="hidden lg:block absolute left-12 top-0 bottom-0 w-[1px] bg-white/5 pointer-events-none" />

                <div className="lg:pl-16 w-full h-full flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {mode === 'home' && (
                            <Hero
                                key="hero"
                                onSendClick={handleSendMode}
                                onReceiveClick={handleReceiveOptionsMode}
                                onAnonymousClick={handleAnonymousMode}
                            />
                        )}

                        {mode === 'receive-options' && (
                            <ReceiveOptions
                                key="receive-options"
                                onConnect={handleReceiveMode}
                                onBack={handleReset}
                            />
                        )}

                        {mode === 'privacy' && (
                            <Privacy key="privacy" onBack={handleReset} />
                        )}

                        {mode === 'terms' && (
                            <Terms key="terms" onBack={handleReset} />
                        )}

                        {mode === 'techstack' && (
                            <TechStack key="techstack" onBack={handleReset} />
                        )}

                        {mode === 'anonymous' && (
                            showPrivateChat ? (
                                <AnonymousChat
                                    key="private-chat"
                                    messages={messages}
                                    onSendMessage={sendMessage}
                                    onSendFile={sendFile}
                                    onNextPeer={handleNextPeer} // Back to Lobby
                                    onCancel={handleNextPeer} // Back to Lobby
                                    connectionState={connectionState}
                                    isQueuing={false}
                                    remotePeerId={remotePeerId}
                                />
                            ) : (
                                <Lobby
                                    key="lobby"
                                    myPeerId={peerId}
                                    onlineUsers={onlineUsers}
                                    messages={globalMessages}
                                    onSendGlobalMessage={handleSendGlobalMessage}
                                    onRequestConnect={handleRequestConnect}
                                    onCancel={handleReset}
                                    showToast={addToast}
                                    incomingRequest={incomingRequest}
                                    onAcceptRequest={handleAcceptRequest}
                                    onDeclineRequest={handleDeclineRequest}
                                    pendingRequest={pendingRequest}
                                />
                            )
                        )}

                        {(mode === 'send' || mode === 'receive') && !isTransferComplete && (
                            <div key="transfer" className="w-full space-y-4 sm:space-y-6 md:space-y-8">
                                <ConnectionPanel
                                    mode={mode}
                                    peerId={peerId}
                                    connectionState={connectionState}
                                    remotePeerId={remotePeerId}
                                    error={error}
                                />

                                {mode === 'send' && connectionState === 'connected' && (
                                    <div className="animate-fade-in border-t border-white/5 pt-4 sm:pt-6 md:pt-8">
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

            {/* Footer */}
            <Footer
                onPrivacyClick={() => {
                    handleReset()
                    setMode('privacy')
                }}
                onTermsClick={() => {
                    handleReset()
                    setMode('terms')
                }}
                onTechStackClick={() => {
                    handleReset()
                    setMode('techstack')
                }}
            />
        </div>
    )
}

export default App

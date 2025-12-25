import { useState, useCallback, useRef, useEffect } from 'react'
import Peer from 'peerjs'
import { chunkFile, reassembleFile, downloadBlob, generateId } from '../utils/fileUtils'

const CHUNK_SIZE = 64 * 1024 // 64KB chunks

export const usePeer = () => {
    const [peerId, setPeerId] = useState(null)
    const [connectionState, setConnectionState] = useState('idle')
    const [remotePeerId, setRemotePeerId] = useState(null)
    const [transferProgress, setTransferProgress] = useState(0)
    const [transferSpeed, setTransferSpeed] = useState(0)
    const [receivedFile, setReceivedFile] = useState(null)
    const [error, setError] = useState(null)

    const peerRef = useRef(null)
    const connectionRef = useRef(null)
    const chunksRef = useRef([])
    const fileMetaRef = useRef(null)
    const transferStartRef = useRef(null)
    const bytesTransferredRef = useRef(0)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (peerRef.current) {
                peerRef.current.destroy()
            }
        }
    }, [])

    // Create peer instance
    const createPeer = useCallback(() => {
        if (peerRef.current) {
            peerRef.current.destroy()
        }

        const id = generateId()
        const peer = new Peer(id, {
            debug: 1,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' }
                ]
            }
        })

        peer.on('open', (id) => {
            console.log('Peer opened with ID:', id)
            setPeerId(id)
            setConnectionState('waiting')
        })

        peer.on('connection', (conn) => {
            console.log('Incoming connection from:', conn.peer)
            handleConnection(conn)
        })

        peer.on('error', (err) => {
            console.error('Peer error:', err)
            setError(err.message)
            setConnectionState('error')
        })

        peerRef.current = peer
    }, [])

    // Connect to another peer
    const connectToPeer = useCallback((remotePeerId) => {
        if (!peerRef.current) {
            // Create peer first if not exists
            const id = generateId()
            const peer = new Peer(id, {
                debug: 1,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            })

            peer.on('open', () => {
                setPeerId(peer.id)
                setConnectionState('connecting')
                const conn = peer.connect(remotePeerId, { reliable: true })
                handleConnection(conn)
            })

            peer.on('error', (err) => {
                console.error('Peer error:', err)
                setError(err.message)
                setConnectionState('error')
            })

            peerRef.current = peer
        } else {
            setConnectionState('connecting')
            const conn = peerRef.current.connect(remotePeerId, { reliable: true })
            handleConnection(conn)
        }
    }, [])

    // Handle connection events
    const handleConnection = useCallback((conn) => {
        connectionRef.current = conn

        conn.on('open', () => {
            console.log('Connection opened with:', conn.peer)
            setRemotePeerId(conn.peer)
            setConnectionState('connected')
        })

        conn.on('data', (data) => {
            handleIncomingData(data)
        })

        conn.on('close', () => {
            console.log('Connection closed')
            setConnectionState('idle')
        })

        conn.on('error', (err) => {
            console.error('Connection error:', err)
            setError(err.message)
            setConnectionState('error')
        })
    }, [])

    // Handle incoming data
    const handleIncomingData = useCallback((data) => {
        if (data.type === 'file-meta') {
            // Received file metadata
            console.log('Received file metadata:', data)
            fileMetaRef.current = {
                name: data.name,
                size: data.size,
                mimeType: data.mimeType,
                totalChunks: data.totalChunks
            }
            chunksRef.current = []
            bytesTransferredRef.current = 0
            transferStartRef.current = Date.now()
            setConnectionState('transferring')
            setTransferProgress(0)
        } else if (data.type === 'file-chunk') {
            // Received a chunk
            chunksRef.current.push(data.chunk)
            bytesTransferredRef.current += data.chunk.byteLength

            const progress = (chunksRef.current.length / fileMetaRef.current.totalChunks) * 100
            setTransferProgress(progress)

            // Calculate speed
            const elapsed = (Date.now() - transferStartRef.current) / 1000
            const speed = elapsed > 0 ? bytesTransferredRef.current / elapsed : 0
            setTransferSpeed(speed)

            // Check if transfer complete
            if (chunksRef.current.length === fileMetaRef.current.totalChunks) {
                completeReceive()
            }
        }
    }, [])

    // Complete file receive
    const completeReceive = useCallback(() => {
        const { name, mimeType, size } = fileMetaRef.current
        const blob = reassembleFile(chunksRef.current, name, mimeType)

        // Trigger download
        downloadBlob(blob, name)

        setReceivedFile({ name, size, mimeType })
        setConnectionState('complete')
        setTransferProgress(100)
    }, [])

    // Send file
    const sendFile = useCallback(async (file) => {
        if (!connectionRef.current || connectionRef.current.open === false) {
            setError('No active connection')
            return
        }

        try {
            setConnectionState('transferring')
            transferStartRef.current = Date.now()
            bytesTransferredRef.current = 0

            // Send file metadata first
            const chunks = await chunkFile(file, CHUNK_SIZE)

            connectionRef.current.send({
                type: 'file-meta',
                name: file.name,
                size: file.size,
                mimeType: file.type || 'application/octet-stream',
                totalChunks: chunks.length
            })

            // Send chunks with progress tracking
            for (let i = 0; i < chunks.length; i++) {
                connectionRef.current.send({
                    type: 'file-chunk',
                    index: i,
                    chunk: chunks[i]
                })

                bytesTransferredRef.current += chunks[i].byteLength

                const progress = ((i + 1) / chunks.length) * 100
                setTransferProgress(progress)

                // Calculate speed
                const elapsed = (Date.now() - transferStartRef.current) / 1000
                const speed = elapsed > 0 ? bytesTransferredRef.current / elapsed : 0
                setTransferSpeed(speed)

                // Small delay to prevent overwhelming the connection
                if (i % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1))
                }
            }

            setConnectionState('complete')
        } catch (err) {
            console.error('Send error:', err)
            setError(err.message)
            setConnectionState('error')
        }
    }, [])

    // Reset transfer state
    const resetTransfer = useCallback(() => {
        setTransferProgress(0)
        setTransferSpeed(0)
        setReceivedFile(null)
        setError(null)
        setConnectionState('idle')
        setRemotePeerId(null)
        setPeerId(null)
        chunksRef.current = []
        fileMetaRef.current = null

        if (peerRef.current) {
            peerRef.current.destroy()
            peerRef.current = null
        }
        connectionRef.current = null
    }, [])

    return {
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
    }
}

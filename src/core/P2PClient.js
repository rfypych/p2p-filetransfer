import { FileChunker } from './FileChunker';
import { generateId } from '../utils/fileUtils';
import Peer from 'peerjs';

// Event types for listeners
export const P2P_EVENTS = {
    STATUS: 'status',       // idle, waiting, connecting, connected, disconnected, error
    PROGRESS: 'progress',   // 0-100
    FILE_RECEIVED: 'file_received',
    DATA: 'data',
    ERROR: 'error'
};

export class P2PClient extends EventTarget {
    constructor() {
        super();
        this.peer = null;
        this.connection = null;
        this.peerId = null;
        this.remotePeerId = null;
        this.status = 'idle';

        // Transfer state
        this.incomingFileMeta = null;
        this.incomingChunks = [];
        this.receivedBytes = 0;
        this.transferStartTime = 0;
    }

    _setStatus(newStatus) {
        this.status = newStatus;
        this.dispatchEvent(new CustomEvent(P2P_EVENTS.STATUS, { detail: newStatus }));
    }

    _setError(errorMsg) {
        this.dispatchEvent(new CustomEvent(P2P_EVENTS.ERROR, { detail: errorMsg }));
    }

    _emitProgress(percent, speed) {
        this.dispatchEvent(new CustomEvent(P2P_EVENTS.PROGRESS, {
            detail: { percent, speed }
        }));
    }

    initialize() {
        if (this.peer) return;

        const id = generateId();
        // Note: In a real app, we might want to pass config (ICE servers) here
        this.peer = new Peer(id, {
            debug: 1,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        this.peer.on('open', (id) => {
            console.log('[P2P] Peer Opened:', id);
            this.peerId = id;
            this._setStatus('waiting');
        });

        this.peer.on('connection', (conn) => {
            console.log('[P2P] Incoming connection:', conn.peer);
            this._handleConnection(conn);
        });

        this.peer.on('error', (err) => {
            console.error('[P2P] Peer Error:', err);
            this._setError(err.message || 'Peer connection error');
            this._setStatus('error');
        });
    }

    connect(remoteId) {
        if (!this.peer) this.initialize();

        // Wait for peer to be ready if it's just initializing
        if (!this.peerId) {
             this.peer.once('open', () => this.connect(remoteId));
             return;
        }

        console.log('[P2P] Connecting to:', remoteId);
        this._setStatus('connecting');
        const conn = this.peer.connect(remoteId, { reliable: true });
        this._handleConnection(conn);
    }

    _handleConnection(conn) {
        // Clean up existing connection if any
        if (this.connection) {
            this.connection.close();
        }

        this.connection = conn;
        this.remotePeerId = conn.peer;

        conn.on('open', () => {
            console.log('[P2P] Connection Established');
            this._setStatus('connected');
        });

        conn.on('data', (data) => this._handleData(data));

        conn.on('close', () => {
            console.log('[P2P] Connection Closed');
            this.connection = null;
            this.remotePeerId = null;
            this._setStatus('disconnected');
        });

        conn.on('error', (err) => {
            console.error('[P2P] Connection Error:', err);
            this._setError(err.message);
        });
    }

    async sendFile(file) {
        if (!this.connection || !this.connection.open) {
            throw new Error('No active connection');
        }

        this._setStatus('transferring');
        const startTime = Date.now();
        let bytesSent = 0;

        try {
            const chunker = new FileChunker(file);

            // 1. Send Meta
            this.connection.send({
                type: 'meta',
                name: file.name,
                size: file.size,
                mimeType: file.type || 'application/octet-stream',
                totalChunks: chunker.totalChunks
            });

            // 2. Send Chunks
            for await (const { chunk, index } of chunker.getChunks()) {
                this.connection.send({
                    type: 'chunk',
                    index,
                    chunk
                });

                bytesSent += chunk.byteLength;
                const elapsed = (Date.now() - startTime) / 1000;
                const speed = elapsed > 0 ? bytesSent / elapsed : 0;
                const percent = (index + 1) / chunker.totalChunks * 100;

                this._emitProgress(percent, speed);

                // Small backoff to prevent flooding connection buffer (primitive flow control)
                if (index % 20 === 0) {
                     await new Promise(r => setTimeout(r, 2));
                }
            }

            this._setStatus('connected'); // Back to connected state after finish
        } catch (err) {
            console.error('[P2P] Send Error:', err);
            this._setError('Failed to send file');
            this._setStatus('error');
        }
    }

    _handleData(data) {
        if (data.type === 'meta') {
            console.log('[P2P] Receiving File:', data.name);
            this.incomingFileMeta = data;
            this.incomingChunks = [];
            this.receivedBytes = 0;
            this.transferStartTime = Date.now();
            this._setStatus('transferring');
            this._emitProgress(0, 0);

        } else if (data.type === 'chunk') {
            if (!this.incomingFileMeta) return;

            this.incomingChunks.push(data.chunk);
            this.receivedBytes += data.chunk.byteLength;

            const elapsed = (Date.now() - this.transferStartTime) / 1000;
            const speed = elapsed > 0 ? this.receivedBytes / elapsed : 0;
            const percent = (this.incomingChunks.length / this.incomingFileMeta.totalChunks) * 100;

            this._emitProgress(percent, speed);

            if (this.incomingChunks.length === this.incomingFileMeta.totalChunks) {
                this._finalizeReceive();
            }
        }
    }

    _finalizeReceive() {
        const { name, mimeType } = this.incomingFileMeta;
        const blob = new Blob(this.incomingChunks, { type: mimeType });

        console.log('[P2P] File Receive Complete');

        this.dispatchEvent(new CustomEvent(P2P_EVENTS.FILE_RECEIVED, {
            detail: {
                file: blob,
                name: name
            }
        }));

        // Reset transfer state
        this.incomingFileMeta = null;
        this.incomingChunks = [];
        this._setStatus('connected');
    }

    destroy() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        this.connection = null;
        this.status = 'idle';
    }
}

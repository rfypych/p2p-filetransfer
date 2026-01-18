import { useState, useEffect, useCallback } from 'react';
import { P2PClient, P2P_EVENTS } from '../core/P2PClient';
import { downloadBlob } from '../utils/fileUtils';

// Singleton instance to persist across re-renders
const p2pClient = new P2PClient();

export const useP2P = () => {
    // Initialize with current state from the singleton
    const [status, setStatus] = useState(p2pClient.status);
    const [peerId, setPeerId] = useState(p2pClient.peerId);
    const [remotePeerId, setRemotePeerId] = useState(p2pClient.remotePeerId);
    const [progress, setProgress] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [error, setError] = useState(null);
    const [receivedFile, setReceivedFile] = useState(null);

    useEffect(() => {
        const handleStatus = (e) => {
            setStatus(e.detail);
            setPeerId(p2pClient.peerId);
            setRemotePeerId(p2pClient.remotePeerId);
        };

        const handleProgress = (e) => {
            setProgress(e.detail.percent);
            setSpeed(e.detail.speed);
        };

        const handleError = (e) => {
            setError(e.detail);
        };

        const handleFileReceived = (e) => {
            const { file, name } = e.detail;
            setReceivedFile({ file, name, size: file.size });
            downloadBlob(file, name);
        };

        p2pClient.addEventListener(P2P_EVENTS.STATUS, handleStatus);
        p2pClient.addEventListener(P2P_EVENTS.PROGRESS, handleProgress);
        p2pClient.addEventListener(P2P_EVENTS.ERROR, handleError);
        p2pClient.addEventListener(P2P_EVENTS.FILE_RECEIVED, handleFileReceived);

        return () => {
            p2pClient.removeEventListener(P2P_EVENTS.STATUS, handleStatus);
            p2pClient.removeEventListener(P2P_EVENTS.PROGRESS, handleProgress);
            p2pClient.removeEventListener(P2P_EVENTS.ERROR, handleError);
            p2pClient.removeEventListener(P2P_EVENTS.FILE_RECEIVED, handleFileReceived);
        };
    }, []);

    const initialize = useCallback(() => {
        p2pClient.initialize();
    }, []);

    const connect = useCallback((id) => {
        p2pClient.connect(id);
    }, []);

    const sendFile = useCallback(async (file) => {
        await p2pClient.sendFile(file);
    }, []);

    const reset = useCallback(() => {
        setProgress(0);
        setSpeed(0);
        setReceivedFile(null);
        setError(null);
    }, []);

    return {
        status,
        peerId,
        remotePeerId,
        progress,
        speed,
        error,
        receivedFile,
        initialize,
        connect,
        sendFile,
        reset
    };
};

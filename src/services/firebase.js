import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, remove, get, child, push, onDisconnect, query, limitToLast, update } from 'firebase/database';

// Firebase project configuration (loaded from environment variables)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase only if config is valid (prevent crash on empty config)
let app;
let db;

try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        app = initializeApp(firebaseConfig);
        db = getDatabase(app);
        console.log("Firebase initialized");
    } else {
        console.warn('Firebase config is missing. Anonymous matchmaking will not work.');
    }
} catch (e) {
    console.error('Error initializing Firebase:', e);
}

// ============ LOBBY SYSTEM ============

export const addToLobby = async (peerId, username = 'Anonymous') => {
    if (!db) return null;
    const lobbyRef = ref(db, 'lobby_users');
    const newEntryRef = push(lobbyRef);

    const entryData = {
        peerId,
        username,
        timestamp: Date.now()
    };

    try {
        await set(newEntryRef, entryData);
        onDisconnect(newEntryRef).remove();
        return newEntryRef.key;
    } catch (error) {
        console.error("Error adding to lobby:", error);
        throw error;
    }
};

export const subscribeToLobby = (onUsersUpdate) => {
    if (!db) return () => { };
    const lobbyRef = ref(db, 'lobby_users');

    const unsubscribe = onValue(lobbyRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            onUsersUpdate([]);
            return;
        }

        const now = Date.now();
        const STALE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

        // Convert to array and filter out stale entries
        const users = Object.entries(data)
            .map(([key, val]) => ({ key, ...val }))
            .filter(user => {
                // Filter out users whose lastSeen is older than threshold
                const lastActive = user.lastSeen || user.timestamp;
                return (now - lastActive) < STALE_THRESHOLD;
            });

        users.sort((a, b) => b.timestamp - a.timestamp);
        onUsersUpdate(users);
    });

    return unsubscribe;
};

// Update heartbeat to keep presence alive
export const updateHeartbeat = async (lobbyKey) => {
    if (!db || !lobbyKey) return;
    const itemRef = ref(db, `lobby_users/${lobbyKey}/lastSeen`);
    try {
        await set(itemRef, Date.now());
    } catch (e) {
        console.error("Error updating heartbeat", e);
    }
};

export const removeFromLobby = async (key) => {
    if (!db || !key) return;
    const itemRef = ref(db, `lobby_users/${key}`);
    try {
        await remove(itemRef);
    } catch (e) {
        console.error("Error removing from lobby", e);
    }
};

// ============ GLOBAL CHAT (ENCRYPTED + RATE LIMITED) ============

import { getGlobalChatKey, encryptString, decryptString } from '../utils/crypto.js';

// Rate limiting: 1 message per 2 seconds per user
const RATE_LIMIT_MS = 2000;
let lastMessageTime = 0;

export const sendGlobalMessage = async (text, senderId, senderName) => {
    if (!db) return { success: false, error: 'Database not available' };

    // Rate limit check
    const now = Date.now();
    if (now - lastMessageTime < RATE_LIMIT_MS) {
        const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastMessageTime)) / 1000);
        return { success: false, error: `Please wait ${waitTime}s before sending another message` };
    }
    lastMessageTime = now;

    const chatRef = ref(db, 'global_messages');
    const newMessageRef = push(chatRef);

    try {
        // Try to get encryption key (may be null on non-HTTPS)
        const key = await getGlobalChatKey();

        let messageData;
        if (key) {
            // Encrypted mode
            const encryptedText = await encryptString(text, key);
            const encryptedSenderName = await encryptString(senderName, key);
            messageData = {
                text: encryptedText,
                senderId,
                senderName: encryptedSenderName,
                timestamp: Date.now(),
                encrypted: true
            };
        } else {
            // Plaintext fallback (non-HTTPS)
            messageData = {
                text,
                senderId,
                senderName,
                timestamp: Date.now(),
                encrypted: false
            };
        }

        await set(newMessageRef, messageData);
        return { success: true };
    } catch (e) {
        console.error('[Firebase] Error sending message:', e);
        return { success: false, error: 'Failed to send message' };
    }
};

export const subscribeToGlobalMessages = (onMessagesUpdate) => {
    if (!db) return () => { };
    const chatQuery = query(ref(db, 'global_messages'), limitToLast(50));

    const unsubscribe = onValue(chatQuery, async (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            onMessagesUpdate([]);
            return;
        }

        try {
            const key = await getGlobalChatKey();
            const entries = Object.values(data);

            // Decrypt all messages
            const messages = await Promise.all(entries.map(async (msg) => {
                if (msg.encrypted) {
                    const decryptedText = await decryptString(msg.text, key);
                    const decryptedName = await decryptString(msg.senderName, key);
                    return {
                        ...msg,
                        text: decryptedText || '[Decryption failed]',
                        senderName: decryptedName || 'Unknown'
                    };
                }
                // Legacy unencrypted messages
                return msg;
            }));

            messages.sort((a, b) => a.timestamp - b.timestamp);
            onMessagesUpdate(messages);
        } catch (e) {
            console.error('[Firebase] Error decrypting messages:', e);
            onMessagesUpdate([]);
        }
    });

    return unsubscribe;
};

// ============ CONNECTION REQUEST SYSTEM ============

export const sendConnectionRequest = async (fromId, toId, fromUsername) => {
    if (!db) return { success: false, error: 'Database not available' };

    const requestRef = ref(db, `connection_requests/${toId}`);
    const newRequestRef = push(requestRef);

    const requestData = {
        fromId,
        fromUsername: fromUsername || `User_${fromId}`,
        toId,
        timestamp: Date.now(),
        status: 'pending'
    };

    try {
        await set(newRequestRef, requestData);
        // Auto-delete request after 30 seconds if no response
        setTimeout(async () => {
            try {
                await remove(newRequestRef);
            } catch (e) {
                // Ignore if already removed
            }
        }, 30000);
        return { success: true, requestKey: newRequestRef.key };
    } catch (e) {
        console.error('[Firebase] Error sending connection request:', e);
        return { success: false, error: 'Failed to send request' };
    }
};

export const subscribeToConnectionRequests = (myPeerId, onRequestReceived) => {
    if (!db || !myPeerId) return () => { };

    const requestsRef = ref(db, `connection_requests/${myPeerId}`);

    const unsubscribe = onValue(requestsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            onRequestReceived(null);
            return;
        }

        // Get the first pending request
        const entries = Object.entries(data);
        const pendingRequest = entries.find(([key, val]) => val.status === 'pending');

        if (pendingRequest) {
            const [key, val] = pendingRequest;
            onRequestReceived({ key, ...val });
        } else {
            onRequestReceived(null);
        }
    });

    return unsubscribe;
};

export const respondToConnectionRequest = async (myPeerId, requestKey, accepted) => {
    if (!db || !myPeerId || !requestKey) return { success: false };

    console.log('[Firebase] Responding to request at:', `connection_requests/${myPeerId}/${requestKey}`, 'accepted:', accepted);

    const requestRef = ref(db, `connection_requests/${myPeerId}/${requestKey}`);

    try {
        if (accepted) {
            // Update status to 'accepted' so the sender's listener can detect it
            console.log('[Firebase] Updating status to accepted...');
            await update(requestRef, { status: 'accepted' });
            console.log('[Firebase] Status updated to accepted!');
            // Remove after a short delay to allow listener to detect the change
            setTimeout(() => remove(requestRef).catch(() => { }), 2000);
        } else {
            // Update status to 'declined' then remove
            await update(requestRef, { status: 'declined' });
            setTimeout(() => remove(requestRef).catch(() => { }), 2000);
        }
        return { success: true, accepted };
    } catch (e) {
        console.error('[Firebase] Error responding to request:', e);
        return { success: false };
    }
};

export const cancelConnectionRequest = async (toId, requestKey) => {
    if (!db || !toId || !requestKey) return;
    const requestRef = ref(db, `connection_requests/${toId}/${requestKey}`);
    try {
        await remove(requestRef);
    } catch (e) {
        console.error('[Firebase] Error cancelling request:', e);
    }
};

export const listenForRequestResponse = (toId, requestKey, onResponse) => {
    if (!db || !toId || !requestKey) return () => { };

    console.log('[Firebase] Listening for response at:', `connection_requests/${toId}/${requestKey}`);

    const requestRef = ref(db, `connection_requests/${toId}/${requestKey}`);
    let hasResponded = false;

    const unsubscribe = onValue(requestRef, (snapshot) => {
        if (hasResponded) return;

        const data = snapshot.val();
        console.log('[Firebase] Response listener received data:', data);

        if (data === null) {
            console.log('[Firebase] Data is null, ignoring');
            return;
        }

        if (data.status === 'accepted') {
            console.log('[Firebase] Status is ACCEPTED, triggering connection');
            hasResponded = true;
            onResponse({ accepted: true });
        } else if (data.status === 'declined') {
            console.log('[Firebase] Status is DECLINED');
            hasResponded = true;
            onResponse({ accepted: false });
        } else {
            console.log('[Firebase] Status is still:', data.status);
        }
    });

    return unsubscribe;
};

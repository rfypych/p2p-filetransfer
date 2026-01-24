import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, remove, get, child, push, onDisconnect, query, limitToLast } from 'firebase/database';

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

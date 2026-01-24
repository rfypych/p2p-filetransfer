/**
 * Crypto Utility - End-to-End Encryption using Web Crypto API
 * Uses AES-GCM-256 for symmetric encryption
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

// Check if Web Crypto API is available (requires HTTPS or localhost)
const isCryptoAvailable = () => {
    return typeof crypto !== 'undefined' &&
        typeof crypto.subtle !== 'undefined' &&
        typeof crypto.getRandomValues !== 'undefined';
};

// Log warning if crypto not available
if (!isCryptoAvailable()) {
    console.warn('[Crypto] ⚠️ Web Crypto API not available. Running on non-HTTPS? Encryption disabled.');
}

/**
 * Generate a random AES-256 key for session encryption
 */
export async function generateKey() {
    if (!isCryptoAvailable()) return null;
    return await crypto.subtle.generateKey(
        { name: ALGORITHM, length: KEY_LENGTH },
        true, // extractable
        ['encrypt', 'decrypt']
    );
}

/**
 * Derive a key from a passphrase (for shared secrets like global chat)
 */
export async function deriveKey(passphrase) {
    if (!isCryptoAvailable()) return null;
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode('p2p-filetransfer-salt-v1'),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Export key to base64 string for transmission
 */
export async function exportKey(key) {
    if (!isCryptoAvailable() || !key) return null;
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Import key from base64 string
 */
export async function importKey(keyString) {
    if (!isCryptoAvailable() || !keyString) return null;
    const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt a string with AES-GCM
 * Returns base64 encoded string: IV + ciphertext
 * Falls back to plaintext if crypto unavailable
 */
export async function encryptString(plaintext, key) {
    // Fallback: return plaintext if crypto not available
    if (!isCryptoAvailable() || !key) {
        return plaintext;
    }

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const ciphertext = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        encoder.encode(plaintext)
    );

    // Combine IV + ciphertext
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a string with AES-GCM
 * Input: base64 encoded string (IV + ciphertext)
 * Falls back to returning input if crypto unavailable
 */
export async function decryptString(encryptedBase64, key) {
    // Fallback: return as-is if crypto not available
    if (!isCryptoAvailable() || !key) {
        return encryptedBase64;
    }

    try {
        const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

        const iv = combined.slice(0, IV_LENGTH);
        const ciphertext = combined.slice(IV_LENGTH);

        const decrypted = await crypto.subtle.decrypt(
            { name: ALGORITHM, iv },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        // If decryption fails, it might be plaintext (legacy or fallback)
        console.warn('[Crypto] Decryption failed, returning original:', e.message);
        return encryptedBase64;
    }
}

/**
 * Encrypt binary data (ArrayBuffer) with AES-GCM
 * Returns: { iv: Uint8Array, data: ArrayBuffer }
 */
export async function encryptBinary(data, key) {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const ciphertext = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        data
    );

    return { iv, data: ciphertext };
}

/**
 * Decrypt binary data with AES-GCM
 */
export async function decryptBinary(iv, ciphertext, key) {
    try {
        return await crypto.subtle.decrypt(
            { name: ALGORITHM, iv },
            key,
            ciphertext
        );
    } catch (e) {
        console.error('[Crypto] Binary decryption failed:', e);
        return null;
    }
}

// Shared secret for Firebase global chat (derived client-side)
// In production, this could be a user-specific key or room key
const GLOBAL_CHAT_SECRET = 'p2p-anonymous-chat-v1-2024';
let globalChatKey = null;

/**
 * Get or create the global chat encryption key
 */
export async function getGlobalChatKey() {
    if (!globalChatKey) {
        globalChatKey = await deriveKey(GLOBAL_CHAT_SECRET);
    }
    return globalChatKey;
}

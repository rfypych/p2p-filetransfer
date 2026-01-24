/**
 * Format file size to human readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'

    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`
}

export const formatBytes = formatFileSize


/**
 * Format transfer speed
 * @param {number} bytesPerSecond - Speed in bytes per second
 * @returns {string} Formatted speed
 */
export const formatSpeed = (bytesPerSecond) => {
    if (bytesPerSecond === 0) return '0 B/s'
    return `${formatFileSize(bytesPerSecond)}/s`
}

/**
 * Format time in seconds to human readable string
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
export const formatTime = (seconds) => {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
        const mins = Math.floor(seconds / 60)
        const secs = Math.round(seconds % 60)
        return `${mins}m ${secs}s`
    } else {
        const hours = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        return `${hours}h ${mins}m`
    }
}

/**
 * Chunk a file into smaller pieces
 * @param {File} file - The file to chunk
 * @param {number} chunkSize - Size of each chunk in bytes (default 64KB)
 * @returns {Promise<ArrayBuffer[]>} Array of chunks
 */
export const chunkFile = async (file, chunkSize = 64 * 1024) => {
    const chunks = []
    const totalChunks = Math.ceil(file.size / chunkSize)

    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        const blob = file.slice(start, end)
        const buffer = await blob.arrayBuffer()
        chunks.push(buffer)
    }

    return chunks
}

/**
 * Reassemble chunks into a file
 * @param {ArrayBuffer[]} chunks - Array of file chunks
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Blob} Reassembled file as Blob
 */
export const reassembleFile = (chunks, fileName, mimeType) => {
    const blob = new Blob(chunks, { type: mimeType })
    return blob
}

/**
 * Trigger download of a blob
 * @param {Blob} blob - The blob to download
 * @param {string} fileName - Name for the downloaded file
 */
export const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

/**
 * Generate a unique session ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

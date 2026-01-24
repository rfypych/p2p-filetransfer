/**
 * Generator-based file chunker to keep memory usage low during sending.
 * It yields chunks one by one instead of loading the whole file.
 */
export class FileChunker {
    constructor(file, chunkSize = 64 * 1024) { // 64KB default
        this.file = file;
        this.chunkSize = chunkSize;
        this.totalChunks = Math.ceil(file.size / chunkSize);
    }

    /**
     * Generator that yields chunks of the file.
     * @returns {AsyncGenerator<{chunk: ArrayBuffer, index: number, total: number}>}
     */
    async *getChunks() {
        for (let i = 0; i < this.totalChunks; i++) {
            const start = i * this.chunkSize;
            const end = Math.min(start + this.chunkSize, this.file.size);

            // We slice the Blob/File. This is a lightweight operation.
            // The actual data is read into memory only when we call arrayBuffer().
            const blobSlice = this.file.slice(start, end);
            const buffer = await blobSlice.arrayBuffer();

            yield {
                chunk: buffer,
                index: i,
                total: this.totalChunks
            };
        }
    }
}

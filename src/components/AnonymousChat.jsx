import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatBytes } from '../utils/fileUtils'
import { FaLock } from 'react-icons/fa'

export default function AnonymousChat({
    messages,
    onSendMessage,
    onSendFile,
    onNextPeer,
    onCancel,
    connectionState,
    isQueuing,
    remotePeerId
}) {
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = () => {
        if (!inputValue.trim()) return
        onSendMessage(inputValue)
        setInputValue('')
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleFileSelect = (e) => {
        if (e.target.files?.[0]) {
            onSendFile(e.target.files[0])
        }
    }

    if (isQueuing) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center w-full">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-t-2 border-white/20 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-r-2 border-white/40 rounded-full animate-spin-reverse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl">🕵️</span>
                    </div>
                </div>
                <h2 className="text-2xl font-serif text-white mb-2">Searching for a partner...</h2>
                <p className="text-gray-500 mb-8">Looking for someone online to chat with.</p>
                <button
                    onClick={onCancel}
                    className="px-6 py-2 border border-white/20 hover:bg-white/10 text-gray-300 rounded-full transition-colors text-sm"
                >
                    Cancel Search
                </button>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col h-[70vh] bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden shadow-2xl relative"
        >
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0d0d0d]">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <div>
                        <h3 className="text-white font-medium text-sm flex items-center gap-2">
                            {remotePeerId ? `Peer ${remotePeerId}` : 'Anonymous Peer'}
                            <FaLock className="w-3 h-3 text-green-400" title="End-to-end encrypted" />
                        </h3>
                        <p className="text-xs text-gray-500">
                            {connectionState === 'connected' ? 'Encrypted P2P Connection' : connectionState}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onNextPeer}
                    className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider font-mono px-3 py-1 border border-white/20 rounded bg-white/5 hover:bg-white/10"
                >
                    ← Back
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                {messages.length === 0 && (
                    <div className="text-center text-gray-600 mt-12 text-sm">
                        <p>You are connected!</p>
                        <p>Say hello or share a secret file.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col max-w-[80%] ${msg.type === 'system' ? 'mx-auto w-full items-center my-4' :
                            msg.isSelf ? 'ml-auto items-end' : 'mr-auto items-start'
                            }`}
                    >
                        {msg.type === 'system' ? (
                            <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase bg-white/5 px-2 py-1 rounded">
                                {msg.text}
                            </span>
                        ) : msg.type === 'message' ? (
                            <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed break-words ${msg.isSelf
                                ? 'bg-white text-black rounded-tr-sm'
                                : 'bg-[#1a1a1a] text-gray-200 rounded-tl-sm border border-white/5'
                                }`}>
                                {msg.text}
                            </div>
                        ) : null}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0d0d0d] border-t border-white/5">
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
                        title="Send File"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full bg-[#151515] text-white text-sm px-4 py-3 rounded-full border border-white/5 focus:outline-none focus:border-white/20 transition-colors placeholder:text-gray-600"
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!inputValue.trim()}
                    >
                        <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

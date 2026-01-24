import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatFileSize } from '../utils/fileUtils'

// Helper for avatars/colors
const getAvatarColor = (id) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

export default function Lobby({
    myPeerId,
    onlineUsers,
    messages,
    onSendGlobalMessage,
    onConnect,
    onCancel
}) {
    const [inputValue, setInputValue] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState('users') // 'users' | 'chat' (for mobile)
    const messagesEndRef = useRef(null)
    const [rateLimitError, setRateLimitError] = useState(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if (!inputValue.trim()) return
        setRateLimitError(null)
        const result = await onSendGlobalMessage(inputValue)
        if (result && !result.success) {
            setRateLimitError(result.error)
            // Clear error after 3 seconds
            setTimeout(() => setRateLimitError(null), 3000)
        } else {
            setInputValue('')
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Filter out myself and apply search query
    const otherUsers = onlineUsers.filter(u => {
        if (u.peerId === myPeerId) return false
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return u.peerId.toLowerCase().includes(query) ||
                (u.username && u.username.toLowerCase().includes(query))
        }
        return true
    })

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-[80vh] bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
        >
            {/* Header / Tabs for Mobile */}
            <div className="md:hidden flex border-b border-white/5 bg-[#0d0d0d]">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'users' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500'}`}
                >
                    Online ({otherUsers.length})
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'chat' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500'}`}
                >
                    Global Chat
                </button>
            </div>

            {/* Left Panel: Online Users */}
            <div className={`
                ${activeTab === 'users' ? 'flex' : 'hidden'} 
                md:flex flex-col w-full md:w-1/3 border-r border-white/5 bg-[#0d0d0d]
            `}>
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-white font-serif">Online Users</h3>
                    <div className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs border border-green-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {onlineUsers.length} Online
                    </div>
                </div>

                {/* My ID Info */}
                {myPeerId && (
                    <div className="px-4 py-2 border-b border-white/5 bg-[#0a0a0a]">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">Your ID:</span>
                            <div className="flex items-center gap-2">
                                <code className="text-blue-400 text-xs font-mono bg-blue-500/10 px-2 py-0.5 rounded">{myPeerId}</code>
                                <button
                                    onClick={async () => {
                                        try {
                                            // Try modern clipboard API first
                                            if (navigator.clipboard && navigator.clipboard.writeText) {
                                                await navigator.clipboard.writeText(myPeerId)
                                            } else {
                                                // Fallback for older browsers/HTTP
                                                const textArea = document.createElement('textarea')
                                                textArea.value = myPeerId
                                                textArea.style.position = 'fixed'
                                                textArea.style.left = '-9999px'
                                                document.body.appendChild(textArea)
                                                textArea.select()
                                                document.execCommand('copy')
                                                document.body.removeChild(textArea)
                                            }
                                            setCopied(true)
                                            setTimeout(() => setCopied(false), 2000)
                                        } catch (err) {
                                            console.error('Copy failed:', err)
                                        }
                                    }}
                                    className={`transition-colors ${copied ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}
                                    title={copied ? 'Copied!' : 'Copy ID'}
                                >
                                    {copied ? (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Input */}
                <div className="p-2 border-b border-white/5">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by ID..."
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {otherUsers.length === 0 ? (
                        <div className="text-center py-10 text-gray-600 italic text-sm">
                            {searchQuery ? `No users found for "${searchQuery}"` : 'No one else is online...'}
                        </div>
                    ) : (
                        otherUsers.map(user => (
                            <div key={user.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 group transition-colors border border-transparent hover:border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${getAvatarColor(user.peerId)}`}>
                                        {user.peerId.substring(0, 2)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-200 text-sm font-medium">{user.username || 'Anonymous'}</span>
                                        <span className="text-gray-600 text-xs font-mono">{user.peerId}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onConnect(user.peerId)}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-blue-600/20 hover:text-blue-400 text-gray-400 text-xs rounded transition-all transform hover:scale-105 active:scale-95 border border-white/5 hover:border-blue-500/30"
                                >
                                    Chat
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={onCancel}
                        className="w-full py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                    >
                        Exit Lobby
                    </button>
                </div>
            </div>

            {/* Right Panel: Global Chat */}
            <div className={`
                ${activeTab === 'chat' ? 'flex' : 'hidden'} 
                md:flex flex-col flex-1 bg-[#0a0a0a]
            `}>
                <div className="p-4 border-b border-white/5 bg-[#0a0a0a]">
                    <h3 className="text-gray-400 text-sm uppercase tracking-wider font-mono">Global Chat</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === myPeerId;
                        const avatarColor = getAvatarColor(msg.senderId);
                        return (
                            <div key={msg.timestamp || idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-lg ${isMe ? 'bg-blue-600' : avatarColor}`}>
                                    {msg.senderId.substring(0, 2)}
                                </div>

                                {/* Message Content */}
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className={`text-xs font-bold ${isMe ? 'text-blue-400' : avatarColor.replace('bg-', 'text-')}`}>
                                            {msg.senderName || msg.senderId}
                                        </span>
                                        <span className="text-[10px] text-gray-600">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`
                                        px-3 py-2 rounded-lg text-sm
                                        ${isMe
                                            ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-tr-none'
                                            : 'bg-[#1a1a1a] text-gray-300 border border-white/5 rounded-tl-none'}
                                    `}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-white/5 bg-[#0d0d0d]">
                    {rateLimitError && (
                        <div className="mb-2 text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg text-center animate-pulse">
                            ⏳ {rateLimitError}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message to everyone..."
                            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

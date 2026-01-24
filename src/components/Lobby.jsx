import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaClock } from 'react-icons/fa'

// Helper for avatars/colors
const getAvatarColor = (id) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

// Format username with full ID
const formatUsername = (peerId) => {
    return `User_${peerId}`
}

export default function Lobby({
    myPeerId,
    onlineUsers,
    messages,
    onSendGlobalMessage,
    onConnect,
    onCancel,
    showToast
}) {
    const [inputValue, setInputValue] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('chat')
    const [rateLimitError, setRateLimitError] = useState(null)
    const messagesEndRef = useRef(null)

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
            if (showToast) {
                showToast(result.error, 'warning')
            }
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

    const otherUsers = onlineUsers.filter(u => {
        if (u.peerId === myPeerId) return false
        if (searchQuery) {
            const username = formatUsername(u.peerId)
            return username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.peerId.toLowerCase().includes(searchQuery.toLowerCase())
        }
        return true
    })

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-[80vh] min-h-[500px] bg-[#0a0a0a] border border-white/5 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
            {/* Mobile Tabs - Fixed at top */}
            <div className="md:hidden flex border-b border-white/5 bg-[#0d0d0d] flex-shrink-0">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'users' ? 'text-white border-b-2 border-green-500' : 'text-gray-500'}`}
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

            {/* Main Content - Flex row on desktop, column on mobile */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">

                {/* LEFT PANEL: Online Users */}
                <div
                    className={`
                        ${activeTab === 'users' ? 'flex' : 'hidden'} 
                        md:flex flex-col w-full md:w-72 lg:w-80 border-r border-white/5 bg-[#0d0d0d] flex-shrink-0 
                        flex-1 md:flex-none overflow-hidden
                    `}
                >
                    {/* My ID Card */}
                    <div className="p-4 border-b border-white/5 flex-shrink-0">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-mono">Your ID</div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {myPeerId?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-medium text-sm truncate">
                                    {formatUsername(myPeerId || '')}
                                </div>
                                <div className="text-xs text-gray-500 font-mono truncate">{myPeerId}</div>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="p-3 border-b border-white/5 flex-shrink-0">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                        />
                    </div>

                    {/* Online Users Header */}
                    <div className="px-4 py-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-mono">
                            Online — {otherUsers.length}
                        </span>
                    </div>

                    {/* Users List - Scrollable */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {otherUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-600 text-sm">
                                {searchQuery ? 'No users found' : 'Waiting for others...'}
                            </div>
                        ) : (
                            <div className="space-y-1 p-2">
                                {otherUsers.map(user => {
                                    const avatarColor = getAvatarColor(user.peerId);
                                    const username = formatUsername(user.peerId);
                                    return (
                                        <button
                                            key={user.peerId}
                                            onClick={() => onConnect(user.peerId)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group text-left"
                                        >
                                            <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                                                {user.peerId.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-gray-200 text-sm font-medium truncate">{username}</div>
                                                <div className="text-xs text-gray-500 font-mono truncate">{user.peerId}</div>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Back Button */}
                    <div className="p-3 border-t border-white/5 flex-shrink-0">
                        <button
                            onClick={onCancel}
                            className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-wider font-mono"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>

                {/* RIGHT PANEL: Global Chat */}
                <div
                    className={`
                        ${activeTab === 'chat' ? 'flex' : 'hidden'} 
                        md:flex flex-col flex-1 bg-[#0a0a0a] min-w-0 overflow-hidden
                    `}
                >
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/5 bg-[#0a0a0a] flex-shrink-0">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider font-mono">Global Chat</h3>
                    </div>

                    {/* Messages - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                                No messages yet. Say hello!
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === myPeerId;
                                const avatarColor = getAvatarColor(msg.senderId);
                                const username = formatUsername(msg.senderId);
                                return (
                                    <div key={msg.timestamp || idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-lg ${isMe ? 'bg-blue-600' : avatarColor}`}>
                                            {msg.senderId.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%] min-w-0`}>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className={`text-xs font-bold ${isMe ? 'text-blue-400' : avatarColor.replace('bg-', 'text-')}`}>
                                                    {username}
                                                </span>
                                                <span className="text-[10px] text-gray-600">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div
                                                className={`
                                                    px-3 py-2 rounded-lg text-sm
                                                    ${isMe
                                                        ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-tr-none'
                                                        : 'bg-[#1a1a1a] text-gray-300 border border-white/5 rounded-tl-none'}
                                                `}
                                                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area - Fixed at bottom */}
                    <div className="p-4 border-t border-white/5 bg-[#0d0d0d] flex-shrink-0">
                        {rateLimitError && (
                            <div className="mb-2 text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg text-center animate-pulse flex items-center justify-center gap-1.5">
                                <FaClock className="w-3 h-3" />
                                {rateLimitError}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message to everyone..."
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="px-5 py-3 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, User as UserIcon, MessageSquare, Search, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

export default function MessagesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchConversations();
            const interval = setInterval(fetchConversations, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        if (selectedConv?.otherUser?.id) {
            fetchMessages(selectedConv.otherUser.id);
            const interval = setInterval(() => fetchMessages(selectedConv.otherUser.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedConv]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/chat/conversations');
            setConversations(res.data);
            setLoadingConvs(false);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const res = await api.get(`/chat/${otherUserId}`);
            setMessages(res.data);
            setLoadingMsgs(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || !selectedConv) return;

        setSending(true);
        try {
            const res = await api.post('/chat/send', {
                receiverId: selectedConv?.otherUser?.id,
                content: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
            fetchConversations(); // Update last message in sidebar
        } catch (error) {
            console.error('Error sending message:', error.response?.data || error);
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#f5f5f5]">
            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-12 max-w-6xl h-[calc(100vh-100px)]">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-100 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm group w-fit"
                >
                    <ArrowLeft size={18} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                    <span className="text-sm font-black text-gray-600 group-hover:text-red-600 uppercase tracking-widest transition-colors">Back</span>
                </button>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex overflow-hidden h-full">

                    {/* Sidebar: Conversations List */}
                    <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-white">
                        <div className="p-6 border-b border-gray-100">
                            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                <MessageSquare className="text-red-600" size={24} />
                                Artisan Inbox
                            </h1>
                            <div className="mt-4 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {loadingConvs ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="animate-spin text-red-600" />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-sm text-gray-400 font-medium italic">No conversations yet.</p>
                                </div>
                            ) : (
                                conversations.map((conv, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedConv(conv);
                                            setLoadingMsgs(true);
                                        }}
                                        className={`w-full p-4 flex items-center gap-4 hover:bg-red-50/50 transition-all border-l-4 ${selectedConv?.otherUser?.id === conv?.otherUser?.id ? 'bg-red-50 border-red-600' : 'border-transparent'}`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 relative">
                                            {conv?.otherUser?.profileImage ? (
                                                <img src={conv.otherUser.profileImage} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-red-600">
                                                    {(conv?.otherUser?.shopName || conv?.otherUser?.name || '?').charAt(0)}
                                                </div>
                                            )}
                                            {conv.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {conv?.otherUser?.shopName || conv?.otherUser?.name || 'Unknown'}
                                                </p>
                                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(conv.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500 opacity-70'}`}>
                                                {conv.lastMessage}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="hidden md:flex flex-1 flex-col bg-gray-50/30">
                        {selectedConv ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                            {selectedConv?.otherUser?.profileImage ? (
                                                <img src={selectedConv.otherUser.profileImage} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-red-600">
                                                    {(selectedConv?.otherUser?.shopName || selectedConv?.otherUser?.name || '?').charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{selectedConv?.otherUser?.shopName || selectedConv?.otherUser?.name || 'Unknown'}</p>
                                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Active Session
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/shop/${selectedConv?.otherUser?.id}`)}
                                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        View Profile
                                    </button>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                                    {loadingMsgs ? (
                                        <div className="flex justify-center p-12">
                                            <Loader2 className="animate-spin text-red-600" />
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isMine = msg.sender.id === user.id || msg.sender === user.id;
                                            return (
                                                <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${isMine ? 'bg-red-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                                                        {msg.content}
                                                        <p className={`text-[9px] mt-2 font-medium opacity-60 ${isMine ? 'text-red-100' : 'text-gray-400'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={scrollRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-6 bg-white border-t border-gray-100">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-2 pl-4 border border-gray-100 focus-within:border-red-600 transition-all">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Write your message..."
                                            className="flex-1 bg-transparent outline-none text-sm py-2"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className={`p-3 rounded-xl transition-all ${newMessage.trim() && !sending ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-gray-300'}`}
                                        >
                                            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6">
                                    <MessageSquare size={40} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Select a Conversation</h3>
                                <p className="text-sm text-gray-400 font-medium italic max-w-xs">
                                    Choose a client or artisan from the list to start discussing commissions and heritage designs.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}

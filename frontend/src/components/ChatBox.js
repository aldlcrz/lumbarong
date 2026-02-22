import { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, User as UserIcon } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBox({ receiver, onClose }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (receiver?.id) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Polling for real-time feel
            return () => clearInterval(interval);
        }
    }, [receiver?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/chat/${receiver.id}`);
            setMessages(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await api.post('/chat/send', {
                receiverId: receiver.id,
                content: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Send error:', error);
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!user) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 right-4 w-80 md:w-96 bg-white shadow-2xl rounded-t-2xl border border-gray-100 z-[120] flex flex-col h-[500px]"
        >
            {/* Header */}
            <div className="p-4 bg-gray-900 rounded-t-2xl flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold font-italic">
                        {receiver?.profileImage ? (
                            <img src={receiver.profileImage} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <span>{receiver?.shopName?.charAt(0) || receiver?.name?.charAt(0) || 'L'}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold truncate max-w-[150px]">{receiver?.shopName || receiver?.name}</p>
                        <p className="text-[10px] text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin text-red-600" size={24} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <UserIcon className="text-gray-200 mb-2" size={48} />
                        <p className="text-xs text-gray-400 font-medium">Start a conversation with {receiver?.shopName || receiver?.name}</p>
                        <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest font-black">Lumban Direct Artisan Chat</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMine = msg.sender.id === user.id || msg.sender === user.id;
                        return (
                            <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMine ? 'bg-red-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none'}`}>
                                    {msg.content}
                                    <p className={`text-[9px] mt-1 ${isMine ? 'text-red-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white shadow-inner">
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-100 focus-within:border-red-600 transition-colors">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask the artisan..."
                        className="flex-1 bg-transparent outline-none text-sm py-1"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className={`p-2 rounded-full transition-all ${newMessage.trim() && !sending ? 'text-red-600 hover:bg-red-50' : 'text-gray-300'}`}
                    >
                        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}

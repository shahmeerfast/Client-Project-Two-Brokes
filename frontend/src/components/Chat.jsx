import React, { useState, useEffect, useRef } from 'react';
import { useShopContext } from '../context/ShopContext';

const Chat = () => {
    const { user } = useShopContext();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatList, setChatList] = useState([]);
    const messagesEndRef = useRef(null);

    // Mock data for demonstration
    useEffect(() => {
        const mockChats = [
            { id: 1, name: 'John Doe', role: 'buyer', lastMessage: 'Hello, is this available?' },
            { id: 2, name: 'Jane Smith', role: 'seller', lastMessage: 'Yes, I can ship it today' },
            { id: 3, name: 'Admin', role: 'admin', lastMessage: 'How can I help you?' }
        ];
        setChatList(mockChats);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const newMsg = {
            id: Date.now(),
            text: newMessage,
            sender: user.name,
            timestamp: new Date().toISOString(),
            role: user.role
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
    };

    const selectChat = (chat) => {
        setSelectedChat(chat);
        // Mock messages for demonstration
        setMessages([
            { id: 1, text: 'Hello, is this available?', sender: 'Buyer', timestamp: '2024-01-01T10:00:00', role: 'buyer' },
            { id: 2, text: 'Yes, it is!', sender: 'Seller', timestamp: '2024-01-01T10:01:00', role: 'seller' },
            { id: 3, text: 'Great, I would like to buy it', sender: 'Buyer', timestamp: '2024-01-01T10:02:00', role: 'buyer' }
        ]);
    };

    return (
        <div className="flex h-[600px] bg-white rounded-lg shadow-lg">
            {/* Chat List */}
            <div className="w-1/3 border-r">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Messages</h2>
                </div>
                <div className="overflow-y-auto h-[calc(100%-4rem)]">
                    {chatList.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => selectChat(chat)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                                selectedChat?.id === chat.id ? 'bg-gray-100' : ''
                            }`}
                        >
                            <div className="font-semibold">{chat.name}</div>
                            <div className="text-sm text-gray-500">{chat.lastMessage}</div>
                            <div className="text-xs text-gray-400">{chat.role}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold">{selectedChat.name}</h3>
                            <div className="text-sm text-gray-500">{selectedChat.role}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`mb-4 ${
                                        message.role === user.role
                                            ? 'ml-auto'
                                            : 'mr-auto'
                                    }`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg ${
                                            message.role === user.role
                                                ? 'bg-black text-white ml-auto'
                                                : 'bg-gray-200'
                                        }`}
                                    >
                                        <div className="text-sm">{message.text}</div>
                                        <div className="text-xs mt-1 opacity-70">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat; 
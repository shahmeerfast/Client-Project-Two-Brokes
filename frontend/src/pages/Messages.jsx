import React from 'react';
import Chat from '../components/Chat';

const Messages = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            <Chat />
        </div>
    );
};

export default Messages; 
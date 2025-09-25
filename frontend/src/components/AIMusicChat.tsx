import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIMusicChatProps {
  userData: any;
}

const AIMusicChat: React.FC<AIMusicChatProps> = ({ userData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hey ${userData?.user?.displayName || 'there'}! 🎵 I'm your AI DJ assistant. I can help you discover new music based on your Spotify listening history. What kind of mood are you in today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      console.log('🤖 Sending message to AI:', userMessage.text);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:8080/api/auth/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage.text })
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();
      console.log('🎵 AI Response received:', data);

      let aiText = data.data?.message || "Sorry, I couldn't process that request.";
      
      // Add Spotify results if available
      if (data.data?.spotifyResults && data.data.spotifyResults.length > 0) {
        const results = data.data.spotifyResults;
        aiText += "\n\n🎵 Here's what I found:\n";
        results.slice(0, 3).forEach((item: any, index: number) => {
          if (item.name) {
            const artists = item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist';
            aiText += `${index + 1}. ${item.name} by ${artists}\n`;
          }
        });
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble right now. Please make sure you're authenticated with Spotify and try again!",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
      setIsLoading(false);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          🤖 AI Music Assistant
          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            Beta
          </span>
        </h2>
        
        {/* Chat Messages */}
        <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-3">
              <div className="bg-white text-gray-800 border max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about music recommendations..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Send
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "Play some workout music",
            "Pause the music", 
            "Skip to next song",
            "Turn up the volume",
            "Shuffle my playlist",
            "Find chill music",
            "Create a party playlist"
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInputText(suggestion)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIMusicChat;
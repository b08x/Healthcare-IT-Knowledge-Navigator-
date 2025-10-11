

import React, { useState, useRef, useEffect } from 'react';
import { Role } from '../types';
import { queryKnowledgeBase } from '../services/geminiService';
import { SendIcon, BotIcon, UserIcon } from './common/Icons';

interface KnowledgeEngineProps {
  role: Role;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const KnowledgeEngine = ({ role }: KnowledgeEngineProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    // Introduce the bot on first load
    const initialBotMessage: Message = {
        sender: 'bot',
        text: "Hello! I'm Navigator AI. How can I help you navigate the Healthcare Imaging Platform support documentation today?"
    };
    setMessages([initialBotMessage]);
  }, []);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await queryKnowledgeBase(input);
      const botMessage: Message = { sender: 'bot', text: botResponse };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 bg-brand-surface border border-white/10 rounded-lg shadow-inner mb-4">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <BotIcon className="w-8 h-8 flex-shrink-0 text-brand-accent" />}
              <div
                className={`max-w-xl px-4 py-3 rounded-2xl shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-brand-accent text-brand-bg font-medium'
                    : 'bg-brand-bg text-brand-text'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
               {msg.sender === 'user' && <UserIcon className="w-8 h-8 flex-shrink-0 text-brand-text opacity-70" />}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3">
                 <BotIcon className="w-8 h-8 flex-shrink-0 text-brand-accent" />
                 <div className="max-w-xl px-4 py-3 rounded-2xl bg-brand-bg text-brand-text">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-brand-subtle rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                 </div>
             </div>
          )}
          <div ref={chatEndRef}></div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 bg-brand-surface border border-white/10 rounded-lg shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about HL7 failures, DICOM issues, etc."
          className="w-full px-4 py-2 bg-transparent focus:outline-none disabled:opacity-50 text-brand-text placeholder:text-brand-subtle"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || input.trim() === ''}
          className="p-2 rounded-full bg-brand-accent text-brand-bg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default KnowledgeEngine;
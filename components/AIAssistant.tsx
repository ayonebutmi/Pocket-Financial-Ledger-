

import React, { useState, useRef, useEffect } from 'react';
import { Transaction, BudgetCategory, ChatMessage, Account, CreditScore, FinancialGoal } from '../types';
import { analyzeFinances, processVoiceCommand } from '../services/geminiService';
import { Send, Bot, User, Sparkles, X, ExternalLink, Globe, LineChart, Mic, Square, Check, Plus, Volume2 } from 'lucide-react';
import { INITIAL_ACCOUNTS, INITIAL_CREDIT_SCORE, INITIAL_GOALS } from '../constants'; 

interface AIAssistantProps {
  transactions: Transaction[];
  budgets: BudgetCategory[];
  isOpen: boolean;
  toggleOpen: () => void;
  onAddTransaction: (tx: Transaction) => void;
  setActiveTab: (tab: string) => void; // Added for navigation
  autoStartListening?: boolean; // Trigger voice immediately
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
    transactions, 
    budgets, 
    isOpen, 
    toggleOpen, 
    onAddTransaction, 
    setActiveTab,
    autoStartListening 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: "Hi! I'm your AI Financial Planner. I can help you navigate the app, record transactions, or analyze your spending. Just speak!", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [pendingTransaction, setPendingTransaction] = useState<Partial<Transaction> | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Auto-start listening if triggered externally
  useEffect(() => {
      if (isOpen && autoStartListening && !isRecording) {
          startRecording();
      }
  }, [isOpen, autoStartListening]);

  // Text-to-Speech Helper
  const speak = (text: string) => {
      if ('speechSynthesis' in window) {
          // Cancel previous speech
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          // Try to find a good voice
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US');
          if (preferredVoice) utterance.voice = preferredVoice;
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
      }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await analyzeFinances(
          input, 
          transactions, 
          budgets, 
          INITIAL_ACCOUNTS, 
          INITIAL_CREDIT_SCORE, 
          INITIAL_GOALS
      );
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: result.text, 
        sources: result.sources,
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, botMsg]);
      // Optional: Speak the response for text chats too? Maybe too verbose.
      // speak(result.text.substring(0, 150)); // Speak first 150 chars
    } catch (error) {
        const errorMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: "I'm having trouble connecting. Please try again.", timestamp: Date.now() };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- VOICE RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
        await processAudio(audioBlob);
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsLoading(true);
    }
  };

  const processAudio = async (blob: Blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          // 1. Add user message placeholder
          const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: "🎤 [Processing Voice Command...]", timestamp: Date.now() };
          setMessages(prev => [...prev, userMsg]);

          // 2. Send to Gemini for Classification (Navigation vs Transaction vs Chat)
          const commandResult = await processVoiceCommand(base64Audio);
          setIsLoading(false);

          if (!commandResult) {
              const errorMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: "Sorry, I couldn't understand that. Please try again.", timestamp: Date.now() };
              setMessages(prev => [...prev, errorMsg]);
              speak("Sorry, I couldn't understand that.");
              return;
          }

          // 3. Handle Intent
          if (commandResult.type === 'NAVIGATION' && commandResult.destination) {
             // NAVIGATE
             setActiveTab(commandResult.destination);
             const botMsg: ChatMessage = { 
                 id: Date.now().toString(), 
                 role: 'model', 
                 text: commandResult.responseText || `Navigating to ${commandResult.destination}...`, 
                 timestamp: Date.now() 
             };
             setMessages(prev => [...prev, botMsg]);
             speak(commandResult.responseText || "Taking you there now.");
          } 
          else if (commandResult.type === 'TRANSACTION' && commandResult.transactionData) {
             // TRANSACTION DRAFT
             setPendingTransaction(commandResult.transactionData);
             const botMsg: ChatMessage = { 
                 id: Date.now().toString(), 
                 role: 'model', 
                 text: commandResult.responseText || "I've drafted that transaction for you. Please confirm.", 
                 timestamp: Date.now() 
             };
             setMessages(prev => [...prev, botMsg]);
             speak(commandResult.responseText || "I've drafted that transaction. Does it look right?");
          } 
          else {
             // CHAT / GENERAL QUERY
             const botMsg: ChatMessage = { 
                 id: Date.now().toString(), 
                 role: 'model', 
                 text: commandResult.responseText || "I heard you, but I'm not sure what to do.", 
                 timestamp: Date.now() 
             };
             setMessages(prev => [...prev, botMsg]);
             if (commandResult.responseText) speak(commandResult.responseText);
          }
      };
  };

  const confirmTransaction = () => {
      if (pendingTransaction) {
          const newTx: Transaction = {
              id: `tx_voice_${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              merchant: pendingTransaction.merchant || 'Unknown',
              amount: pendingTransaction.amount || 0,
              category: pendingTransaction.category || 'Uncategorized',
              type: 'expense',
              status: 'pending',
              source: 'manual',
              notes: pendingTransaction.notes 
          };
          onAddTransaction(newTx);
          setPendingTransaction(null);
          
          const confirmMsg: ChatMessage = { 
              id: Date.now().toString(), 
              role: 'model', 
              text: `✅ Saved! Added **$${newTx.amount}** at **${newTx.merchant}**.`, 
              timestamp: Date.now() 
          };
          setMessages(prev => [...prev, confirmMsg]);
          speak(`Saved ${newTx.amount} dollars.`);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col z-50">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <Bot size={18} className="text-yellow-300" />
          </div>
          <span className="font-semibold">Omni-Voice Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={toggleOpen} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X size={20} />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
              }`}
            >
               {/* Simple Markdown rendering simulation */}
              <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
            
            {/* Sources / Citations */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-2 max-w-[90%] bg-slate-100 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">
                  <Globe size={12} className="mr-1" /> Sources
                </div>
                <div className="space-y-2">
                  {msg.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all text-xs group"
                    >
                      <span className="truncate text-slate-700 font-medium pr-2">{source.title}</span>
                      <ExternalLink size={12} className="text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Pending Transaction Card */}
        {pendingTransaction && (
             <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-md mx-4 animate-in fade-in slide-in-from-bottom-5">
                 <div className="flex items-center space-x-2 mb-3">
                     <div className="bg-emerald-100 p-1.5 rounded-full text-emerald-600">
                         <Sparkles size={16} />
                     </div>
                     <span className="font-bold text-slate-800 text-sm">Proposed Transaction</span>
                 </div>
                 
                 <div className="space-y-2 mb-4">
                     <div className="flex justify-between text-sm border-b border-slate-50 pb-1">
                         <span className="text-slate-500">Merchant</span>
                         <span className="font-bold text-slate-900">{pendingTransaction.merchant}</span>
                     </div>
                     <div className="flex justify-between text-sm border-b border-slate-50 pb-1">
                         <span className="text-slate-500">Amount</span>
                         <span className="font-bold text-slate-900">${pendingTransaction.amount}</span>
                     </div>
                     <div className="flex justify-between text-sm border-b border-slate-50 pb-1">
                         <span className="text-slate-500">Category</span>
                         <span className="font-medium text-indigo-600">{pendingTransaction.category}</span>
                     </div>
                     {pendingTransaction.notes && (
                        <div className="bg-slate-50 p-2 rounded-lg text-xs text-slate-600 mt-2 italic">
                            "{pendingTransaction.notes}"
                        </div>
                     )}
                 </div>

                 <div className="flex space-x-2">
                     <button 
                        onClick={() => setPendingTransaction(null)}
                        className="flex-1 py-2 text-slate-500 text-xs font-bold hover:bg-slate-100 rounded-lg"
                     >
                         Discard
                     </button>
                     <button 
                        onClick={confirmTransaction}
                        className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 flex items-center justify-center"
                     >
                         <Plus size={14} className="mr-1" /> Save
                     </button>
                 </div>
             </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-shadow">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : "Ask or command..."}
            className="flex-1 bg-transparent border-none outline-none text-sm py-2 text-slate-800 placeholder:text-slate-400"
            disabled={isRecording}
          />
          
          {/* Voice Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                isRecording 
                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                : 'text-slate-500 hover:bg-slate-200'
            }`}
            title="Voice Command"
          >
            {isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={20} />}
          </button>

          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        {!isRecording && (
            <div className="mt-2 flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                {['Go to Budget', 'Spent $45 on Gas', 'Open Dream Vault'].map(suggestion => (
                    <button key={suggestion} onClick={() => setInput(suggestion)} className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors border border-slate-200">
                        {suggestion}
                    </button>
                ))}
            </div>
        )}
        {isRecording && (
             <div className="mt-2 text-center text-xs text-indigo-600 font-bold animate-pulse flex items-center justify-center">
                 <Volume2 size={12} className="mr-1" /> Listening... Speak naturally.
             </div>
        )}
      </div>
    </div>
  );
};
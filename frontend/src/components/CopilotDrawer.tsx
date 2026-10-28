import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { queryCopilot } from '../api/client';

export const CopilotDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; sources?: string[]; confidence?: number }>>([
    {
      sender: 'bot',
      text: 'Hello! I am BioCopilot. I analyze cell-culture telemetry, explain metabolic risk models, and evaluate 2 L to 1,000 L scale-up trade-offs. Ask me any question about your process!'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const presetQuestions = [
    "Why is lactate increasing?",
    "What is affecting viability?",
    "What are the current process risks?",
    "What changes from 2 L to 200 L?",
    "Which feed scenario has lower estimated cost?"
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await queryCopilot(q);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: res.answer,
          sources: res.data_sources,
          confidence: res.confidence
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Unable to reach backend copilot service. Please check network connectivity.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-bold text-sm rounded-full shadow-2xl hover:scale-105 transition-all duration-200 border border-teal-300"
        >
          <Bot className="w-5 h-5" />
          <span>Ask BioCopilot AI</span>
        </button>
      )}

      {/* Drawer Overlay / Sidebar */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-colors">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between border-b border-teal-800">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6 text-teal-400" />
              <div>
                <h3 className="font-bold text-base">BioCopilot Assistant</h3>
                <p className="text-xs text-teal-200 font-mono">State-Aware Decision Support</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preset Questions */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">QUICK PROCESS QUESTIONS:</p>
            <div className="flex flex-wrap gap-1.5">
              {presetQuestions.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(pq)}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-700 rounded-full transition-colors"
                >
                  {pq}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
                    m.sender === 'user'
                      ? 'bg-teal-600 text-white font-medium rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  {m.sources && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-teal-700 dark:text-teal-400">DATA SOURCES:</span> {m.sources.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 text-xs text-slate-500 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Analyzing process telemetry state...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2">
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask BioCopilot..."
              className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={() => handleSend()}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

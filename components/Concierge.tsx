import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const Concierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: 'Witaj w naszym Azylu. Jestem kustoszem tego miejsca. O co chciałbyś zapytać w progu Akademii Dobrego Nastroju?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: trimmedInput }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'Jesteś Cyfrowym Konsjerżem (Kustoszem) "Akademii Dobrego Nastroju". Twoja osobowość: elegancka, nieco tajemnicza, artystyczna, głęboko szanująca rozmówcę. Mówisz wyłącznie w języku polskim. Twoim celem jest pomóc odwiedzającym zrozumieć duszę tego miejsca: Akademia to azyl dla świadomych, pracowitych i inteligentnych ludzi, którzy szukają głębi. Lokalizacja: Kłobuck, ul. Kręta 23.',
        },
      });

      const responseStream = await chat.sendMessageStream({ message: trimmedInput });
      
      let assistantAccumulatedText = '';
      setMessages(prev => [...prev, { role: 'assistant', text: '' }]);

      for await (const chunk of responseStream) {
        const chunkText = chunk.text || '';
        assistantAccumulatedText += chunkText;
        setMessages(prev => {
          const newMsgs = [...prev];
          if (newMsgs.length > 0) {
            newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], text: assistantAccumulatedText };
          }
          return newMsgs;
        });
      }
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Przepraszam, chwilowe zakłócenia w eterze. Spróbujmy jeszcze raz za chwilę.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-[250]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 left-0 w-[300px] md:w-[380px] h-[480px] bg-white/95 backdrop-blur-2xl rounded-sm border border-[#966F33]/20 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-5 bg-[#F5F2EB] border-b border-[#966F33]/10 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#966F33] rounded-full animate-pulse" />
                <h3 className="font-serif italic text-[#2C1810] text-base">Kustosz Azylu</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#2C1810]/30 hover:text-[#2C1810] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-[#FAF9F6]"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-sm text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-[#966F33] text-white shadow-md' 
                      : 'bg-white border border-[#2C1810]/5 text-[#2C1810]/80 shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#2C1810]/5 p-3 rounded-sm shadow-sm">
                    <Loader2 size={16} className="animate-spin text-[#966F33]" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#966F33]/10 bg-white">
              <div className="flex items-center space-x-2 bg-[#F5F2EB] p-2 rounded-sm border border-transparent focus-within:border-[#966F33]/30 transition-all">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                  placeholder="Zapytaj o duszę Akademii..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[#2C1810] px-2 placeholder:text-[#2C1810]/30"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="p-2 text-[#966F33] disabled:opacity-30 hover:scale-110 transition-transform"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#F5F2EB] border border-[#966F33]/30 rounded-full flex items-center justify-center text-[#966F33] shadow-2xl relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#966F33]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
      </motion.button>
    </div>
  );
};

export default Concierge;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SecretRoom: React.FC = () => {
  const [code, setCode] = useState('');
  const [access, setAccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.toLowerCase() === 'nuta') {
      setAccess(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center p-8">
      <AnimatePresence mode="wait">
        {!access ? (
          <motion.div 
            key="lock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
            className="max-w-md w-full text-center space-y-8"
          >
            <h2 className="font-serif text-3xl text-[#C9A96E]">Klub Nuty</h2>
            <p className="text-[#F8F5F0]/60 font-light italic">
              Masz kod od kogoś z nas? Wpisz i wejdź do środka rozmowy.
            </p>
            
            <form onSubmit={handleSubmit} className="relative">
              <input 
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Kod wstępu..."
                className={`w-full bg-transparent border-b-2 ${error ? 'border-red-500' : 'border-[#C9A96E]/30'} py-4 text-center text-2xl text-white focus:outline-none focus:border-[#C9A96E] transition-colors`}
              />
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#C9A96E]"
              >
                &rarr;
              </motion.button>
            </form>
            {error && <p className="text-red-500 text-sm">Nieprawidłowy kod. Spróbuj ponownie.</p>}
          </motion.div>
        ) : (
          <motion.div 
            key="room"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl bg-[#F8F5F0] rounded-3xl p-12 text-[#1A1A1A] shadow-inner border-4 border-dashed border-[#A55A3A]/20"
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="font-serif text-4xl text-[#A55A3A]">Witaj w Azylu</h2>
              <div className="text-sm font-serif italic text-[#C9A96E]">Członek Klubu Nuty</div>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-xl shadow-md border-l-4 border-[#A55A3A]">
                <span className="text-xs uppercase tracking-widest text-[#C9A96E] mb-2 block">Ogłoszenie Admina</span>
                <p className="italic">"Najbliższe spotkanie przy fortepianie odbędzie się w czwartek o 19:00. Przynieście swoje ulubione wiersze."</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#1A1A1A]/5 rounded-xl border border-dashed border-[#1A1A1A]/10">
                  <h4 className="font-serif text-xl mb-4">Wątki rozmów</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="hover:text-[#A55A3A] cursor-pointer">&bull; Jak słuchać ciszy?</li>
                    <li className="hover:text-[#A55A3A] cursor-pointer">&bull; Polecana kawa z palarni...</li>
                    <li className="hover:text-[#A55A3A] cursor-pointer">&bull; Kultura 40+ vs Reszta Świata</li>
                  </ul>
                </div>
                <div className="p-6 bg-[#A55A3A]/5 rounded-xl border border-dashed border-[#A55A3A]/20 flex items-center justify-center text-center">
                  <p className="text-sm italic">Tu nuta nie kończy się – zaczyna.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecretRoom;

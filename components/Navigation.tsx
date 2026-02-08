
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionId } from '../types';

interface NavigationProps {
  activeId: SectionId;
  onNavigate: (id: SectionId) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeId, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: SectionId.HERO, label: 'Próg / Budynek', icon: '☊' },
    { id: SectionId.GALLERY, label: 'Korytarz / Wnętrza', icon: '☗' },
    { id: SectionId.GENESIS, label: 'Serce / Dusza', icon: '❦' },
    { id: SectionId.CONTACT, label: 'Pokój Spotkań / Dla Ciebie', icon: '☕' },
    { id: SectionId.LOCATION, label: 'Wyjście / Dojazd', icon: '⚐' },
    { id: SectionId.SECRET, label: 'Ukryty Pokój', icon: '𝄞' },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-8 left-8 z-[100] text-[#C9A96E] hover:text-white transition-colors"
      >
        <motion.div 
          animate={{ rotate: isOpen ? 90 : 0 }}
          className="text-4xl"
        >
          {isOpen ? '✕' : '𝄞'}
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-[#1A1A1A] shadow-2xl z-[90] border-r border-[#C9A96E]/20 p-12 flex flex-col justify-center"
          >
            <div className="space-y-12">
              <h3 className="font-serif text-3xl text-[#C9A96E] mb-12">Nawigacja</h3>
              <nav className="space-y-8">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center space-x-6 text-xl transition-all group w-full text-left ${
                      activeId === item.id ? 'text-white' : 'text-[#F8F5F0]/40'
                    }`}
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform">{item.icon}</span>
                    <span className="font-serif group-hover:translate-x-2 transition-transform tracking-wide">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="absolute bottom-12 left-12 text-[#C9A96E]/30 text-xs tracking-[0.2em] uppercase">
              Akademia Dobrego Nastroju
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Hero from './components/Hero';
import NarrativeGallery from './components/NarrativeGallery';
import ContactInvitation from './components/ContactInvitation';
import MusicPlayer from './components/MusicPlayer';
import CustomCursor from './components/CustomCursor';
import ClubRoom from './components/ClubRoom';
import EventsView from './components/EventsView';

type ViewState = 'landing' | 'choice' | 'story' | 'contact' | 'club' | 'events';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [currentSlideType, setCurrentSlideType] = useState<'genesis' | 'image' | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      if (view === 'landing' && window.scrollY > 40) {
        setView('choice');
        window.scrollTo(0, 0);
      }
    };
    if (view === 'landing') {
      window.addEventListener('scroll', handleScroll);
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleJoinClub = (code: string) => {
    setActiveCode(code);
    setView('club');
  };

  const handleGoToEvents = () => {
    setView('events');
  };

  return (
    <div className="relative bg-[#F5F5F5] min-h-screen selection:bg-[#D4AF37] selection:text-white overflow-x-hidden">
      <CustomCursor />
      <MusicPlayer isVisible={view !== 'story' || currentSlideType === 'image'} />

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="view-landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative z-10 h-[120vh]"
          >
            <Hero />
          </motion.div>
        )}

        {view === 'choice' && (
          <motion.section
            key="view-choice"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#EADDCA] px-6"
          >
            <div className="flex flex-col items-center justify-center w-full max-w-6xl relative z-10">
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
                <ChoiceButton title="1: Geneza" subtitle="Historia i Wnętrza" onClick={() => setView('story')} />
                <ChoiceButton title="2: Kontakt" subtitle="dołącz do nas" onClick={() => setView('contact')} />
                <ChoiceButton title="3: Wydarzenia" subtitle="Zobacz co się dzieje" onClick={() => setView('events')} />
              </div>
              <button onClick={() => setView('landing')} className="font-serif italic text-[#8B4513] tracking-[0.4em] text-sm md:text-lg px-10 py-3 border border-[#8B4513]/20 hover:border-[#966F33] rounded-sm bg-white/40 shadow-lg">P O W R Ó T</button>
            </div>
          </motion.section>
        )}

        {view === 'story' && (
          <motion.div key="view-story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NarrativeGallery 
              onComplete={() => setView('contact')} 
              onBack={() => setView('choice')}
              onSlideChange={(type) => setCurrentSlideType(type)}
            />
          </motion.div>
        )}

        {view === 'contact' && (
          <motion.div key="view-contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="min-h-screen bg-[#F1E9D2] text-[#121212] flex flex-col items-center">
              <ContactInvitation onBack={() => setView('choice')} onJoinClub={handleJoinClub} onGoToEvents={handleGoToEvents} />
              <footer className="w-full bg-[#EADDCA] text-[#2C1810] py-32 px-6 flex flex-col items-center justify-center text-center">
                <h4 className="font-serif text-3xl md:text-6xl text-[#8B4513]">Akademia Dobrego Nastroju</h4>
                <p className="font-serif italic text-[#966F33] text-xl opacity-80 mt-4 text-center">Tu, gdzie dobry nastrój ma swój dom.</p>
              </footer>
            </section>
          </motion.div>
        )}

        {view === 'events' && (
           <motion.div key="view-events" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
             <EventsView onBack={() => setView('choice')} />
           </motion.div>
        )}

        {view === 'club' && activeCode && (
          <motion.div key="view-club" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <ClubRoom code={activeCode} onExit={() => setView('choice')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChoiceButton = ({ title, subtitle, onClick }: { title: string, subtitle: string, onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.95)" }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group p-8 md:p-12 border border-[#8B4513]/10 rounded-sm bg-white/60 shadow-xl flex flex-col items-center justify-center space-y-4"
  >
    <h3 className="font-serif text-2xl md:text-4xl text-[#2C1810] group-hover:text-[#966F33] italic">{title}</h3>
    <p className="text-[#8B4513]/60 text-[10px] tracking-[0.3em] uppercase">{subtitle}</p>
    <div className="w-6 h-px bg-[#966F33]/20 group-hover:w-16 transition-all duration-700" />
  </motion.button>
);

export default App;
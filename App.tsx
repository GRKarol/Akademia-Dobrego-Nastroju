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
  const [isGuided, setIsGuided] = useState(false);
  const [isInteractionBlocked, setIsInteractionBlocked] = useState(false);
  
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
    
    // ⚠️ ZMIANA 1: Blokada interakcji NIE dotyczy widoku 'club'
    if (view === 'choice' && isGuided) {
      setIsInteractionBlocked(true);
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        setIsInteractionBlocked(false);
        document.body.style.overflow = 'auto';
      }, 1000);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'auto';
      };
    }
    
    // ⚠️ ZMIANA 2: Dla widoku 'club' wymuszamy overflow auto
    if (view === 'club') {
      document.body.style.overflow = 'auto';
    }
  }, [view, isGuided]);

  const handleJoinClub = (code: string) => {
    console.log("🔵 handleJoinClub wywołany z kodem:", code);
    setActiveCode(code);
    setView('club');
    setIsGuided(false); // ⚠️ Resetujemy guided, żeby nie kolidowało z blokowaniem
  };

  const handleReturnToMenuFromScroll = () => {
    setIsGuided(true);
    setView('choice');
  };

  const navigate = (newView: ViewState) => {
    if (isInteractionBlocked) return;
    setIsGuided(false);
    setView(newView);
  };

  // ⚠️ ZMIANA 3: Console.log przeniesiony tutaj (debug)
  console.log("🟣 App render - view:", view, "activeCode:", activeCode);

  return (
    <div className="relative bg-[#F5F5F5] min-h-screen selection:bg-[#D4AF37] selection:text-white overflow-x-hidden">
      <CustomCursor />
      <MusicPlayer isVisible={view !== 'story' || currentSlideType === 'image'} />

      <AnimatePresence mode="sync">
        {view === 'landing' && (
          <motion.div
            key="view-landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -100, filter: 'blur(20px)', scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 h-[120vh]"
          >
            <Hero />
          </motion.div>
        )}

        {view === 'choice' && (
          <motion.section
            key="view-choice"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(30px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#EADDCA] px-6"
          >
            {isInteractionBlocked && (
              <div className="absolute inset-0 z-[60] cursor-wait" />
            )}
            <div className="flex flex-col items-center justify-center w-full max-w-6xl relative z-10">
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
                <ChoiceButton 
                  title="1: Geneza" 
                  subtitle="Historia i Wnętrza" 
                  onClick={() => navigate('story')} 
                />
                <ChoiceButton 
                  title="2: Kontakt" 
                  subtitle={isGuided ? "Ostatnio odwiedzona sekcja" : "dołącz do nas"} 
                  isHighlighted={isGuided}
                  onClick={() => navigate('contact')} 
                />
                <ChoiceButton 
                  title="3: Wydarzenia" 
                  subtitle={isGuided ? "następny krok" : "Zobacz co się dzieje"} 
                  isNextStep={isGuided}
                  onClick={() => navigate('events')} 
                />
              </div>
              <button 
                onClick={() => navigate('landing')} 
                className="font-serif italic text-[#8B4513] tracking-[0.4em] text-sm md:text-lg px-10 py-3 border border-[#8B4513]/20 hover:border-[#966F33] rounded-sm bg-white/40 shadow-lg transition-all"
              >
                P O W R Ó T
              </button>
            </div>
          </motion.section>
        )}

        {view === 'story' && (
          <motion.div 
            key="view-story" 
            initial={{ opacity: 0, x: 100 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <NarrativeGallery 
              onComplete={() => navigate('contact')} 
              onBack={() => navigate('choice')}
              onSlideChange={(type) => setCurrentSlideType(type)}
            />
          </motion.div>
        )}

        {view === 'contact' && (
          <motion.div 
            key="view-contact" 
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }} 
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(40px)', y: -150 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <ContactInvitation 
              onBack={() => navigate('choice')} 
              onJoinClub={handleJoinClub} 
              onGoToEvents={handleReturnToMenuFromScroll} 
            />
          </motion.div>
        )}

        {view === 'events' && (
           <motion.div 
            key="view-events" 
            initial={{ opacity: 0, scale: 1.1, filter: 'blur(30px)', y: 100 }} 
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }} 
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           >
             <EventsView onBack={() => navigate('choice')} />
           </motion.div>
        )}

        {/* ⚠️ ZMIANA 4: ClubRoom PRZENIESIONY TUTAJ - wewnątrz AnimatePresence */}
        {view === 'club' && (
          <motion.div 
            key="view-club" 
            initial={{ opacity: 0, scale: 1.05 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] bg-[#F5F5F5]" // ⚠️ ZMIANA 5: Fixed + wysoki z-index
          >
            {activeCode ? (
              <>
                {console.log("🟢 RENDERUJĘ ClubRoom z kodem:", activeCode)}
                <ClubRoom 
                  code={activeCode} 
                  onExit={() => {
                    console.log("🔴 ClubRoom.onExit wywołany - użytkownik kliknął Wyjdź");
                    navigate('choice');
                  }} 
                />
              </>
            ) : (
              <div className="fixed inset-0 bg-red-500 flex items-center justify-center text-white text-2xl">
                <div className="text-center p-8">
                  <p className="mb-4 text-4xl">❌ BŁĄD</p>
                  <p className="mb-2">Brak activeCode!</p>
                  <p className="text-sm opacity-70">view: {view}</p>
                  <p className="text-sm opacity-70">activeCode: {String(activeCode)}</p>
                  <button 
                    onClick={() => navigate('choice')}
                    className="mt-6 px-6 py-3 bg-white text-red-500 rounded hover:bg-gray-100 transition"
                  >
                    Powrót do menu
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

const ChoiceButton = ({ 
  title, 
  subtitle, 
  onClick, 
  isHighlighted, 
  isNextStep 
}: { 
  title: string, 
  subtitle: string, 
  onClick: () => void,
  isHighlighted?: boolean,
  isNextStep?: boolean
}) => (
  <motion.button
    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.95)", boxShadow: "0 25px 50px -12px rgba(139, 69, 19, 0.2)" }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`group p-8 md:p-12 border rounded-sm shadow-xl flex flex-col items-center justify-center space-y-4 transition-all duration-500 relative overflow-hidden ${
      isNextStep 
        ? 'border-[#966F33] bg-[#F5F2EB]' 
        : isHighlighted 
          ? 'border-[#8B4513]/40 bg-white/40' 
          : 'border-[#8B4513]/10 bg-white/60'
    }`}
  >
    {isNextStep && (
      <motion.div 
        animate={{ opacity: [0.2, 0.5, 0.2] }} 
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-[#D4AF37]/5 pointer-events-none" 
      />
    )}
    <h3 className={`font-serif text-2xl md:text-4xl italic transition-colors duration-500 ${
      isNextStep ? 'text-[#966F33]' : 'text-[#2C1810]'
    }`}>
      {title}
    </h3>
    <p className={`text-[10px] tracking-[0.3em] uppercase transition-colors duration-500 font-bold ${
      isNextStep ? 'text-[#966F33]' : isHighlighted ? 'text-[#8B4513]/40' : 'text-[#8B4513]/60'
    }`}>
      {subtitle}
    </p>
    <div className={`h-px transition-all duration-700 ${
      isNextStep ? 'w-24 bg-[#966F33]' : 'w-6 bg-[#966F33]/20 group-hover:w-16'
    }`} />
  </motion.button>
);

export default App;

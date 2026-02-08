
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';

interface NarrativeGalleryProps {
  onComplete: () => void;
  onBack: () => void;
  onSlideChange?: (type: 'genesis' | 'image') => void;
}

const items = [
  {
    type: 'genesis' as const,
    id: 'gen1',
    title: "Zaczęło się od zmęczenia jazdą.",
    img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000",
    bg: '#F5F2EB', // Bone/Linen
    accent: '#5D4037', // Mahogany
    content: (
      <div className="space-y-4 md:space-y-8 text-xl sm:text-2xl md:text-3xl font-light leading-relaxed text-[#2C1810]/80 text-justify md:text-center max-w-5xl mx-auto px-4">
        <p>Dwoje muzyków, którzy spędzali życie w drodze do sal prób, koncertów, spotkań, pomyśleli: a gdyby tak przenieść muzykę bliżej? Zbudowali ten budynek, żeby nie musieć jeździć, ale szybko zrozumieli, że nie tylko chodzi o muzykę.</p>
        <p>To o przestrzeń dla ludzi, którzy myślą głębiej. Dla tych, którzy czują, że dzisiejszy świat ogłupia, ale się nie poddają – szukają, tworzą, rozmawiają.</p>
      </div>
    )
  },
  {
    type: 'genesis' as const,
    id: 'gen2',
    title: "Jądro świadomej wspólnoty.",
    img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2000",
    bg: '#EADDCA', // Champagne
    accent: '#8B4513', // Saddle
    content: (
      <div className="space-y-4 md:space-y-6 text-lg sm:text-xl md:text-2xl font-light leading-relaxed text-[#2C1810]/80 text-justify md:text-center max-w-5xl mx-auto px-4">
        <p>Akademia Dobrego Nastroju to pierwsze takie miejsce, gdzie ośrodek kultury dla masy jest przeciwieństwem.</p>
        <p className="text-[#8B4513] font-serif italic text-xl md:text-5xl py-2 md:py-6 drop-shadow-sm font-bold">Jesteśmy jądrem, które łączy elity – nie w sensie snobistycznym, ale w sensie ludzi świadomych, pracowitych, pełnych wiedzy i inteligencji życiowej.</p>
        <p>Ludzi, którzy chcą współpracować, tworzyć wspólnotę opartą na szacunku, pomysłowości i zaangażowaniu. Szukamy jednostek, które chcą być częścią tego miejsca.</p>
      </div>
    )
  },
  {
    type: 'image' as const,
    title: "Wejście – próg do innego świata",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
    bg: '#FAF0E6', // Linen
    desc: "Przekraczając te drzwi, zostawiasz za sobą pośpiech. Drewno, światło, faktura – wszystko mówi: „Tutaj możesz zwolnić”."
  },
  {
    type: 'image' as const,
    title: "Kawiarnia – tu zaczyna się rozmowa",
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200",
    bg: '#FDF5E6', // OldLace
    desc: "Lampy z nut, drewniany blat, zapach kawy. To miejsce, gdzie nie spieszy się nikomu. Tu nie \"załatwia się spraw\" – tu po prostu jest się sobą."
  },
  {
    type: 'image' as const,
    title: "Duża sala – przestrzeń dla głębi",
    img: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200",
    bg: '#FDFBF7', // Seashell variant
    desc: "Lustra, które mnożą światło. Solne lampy, które oczyszczają powietrze i myśli. Wspólne przeżywanie chwili."
  },
  {
    type: 'image' as const,
    title: "Kameralna sala – intymność dźwięku",
    img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200",
    bg: '#F1E9D2', // Parchment
    desc: "Dla tych momentów, kiedy muzyka, rozmowa czy poezja potrzebują bliskości. Cisza między nutami jest równie ważna jak one same."
  },
  {
    type: 'image' as const,
    title: "Detal – drewno, które pamięta",
    img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1200",
    bg: '#FAF0E6', // Linen
    desc: "Każda deska została wybrana z intencją. Drewno ma swoją historię, swoją ciepłotę. Ktoś tu myślał o każdym szczególe."
  },
  {
    type: 'image' as const,
    title: "Zakamarki – miejsca do odkrycia",
    img: "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?q=80&w=1200",
    bg: '#FDFBF7', // Alabaster
    desc: "Fotele, w których można zniknąć z książką. Akademia to żywe miejsce, które zmienia się razem z ludźmi, którzy tu bywają."
  }
];

const NarrativeGallery: React.FC<NarrativeGalleryProps> = ({ onComplete, onBack, onSlideChange }) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const lastTransitionTime = useRef(0);
  const COOLDOWN = 500;

  const next = useCallback(() => {
    if (index < items.length - 1) {
      setDirection(1);
      setIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  }, [index, onComplete]);

  const prev = useCallback(() => {
    if (index > 0) {
      setDirection(-1);
      setIndex(prev => prev - 1);
    }
  }, [index]);

  useEffect(() => {
    onSlideChange?.(items[index].type);
  }, [index, onSlideChange]);

  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastTransitionTime.current < COOLDOWN) return;

      if (e.deltaY > 20) {
        next();
        lastTransitionTime.current = now;
      } else if (e.deltaY < -20) {
        prev();
        lastTransitionTime.current = now;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTransitionTime.current < COOLDOWN) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      
      const diffY = touchStartY - touchEndY;
      const diffX = touchStartX - touchEndX;

      if (Math.abs(diffY) > 50 || Math.abs(diffX) > 50) {
        if (diffY > 50 || diffX > 50) {
          next();
        } else {
          prev();
        }
        lastTransitionTime.current = now;
      }
    };

    const container = document.getElementById('narrative-container');
    if (container) {
      container.addEventListener('wheel', handleWheel as any, { passive: true });
      container.addEventListener('touchstart', handleTouchStart as any, { passive: true });
      container.addEventListener('touchend', handleTouchEnd as any, { passive: true });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel as any);
        container.removeEventListener('touchstart', handleTouchStart as any);
        container.removeEventListener('touchend', handleTouchEnd as any);
      }
    };
  }, [next, prev]);

  const variants = {
    enter: (direction: number) => ({
      scale: 0.9,
      opacity: 0,
      filter: 'blur(10px)',
    }),
    center: {
      zIndex: 1,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      scale: 1.1,
      opacity: 0,
      filter: 'blur(10px)',
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  const currentItem = items[index];

  return (
    <div 
      id="narrative-container"
      className="relative h-screen w-full overflow-hidden perspective-container"
      style={{ touchAction: 'none', backgroundColor: currentItem.bg }}
    >
      <div className="fixed top-8 left-8 z-[110]">
        <button 
          onClick={onBack} 
          className="flex items-center space-x-2 text-[#8B4513] opacity-60 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={24} />
          {index === 0 && <span className="font-serif italic text-xl">Menu</span>}
        </button>
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex items-center justify-center p-4 md:p-12"
        >
          {currentItem.type === 'genesis' ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center text-[#2C1810] overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div 
                  className="absolute inset-0 bg-cover bg-center grayscale opacity-5"
                  style={{ backgroundImage: `url(${currentItem.img})` }}
                />
              </div>

              <div className="relative z-10 max-w-6xl mx-auto text-center space-y-4 md:space-y-6 px-6 flex flex-col items-center pt-8 md:pt-0 pointer-events-none">
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`font-serif italic leading-[1.1] text-[#5D4037] font-bold ${currentItem.id === 'gen1' ? 'text-4xl sm:text-6xl md:text-[7rem]' : 'text-4xl sm:text-6xl md:text-[6.5rem]'}`}
                >
                  {currentItem.title}
                </motion.h2>
                
                {currentItem.content}
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="pt-4 md:pt-8 flex flex-col items-center space-y-4 pointer-events-auto"
                >
                  {currentItem.id === 'gen2' ? (
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: '#8B4513', color: '#FFF' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); next(); }}
                      className="px-12 py-5 border-2 border-[#8B4513] text-[#8B4513] font-serif italic text-xl md:text-2xl rounded-sm flex items-center space-x-6 transition-all group shadow-md mt-2"
                    >
                      <span>Odkryj wnętrze</span>
                      <ChevronRight size={28} className="group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                  ) : (
                    <motion.div className="flex flex-col items-center space-y-4 group">
                      <p className="font-serif italic text-sm md:text-base tracking-[0.4em] uppercase text-[#8B4513]/40 group-hover:text-[#8B4513] transition-colors">Przeciągnij</p>
                      <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-px h-12 md:h-20 bg-gradient-to-b from-[#8B4513]/30 to-transparent"
                      />
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center w-full max-w-7xl h-full">
              <div className="relative order-1 md:order-none h-[35vh] md:h-auto">
                <div className="overflow-hidden rounded-sm shadow-2xl border border-[#8B4513]/5 aspect-[16/10] bg-white">
                  <img 
                    src={currentItem.img} 
                    alt={currentItem.title} 
                    className="w-full h-full object-cover transition-all duration-1000"
                  />
                </div>
              </div>
              
              <div className="text-left space-y-6 md:space-y-12 order-2 md:order-none px-4">
                <div className="space-y-4">
                  <h3 className="text-3xl sm:text-4xl md:text-6xl font-serif text-[#2C1810] italic leading-tight">
                    {currentItem.title}
                  </h3>
                  <div className="w-20 h-px bg-[#8B4513]/30" />
                </div>
                
                <p className="text-lg sm:text-xl md:text-3xl font-light text-[#2C1810]/60 italic leading-relaxed">
                  {currentItem.desc}
                </p>
                
                <div className="flex space-x-4 pt-6">
                   <button
                    onClick={prev}
                    className="p-4 border border-[#8B4513]/10 text-[#8B4513]/40 hover:text-[#8B4513] hover:border-[#8B4513] transition-all rounded-sm bg-white/50"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={next}
                    className="px-6 md:px-10 py-4 border border-[#8B4513]/20 text-[#8B4513] font-serif italic text-lg md:text-xl flex items-center space-x-4 hover:bg-[#8B4513] hover:text-white transition-all rounded-sm flex-1 justify-center group shadow-sm bg-white/80"
                  >
                    <span className="opacity-60 group-hover:opacity-100 uppercase tracking-widest">{index === items.length - 1 ? "Zakończ" : "Dalej"}</span>
                    <ChevronRight size={24} className="opacity-40 group-hover:opacity-100" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default NarrativeGallery;

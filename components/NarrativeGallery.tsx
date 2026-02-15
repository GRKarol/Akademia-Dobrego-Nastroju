import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowLeft, ArrowRight } from 'lucide-react';

interface NarrativeGalleryProps {
  onComplete: () => void;
  onBack: () => void;
  onSlideChange?: (type: 'genesis' | 'image') => void;
}

const items = [
 {
  type: 'genesis',
  id: 'gen1',
  title: "Zaczęło się od zmęczenia jazdą.",
  img: "budynek.jpg",
  bg: '#F5F2EB', 
  content: (
    <div className="space-y-3 md:space-y-6 text-sm sm:text-base md:text-xl lg:text-2xl font-light leading-relaxed text-[#1A0F0A] text-center max-w-5xl mx-auto px-4 italic">
      <p>Dwoje muzyków, którzy spędzali życie w drodze do sal prób, koncertów, spotkań, pomyśleli: a gdyby tak przenieść muzykę bliżej?</p>
      <p>Zbudowali ten budynek, żeby nie musieć jeździć, ale szybko zrozumieli, że nie tylko chodzi o muzykę. To o przestrzeń dla ludzi, którzy myślą głębiej. Dla tych, którzy czują, że dzisiejszy świat ogłupia, ale se nie poddają – szukają, tworzą, rozmawiają.</p>
      <div className="pt-3 md:pt-4">
        <div className="px-6 py-4 md:px-12 md:py-8 bg-[#8B4513]/5 border border-[#8B4513]/10 rounded-sm shadow-sm inline-block">
          <p className="text-[#1A0F0A] font-bold not-italic text-xs sm:text-sm md:text-xl lg:text-2xl uppercase tracking-tight">Akademia Dobrego Nastroju to pierwsze takie miejsce, gdzie w ośrodku kultury nie liczy się ilość, a jakość.</p>
        </div>
      </div>
    </div>
  )
},

  {
  type: 'genesis',
  id: 'gen2',
  title: "Jądro świadomej wspólnoty.",
  img: "kawiarnia.jpg",
  bg: '#EADDCA', 
  content: (
    <div className="space-y-3 md:space-y-6 text-sm sm:text-base md:text-2xl font-light leading-relaxed text-[#1A0F0A] text-center max-w-5xl mx-auto px-4">
      <p className="text-[#8B4513] font-serif italic text-lg sm:text-xl md:text-3xl lg:text-4xl py-2 md:py-4 drop-shadow-sm font-bold leading-tight">
        Jesteśmy jądrem, które łączy elity – nie w sensie snobistycznym, ale w sensie ludzi świadomych, pracowitych, pełnych wiedzy i inteligencji życiowej.
      </p>
      <p className="text-base sm:text-lg md:text-2xl lg:text-3xl opacity-90 leading-relaxed font-medium">
        Ludzi, którzy chcą współpracować, tworzyć wspólnotę opartą na szacunku, pomysłowości i zaangażowaniu. Nie spieszymy się. Nie szukamy liczb. Szukamy jednostek, które czują klimat tego miejsca – i chcą być jego częścią.
      </p>
    </div>
  ),
  hasButton: true,
  buttonText: "Wejdź do środka"
},

  {
    type: 'image',
    title: "Wejście – próg do innego świata",
    img: "budynek.jpg",
    bg: '#FAF0E6', 
    desc: "Przekraczając te drzwi, zostawiasz za sobą pośpiech. Drewno, światło, faktura – wszystko mówi: „Tutaj możesz zwolnić\". To nie jest miejsce, do którego wpada się na chwilę. Tu się zostaje."
  },
  {
    type: 'image',
    title: "Kawiarnia – tu zaczyna się rozmowa",
    img: "kawiarnia.jpg",
    bg: '#FDF5E6', 
    desc: "Lampy z nut, drewniany blat, zapach kawy. To miejsce, gdzie nie spieszy się nikomu. Tu nie \"załatwia się spraw\" – tu po prostu jest się sobą, w towarzystwie ludzi, którzy słuchają tak samo uważnie, jak mówią."
  },
  {
    type: 'image',
    title: "Duża sala – przestrzeń dla głębi",
    img: "sala.jpg",
    bg: '#FDFBF7', 
    desc: "Lustra, które mnożą światło. Solne lampy, które oczyszczają powietrze i myśli. W tej sali odbywają się koncerty, wykłady, spotkania, zajęcia – ale przede wszystkim dzieje się coś trudnego do nazwania: wspólne przeżywanie chwili."
  },
  {
    type: 'image',
    title: "Kameralna sala – intymność dźwięku",
    img: "kameralna.jpg",
    bg: '#FDFBF7', 
    desc: "Dla tych momentów, kiedy muzyka, rozmowa czy poezja potrzebują bliskości. Tu fortepian brzmi inaczej, słowa znaczą więcej, a cisza między nutami jest równie ważna jak one same."
  },
  {
    type: 'image',
    title: "Detal – drewno, które pamięta",
    img: "detal.jpg",
    bg: '#F5F5F5', 
    desc: "Każda deska, każdy element wystroju został wybrany z intencją. Drewno ma swoją historię, swoją ciepłotę. Dotykając go, czujesz, że ktoś tu myślał o każdym szczególe – nie dla efektu, ale dla ciebie."
  },
  {
    type: 'image',
    title: "Zakamarki – miejsca do odkrycia",
    img: "zakamarki.jpg",
    bg: '#FAF0E6', 
    desc: "Są tu detale, o których nie mówi się od razu. Fotele, w których można zniknąć z książką. Zakamarki, które mają znaczenie. Akademia to żywe miejsce, które zmienia się razem z ludźmi, którzy tu bywają."
  }
];

const NarrativeGallery: React.FC<NarrativeGalleryProps> = ({ onComplete, onBack, onSlideChange }) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const lastTransitionTime = useRef(0);
  const touchStart = useRef<number | null>(null);
  const COOLDOWN = 600;

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
    onSlideChange?.(items[index].type as 'genesis' | 'image');
  }, [index, onSlideChange]);

  // Unified Scroll/Touch Handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastTransitionTime.current < COOLDOWN) return;
      if (Math.abs(e.deltaY) < 40) return;
      if (e.deltaY > 0) next(); else prev();
      lastTransitionTime.current = now;
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStart.current === null) return;
      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStart.current - touchEnd;
      const now = Date.now();
      
      if (now - lastTransitionTime.current < COOLDOWN) return;
      
      if (Math.abs(diff) > 50) { // Threshold for swipe
        if (diff > 0) next(); else prev();
        lastTransitionTime.current = now;
      }
      touchStart.current = null;
    };

    const container = document.getElementById('narrative-container');
    if (container) {
      container.addEventListener('wheel', handleWheel as any, { passive: true });
      container.addEventListener('touchstart', handleTouchStart as any, { passive: true });
      container.addEventListener('touchend', handleTouchEnd as any, { passive: true });
    }
    return () => {
      container?.removeEventListener('wheel', handleWheel as any);
      container?.removeEventListener('touchstart', handleTouchStart as any);
      container?.removeEventListener('touchend', handleTouchEnd as any);
    };
  }, [next, prev]);

  const currentItem = items[index] as any;

  return (
    <div 
      id="narrative-container"
      className="relative h-screen w-full overflow-hidden flex flex-col selection:bg-[#8B4513] selection:text-white"
      style={{ backgroundColor: currentItem.bg }}
    >
      <div className="fixed top-6 left-6 md:top-10 md:left-10 z-[110]">
        <button 
          onClick={onBack} 
          className="flex items-center space-x-3 text-[#8B4513] opacity-50 hover:opacity-100 transition-all group"
        >
          <div className="p-2 border border-[#8B4513]/20 rounded-full group-hover:bg-[#8B4513] group-hover:text-white transition-all">
            <ArrowLeft size={20} />
          </div>
          <span className="font-serif italic text-lg md:text-xl hidden sm:inline">Powrót</span>
        </button>
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={index}
          custom={direction}
          initial={{ opacity: 0, y: direction > 0 ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: direction > 0 ? -20 : 20 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-start p-6 md:p-12 overflow-y-auto no-scrollbar"
        >
          {currentItem.type === 'genesis' ? (
            <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-start min-h-full pt-16 sm:pt-28 md:pt-40 pb-12">
              <h2 className="font-serif italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#5D4037] font-bold leading-[1.1] text-center mb-6 md:mb-10">
                {currentItem.title}
              </h2>
              <div className="w-full flex flex-col items-center">
                {currentItem.content}
                {currentItem.hasButton && (
                  <div className="flex flex-col items-center mt-6 md:mt-10">
                    <button 
                      onClick={next}
                      className="group relative px-10 py-4 md:px-14 md:py-5 bg-[#8B4513] text-white font-serif italic text-lg md:text-xl rounded-sm shadow-2xl hover:bg-[#966F33] transition-all transform hover:-translate-y-1 flex items-center space-x-4 md:space-x-6 overflow-hidden"
                    >
                      <span className="relative z-10">{currentItem.buttonText}</span>
                      <ArrowRight size={24} className="relative z-10 group-hover:translate-x-3 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
              {!currentItem.hasButton && (
                <div className="mt-8 md:mt-12 flex flex-col items-center space-y-2 md:space-y-4">
                  <p className="text-[#8B4513]/30 font-serif italic text-sm md:text-base tracking-[0.4em] uppercase">przewiń dalej</p>
                  <div className="w-px h-8 md:h-12 bg-gradient-to-b from-[#8B4513]/30 to-transparent" />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center w-full max-w-7xl py-12 h-full">
              <div className="relative aspect-video lg:aspect-[4/5] w-full rounded-sm shadow-2xl border border-[#8B4513]/10 overflow-hidden bg-white">
                <img src={currentItem.img} loading="lazy" className="w-full h-full object-cover" alt={currentItem.title} />
              </div>
              <div className="flex flex-col justify-center space-y-6 md:space-y-10">
                <h3 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif text-[#1A0F0A] italic leading-[1.1] font-bold">{currentItem.title}</h3>
                <p className="text-lg md:text-2xl lg:text-3xl font-light text-[#1A0F0A]/70 italic leading-relaxed">{currentItem.desc}</p>
                <div className="flex items-center space-x-4 pt-6 md:pt-10">
                   <button onClick={prev} className="p-4 md:p-5 border border-[#8B4513]/10 text-[#8B4513]/40 hover:text-[#8B4513] rounded-sm bg-white/40"><ChevronLeft size={28} /></button>
                   <button onClick={next} className="flex-1 px-8 py-4 md:px-12 md:py-5 bg-[#8B4513] text-white font-serif italic text-xl md:text-2xl rounded-sm shadow-xl hover:bg-[#966F33] transition-all">{index === items.length - 1 ? "Dołącz" : "Dalej"}</button>
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


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';

interface NarrativeGalleryProps {
  onComplete: () => void;
  onBack: () => void;
  onSlideChange?: (type: 'genesis' | 'image') => void;
}

// ==========================================
// TUTAJ PODMIEŃ LINKI DO SWOICH ZDJĘĆ:
// ==========================================
const items = [
  {
    type: 'genesis' as const,
    id: 'gen1',
    title: "Zaczęło się od zmęczenia jazdą.",
    img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2000",
    bg: '#F5F2EB', 
    content: (
      <div className="space-y-4 md:space-y-8 text-xl sm:text-2xl md:text-3xl font-light leading-relaxed text-[#2C1810]/80 text-center max-w-5xl mx-auto px-4 italic">
        <p>Dwoje muzyków, którzy spędzali życie w drodze do sal prób, koncertów i spotkań, pomyśleli: a gdyby tak przenieść muzykę bliżej?</p>
        <p>Zbudowali ten budynek, żeby nie musieć jeździć, ale szybko zrozumieli, że nie tylko o muzykę tutaj chodzi.</p>
      </div>
    )
  },
  {
    type: 'genesis' as const,
    id: 'gen2',
    title: "Jądro świadomej wspólnoty.",
    img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2000",
    bg: '#EADDCA', 
    content: (
      <div className="space-y-4 md:space-y-6 text-lg sm:text-xl md:text-2xl font-light leading-relaxed text-[#2C1810]/80 text-center max-w-5xl mx-auto px-4">
        <p className="text-[#8B4513] font-serif italic text-2xl md:text-5xl py-2 md:py-6 drop-shadow-sm font-bold">Jesteśmy jądrem, które łączy elity – ludzi świadomych, pracowitych i inteligentnych życiowo.</p>
        <p>Ludzi, którzy chcą tworzyć wspólnotę opartą na szacunku i pomysłowości. Szukamy jednostek, które czują ten unikalny klimat.</p>
      </div>
    )
  },
  {
    type: 'image' as const,
    title: "Wejście – próg do innego świata",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
    bg: '#FAF0E6', 
    desc: "Przekraczając te drzwi, zostawiasz za sobą pośpiech świata. Drewno i światło zapraszają Cię do środka."
  },
  {
    type: 'image' as const,
    title: "Kawiarnia – serce rozmów",
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200",
    bg: '#FDF5E6', 
    desc: "Tu czas płynie wolniej. Przy zapachu kawy i dźwiękach jazzu rodzą się najlepsze pomysły."
  },
  {
    type: 'image' as const,
    title: "Duża sala – przestrzeń dla głębi",
    img: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200",
    bg: '#FDFBF7', 
    desc: "Miejsce, w którym kultura spotyka się z autentycznością. Wspólne przeżywanie sztuki w jej czystej formie."
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
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastTransitionTime.current < COOLDOWN) return;
      if (Math.abs(e.deltaY) < 30) return;
      if (e.deltaY > 0) next(); else prev();
      lastTransitionTime.current = now;
    };
    const container = document.getElementById('narrative-container');
    if (container) container.addEventListener('wheel', handleWheel as any, { passive: true });
    return () => container?.removeEventListener('wheel', handleWheel as any);
  }, [next, prev]);

  const currentItem = items[index];

  return (
    <div 
      id="narrative-container"
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: currentItem.bg }}
    >
      <div className="fixed top-8 left-8 z-[110]">
        <button onClick={onBack} className="flex items-center space-x-2 text-[#8B4513] opacity-60 hover:opacity-100 transition-opacity">
          <ArrowLeft size={24} />
          {index === 0 && <span className="font-serif italic text-xl">Powrót do Menu</span>}
        </button>
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={index}
          custom={direction}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center p-4 md:p-12"
        >
          {currentItem.type === 'genesis' ? (
            <div className="max-w-6xl mx-auto text-center space-y-8 flex flex-col items-center">
              <h2 className="font-serif italic text-5xl md:text-[8rem] text-[#5D4037] font-bold leading-tight">
                {currentItem.title}
              </h2>
              {currentItem.content}
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#8B4513', color: '#FFF' }}
                onClick={next}
                className="px-12 py-5 border-2 border-[#8B4513] text-[#8B4513] font-serif italic text-2xl rounded-sm mt-8 shadow-md"
              >
                Poznaj to miejsce
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center w-full max-w-7xl">
              <div className="rounded-sm shadow-2xl border border-[#8B4513]/10 overflow-hidden bg-white">
                <img src={currentItem.img} className="w-full aspect-[16/10] object-cover" alt={currentItem.title} />
              </div>
              <div className="space-y-12 px-4">
                <h3 className="text-4xl md:text-7xl font-serif text-[#2C1810] italic leading-tight">{currentItem.title}</h3>
                <p className="text-xl md:text-3xl font-light text-[#2C1810]/60 italic leading-relaxed">{currentItem.desc}</p>
                <div className="flex space-x-4">
                   <button onClick={prev} className="p-4 border border-[#8B4513]/10 text-[#8B4513]/40 hover:text-[#8B4513] transition-all rounded-sm bg-white/50"><ChevronLeft size={32} /></button>
                   <button onClick={next} className="px-10 py-4 border border-[#8B4513] text-white bg-[#8B4513] font-serif italic text-xl flex-1 rounded-sm shadow-lg hover:bg-[#966F33] transition-all">
                    {index === items.length - 1 ? "Dołącz do nas" : "Idź dalej"}
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

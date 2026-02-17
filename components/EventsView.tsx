import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, Variants } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Sparkles, History, ChevronRight, ChevronLeft } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface AdnEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string;
  timestamp: number;
  order: number;
}

interface EventsViewProps {
  onBack: () => void;
}

const EventsView: React.FC<EventsViewProps> = ({ onBack }) => {
  const [adnEvents, setAdnEvents] = useState<AdnEvent[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Scroll locking logic during entry animation - extended to 1s as requested
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      document.body.style.overflow = 'auto';
    }, 1000); 
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, "adn_events"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const evs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AdnEvent[];
      setAdnEvents(evs);
    });
    return () => unsub();
  }, []);

const FOUR_WEEKS_MS = 2419200000;
const now = Date.now();

// ✅ Aktywne: NIE zarchiwizowane ORAZ młodsze niż 4 tygodnie
const activeEvents = adnEvents.filter(e => 
  !e.isArchived && (now - e.timestamp < FOUR_WEEKS_MS)
);

// ✅ Archiwalne: zarchiwizowane ALBO starsze niż 4 tygodnie
const archivedEvents = adnEvents.filter(e => 
  e.isArchived || (now - e.timestamp >= FOUR_WEEKS_MS)
);

  const nextEvent = () => {
    setDirection(1);
    setActiveIndex(p => (p + 1) % activeEvents.length);
  };
  
  const prevEvent = () => {
    setDirection(-1);
    setActiveIndex(p => (p - 1 + activeEvents.length) % activeEvents.length);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      nextEvent();
    } else if (info.offset.x > threshold) {
      prevEvent();
    }
  };

  const variants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1] as const
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1] as const
      }
    })
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#2C1810] overflow-y-auto no-scrollbar relative">
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8B4513]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-6 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 space-y-6 md:space-y-0">
          <div className="space-y-4">
            <button onClick={onBack} className="flex items-center space-x-3 text-[#8B4513]/40 hover:text-[#8B4513] transition-all group mb-2">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-serif italic text-lg uppercase tracking-widest">Wróć</span>
            </button>
            <h1 className="font-serif text-5xl md:text-8xl leading-none text-[#2C1810]">
              Nasze <br /> <span className="italic text-[#966F33]">Wydarzenia</span>
            </h1>
          </div>
        </div>

        {/* AKTUALNE WYDARZENIA */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8 border-b border-[#2C1810]/5 pb-4">
            <div className="flex items-center space-x-4">
              <Sparkles className="text-[#966F33]" size={20} />
              <h2 className="text-sm uppercase tracking-[0.4em] text-[#966F33] font-bold">Najnowsze Eventy</h2>
            </div>
            {activeEvents.length > 1 && (
              <div className="flex space-x-4">
                <button onClick={prevEvent} className="p-2 border border-[#2C1810]/10 bg-white/50 text-[#2C1810]/40 hover:text-[#966F33] transition-all"><ChevronLeft size={24}/></button>
                <button onClick={nextEvent} className="p-2 border border-[#2C1810]/10 bg-white/50 text-[#2C1810]/40 hover:text-[#966F33] transition-all"><ChevronRight size={24}/></button>
              </div>
            )}
          </div>

          <div className="relative min-h-[400px]">
            {activeEvents.length > 0 ? (
              <div className="relative overflow-visible">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div 
                    key={activeEvents[activeIndex]?.id}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start bg-white border border-[#8B4513]/10 p-6 md:p-12 rounded-sm shadow-xl cursor-grab active:cursor-grabbing"
                  >
                    <div className="space-y-6 select-none">
                      <h3 className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight text-[#2C1810] italic font-bold uppercase break-words hyphens-auto">{activeEvents[activeIndex].title}</h3>
                      <div className="text-[#2C1810]/60 font-light text-base md:text-lg leading-relaxed whitespace-pre-wrap">{activeEvents[activeIndex].description}</div>
                      <div className="pt-8 flex flex-wrap gap-8 border-t border-[#2C1810]/10">
                       <div className="flex items-center space-x-3 group/info">
  <Calendar size={20} className="text-[#966F33]" />
  <span className="font-serif italic text-sm md:text-lg text-[#2C1810]/80">{activeEvents[activeIndex].date}</span>
</div>
                        <div className="flex items-center space-x-3 group/info">
                          <MapPin size={20} className="text-[#966F33]" />
                          <span className="font-serif italic text-sm md:text-lg text-[#2C1810]/80">{activeEvents[activeIndex].location}</span>
                        </div>
                      </div>
                    </div>
                 {activeEvents[activeIndex].image && (
  <div className="relative w-full aspect-square md:aspect-auto h-auto overflow-hidden rounded-sm border border-[#2C1810]/5 bg-white p-2">
    <img 
      src={activeEvents[activeIndex].image} 
      className="w-full h-full object-cover block rounded-sm grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
      alt={activeEvents[activeIndex].title}
    />
  </div>
)}
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              <div className="w-full py-24 border border-dashed border-[#2C1810]/20 rounded-sm text-center bg-white/20">
                 <p className="font-serif italic text-2xl text-[#2C1810]/30 mb-4">Cisza w kalendarzu...</p>
              </div>
            )}
          </div>
        </section>

        {/* SEPARATOR WIZUALNY */}
        <div className="flex items-center justify-center my-24 overflow-hidden px-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#966F33]/30 to-transparent" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mx-8 text-[#966F33]/30 font-serif italic text-4xl"
          >
            ❦
          </motion.div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#966F33]/30 to-transparent" />
        </div>

        {/* ARCHIWUM WYDARZEŃ */}
        <section className="pb-32">
          <div className="bg-white border border-[#2C1810]/10 rounded-sm overflow-hidden shadow-xl">
            <div className="px-8 py-10 border-b border-[#2C1810]/10 bg-[#FAF9F6] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#966F33]/10 rounded-full text-[#966F33]">
                  <History size={24} />
                </div>
                <div>
                  <h2 className="font-serif text-3xl md:text-4xl italic text-[#2C1810]">Kronika Minionych Chwil</h2>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-[#2C1810]/40 mt-1">Archiwum wspomnień Akademii</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-[#2C1810]/60 text-[10px] uppercase tracking-widest font-bold border border-[#2C1810]/20 px-4 py-2 rounded-full bg-white/50">
                <span>{archivedEvents.length} {archivedEvents.length === 1 ? 'zapis' : 'zapisów'}</span>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-6 md:p-10 bg-white">
              {archivedEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {archivedEvents.map((ev, i) => (
  <motion.div 
    key={ev.id} 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05 }}
    className="group bg-[#FAF9F6] border border-[#8B4513]/10 rounded-sm hover:border-[#966F33]/40 hover:shadow-xl transition-all duration-500 relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[#966F33]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    
    {/* ✅ NOWA SEKCJA ZDJĘĆ */}
    {ev.image && (
      <div className="relative w-full h-48 overflow-hidden">
        <img 
          src={ev.image} 
          alt={ev.title}
          className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
        />
      </div>
    )}
    
    <div className="relative z-10 p-8">
      <div className="flex justify-between items-start mb-6">
        <p className="text-[#966F33]/60 text-[9px] uppercase tracking-widest font-bold border-l-2 border-[#966F33]/30 pl-3">{ev.date}</p>
        <History size={14} className="text-[#2C1810]/10 group-hover:text-[#966F33]/40 transition-colors" />
      </div>
      
      <h4 className="font-serif text-2xl text-[#2C1810]/80 italic mb-4 group-hover:text-[#2C1810] transition-colors uppercase font-bold">{ev.title}</h4>
      <p className="text-[#2C1810]/40 text-sm font-light leading-relaxed line-clamp-3 italic group-hover:text-[#2C1810]/70 transition-colors">{ev.description}</p>
      
      <div className="mt-8 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
        <div className="h-px flex-1 bg-[#2C1810]/10" />
        <span className="text-[8px] uppercase tracking-[0.3em] text-[#966F33]/50">Zapis archiwalny</span>
      </div>
    </div>
  </motion.div>
))}

                </div>
              ) : (
                <div className="w-full py-32 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <History size={48} className="text-[#2C1810]" />
                  <p className="font-serif italic text-2xl tracking-wide text-[#2C1810]">Strony tej księgi czekają na zapis...</p>
                </div>
              )}
            </div>
            
            <div className="px-8 py-6 border-t border-[#2C1810]/10 bg-[#FAF9F6] text-center">
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#2C1810]/30 italic">Historia, która buduje naszą przyszłość</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventsView;

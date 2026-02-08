import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// KONFIGURACJA MUZYKI:
const MY_MUSIC_URL = '/muzyka.mp3';
// ==========================================

interface MusicPlayerProps {
  isVisible?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isVisible = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(MY_MUSIC_URL);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.2;
      
      // ZMIANA 1: 'metadata' zamiast 'auto' - nie ładuje całego pliku z góry
      audioRef.current.preload = 'metadata';
      
      // ZMIANA 2: Możesz grać jak tylko jest trochę bufora
      audioRef.current.oncanplay = () => {
        console.log("✅ Można zacząć odtwarzanie!");
        setCanPlay(true);
      };
      
      // Progress ładowania (opcjonalnie)
      audioRef.current.onprogress = () => {
        if (audioRef.current?.buffered.length > 0) {
          const buffered = audioRef.current.buffered.end(0);
          const duration = audioRef.current.duration;
          if (duration > 0) {
            setLoadProgress(Math.round((buffered / duration) * 100));
          }
        }
      };
      
      audioRef.current.onerror = (e) => {
        console.error("❌ BŁĄD: Nie można załadować pliku muzyka.mp3", e);
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // Zwolnij pamięć
        audioRef.current = null;
      }
    };
  }, []);

  const toggle = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      if (playPromiseRef.current !== null) {
        try {
          await playPromiseRef.current;
          audioRef.current.pause();
        } catch (error) {
          console.debug("Audio play promise rejected", error);
        } finally {
          playPromiseRef.current = null;
        }
      } else {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      try {
        // ZMIANA 3: Zacznij ładować dopiero jak użytkownik kliknie
        if (audioRef.current.readyState < 2) {
          audioRef.current.load();
        }
        
        const playPromise = audioRef.current.play();
        playPromiseRef.current = playPromise;
        setIsPlaying(true);
        await playPromise;
        playPromiseRef.current = null;
        setCanPlay(true);
      } catch (error) {
        console.error("Nie można odtworzyć muzyki:", error);
        setIsPlaying(false);
        playPromiseRef.current = null;
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed top-8 right-8 z-[200] flex items-center space-x-6"
        >
          <div className="hidden md:block overflow-hidden text-right">
            <motion.p 
              animate={isPlaying ? { x: [-250, 350] } : {}}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="text-[9px] uppercase tracking-[0.5em] text-[#966F33] whitespace-nowrap font-bold"
            >
              {isPlaying ? "Sesja Dobrego Nastroju • Ambient Piano Journey • " : "Cisza przed podróżą"}
            </motion.p>
          </div>
          
          {/* ZMIANA 4: Pokazuj progress ładowania */}
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.1, backgroundColor: '#EADDCA' }}
            whileTap={{ scale: 0.9 }}
            className="relative w-14 h-14 flex items-center justify-center border border-[#966F33]/30 rounded-full text-[#966F33] bg-white/70 backdrop-blur-md shadow-2xl transition-colors overflow-hidden"
          >
            {/* Progress ring - pokazuje się tylko podczas ładowania */}
            {isPlaying && !canPlay && loadProgress > 0 && loadProgress < 100 && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="#966F33"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${(loadProgress / 100) * 150.8} 150.8`}
                  opacity="0.3"
                />
              </svg>
            )}
            
            {isPlaying ? (
              <div className="flex space-x-1 items-end h-4 z-10">
                {[1,2,3,4,5].map(i => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [4, 14, 6, 14, 4] }} 
                    transition={{ duration: 1.2, repeat: Infinity, delay: i*0.2 }} 
                    className="w-0.5 bg-[#966F33]" 
                  />
                ))}
              </div>
            ) : (
              <span className="text-2xl z-10">𝄞</span>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MusicPlayer;

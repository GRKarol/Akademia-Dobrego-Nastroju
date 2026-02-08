import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// KONFIGURACJA MUZYKI:
// Dla pliku w folderze public, używamy ścieżki bezwzględnej
const MY_MUSIC_URL = '/muzyka.mp3';
// ==========================================

interface MusicPlayerProps {
  isVisible?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isVisible = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(MY_MUSIC_URL);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.2;
      audioRef.current.preload = 'auto';
      
      audioRef.current.oncanplaythrough = () => {
        console.log("✅ Muzyka załadowana poprawnie!");
        setIsLoaded(true);
      };
      
      audioRef.current.onerror = (e) => {
        console.error("❌ BŁĄD: Nie można załadować pliku muzyka.mp3", e);
        console.error("Sprawdź czy plik znajduje się w folderze public/");
      };

      // Załaduj plik
      audioRef.current.load();
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggle = async () => {
    if (!audioRef.current || !isLoaded) {
      console.warn("Muzyka jeszcze się ładuje...");
      return;
    }

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
        const playPromise = audioRef.current.play();
        playPromiseRef.current = playPromise;
        setIsPlaying(true);
        await playPromise;
        playPromiseRef.current = null;
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
              {isPlaying ? "Sesja Dobrego Nastroju • Ambient Piano Journey • " : isLoaded ? "Cisza przed podróżą" : "Ładowanie muzyki..."}
            </motion.p>
          </div>
          <motion.button
            onClick={toggle}
            disabled={!isLoaded}
            whileHover={{ scale: isLoaded ? 1.1 : 1, backgroundColor: isLoaded ? '#EADDCA' : undefined }}
            whileTap={{ scale: isLoaded ? 0.9 : 1 }}
            className={`w-14 h-14 flex items-center justify-center border border-[#966F33]/30 rounded-full text-[#966F33] bg-white/70 backdrop-blur-md shadow-2xl transition-colors ${!isLoaded ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isPlaying ? (
              <div className="flex space-x-1 items-end h-4">
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
              <span className="text-2xl">𝄞</span>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MusicPlayer;

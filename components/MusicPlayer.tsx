
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// KONFIGURACJA MUZYKI:
// 1. Upewnij się, że plik z muzyką znajduje się w tym samym folderze co index.html
// 2. Nazwij go dokładnie: white-lady.mp3
const MY_MUSIC_URL = './white-lady.mp3'; 
// ==========================================

interface MusicPlayerProps {
  isVisible?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isVisible = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(MY_MUSIC_URL);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25; // Idealny poziom dla melancholijnego tła
    }
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
        const playPromise = audioRef.current.play();
        playPromiseRef.current = playPromise;
        setIsPlaying(true);
        await playPromise;
        playPromiseRef.current = null;
      } catch (error) {
        console.error("Audio playback failed. Sprawdź czy plik white-lady.mp3 istnieje w folderze głównym.", error);
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
              animate={isPlaying ? { x: [-200, 300] } : {}}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="text-[9px] uppercase tracking-[0.5em] text-[#966F33] whitespace-nowrap font-bold"
            >
              {isPlaying ? "Hollow Knight OST • The White Lady • Pure Soul Session • " : "Cisza przed podróżą"}
            </motion.p>
          </div>
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.1, backgroundColor: '#EADDCA' }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 flex items-center justify-center border border-[#966F33]/30 rounded-full text-[#966F33] bg-white/70 backdrop-blur-md shadow-2xl transition-colors"
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

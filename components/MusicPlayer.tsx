import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MY_MUSIC_URL = 'https://landingpage.progressio.giize.com/muzyka.mp3';

interface MusicPlayerProps {
  isVisible?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isVisible = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(() => {
    return localStorage.getItem('adn_music_interacted') === 'true';
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(MY_MUSIC_URL);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.2;
      
      audioRef.current.onerror = () => {
        console.error("BŁĄD: Nie można załadować pliku audio.");
      };
    }
  }, []);

  const toggle = async () => {
    if (!audioRef.current) return;

    if (!hasInteracted) {
      setHasInteracted(true);
      localStorage.setItem('adn_music_interacted', 'true');
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
        console.error("Playback failed:", error);
        setIsPlaying(false);
        playPromiseRef.current = null;
      }
    }
  };

  const marqueeText = "MUZYKA DOBREGO NASTROJU • ";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed top-6 right-6 md:top-8 md:right-8 z-[200] flex items-center space-x-3 md:space-x-6"
        >
          <div className="overflow-hidden text-right max-w-[150px] md:max-w-none">
            {isPlaying ? (
              <div className="relative w-full overflow-hidden">
                <div className="animate-marquee whitespace-nowrap">
                  <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] text-[#966F33] font-bold px-4">
                    {marqueeText}
                  </span>
                  <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] text-[#966F33] font-bold px-4">
                    {marqueeText}
                  </span>
                </div>
              </div>
            ) : (
              !hasInteracted && (
                <p className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.4em] text-[#966F33] font-bold italic">
                  ZATRYMAJ SIĘ NA CHWILĘ... DOTKNIJ KLUCZA WIOLINOWEGO
                </p>
              )
            )}
          </div>
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.1, backgroundColor: '#EADDCA' }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center border border-[#966F33]/30 rounded-full text-[#966F33] bg-white/70 backdrop-blur-md shadow-2xl transition-colors"
          >
            {isPlaying ? (
              <div className="flex space-x-1 items-end h-3 md:h-4">
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
              <span className="text-base md:text-2xl">𝄞</span>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MusicPlayer;

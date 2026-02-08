
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MusicPlayerProps {
  isVisible?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isVisible = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Inicjalizacja audio
  useEffect(() => {
    if (!audioRef.current) {
      // Wybrano inny, często bardziej dostępny utwór z SoundHelix
      audioRef.current = new Audio('/Hollow Knight OST - The White Lady (Full Version).mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15;
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
          console.debug("Audio play promise rejected, ignoring pause sync", error);
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
        console.error("Audio playback failed or was interrupted:", error);
        setIsPlaying(false);
        playPromiseRef.current = null;
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-8 right-8 z-[200] flex items-center space-x-6"
        >
          <div className="hidden md:block overflow-hidden text-right">
            <motion.p 
              animate={isPlaying ? { x: [-100, 200] } : {}}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="text-[10px] uppercase tracking-[0.4em] text-[#2C1810]/40 whitespace-nowrap"
            >
              {isPlaying ? "Jazz Asylum Session • Klimat Duszy • " : "Cisza przed akordem"}
            </motion.p>
          </div>
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 flex items-center justify-center border border-[#966F33]/20 rounded-full text-[#966F33] bg-white/50 backdrop-blur-sm shadow-xl"
          >
            {isPlaying ? (
              <div className="flex space-x-1 items-end h-3">
                {[1,2,3,4].map(i => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [4, 12, 6, 12, 4] }} 
                    transition={{ duration: 0.5, repeat: Infinity, delay: i*0.1 }} 
                    className="w-0.5 bg-[#966F33]" 
                  />
                ))}
              </div>
            ) : "𝄞"}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MusicPlayer;

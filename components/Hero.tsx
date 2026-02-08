
import React from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-start md:justify-center overflow-hidden bg-[#F5F2EB]">
      {/* Klimatyczne Wideo w tle - Grayscale dla elegancji */}
      <div className="absolute inset-x-0 top-0 h-[80vh] z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-[0.25]"
          src="https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-person-playing-the-piano-in-a-4934-large.mp4"
        >
          {/* Fallback dla starszych przeglądarek */}
          <source src="https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-person-playing-the-piano-in-a-4934-large.mp4" type="video/mp4" />
          Twoja przeglądarka nie wspiera wideo.
        </video>
        {/* Ciepły gradient łączący wideo z kolorem Champagne tła */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F5F2EB]/30 to-[#F5F2EB]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl relative z-20 px-6 flex flex-col items-center pt-24 md:pt-0"
      >
        <h1 className="font-serif text-7xl sm:text-8xl md:text-[10rem] text-[#2C1810] mb-10 md:mb-12 leading-[0.85] drop-shadow-sm text-center">
          Akademia <br /> 
          <span className="italic font-normal text-[#966F33]">Dobrego Nastroju</span>
        </h1>
        
        <div className="mt-16 md:mt-28 flex flex-col items-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1.2 }}
            className="font-serif text-2xl md:text-5xl text-[#5D4037] mb-8 md:mb-12 italic tracking-tight text-center max-w-5xl"
          >
            Miejsce by kultywować kulturę, <br className="hidden md:block" />
            <span className="text-[#966F33]/80 not-italic">ale nie taką jaką znasz z MOK'u.</span>
          </motion.h2>

          <div className="relative z-30 flex flex-col items-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ delay: 1.2, duration: 1.5 }}
              className="text-base md:text-2xl font-light tracking-wide leading-relaxed text-[#2C1810]/70 max-w-4xl mx-auto text-center px-4"
            >
              Stworzony przez ludzi świadomych, dla ludzi światowych. To w tym miejscu spotkasz osoby które wyróżniają się spośród masy swoją kulturą, świadomością i wiedzą.
            </motion.p>
            
            <motion.div 
              initial={{ scaleY: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ 
                scaleY: { duration: 1.5, delay: 1.8 },
                opacity: { duration: 2, repeat: Infinity }
              }}
              className="w-px h-12 md:h-20 bg-gradient-to-b from-[#966F33] to-transparent mx-auto mt-10 origin-top"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;

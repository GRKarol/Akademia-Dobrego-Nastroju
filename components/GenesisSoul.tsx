
import React from 'react';
import { motion } from 'framer-motion';

const GenesisSoul: React.FC = () => {
  return (
    <div className="max-w-5xl px-8 text-center space-y-16 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="space-y-12"
      >
        <span className="text-[#D4AF37] uppercase tracking-[0.4em] text-xs">Sekcja „Dusza / Geneza"</span>
        <h2 className="font-serif text-5xl md:text-8xl text-[#F8F5F0]">Zaczęło się od <br/> <span className="italic">zmęczenia jazdą.</span></h2>
        
        <div className="space-y-8 text-xl md:text-2xl font-light leading-relaxed text-[#F8F5F0]/80 text-justify md:text-center max-w-4xl mx-auto">
          <p>
            Dwoje muzyków, którzy spędzali życie w drodze do sal prób, koncertów, spotkań, pomyśleli: a gdyby tak przenieść muzykę bliżej? Zbudowali ten budynek, żeby nie musieć jeździć, ale szybko zrozumieli, że nie tylko chodzi o muzykę. 
          </p>
          <p>
            To o przestrzeń dla ludzi, którzy myślą głębiej. Dla tych, którzy czują, że dzisiejszy świat ogłupia, ale się nie poddają – szukają, tworzą, rozmawiają. Akademia Dobrego Nastroju to pierwsze takie miejsce, gdzie ośrodek kultury dla masy jest przeciwieństwem. 
          </p>
          <p className="text-[#D4AF37] font-serif italic text-3xl py-4">
            Jesteśmy jądrem, które łączy elity – nie w sensie snobistycznym, ale w sensie ludzi świadomych, pracowitych, pełnych wiedzy i inteligencji życiowej. 
          </p>
          <p>
            Ludzi, którzy chcują współpracować, tworzyć wspólnotę opartą na szacunku, pomysłowości i zaangażowaniu. Nie spieszymy się. Nie szukamy liczb. Szukamy jednostek, które czują klimat tego miejsca – i chcą być jego częścią.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default GenesisSoul;

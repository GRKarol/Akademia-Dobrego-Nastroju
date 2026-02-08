
import React from 'react';
import { motion } from 'framer-motion';

const Genesis: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#1A1A1A] text-[#F8F5F0] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background texture */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 20h100M0 40h100M0 60h100M0 80h100\' stroke=\'white\' stroke-width=\'0.5\' fill=\'none\'/%3E%3C/svg%3E")' }}
      />
      
      <div className="max-w-3xl z-10">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-serif text-4xl md:text-6xl text-[#C9A96E] mb-12 text-center"
        >
          Dusza Akademii
        </motion.h2>

        <motion.div 
          className="space-y-8 text-lg md:text-xl font-light leading-relaxed text-justify"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.3 } }
          }}
        >
          <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            Akademia Dobrego Nastroju to nie jest zwykłe miejsce na mapie. To manifest dwóch muzyków, którzy po latach w trasie, zmęczeni hałasem świata i powierzchownością, postanowili stworzyć azyl. Jądro dla rozproszonych elit kultury.
          </motion.p>
          <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            Nie szukamy mas. Szukamy jakości. Budujemy to miejsce organicznie, krok po kroku, nuta po nucie. Każdy detal ma tu intencję — od wyboru drewna na blatach kawiarni po solne lampy, które pilnują czystości myśli.
          </motion.p>
          <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            Wierzymy w muzykę jako język duszy, w intelektualną stymulację bez wymądrzania i w bezinteresowny szacunek. To miejsce dla tych, którzy nienawidzą fałszu i marzą o wspólnocie opartej na autentyczności.
          </motion.p>
        </motion.div>

        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mt-16 flex justify-center"
        >
          <div className="w-16 h-1 bg-[#A55A3A] rounded-full" />
        </motion.div>
      </div>
    </div>
  );
};

export default Genesis;

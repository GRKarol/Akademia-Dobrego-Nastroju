
import React from 'react';
import { motion } from 'framer-motion';

const items = [
  {
    title: "Kawiarnia – tu zaczyna się rozmowa",
    description: "Lampy z nut, drewniany blat, zapach kawy. To miejsce, gdzie nie spieszy się nikomu. Tu nie 'załatwia się spraw' – tu po prostu jest się sobą, w towarzystwie ludzi, którzy słuchają tak samo uważnie, jak mówią.",
    image: "https://picsum.photos/id/42/1200/800"
  },
  {
    title: "Duża sala – przestrzeń dla głębi",
    description: "Lustra, które mnożą światło. Solne lampy, które oczyszczają powietrze i myśli. W tej sali odbywają się koncerty, wykłady, spotkania, zajęcia – ale przede wszystkim dzieje się coś trudnego do nazwania: wspólne przeżywanie chwili.",
    image: "https://picsum.photos/id/102/1200/800"
  },
  {
    title: "Kameralna sala – intymność dźwięku",
    description: "Dla tych momentów, kiedy muzyka, rozmowa czy poezja potrzebują bliskości. Tu fortepian brzmi inaczej, słowa znaczą więcej, a cisza między nutami jest równie ważna jak one same.",
    image: "https://picsum.photos/id/101/1200/800"
  },
  {
    title: "Wejście – próg do innego świata",
    description: "Przekraczając te drzwi, zostawiasz za sobą pośpiech. Drewno, światło, faktura – wszystko mówi: 'Tutaj możesz zwolnić'. To nie jest miejsce, do którego wpada się na chwilę. Tu się zostaje.",
    image: "https://picsum.photos/id/103/1200/800"
  },
  {
    title: "Detal – drewno, które pamięta",
    description: "Każda deska, każdy element wystroju został wybrany z intencją. Drewno ma swoją historię, swoją ciepłotę. Dotykając go, czujesz, że ktoś tu myślał o każdym szczególe – nie dla efektu, ale dla ciebie.",
    image: "https://picsum.photos/id/104/1200/800"
  },
  {
    title: "Zakamarki – miejsca do odkrycia",
    description: "Są tu detale, o których nie mówi się od razu. Fotele, w których można zniknąć z książką. Zakamarki, które mają znaczenie. Akademia to żywe miejsce, które zmienia się razem z ludźmi, którzy tu bywają.",
    image: "https://picsum.photos/id/106/1200/800"
  }
];

const Gallery: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#F8F5F0] flex flex-col items-center justify-center p-8 overflow-hidden">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-4xl text-[#1A1A1A] mb-12"
      >
        Budynek – tu zaczyna się prawdziwe
      </motion.h2>

      <div className="w-full flex overflow-x-auto no-scrollbar gap-8 pb-12 px-4 cursor-grab active:cursor-grabbing">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 w-[80vw] md:w-[600px] h-[70vh] bg-white rounded-lg shadow-2xl overflow-hidden group"
          >
            <div className="h-2/3 overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="p-8 flex flex-col justify-center h-1/3 bg-[#F8F5F0] border-t border-[#A55A3A]/10">
              <h3 className="font-serif text-2xl text-[#A55A3A] mb-4">{item.title}</h3>
              <p className="text-sm text-[#2C2C2C] leading-relaxed line-clamp-3">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-[#C9A96E] animate-bounce mt-4">
        Przesuń, by odkryć więcej &rarr;
      </div>
    </div>
  );
};

export default Gallery;

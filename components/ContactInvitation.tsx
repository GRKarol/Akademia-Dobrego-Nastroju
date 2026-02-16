import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, ArrowLeft, Loader2, ExternalLink, MapPin, Facebook, ArrowRight, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface ContactInvitationProps {
  onBack?: () => void;
  onJoinClub?: (code: string) => void;
  onGoToEvents?: () => void;
}

interface AccessCode {
  value: string;
  role: 'member' | 'admin';
}

const ContactInvitation: React.FC<ContactInvitationProps> = ({ onBack, onJoinClub, onGoToEvents }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onGoToEvents) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const timer = setTimeout(() => {
            onGoToEvents();
          }, 400);
          return () => clearTimeout(timer);
        }
      },
      { 
        threshold: 0.05,
        rootMargin: '0px 0px 200px 0px' 
      }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, [onGoToEvents]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    const inputCode = code.toLowerCase().trim();
    
    console.log("🔎 Szukam kodu:", inputCode);
    
    try {
      const snap = await getDocs(collection(db, "access_codes"));
      const codes = snap.docs.map(d => d.data() as AccessCode);
      
      console.log("📋 Wszystkie kody w bazie:", codes);
      
      const found = codes.find(c => c.value === inputCode);
      
      console.log("✅ Znaleziony kod?", found);
      
      if (found) {
        console.log("🎉 Kod jest poprawny! Wywołuję onJoinClub z:", inputCode);
        onJoinClub?.(inputCode);
      } else {
        console.log("❌ Kod niepoprawny!");
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
      console.error("💥 Firebase error:", err);
      setError(true);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F1E9D2] text-[#121212] selection:bg-[#966F33] selection:text-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center pointer-events-none">
        {onBack && (
          <button 
            onClick={onBack}
            className="pointer-events-auto flex items-center space-x-2 text-[#121212]/40 hover:text-[#121212] transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-serif italic text-lg">Powrót</span>
          </button>
        )}
      </nav>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 pt-32 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mb-20"
        >
          <h2 className="font-serif text-5xl md:text-8xl leading-[1] tracking-tighter mb-4">
            Jeśli czujesz <br />
            <span className="italic text-[#8B4513]">to samo co my...</span>
          </h2>
          
          <h3 className="text-[#8B4513] uppercase tracking-[0.3em] text-sm md:text-base font-bold mb-10">
            Jeśli masz pasję, którą chcesz dzielić
          </h3>

          <div className="h-px w-24 bg-[#121212]/10 mb-10" />
          
          <p className="text-xl md:text-3xl font-light text-[#121212]/90 leading-relaxed max-w-3xl italic">
            Prosimy o szczerość. O gotowość do rozmowy. O chęć bycia częścią czegoś, co buduje się powoli, ale na lata. 
            Nie trzeba mieć 50 lat ani dwóch dyplomów – trzeba mieć głowę pełną myśli i serce otwarte na wspólnotę.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-32"
        >
          <h3 className="font-serif text-5xl sm:text-7xl md:text-9xl leading-none italic text-[#121212] tracking-tight">
            Porozmawiajmy.
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32 items-start">
          <div className="space-y-10">
            <a href="tel:+48502105729" className="flex items-center space-x-6 group">
              <div className="w-12 h-12 flex items-center justify-center border border-[#8B4513]/20 rounded-full text-[#8B4513] group-hover:bg-[#8B4513] group-hover:text-white transition-all">
                <Phone size={20} strokeWidth={1.5} />
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-[#121212]/40 mb-1 font-bold">Zadzwoń do nas</span>
                <span className="text-2xl md:text-3xl font-serif text-[#121212]">502 105 729</span>
              </div>
            </a>

            <a 
  href="mailto:akademiadobregonastroju@gmail.com?subject=Kontakt%20ze%20strony%20Akademii" 
  className="flex items-start space-x-4 md:space-x-6 group"
>
  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-[#8B4513]/20 rounded-full text-[#8B4513] group-hover:bg-[#8B4513] group-hover:text-white transition-all">
    <Mail size={20} strokeWidth={1.5} />
  </div>
  <div className="flex-1 min-w-0 overflow-visible">
    <span className="block text-[10px] uppercase tracking-widest text-[#121212]/40 mb-1 font-bold">Napisz wiadomość</span>
    <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-serif text-[#121212] block break-all leading-snug">
      akademiadobregonastroju@gmail.com
    </span>
  </div>
</a>


            <a 
              href="https://www.facebook.com/people/Akademia-Dobrego-Nastroju/100072041536375/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-4 text-[#966F33] hover:text-[#8B4513] transition-all group pt-4"
            >
              <Facebook size={24} strokeWidth={1.5} />
              <span className="font-serif italic text-xl md:text-2xl border-b border-[#966F33]/30 pb-1">Śledź nas na facebooku</span>
              <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </div>

        <section className="space-y-10 mb-40">
          <div className="space-y-2">
            <h3 className="font-serif text-4xl md:text-6xl italic">Tutaj jesteśmy:</h3>
            <p className="text-[#121212]/50 font-serif italic text-xl">Kłobuck, ul. Kręta 23</p>
          </div>
          
          <div className="relative group">
            <div className="w-full h-[400px] md:h-auto md:aspect-[21/9] bg-white rounded-sm overflow-hidden border-8 border-white shadow-2xl relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2520.1017014467264!2d18.9248473!3d50.9031735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4710b71946399023%3A0x9599d10e6ca70e0a!2sKr%C4%99ta%2023%2C%2042-100%20K%C5%82obuck!5e0!3m2!1spl!2spl!4v1740924976451!5m2!1spl!2spl" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(0.3) contrast(1.1)' }} 
                className="group-hover:grayscale-0 transition-all duration-1000 ease-in-out"
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-10 flex justify-center"
            >
              <a 
                href="https://www.google.com/maps/dir/?api=1&destination=Kręta+23+Kłobuck" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-4 px-10 py-5 bg-[#121212] text-[#F4EBD0] rounded-sm hover:bg-[#8B4513] transition-all transform hover:scale-[1.02] shadow-xl"
              >
                <MapPin size={22} strokeWidth={1.5} />
                <span className="font-serif italic text-xl">Zobacz w aplikacji Mapy</span>
              </a>
            </motion.div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto pt-12 mb-20">
           <div className="flex flex-col items-center text-center space-y-10">
              <div className="space-y-4">
                <h4 className="font-serif text-4xl md:text-6xl text-[#2C1810]">Poznaj naszą <span className="italic text-[#966F33]">codzienność</span></h4>
                <p className="text-[#2C1810]/50 font-serif italic text-xl">Wydarzenia, warsztaty i spotkania, które tworzą historię tego miejsca.</p>
              </div>
              
              <motion.button
                onClick={onGoToEvents}
                whileHover={{ scale: 1.05, backgroundColor: "#8B4513", color: "#FFF" }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center space-x-8 px-12 py-8 bg-white border-2 border-[#8B4513]/20 rounded-sm shadow-2xl transition-all"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#8B4513]/60 mb-1 font-bold group-hover:text-white/60">Odkryj teraz</span>
                  <span className="font-serif italic text-3xl md:text-4xl text-[#8B4513] group-hover:text-white">Zobacz co się dzieje wewnątrz</span>
                </div>
                <ArrowRight size={40} className="text-[#8B4513] group-hover:text-white group-hover:translate-x-2 transition-all" />
              </motion.button>
           </div>
        </section>

        <section className="max-w-4xl mx-auto pt-24 mb-40">
          <div className="text-center">
            <div className="bg-[#EADDCA] p-10 md:p-24 rounded-sm border border-[#121212]/10 shadow-lg space-y-12">
              <div className="space-y-4">
                <h4 className="text-[#8B4513] text-4xl md:text-7xl font-serif italic font-bold">Klub nuty</h4>
                <p className="text-xl md:text-2xl font-serif italic text-[#121212]/60">Czat dla członków Klubu</p>
              </div>

              <form onSubmit={handleCodeSubmit} className="relative max-w-md mx-auto">
                <div className="relative border-b-2 border-[#121212]/30 focus-within:border-[#8B4513] transition-all pb-2">
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Twój klucz..."
                    disabled={isValidating}
                    className="w-full bg-transparent text-center text-3xl md:text-5xl font-serif focus:outline-none text-[#121212] placeholder:text-[#121212]/20 py-4"
                  />
                  <button 
                    type="submit" 
                    disabled={isValidating} 
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8B4513] hover:translate-x-2 transition-transform p-2"
                  >
                    {isValidating ? <Loader2 className="animate-spin" size={32} /> : <ExternalLink size={32} />}
                  </button>
                </div>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-xs uppercase tracking-widest font-bold mt-6"
                  >
                    Klucz nie pasuje do zamka...
                  </motion.p>
                )}
              </form>
            </div>
          </div>
        </section>

        <div className="h-[150vh] flex flex-col items-center justify-start pt-40">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex flex-col items-center space-y-12 text-[#8B4513]"
          >
            <div className="px-10 py-4 border border-[#8B4513]/20 rounded-full bg-white/10 backdrop-blur-sm shadow-xl">
              <p className="font-serif italic text-sm tracking-[0.5em] uppercase opacity-70">Zejdź głębiej, by powrócić do początku</p>
            </div>
            
            <div className="relative h-96 w-px overflow-hidden bg-[#8B4513]/5">
               <motion.div 
                  animate={{ y: [-384, 768] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-[#8B4513] to-transparent"
               />
            </div>
            
            <div ref={bottomRef} className="w-16 h-16 flex items-center justify-center">
              <Sparkles size={40} className="animate-pulse opacity-50" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactInvitation;

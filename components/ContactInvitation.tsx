import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  Facebook, 
  MapPin, 
  ExternalLink, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Loader2,
  Copy,
  Check
} from 'lucide-react';
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

const ContactInvitation: React.FC<ContactInvitationProps> = ({ 
  onBack, 
  onJoinClub,
  onGoToEvents 
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver do automatycznego przejścia do wydarzeń
  useEffect(() => {
    if (!bottomRef.current || !onGoToEvents) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onGoToEvents();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [onGoToEvents]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isValidating) return;

    setIsValidating(true);
    setError(false);

    try {
      const inputCode = code.trim().toLowerCase();
      const snap = await getDocs(collection(db, 'access_codes'));
      const codes = snap.docs.map(d => d.data() as AccessCode);
      const found = codes.find(c => c.value === inputCode);

      if (found && onJoinClub) {
        onJoinClub(inputCode);
      } else {
        setError(true);
        setTimeout(() => setError(false), 3000);
      }
    } catch (err) {
      console.error('Firebase error:', err);
      setError(true);
      setTimeout(() => setError(false), 3000);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText('akademiadobregonastroju@gmail.com');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Błąd kopiowania:', err);
      // Fallback - zaznacz tekst do manualnego kopiowania
      const emailLink = document.querySelector('a[href^="mailto:akademiadobregonastroju"]');
      if (emailLink) {
        const range = document.createRange();
        range.selectNodeContents(emailLink);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#121212] relative overflow-x-hidden">
      {/* Przycisk powrotu */}
      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-8 left-8 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-[#8B4513]/20 text-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-all shadow-lg"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
      )}

      <div className="container mx-auto px-6 md:px-12 py-24 md:py-32 max-w-7xl">
        {/* Nagłówek */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 text-[#2C1810]"
          >
            Skontaktuj się z nami
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-[#8B4513]/80 max-w-2xl mx-auto font-light"
          >
            Jesteśmy tu dla Ciebie. Wybierz najwygodniejszy sposób kontaktu.
          </motion.p>
        </motion.div>

        {/* Sekcja kontaktowa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32 items-start">
          <div className="space-y-10">
            {/* Telefon */}
            <motion.a
              href="tel:+48502105729"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center space-x-6 group"
            >
              <div className="w-12 h-12 flex items-center justify-center border border-[#8B4513]/20 rounded-full text-[#8B4513] group-hover:bg-[#8B4513] group-hover:text-white transition-all">
                <Phone size={20} strokeWidth={1.5} />
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-[#121212]/40 mb-1 font-bold">
                  Zadzwoń do nas
                </span>
                <span className="text-lg md:text-2xl font-serif text-[#121212]">
                  +48 502 105 729
                </span>
              </div>
            </motion.a>

            {/* Email z przyciskiem kopiowania */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex items-start space-x-4 md:space-x-6 group"
            >
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-[#8B4513]/20 rounded-full text-[#8B4513] group-hover:bg-[#8B4513] group-hover:text-white transition-all">
                <Mail size={20} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] uppercase tracking-widest text-[#121212]/40 mb-1 font-bold">
                  Napisz wiadomość
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href="mailto:akademiadobregonastroju@gmail.com?subject=Kontakt+ze+strony+Akademii&body=Dzień+dobry,%0D%0A%0D%0A"
                    className="text-xs sm:text-sm md:text-base lg:text-lg font-serif text-[#121212] hover:text-[#8B4513] transition-colors break-all leading-snug"
                  >
                    akademiadobregonastroju@gmail.com
                  </a>
                  <button
                    onClick={handleCopyEmail}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded border border-[#8B4513]/20 text-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-all"
                    title="Kopiuj adres email"
                  >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <span className="hidden md:block text-[9px] text-[#121212]/30 mt-1">
                  Kliknij ikonę aby skopiować
                </span>
              </div>
            </motion.div>

            {/* Facebook */}
            <motion.a
              href="https://www.facebook.com/people/Akademia-Dobrego-Nastroju/100072041536375/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="inline-flex items-center space-x-4 text-[#966F33] hover:text-[#8B4513] transition-all group pt-4"
            >
              <Facebook size={22} strokeWidth={1.5} />
              <span className="font-medium text-sm tracking-wide">
                Odwiedź nas na Facebooku
              </span>
              <ExternalLink size={16} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>
          </div>

          {/* Mapa Google */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="relative h-[400px] rounded-2xl overflow-hidden border border-[#8B4513]/20 shadow-xl"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2491.234567890123!2d18.933891!3d50.900568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4710b1c7e3a4c8d9%3A0x1234567890abcdef!2sKr%C4%99ta%2023%2C%2042-100%20K%C5%82obuck!5e0!3m2!1spl!2spl!4v1234567890123!5m2!1spl!2spl"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Kręta+23+Kłobuck"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 text-[#8B4513] hover:bg-[#8B4513] hover:text-white transition-all text-sm font-medium"
            >
              <MapPin size={16} />
              <span>Nawiguj</span>
            </a>
          </motion.div>
        </div>

        {/* Przycisk do wydarzeń */}
        {onGoToEvents && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="text-center mb-32"
          >
            <motion.button
              onClick={onGoToEvents}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-4 px-10 py-5 bg-gradient-to-r from-[#8B4513] to-[#966F33] text-white rounded-full font-medium text-lg shadow-2xl hover:shadow-3xl transition-all"
            >
              <Sparkles size={22} />
              <span>Zobacz co się dzieje wewnątrz</span>
              <ArrowRight size={22} />
            </motion.button>
          </motion.div>
        )}

        {/* Prywatny Klub */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="max-w-2xl mx-auto bg-white rounded-3xl p-10 md:p-14 shadow-2xl border border-[#8B4513]/10"
        >
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl md:text-4xl text-[#2C1810] mb-4">
              Prywatny Klub
            </h2>
            <p className="text-[#8B4513]/70 text-base">
              Posiadasz kod dostępu? Wejdź do ekskluzywnej przestrzeni dla członków Akademii.
            </p>
          </div>

          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Wprowadź kod dostępu"
                disabled={isValidating}
                className="w-full px-6 py-4 border-2 border-[#8B4513]/20 rounded-xl focus:border-[#8B4513] focus:outline-none transition-all text-center font-medium text-lg tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-6 left-0 right-0 text-center text-red-600 text-sm font-medium"
                >
                  Nieprawidłowy kod dostępu
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={!code.trim() || isValidating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-[#8B4513] to-[#966F33] text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {isValidating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Sprawdzanie...</span>
                </>
              ) : (
                <span>Wejdź do Klubu</span>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Element do wykrywania scrolla */}
        <div ref={bottomRef} className="h-20" />
      </div>
    </div>
  );
};

export default ContactInvitation;

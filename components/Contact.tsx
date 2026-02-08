
import React from 'react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#F8F5F0] flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-4 rounded-full bg-[#A55A3A]/10 text-[#A55A3A] mb-4"
        >
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.div>

        <motion.h2 
          className="font-serif text-5xl text-[#1A1A1A]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Dla Ciebie
        </motion.h2>

        <motion.p 
          className="text-xl text-[#2C2C2C] font-light leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Jeśli czujesz, że świat pędzi zbyt szybko, a Ty szukasz miejsca, gdzie rozmowa znaczy więcej niż status — zapraszamy. Bez presji, bez masek. Po prostu bądź częścią naszej melodii.
        </motion.p>

        <motion.div 
          className="flex flex-col md:flex-row items-center justify-center gap-8 pt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <a 
            href="tel:+48123456789" 
            className="group flex items-center space-x-4 p-6 bg-white rounded-xl shadow-lg border border-[#C9A96E]/20 transition-all hover:-translate-y-2"
          >
            <div className="p-3 bg-[#A55A3A] text-white rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <div className="text-left">
              <span className="block text-xs uppercase tracking-widest text-[#C9A96E]">Zadzwoń</span>
              <span className="text-xl font-semibold text-[#1A1A1A]">+48 123 456 789</span>
            </div>
          </a>

          <a 
            href="mailto:biuro@akademia.pl" 
            className="group flex items-center space-x-4 p-6 bg-white rounded-xl shadow-lg border border-[#C9A96E]/20 transition-all hover:-translate-y-2"
          >
            <div className="p-3 bg-[#1A1A1A] text-white rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div className="text-left">
              <span className="block text-xs uppercase tracking-widest text-[#C9A96E]">Napisz</span>
              <span className="text-xl font-semibold text-[#1A1A1A]">biuro@akademia.pl</span>
            </div>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;

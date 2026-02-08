
import React from 'react';
import { motion } from 'framer-motion';

const Location: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#1A1A1A] flex flex-col md:flex-row items-center justify-center p-8 gap-12">
      <div className="w-full md:w-1/2 space-y-8 text-center md:text-left">
        <motion.h2 
          className="font-serif text-5xl text-[#C9A96E]"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          Tu jesteśmy
        </motion.h2>
        
        <motion.div 
          className="text-xl text-[#F8F5F0] font-light space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>Kłobuck k. Częstochowy</p>
          <p>ul. Muzyczna 12</p>
          <p className="text-[#A55A3A] font-serif italic text-2xl pt-4">Echo z lasu, spokój z nut.</p>
        </motion.div>

        <motion.a 
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-[#C9A96E] hover:text-white transition-colors text-lg"
          whileHover={{ x: 10 }}
        >
          <span>Echo z Facebooka</span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7h-2.54v-2.9h2.54V9.82c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.77l-.44 2.9h-2.33v7c4.78-.75 8.44-4.9 8.44-9.9 0-5.53-4.5-10.02-10-10.02z" /></svg>
        </motion.a>
      </div>

      <motion.div 
        className="w-full md:w-1/2 h-[50vh] md:h-[70vh] rounded-2xl overflow-hidden border-4 border-[#C9A96E]/20 shadow-2xl shadow-black"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d161204.60338779955!2d18.919794508496464!3d50.90262118430722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4710b7410c5c6e83%3A0x6a0f443588910404!2zS8WCb2J1Y2s!5e0!3m2!1spl!2spl!4v1700000000000!5m2!1spl!2spl" 
          width="100%" 
          height="100%" 
          style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        />
      </motion.div>
    </div>
  );
};

export default Location;

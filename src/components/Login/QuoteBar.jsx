import React, { useState, useEffect } from 'react';
import ParticlesBackground from './ParticlesBackground';
import { motion } from 'framer-motion';

const quotes = [
  { 
    text: "The best investment you can make is in yourself.", 
    author: "Warren Buffett" 
  },
  { 
    text: "Financial freedom is available to those who learn about it and work for it.", 
    author: "Robert Kiyosaki" 
  },
  { 
    text: "A bank is a place that will lend you money if you can prove that you don't need it.", 
    author: "Bob Hope" 
  },
  { 
    text: "The future of banking is digital, but the heart of banking is human.", 
    author: "Brett King" 
  },
];

const QuoteBar = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuote(prev => (prev + 1) % quotes.length);
        setIsVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-3 md:py-6"
    >
      <ParticlesBackground />
      <div className="max-w-7xl mx-auto text-center px-4 relative z-10">
        <motion.div 
          className={`transform transition-all duration-500 ease-in-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-lg md:text-2xl lg:text-3xl font-medium italic mb-2 md:mb-3 text-blue-100 leading-relaxed">
            "{quotes[currentQuote].text}"
          </p>
          <p className="text-sm md:text-lg text-blue-200 font-light">
            - {quotes[currentQuote].author}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QuoteBar;

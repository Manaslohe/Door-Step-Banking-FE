import React, { useState, useEffect } from 'react';
import ParticlesBackground from './ParticlesBackground';

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
  { 
    text: "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.", 
    author: "Ayn Rand" 
  }
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
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-4">
      <ParticlesBackground />
      <div className="max-w-6xl mx-auto text-center px-4 relative z-10">
        <div 
          className={`transform transition-all duration-500 ease-in-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-xl md:text-2xl font-medium italic mb-2 text-blue-100">
            "{quotes[currentQuote].text}"
          </p>
          <p className="text-sm text-blue-200 font-light">
            - {quotes[currentQuote].author}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuoteBar;

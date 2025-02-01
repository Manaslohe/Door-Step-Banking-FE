import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <div className="bg-blue-600 text-white py-6">
      <div className="max-w-6xl mx-auto text-center px-4">
        <div 
          className="transform transition-all duration-700 ease-in-out"
          style={{ opacity: 1 }}
          key={currentQuote}
        >
          <p className="text-2xl font-medium italic mb-2 animate-fadeIn">
            "{quotes[currentQuote].text}"
          </p>
          <p className="text-lg text-blue-200">
            - {quotes[currentQuote].author}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuoteBar;

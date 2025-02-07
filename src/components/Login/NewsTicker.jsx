import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DEFAULT_NEWS = [
  "RBI introduces new UPI-lite features for offline transactions",
  "Banking sector NPAs decline to 3.9%, showing strong recovery",
  "Major Indian banks report record profits this quarter",
  "Digital banking adoption sees significant growth nationwide",
  "New banking regulations announced to enhance cyber security"
];

const NewsTicker = ({ variant = 'default', autoPlayInterval = 5000 }) => {
  const [newsState, setNewsState] = useState(DEFAULT_NEWS);
  const [currentNews, setCurrentNews] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastFetchRef = useRef(Date.now());
  const fetchTimeoutRef = useRef(null);

  const handleNextNews = useCallback(() => {
    if (!newsState.length) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentNews((prev) => (prev + 1) % newsState.length);
      setIsTransitioning(false);
    }, 300);
  }, [newsState.length]);

  const handlePrevNews = useCallback(() => {
    if (!newsState.length) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentNews((prev) => 
        prev === 0 ? newsState.length - 1 : prev - 1
      );
      setIsTransitioning(false);
    }, 300);
  }, [newsState.length]);

  // Use static news instead of API calls
  useEffect(() => {
    setNewsState(DEFAULT_NEWS);
  }, []);

  // Auto-play news
  useEffect(() => {
    if (!newsState.length || isLoading) return;
    
    const interval = setInterval(handleNextNews, autoPlayInterval);
    return () => clearInterval(interval);
  }, [handleNextNews, autoPlayInterval, newsState.length, isLoading]);

  const renderNewsContent = () => {
    if (isLoading) {
      return <div className="animate-pulse h-6 bg-blue-100/50 rounded w-2/3" />;
    }

    return (
      <div className={`transform transition-all duration-300 ease-in-out ${
        isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}>
        <p className="text-sm sm:text-base font-medium line-clamp-2">
          {newsState[currentNews] || "Loading..."}
        </p>
      </div>
    );
  };

  if (variant === 'dashboard') {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center">
          <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 
            flex items-center rounded-l-2xl">
            <AlertCircle className="w-6 h-6 text-white mr-3" />
            <span className="font-medium text-white text-lg">UPDATES</span>
          </div>
          <div className="flex-1 overflow-hidden px-6 py-5">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-blue-100 rounded w-3/4" />
                <div className="h-4 bg-blue-50 rounded w-1/2" />
              </div>
            ) : (
              <div className="transform transition-all duration-700 ease-in-out">
                <p className="text-blue-900 animate-fadeSlide text-lg font-medium">
                  {newsState[currentNews]}
                </p>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 px-4 flex gap-3 border-l border-blue-100">
            <button onClick={handlePrevNews}
              className="p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95">
              <ChevronLeft className="w-5 h-5 text-blue-600" />
            </button>
            <button onClick={handleNextNews}
              className="p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95">
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant styling
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 2.4 }}
      className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white h-full"
    >
      <motion.div 
        className="container mx-auto h-full flex items-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 2.6 }}
      >
        <div className="flex items-center justify-between w-full">
          {/* Latest Updates Badge */}
          <div className="flex items-center space-x-3 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="font-semibold text-sm hidden sm:inline text-red-100">
              {isLoading ? "LOADING UPDATES..." : "LATEST UPDATES"}
            </span>
          </div>

          {/* News Content */}
          <div className="flex-1 mx-4 sm:mx-6 overflow-hidden">
            {renderNewsContent()}
          </div>

          {newsState.length > 0 && (
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevNews}
                disabled={isLoading}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors 
                  focus:outline-none focus:ring-2 focus:ring-white/20 
                  disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous news"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="hidden sm:flex items-center space-x-1 mx-2">
                {newsState.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      currentNews === index ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNextNews}
                disabled={isLoading}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors 
                  focus:outline-none focus:ring-2 focus:ring-white/20
                  disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next news"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewsTicker;

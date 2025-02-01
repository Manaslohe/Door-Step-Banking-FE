import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const NewsTicker = ({ variant = 'default', news: initialNews = [], autoPlayInterval = 5000 }) => {
  const [newsState, setNewsState] = useState([]);
  const [currentNews, setCurrentNews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState(null);

  const handleNextNews = useCallback(() => {
    if (!newsState.length) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentNews((prev) => {
        const nextIndex = (prev + 1) % newsState.length;
        return nextIndex;
      });
      setIsTransitioning(false);
    }, 300);
  }, [newsState.length]);

  const handlePrevNews = useCallback(() => {
    if (!newsState.length) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentNews((prev) => {
        const prevIndex = prev === 0 ? newsState.length - 1 : prev - 1;
        return prevIndex;
      });
      setIsTransitioning(false);
    }, 300);
  }, [newsState.length]);

  const cleanNewsContent = (text) => {
    // Remove dates in various formats (e.g., "January 2024", "2024", "24th March", etc.)
    return text.replace(/\b\d{1,2}(st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b(?:\s+\d{4})?\b/gi, '')
              .replace(/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?\b(?:\s+\d{4})?\b/gi, '')
              .replace(/\b\d{4}\b/g, '')
              .replace(/\b(?:Q[1-4])\s+\d{4}(?:-\d{2})?\b/gi, '') // Remove quarter references like "Q3 2023-24"
              .replace(/\s+/g, ' ')
              .trim();
  };

  const generateNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate 5 latest real banking news updates from India, focusing on:
                - Current banking sector developments
                - RBI policies and regulations
                - Digital banking trends
                - Banking market analysis
                - Financial sector updates
                Each news should be 1-2 sentences focusing on the core information without dates.
                Format: Return only the news separated by |`
              }]
            }]
          })
        }
      );

      if (!response.ok) throw new Error('Failed to fetch news');

      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const newsHeadlines = data.candidates[0].content.parts[0].text
          .split('|')
          .filter(headline => headline.trim()) // Remove empty strings
          .map(headline => cleanNewsContent(headline.trim()));
          
        if (newsHeadlines.length > 0) {
          setNewsState(newsHeadlines);
          setCurrentNews(0);
        } else {
          throw new Error('No valid news generated');
        }
      }
    } catch (error) {
      console.error("Error generating news:", error);
      setError(error.message);
      // Fallback news without dates
      setNewsState([
        "RBI introduces new UPI-lite features for offline transactions, aiming to boost digital payments in rural areas",
        "Banking sector NPAs decline to 3.9%, showing strong recovery as credit growth remains robust",
        "Major Indian banks report record profits driven by strong credit growth and improved asset quality"
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    generateNews();
    const refreshInterval = setInterval(generateNews, 3600000);
    return () => clearInterval(refreshInterval);
  }, [generateNews]);

  useEffect(() => {
    if (!newsState.length || isLoading) return;
    
    const interval = setInterval(handleNextNews, autoPlayInterval);
    return () => clearInterval(interval);
  }, [handleNextNews, autoPlayInterval, newsState.length, isLoading]);

  const renderNewsContent = () => {
    if (isLoading) {
      return <div className="animate-pulse h-6 bg-blue-100/50 rounded w-2/3" />;
    }

    if (error || newsState.length === 0) {
      return (
        <p className="text-red-500">
          {error || "No news available at the moment"}
        </p>
      );
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
      <div className="bg-white/70 backdrop-blur-sm border border-blue-100 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 
            flex items-center rounded-l-lg">
            <AlertCircle className="w-5 h-5 text-white mr-2" />
            <span className="font-medium text-white">UPDATES</span>
          </div>
          <div className="flex-1 overflow-hidden px-5 py-4">
            {isLoading ? (
              <div className="animate-pulse h-6 bg-blue-100 rounded w-2/3" />
            ) : (
              <div className="transform transition-all duration-700 ease-in-out">
                <p className="text-blue-900 animate-fadeSlide whitespace-nowrap md:whitespace-normal
                  overflow-hidden text-ellipsis md:line-clamp-2">
                  {newsState[currentNews]}
                </p>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 px-4 flex gap-2 border-l border-blue-100">
            <button onClick={() => setCurrentNews(prev => prev === 0 ? newsState.length - 1 : prev - 1)}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors">
              <ChevronLeft className="w-4 h-4 text-blue-600" />
            </button>
            <button onClick={() => setCurrentNews(prev => (prev + 1) % newsState.length)}
              className="p-2 hover:bg-blue-50 rounded-full transition-colors">
              <ChevronRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant styling
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-3 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Latest Updates Badge */}
          <div className="flex items-center space-x-2 bg-red-500/10 px-3 py-1 rounded-full">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-sm hidden sm:inline">
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
      </div>
    </div>
  );
};

export default NewsTicker;

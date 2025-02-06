import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2, RefreshCw, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useTranslation } from '../context/TranslationContext';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const systemContext = (language) => `You are an expert Indian Stock Market Advisor. Provide a specific stock recommendation for a company listed on NSE/BSE. Include details about:
{
  "title": "string (Format: 'CompanyName (SYMBOL) - Key Investment Point')",
  "recommendation": "string (specific buy/sell advice with target price - max 15 words)",
  "rationale": "string (why this company - max 25 words)",
  "riskLevel": "string (Low/Moderate/Medium-High/High)",
  "sector": "string (company's sector)",
  "timeframe": "string (Short/Medium/Long Term)",
}
Focus on established companies with good trading volume.
Title example: "Infosys Ltd (INFY) - Strong Digital Growth Momentum"
${language === 'hindi' ? 'Provide the content in Hindi language.' : 'Provide the content in English language.'}`;

const RiskLevelBadge = ({ level, language }) => {
  const riskTranslations = {
    english: {
      'Low': 'Low Risk',
      'Moderate': 'Moderate Risk',
      'Medium-High': 'Medium-High Risk',
      'High': 'High Risk',
      'N/A': 'Risk N/A'
    },
    hindi: {
      'Low': 'कम जोखिम',
      'Moderate': 'सामान्य जोखिम',
      'Medium-High': 'मध्यम-उच्च जोखिम',
      'High': 'उच्च जोखिम',
      'N/A': 'जोखिम अज्ञात'
    }
  };

  const colors = {
    'Low': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Moderate': 'bg-amber-100 text-amber-800 border-amber-200',
    'Medium-High': 'bg-orange-100 text-orange-800 border-orange-200',
    'High': 'bg-red-100 text-red-800 border-red-200',
    'N/A': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <Badge variant="outline" className={`${colors[level]} border px-2.5 py-0.5 text-xs font-medium transition-colors`}>
      {riskTranslations[language][level] || riskTranslations[language]['N/A']}
    </Badge>
  );
};

const LoadingState = () => (
  <div className="space-y-3 animate-pulse">
    <div className="h-6 bg-blue-50 rounded w-3/4" />
    <div className="space-y-2">
      <div className="h-4 bg-blue-50 rounded w-full" />
      <div className="h-4 bg-blue-50 rounded w-5/6" />
    </div>
    <div className="flex flex-wrap gap-2">
      <div className="h-5 bg-blue-50 rounded w-24" />
      <div className="h-5 bg-blue-50 rounded w-32" />
    </div>
  </div>
);

const FinancialAdvice = () => {
  const { t, language } = useTranslation();
  const [advice, setAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speech, setSpeech] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const fetchAdvice = async (isRefresh = false) => {
    if (isPlaying) {
      setShouldRefresh(true);
      return;
    }

    if (shouldRefresh && Date.now() - lastRefreshTime < 2000) {
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      if (!API_KEY) throw new Error('API configuration missing');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemContext(language) }] }]
          })
        }
      );

      if (!response.ok) throw new Error('Failed to fetch advice');

      const data = await response.json();
      const adviceText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!adviceText) throw new Error('Invalid response format');

      const jsonStr = adviceText.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, '$1');
      const parsedAdvice = JSON.parse(jsonStr);

      setAdvice(parsedAdvice);
      stopSpeech();
    } catch (err) {
      setError(t.errorFetchingAdvice);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getSpeechText = (advice, language) => {
    const titleMatch = advice.title.match(/(.*?)\s*\((.*?)\)/);
    const companyName = titleMatch ? titleMatch[1] : '';
    const stockSymbol = titleMatch ? titleMatch[2] : '';
    
    if (language === 'hindi') {
      return `${companyName}, जिसका स्टॉक सिंबल ${stockSymbol} है.
        ${advice.recommendation}.
        इस स्टॉक को क्यों चुना? ${advice.rationale}.
        यह ${advice.riskLevel} जोखिम वाला निवेश है, ${advice.timeframe} अवधि के लिए,
        ${advice.sector} सेक्टर में.
        धन्यवाद, Thank you.`;
    }
    
    return `Investment Recommendation for ${companyName}, trading as ${stockSymbol}.
      ${advice.recommendation}.
      Why this stock? ${advice.rationale}.
      This is a ${advice.riskLevel} risk investment with a ${advice.timeframe} timeframe,
      in the ${advice.sector} sector.
      Thank you, धन्यवाद.`;
  };

  const speakAdvice = () => {
    if (!advice) return;
    
    stopSpeech();
    
    // Get localized speech text
    const textToSpeak = getSpeechText(advice, language);
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Configure voice settings based on language
    utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
    utterance.rate = language === 'hindi' ? 0.9 : 0.95; // Slightly slower for Hindi
    utterance.pitch = 1.0;
    
    // Try to find appropriate voice for the language
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(language === 'hindi' ? 'hi' : 'en') &&
      !voice.name.includes('Google')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => {
      setIsPlaying(false);
      setLastRefreshTime(Date.now());
      if (shouldRefresh) {
        setTimeout(() => {
          setShouldRefresh(false);
          fetchAdvice(true);
        }, 2000);
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setIsPlaying(false);
      setLastRefreshTime(Date.now());
    };
    
    setSpeech(utterance);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (speech) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      stopSpeech();
    } else {
      speakAdvice();
    }
  };

  useEffect(() => {
    fetchAdvice();
    const interval = setInterval(() => fetchAdvice(true), 30000);
    return () => {
      clearInterval(interval);
      stopSpeech();
    };
  }, [language]);

  // Add voice loading effect
  useEffect(() => {
    // Load voices when component mounts
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return (
    <Card className="w-full max-w-6xl mx-auto min-h-[220px] bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between py-1 border-b border-blue-100 flex-wrap gap-2 sm:flex-nowrap">
        <div className="flex items-center gap-1">
          <div className="bg-blue-100 p-1.5 rounded">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <CardTitle className="text-base sm:text-lg font-bold text-blue-900">{t.aiAdvisor}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSpeech}
            disabled={isLoading || !advice}
            className="hover:bg-blue-50 transition-colors"
            aria-label={isPlaying ? "Stop reading" : "Read advice"}
          >
            {isPlaying ? (
              <VolumeX className="w-4 h-4 text-blue-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-blue-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchAdvice(true)}
            disabled={isLoading || refreshing}
            className="hover:bg-blue-50 transition-colors"
            aria-label="Refresh advice"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-blue-600" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {error ? (
          <Alert variant="destructive" className="h-full flex items-center">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <LoadingState />
        ) : advice ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 leading-tight">
                {advice.title}
              </h3>
            </div>
            
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg space-y-2">
              <p className="text-sm text-blue-900 font-medium">
                {advice.recommendation}
              </p>
              <p className="text-xs sm:text-sm text-gray-700">
                {advice.rationale}
              </p>
              
              <div className="flex flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-600">{t.riskLevel}:</span>
                  <RiskLevelBadge level={advice.riskLevel} language={language} />
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-600">{t.sector}:</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                    {advice.sector}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-600">{t.timeframe}:</span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                    {advice.timeframe}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2" />
              <p className="text-sm sm:text-base">{t.noAdviceAvailable}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialAdvice;
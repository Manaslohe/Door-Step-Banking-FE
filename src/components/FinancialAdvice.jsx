import React, { useState, useCallback, useEffect } from 'react';
import { TrendingUp, Landmark, Gem, Bot, Loader2, RefreshCw, AlertCircle, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useTranslation } from '../context/TranslationContext';

const cleanAndParseJson = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    let cleanText = jsonMatch[0]
      .replace(/[\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      .replace(/:\s*([^",\{\}\[\]]+)(\s*[,}])/g, ':"$1"$2')
      .replace(/:\s*"(-?\d+\.?\d*)"/g, ':$1')
      .replace(/:\s*"true"/g, ':true')
      .replace(/:\s*"false"/g, ':false')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    const parsed = JSON.parse(cleanText);
    const requiredFields = ['title', 'recommendation', 'rationale', 'riskLevel', 'timeframe'];
    const hasAllFields = requiredFields.every(field => parsed[field]);
    return hasAllFields ? parsed : null;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
};

const fetchGeminiAdvice = async (prompt, apiKey, retryCount = 0) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        }),
      }
    );

    if (response.status === 429) {
      // Rate limit hit - implement exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 second delay
      if (retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchGeminiAdvice(prompt, apiKey, retryCount + 1);
      }
      throw new Error('Rate limit exceeded. Try again later.');
    }

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
};

const getPromptForType = (type, language) => {
  const isHindi = language === 'hi';
  return `You are an Indian Investment Expert. ${isHindi ? 'आप एक भारतीय निवेश विशेषज्ञ हैं।' : ''} 
  Generate specific advice for ${type} investments ${isHindi ? 'in Hindi' : 'in English'}. 
  Return only a JSON object with this structure:
  {
    "title": "${isHindi ? 'हिंदी में शीर्षक' : 'title in English'}",
    "recommendation": "${isHindi ? 'हिंदी में सिफारिश' : 'recommendation in English'}",
    "rationale": "${isHindi ? 'हिंदी में कारण' : 'rationale in English'}",
    "riskLevel": "${isHindi ? 'जोखिम स्तर' : 'risk level'}",
    "timeframe": "${isHindi ? 'समय सीमा' : 'timeframe'}"
    ${type === 'banking' ? `,"interestRate": "number"` : ''}
  } Use ${isHindi ? 'Hindi' : 'English'} language for all text values.`;
};

// Add more structure to prompt to help avoid format issues
const getStructuredPrompt = (type, language) => {
  const basePrompt = getPromptForType(type, language);
  return `${basePrompt}
  
  IMPORTANT: You must follow this exact JSON format with no additional text before or after.
  Do not include any markdown formatting, explanations, or comments outside the JSON object.
  Example format:
  {
    "title": "Example Title",
    "recommendation": "Example recommendation text here",
    "rationale": "Example rationale text here",
    "riskLevel": "Low",
    "timeframe": "Short Term"
  }`;
};

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    <div className="flex gap-2">
      <div className="h-6 bg-gray-200 rounded w-20"></div>
      <div className="h-6 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

const getBadgeColor = (riskLevel) => {
  const riskLowerCase = riskLevel?.toLowerCase() || '';
  if (riskLowerCase.includes('low')) return 'bg-green-100 text-green-800 border-green-200';
  if (riskLowerCase.includes('medium')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (riskLowerCase.includes('high')) return 'bg-red-100 text-red-800 border-red-200';
  return 'bg-blue-100 text-blue-800 border-blue-200';
};

const AdviceCard = ({ icon, title, type }) => {
  const { t, currentLanguage: language } = useTranslation();
  const [advice, setAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [formatRetryCount, setFormatRetryCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const MAX_RETRIES = 3;
  const MAX_FORMAT_RETRIES = 2;
  const TEXT_LIMIT = 100;
  const FORMAT_RETRY_DELAY = 1500; // 1.5 seconds between format retries

  const fetchAdvice = useCallback(async (isFormatRetry = false) => {
    if (!isFormatRetry) {
      setIsLoading(true);
      setError(null);
      setIsRetrying(false);
      setFormatRetryCount(0);
    } else {
      console.log(`Format retry attempt ${formatRetryCount + 1}`);
    }

    try {
      const prompt = getStructuredPrompt(type, language);
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const text = await fetchGeminiAdvice(prompt, apiKey);
      
      const parsedAdvice = cleanAndParseJson(text);

      if (!parsedAdvice) {
        if (formatRetryCount < MAX_FORMAT_RETRIES) {
          // Auto-retry for format issues after a short delay
          setFormatRetryCount(prev => prev + 1);
          setTimeout(() => fetchAdvice(true), FORMAT_RETRY_DELAY);
          if (!isFormatRetry) {
            // Only set the error message on the first attempt
            setError('Invalid format received. Retrying automatically...');
          }
          return;
        }
        throw new Error('Invalid advice format after multiple attempts');
      }

      setAdvice(parsedAdvice);
      setError(null); // Clear any format error if successful
    } catch (error) {
      console.error('Error fetching advice:', error);
      
      // Improved error message for rate limiting
      let errorMsg = error.message;
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMsg = 'Rate limit reached. Using fallback data.';
      }
      
      const mockResponses = {
        market: {
          en: {
            title: "Diversify Your Stock Portfolio",
            recommendation: "Allocate 60% to blue-chip stocks, 30% to mid-caps, and 10% to emerging sectors",
            rationale: "This balanced approach provides stability while capturing growth opportunities",
            riskLevel: "Medium",
            timeframe: "Long Term"
          },
          hi: {
            title: "अपने स्टॉक पोर्टफोलियो में विविधता लाएं",
            recommendation: "60% ब्लू-चिप स्टॉक्स, 30% मिड-कैप्स, और 10% उभरते क्षेत्रों में निवेश करें",
            rationale: "यह संतुलित दृष्टिकोण स्थिरता प्रदान करते हुए विकास के अवसरों को पकड़ता है",
            riskLevel: "मध्यम",
            timeframe: "लंबी अवधि"
          }
        },
        banking: {
          en: {
            title: "Fixed Deposits with Selective Banks",
            recommendation: "Invest in FDs with AA-rated banks offering competitive interest rates",
            rationale: "These provide reasonable returns with high safety",
            riskLevel: "Low",
            timeframe: "Medium Term",
            interestRate: "7.2%"
          },
          hi: {
            title: "चुनिंदा बैंकों के साथ सावधि जमा",
            recommendation: "AA-रेटेड बैंकों में प्रतिस्पर्धी ब्याज दर वाले एफडी में निवेश करें",
            rationale: "ये उच्च सुरक्षा के साथ उचित रिटर्न प्रदान करते हैं",
            riskLevel: "कम",
            timeframe: "मध्यम अवधि",
            interestRate: "7.2%"
          }
        },
        alternative: {
          en: {
            title: "Real Estate Investment Trusts (REITs)",
            recommendation: "Allocate 15-20% of portfolio to commercial REITs focusing on IT parks",
            rationale: "REITs offer stable income via dividends with lower entry barriers than direct real estate",
            riskLevel: "Medium-Low",
            timeframe: "Medium to Long Term"
          },
          hi: {
            title: "रियल एस्टेट इन्वेस्टमेंट ट्रस्ट (REITs)",
            recommendation: "IT पार्क पर ध्यान केंद्रित करने वाले वाणिज्यिक REITs में पोर्टफोलियो का 15-20% आवंटित करें",
            rationale: "REITs लाभांश के माध्यम से स्थिर आय प्रदान करते हैं",
            riskLevel: "मध्यम-कम",
            timeframe: "मध्यम से लंबी अवधि"
          }
        }
      };
      
      setAdvice(mockResponses[type][language] || mockResponses[type]['en']);
      setError(errorMsg);
    } finally {
      if (!isFormatRetry) {
        setIsLoading(false);
      }
    }
  }, [type, language, formatRetryCount]);

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice]);

  // Manual retry - resets all retry counters
  const retryFetch = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(retryCount + 1);
      setFormatRetryCount(0);
      setIsRetrying(true);
      fetchAdvice();
    }
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else if (advice) {
      const text = `${advice.title}. ${advice.recommendation}. ${advice.rationale}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.onend = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const truncateText = (text) => {
    if (!text) return '';
    if (text.length <= TEXT_LIMIT || expanded) return text;
    return text.substring(0, TEXT_LIMIT) + '...';
  };

  return (
    <Card className="w-full bg-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between py-1 border-b border-blue-100">
        <div className="flex items-center gap-1">
          <div className="bg-blue-100 p-1.5 rounded-full">
            {React.cloneElement(icon, { className: "w-5 h-5 text-blue-600" })}
          </div>
          <CardTitle className="text-base font-bold text-blue-900">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={retryFetch}
            disabled={isRetrying}
            className="hover:bg-blue-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${isRetrying ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSpeech}
            className="hover:bg-blue-50 transition-colors"
          >
            {isPlaying ? (
              <VolumeX className="w-4 h-4 text-blue-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-blue-600" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-3 pb-4">
        {isLoading ? (
          <SkeletonLoader />
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 p-2 bg-red-50 rounded-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        ) : advice ? (
          <div className="space-y-3 transition-all duration-200">
            <div className="text-lg font-bold text-blue-900">{advice.title}</div>
            <div className="text-sm text-gray-700 leading-relaxed">{truncateText(advice.recommendation)}</div>
            <div className="text-sm text-gray-700 leading-relaxed">{truncateText(advice.rationale)}</div>
            {(advice.recommendation?.length > TEXT_LIMIT || advice.rationale?.length > TEXT_LIMIT) && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors"
                onClick={toggleExpand}
              >
                {expanded ? (
                  <>
                    {t.readLess} <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    {t.readMore} <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className={`px-2.5 py-1 rounded-full border ${getBadgeColor(advice.riskLevel)} transition-colors flex items-center gap-1`}>
                <AlertCircle className="w-3.5 h-3.5" />
                {t.riskLevel}: {advice.riskLevel}
              </Badge>
              <Badge className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                {t.timeframe}: {advice.timeframe}
              </Badge>
              {advice.interestRate && 
                <Badge className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {t.interestRate}: {advice.interestRate}
                </Badge>
              }
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

const FinancialAdvice = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none hover:from-blue-100 hover:to-indigo-100 transition-colors duration-300">
        <CardHeader className="flex flex-row items-center justify-center space-x-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <CardTitle className="text-xl font-bold text-blue-900">
            {t.investmentCategories.aiAdvisory}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdviceCard
          icon={<TrendingUp />}
          title={t.investmentCategories.stockMarket}
          type="market"
        />
        <AdviceCard
          icon={<Landmark />}
          title={t.investmentCategories.bankingInvestment}
          type="banking"
        />
        <AdviceCard
          icon={<Gem />}
          title={t.investmentCategories.alternativeInvestments}
          type="alternative"
        />
      </div>
    </div>
  );
};

export default React.memo(FinancialAdvice);
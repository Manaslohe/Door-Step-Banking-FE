import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, RefreshCw, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTranslation } from '../../context/TranslationContext';

const cleanAndParseJson = (text) => {
  try {
    // Extract JSON object from text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    let cleanText = jsonMatch[0]
      .replace(/[\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      // Fix property names
      .replace(/([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      // Ensure proper string values
      .replace(/:\s*([^",\{\}\[\]]+)(\s*[,}])/g, ':"$1"$2')
      // Fix boolean values
      .replace(/:\s*"(true|false)"/g, ':$1')
      // Fix number values
      .replace(/:\s*"(-?\d+\.?\d*)"/g, ':$1')
      // Remove trailing commas
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');

    const parsed = JSON.parse(cleanText);
    
    // Validate required fields
    const requiredFields = ['title', 'recommendation', 'rationale', 'riskLevel', 'timeframe'];
    const hasAllFields = requiredFields.every(field => parsed[field]);
    
    return hasAllFields ? parsed : null;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
};

const getPromptForType = (type, language) => {
  const basePrompt = `You are an Indian Investment Expert. Generate specific advice for ${type} investments. Return only a JSON object with this structure:
  {
    "title": "string",
    "recommendation": "string",
    "rationale": "string",
    "riskLevel": "string",
    "timeframe": "string"
    ${type === 'banking' ? ',"interestRate": number' : ''}
  }`;
  
  return `${basePrompt} Use ${language === 'hindi' ? 'Hindi' : 'English'} language.`;
};

export const AdviceCard = ({ icon, title, type }) => {
  const { t, language } = useTranslation();
  const [advice, setAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchAdvice = useCallback(async (retry = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: getPromptForType(type, language) }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 1,
              topP: 0.8,
              maxOutputTokens: 1024,
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response format');
      }

      const adviceText = data.candidates[0].content.parts[0].text;
      const parsedAdvice = cleanAndParseJson(adviceText);

      if (!parsedAdvice) {
        throw new Error('Failed to parse valid advice from response');
      }

      setAdvice(parsedAdvice);
      setRetryCount(0);

    } catch (err) {
      console.error('Error fetching advice:', err);
      
      if (retry < MAX_RETRIES && !err.name === 'AbortError') {
        console.log(`Retrying... Attempt ${retry + 1} of ${MAX_RETRIES}`);
        setTimeout(() => fetchAdvice(retry + 1), 1000 * (retry + 1)); // Exponential backoff
        setRetryCount(retry + 1);
      } else {
        setError(err.message === 'Failed to fetch' 
          ? 'Network error. Please check your connection.' 
          : 'Failed to get investment advice. Please try again.'
        );
        setRetryCount(0);
      }
    } finally {
      if (retry === 0) setIsLoading(false);
    }
  }, [type, language]);

  useEffect(() => {
    fetchAdvice();
    return () => setIsPlaying(false);
  }, [fetchAdvice]);

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else if (advice) {
      const text = `${advice.title}. ${advice.recommendation}. ${advice.rationale}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      utterance.onend = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="w-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between py-1 border-b border-blue-100">
        <div className="flex items-center gap-1">
          <div className="bg-blue-100 p-1.5 rounded">
            {React.cloneElement(icon, { className: "w-5 h-5 text-blue-600" })}
          </div>
          <CardTitle className="text-base font-bold text-blue-900">{title}</CardTitle>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchAdvice()}
            disabled={isLoading}
            className="hover:bg-blue-50"
            title={retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Refresh'}
          >
            {isLoading ? (
              <Loader2 className={`w-4 h-4 ${retryCount > 0 ? 'animate-bounce' : 'animate-spin'}`} />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSpeech}
            disabled={!advice}
            className="hover:bg-blue-50"
          >
            {isPlaying ? (
              <VolumeX className="w-4 h-4 text-blue-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-blue-600" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {error ? (
          <div className="text-red-500 text-sm flex flex-col items-center gap-2 p-4">
            <AlertCircle className="w-6 h-6" />
            <p className="text-center">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAdvice()}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-blue-50 rounded w-3/4" />
            <div className="h-4 bg-blue-50 rounded w-full" />
            <div className="h-4 bg-blue-50 rounded w-2/3" />
          </div>
        ) : advice ? (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-blue-800">
              {advice.title}
            </h3>
            <div className="bg-blue-50 p-2 rounded-lg space-y-2">
              <p className="text-sm text-blue-900">
                {advice.recommendation || advice.bestOption || advice.instrument}
              </p>
              <p className="text-xs text-gray-600">{advice.rationale}</p>
              
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                  {advice.riskLevel} Risk
                </Badge>
                {advice.timeframe && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                    {advice.timeframe}
                  </Badge>
                )}
                {advice.interestRate && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                    {advice.interestRate}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center py-4">
            No advice available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

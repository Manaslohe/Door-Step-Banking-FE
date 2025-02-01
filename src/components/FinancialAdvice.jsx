import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useTranslation } from '../context/TranslationContext';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const systemContext = (language) => `You are an AI Investment Advisor. Please provide investment advice considering:
- Current market conditions
- Risk assessment
- Investment horizon
- Market trends
Keep responses concise and professional.
Format response as JSON with title, recommendation, description, and riskLevel fields.
${language === 'hindi' ? 'Provide the response in Hindi language.' : 'Provide the response in English language.'}`;

const LoadingPulse = () => (
  <div className="space-y-2">
    <div className="h-4 bg-blue-100 rounded w-3/4"></div>
    <div className="h-3 bg-blue-100 rounded"></div>
    <div className="h-3 bg-blue-100 rounded w-5/6"></div>
  </div>
);

const RiskLevelBadge = ({ level, language }) => {
  const riskTranslations = {
    english: {
      'Low': 'Low',
      'Moderate': 'Moderate',
      'Medium-High': 'Medium-High',
      'High': 'High',
      'N/A': 'N/A'
    },
    hindi: {
      'Low': 'कम जोखिम',
      'Moderate': 'सामान्य जोखिम',
      'Medium-High': 'मध्यम-उच्च जोखिम',
      'High': 'उच्च जोखिम',
      'N/A': 'अज्ञात'
    }
  };

  // Updated colors with better contrast
  const colors = {
    'Low': 'bg-green-200 text-green-900 border border-green-300 font-medium',
    'Moderate': 'bg-yellow-200 text-yellow-900 border border-yellow-300 font-medium',
    'Medium-High': 'bg-orange-200 text-orange-900 border border-orange-300 font-medium',
    'High': 'bg-red-200 text-red-900 border border-red-300 font-medium',
    'N/A': 'bg-gray-200 text-gray-900 border border-gray-300 font-medium'
  };

  const translatedLevel = riskTranslations[language][level] || riskTranslations[language]['N/A'];

  return (
    <Badge className={`${colors[level] || colors['N/A']} px-3 py-1 text-sm`}>
      {translatedLevel}
    </Badge>
  );
};

const FinancialAdvice = () => {
  const { t, language } = useTranslation();
  const [currentAdvice, setCurrentAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchNewAdvice = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!API_KEY) {
        throw new Error('API key not configured');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemContext(language)}\n\nGenerate current investment advice in JSON format with fields:\n{
                  "title": "Investment opportunity title",
                  "recommendation": "Specific investment recommendation",
                  "description": "Brief market analysis and reasoning",
                  "riskLevel": "Low/Moderate/Medium-High/High"
                }`
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const adviceText = data.candidates[0].content.parts[0].text;
        const jsonMatch = adviceText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const advice = JSON.parse(jsonMatch[0]);
          setCurrentAdvice(advice);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewAdvice();
  }, [language]);

  useEffect(() => {
    fetchNewAdvice();
    const interval = setInterval(fetchNewAdvice, 30000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto h-[220px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-xl font-bold">{t.aiAdvisor}</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading}
          className="transition-all duration-200 hover:bg-blue-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5 text-blue-600" />
          )}
        </Button>
      </CardHeader>

      <CardContent className="pt-1 flex-1 overflow-hidden">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. {t.tryAgainLater}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="h-full">
            {isLoading ? (
              <LoadingPulse />
            ) : currentAdvice ? (
              <div className="h-full">
                <h3 className="text-lg font-semibold text-blue-700 mb-1 leading-relaxed">
                  {currentAdvice.title}
                </h3>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    <p className="font-medium text-blue-900 text-sm leading-relaxed tracking-wide">
                      {currentAdvice.recommendation}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed tracking-wide">
                      {currentAdvice.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium text-gray-700">{t.riskLevel}:</span>
                    <RiskLevelBadge level={currentAdvice.riskLevel} language={language} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">{t.unableToLoad}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialAdvice;
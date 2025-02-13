import React, { useState, useCallback, useEffect } from 'react';
import { TrendingUp, Landmark, Gem, Bot } from 'lucide-react';
import { AdviceCard } from './AdviceCard';
import { useTranslation } from '../../context/TranslationContext';
import { Card, CardHeader, CardTitle } from '../ui/card';

const combinedSystemContext = (language) => `You are an Indian Investment Expert. Provide recommendations in this exact format, with no deviations:

{
  "marketAdvice": {
    "title": "Reliance Industries (NSE: RELIANCE) - Strong Growth",
    "recommendation": "Buy at target 2500",
    "currentPrice": 2450.50,
    "rationale": "Strong Q3 results and retail growth",
    "riskLevel": "Moderate",
    "sector": "Energy",
    "timeframe": "Long Term"
  },
  "bankingAdvice": {
    "title": "Fixed Deposit - SBI",
    "bestOption": "SBI Tax Saving FD",
    "interestRate": 7.5,
    "rationale": "Best rates with tax benefits",
    "riskLevel": "Low",
    "liquidity": "Medium",
    "taxBenefit": true,
    "timeframe": "Long Term"
  },
  "alternativeAdvice": {
    "title": "Sovereign Gold Bond 2024",
    "instrument": "RBI Gold Bond",
    "expectedReturn": "8% annually",
    "rationale": "Hedge against inflation",
    "riskLevel": "Low",
    "liquidity": "Medium",
    "minimumInvestment": 5000,
    "timeframe": "Long Term"
  }
}

CRITICAL: Follow this format exactly. Use double quotes for all property names and string values.
Use the exact same property names shown above.
${language === 'hindi' ? 'Provide content in Hindi language.' : 'Provide content in English language.'}`;

const cleanAndParseJson = (text) => {
  let cleanText = '';
  try {
    // Remove any non-JSON content
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON object found');
    }
    
    cleanText = jsonMatch[0]
      // Remove all newlines and extra spaces
      .replace(/\s+/g, ' ')
      // Fix property names
      .replace(/([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      // Ensure proper string values
      .replace(/:\s*([^",\{\}\[\]]+)(\s*[,}])/g, ':"$1"$2')
      // Fix boolean values
      .replace(/:\s*"(true|false)"/g, ':$1')
      // Fix number values
      .replace(/:\s*"(-?\d+\.?\d*)"/g, ':$1')
      // Remove currency symbols
      .replace(/[₹$€£¥]/g, '')
      // Remove trailing commas
      .replace(/,\s*}/g, '}')
      // Fix spacing
      .replace(/"\s+"/g, '","')
      .replace(/}\s+"/g, '},"')
      .replace(/"\s+}/g, '"}');

    try {
      return JSON.parse(cleanText);
    } catch (parseError) {
      console.error('First parse attempt failed:', parseError);
      
      // Second attempt with more aggressive cleaning
      cleanText = cleanText
        .replace(/([{,])\s*'([^']+)'\s*:/g, '$1"$2":') // Fix single-quoted property names
        .replace(/:\s*'([^']+)'/g, ':"$1"') // Fix single-quoted values
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
      
      return JSON.parse(cleanText);
    }
  } catch (err) {
    console.error('JSON parsing error:', err);
    console.error('Original text:', text);
    console.error('Cleaned text:', cleanText);
    throw new Error(`Failed to parse investment advice: ${err.message}`);
  }
};

const InvestmentAdvice = () => {
  const { t, language } = useTranslation();
  const [allAdvice, setAllAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdvice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${combinedSystemContext(language)}
              IMPORTANT: Return a valid JSON object with double quotes around property names.
              Do not include any markdown formatting or additional text.`
            }]
          }],
          generationConfig: {
            temperature: 0.1, // Reduced for more consistent output
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response format');
      }

      const adviceText = data.candidates[0].content.parts[0].text;
      const parsedAdvice = cleanAndParseJson(adviceText);
      
      // Validate the parsed advice
      if (!parsedAdvice.marketAdvice || !parsedAdvice.bankingAdvice || !parsedAdvice.alternativeAdvice) {
        throw new Error('Missing required advice sections');
      }

      setAllAdvice(parsedAdvice);
    } catch (err) {
      console.error('Error fetching advice:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice]);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
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
          advice={allAdvice?.marketAdvice}
          isLoading={isLoading}
          error={error}
        />
        <AdviceCard
          icon={<Landmark />}
          title={t.investmentCategories.bankingInvestment}
          advice={allAdvice?.bankingAdvice}
          isLoading={isLoading}
          error={error}
        />
        <AdviceCard
          icon={<Gem />}
          title={t.investmentCategories.alternativeInvestments}
          advice={allAdvice?.alternativeAdvice}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default React.memo(InvestmentAdvice);

import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, RefreshCw, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTranslation } from '../../context/TranslationContext';

export const AdviceCard = ({ icon, title, advice, isLoading, error }) => {
  const { t, language } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else if (advice) {
      const text = `${advice.title}. ${advice.recommendation || advice.bestOption || advice.instrument}. ${advice.rationale}`;
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
      </CardHeader>

      <CardContent className="pt-2">
        {error ? (
          <div className="text-red-500 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
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

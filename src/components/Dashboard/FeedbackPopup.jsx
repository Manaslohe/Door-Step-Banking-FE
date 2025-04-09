import React, { useState, useEffect } from 'react';
import { X, Send, SmilePlus, CheckCircle2 } from 'lucide-react';
import Sentiment from 'sentiment';
import api from '@/services/api';
import { useTranslation } from '@/context/TranslationContext';

const FeedbackPopup = ({ onClose }) => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentimentScore, setSentimentScore] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const sentiment = new Sentiment();

  const emojis = [
    { value: 1, icon: '😢', label: t.feedbackPopup.ratings[1] },
    { value: 2, icon: '😕', label: t.feedbackPopup.ratings[2] },
    { value: 3, icon: '😐', label: t.feedbackPopup.ratings[3] },
    { value: 4, icon: '😊', label: t.feedbackPopup.ratings[4] },
    { value: 5, icon: '😄', label: t.feedbackPopup.ratings[5] }
  ];

  // Convert sentiment score to rating (1-5 scale)
  const getAutomaticRating = (sentimentResult) => {
    if (!sentimentResult) return 0;
    
    const comparative = sentimentResult.comparative;
    if (comparative <= -0.75) return 1;        // Very Dissatisfied
    if (comparative <= -0.25) return 2;        // Dissatisfied
    if (comparative >= 0.75) return 5;         // Very Satisfied
    if (comparative >= 0.25) return 4;         // Satisfied
    return 3;                                  // Neutral
  };

  useEffect(() => {
    if (feedback.trim()) {
      const result = sentiment.analyze(feedback);
      setSentimentScore(result);
      setRating(getAutomaticRating(result));
    } else {
      setSentimentScore(null);
      setRating(0);
    }
  }, [feedback]);

  const getSentimentColor = () => {
    if (!sentimentScore) return 'gray-50/50';
    if (sentimentScore.comparative > 0.5) return 'green-50';
    if (sentimentScore.comparative < -0.5) return 'red-50';
    return 'yellow-50';
  };

  const analyzeWords = (sentimentResult) => {
    const wordCounts = {};
    const words = sentimentResult.tokens;
    
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    const positiveWords = sentimentResult.positive.map(word => ({
      word,
      score: sentiment.analyze(word).score,
      count: wordCounts[word] || 1
    }));

    const negativeWords = sentimentResult.negative.map(word => ({
      word,
      score: sentiment.analyze(word).score,
      count: wordCounts[word] || 1
    }));

    return { positiveWords, negativeWords };
  };

  const getUserDataFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData) return null;

      return {
        token,
        user: userData
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const authData = getUserDataFromToken();
    if (!authData) {
      console.error('No authentication data found');
      return;
    }

    const sentimentResult = sentiment.analyze(feedback);
    const wordAnalysis = analyzeWords(sentimentResult);
    
    try {
      await api.submitFeedback({
        userId: authData.user._id,
        userName: `${authData.user.firstName} ${authData.user.lastName}`,
        userPhone: authData.user.phone,
        feedback,
        rating,
        sentiment: {
          score: sentimentResult.score,
          comparative: sentimentResult.comparative,
          positive: sentimentResult.positive,
          negative: sentimentResult.negative,
          tokens: sentimentResult.tokens,
          wordAnalysis: {
            positiveWords: wordAnalysis.positiveWords,
            negativeWords: wordAnalysis.negativeWords
          }
        }
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000); // Close after 2 seconds

    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] p-8 transform transition-all">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 animate-[scale_0.5s_ease-in-out]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{t.feedbackPopup.thankYou}</h3>
            <p className="text-gray-500">{t.feedbackPopup.feedbackSuccess}</p>
            <div className="animate-[fadeIn_1s_ease-in-out] text-4xl">
              {rating >= 4 ? '😄' : rating >= 3 ? '😊' : '🙂'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
         onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl py-5 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <SmilePlus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">{t.feedbackPopup.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Feedback Text Area with Sentiment Analysis */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t.feedbackPopup.textareaLabel}
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className={`w-full p-4 border border-gray-200 rounded-xl resize-none
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder:text-gray-400 transition-all h-[100px]
                bg-${getSentimentColor()}`}
              placeholder={t.feedbackPopup.textareaPlaceholder}
            />
          </div>

          {/* Rating Section with improved alignment and grayscale effect */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {t.feedbackPopup.sentimentLabel}
            </label>
            <div className="grid grid-cols-5 gap-2 px-2">
              {emojis.map((emoji) => (
                <div
                  key={emoji.value}
                  className={`
                    relative group flex flex-col items-center
                    py-3 px-1 rounded-xl transition-all duration-300
                    ${rating === emoji.value 
                      ? 'z-10' 
                      : 'filter grayscale opacity-40'}
                  `}
                >
                  {/* Glow effect background */}
                  {rating === emoji.value && (
                    <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full" />
                  )}
                  
                  {/* Emoji and label container */}
                  <div className="relative flex flex-col items-center">
                    <span className={`
                      text-3xl transition-all duration-300 mb-2
                      ${rating === emoji.value ? 'transform scale-125' : ''}
                    `}>
                      {emoji.icon}
                    </span>
                    <span className={`
                      text-[11px] text-center transition-colors duration-200
                      font-medium leading-tight
                      ${rating === emoji.value 
                        ? 'text-blue-600' 
                        : 'text-gray-500'}
                    `}>
                      {emoji.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !rating || !feedback.trim()}
            className={`
              w-full py-3 px-4 rounded-xl
              flex items-center justify-center gap-2
              font-medium transition-all duration-200
              ${isSubmitting || !rating || !feedback.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white'}
            `}
          >
            <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
            {isSubmitting ? t.feedbackPopup.submitting : t.feedbackPopup.submitButton}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPopup;
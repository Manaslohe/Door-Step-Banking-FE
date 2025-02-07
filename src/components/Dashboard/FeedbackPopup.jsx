import React, { useState } from 'react';
import { X, Send, SmilePlus } from 'lucide-react';

const FeedbackPopup = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emojis = [
    { value: 1, icon: '😢', label: 'Very Dissatisfied' },
    { value: 2, icon: '😕', label: 'Dissatisfied' },
    { value: 3, icon: '😐', label: 'Neutral' },
    { value: 4, icon: '😊', label: 'Satisfied' },
    { value: 5, icon: '😄', label: 'Very Satisfied' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log({ feedback, rating });
    setIsSubmitting(false);
    onClose();
  };

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
              <h2 className="text-lg font-semibold text-white">Share Your Feedback</h2>
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
          {/* Rating Section with improved alignment and grayscale effect */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              How was your experience?
            </label>
            <div className="grid grid-cols-5 gap-2 px-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji.value}
                  type="button"
                  onClick={() => setRating(emoji.value)}
                  className={`
                    relative group flex flex-col items-center
                    py-3 px-1 rounded-xl transition-all duration-300
                    ${rating === emoji.value 
                      ? 'z-10' 
                      : 'filter grayscale opacity-40 hover:opacity-60 hover:grayscale-[0.6]'}
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
                      ${rating === emoji.value 
                        ? 'transform scale-125' 
                        : 'group-hover:scale-110'}
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
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Text Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tell us more about your experience
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl resize-none
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder:text-gray-400 transition-all h-[100px]
                bg-gray-50/50"
              placeholder="What went well? What could be improved?"
            />
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
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPopup;
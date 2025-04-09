import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Square, MicOff, VolumeX, HelpCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../Admin/Toast';
import { getServiceExplanation } from '../../utils/serviceDescriptions';
import { speak } from '../../utils/voiceUtils';
import { useTranslation } from '../../context/TranslationContext';

// Internal Button Component
const VoiceControlButton = ({ 
  type = 'input',
  isActive = false,
  onClick,
  className = '',
  size = 'md',
  isProcessing = false,
}) => {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const getIcon = () => {
    switch (type) {
      case 'input':
        return isActive ? <Square size={iconSizes[size]} /> : <Mic size={iconSizes[size]} />;
      case 'feedback':
        return isActive ? <Volume2 size={iconSizes[size]} /> : <VolumeX size={iconSizes[size]} />;
      case 'explain':
        return isActive ? <BookOpen size={iconSizes[size]} /> : <HelpCircle size={iconSizes[size]} />;
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'input':
        return isActive 
          ? 'bg-red-500 hover:bg-red-600 ring-red-300' 
          : 'bg-blue-500 hover:bg-blue-600 ring-blue-300';
      case 'feedback':
        return isActive 
          ? 'bg-emerald-500 hover:bg-emerald-600 ring-emerald-300' 
          : 'bg-slate-500 hover:bg-slate-600 ring-slate-300';
      case 'explain':
        return isActive 
          ? 'bg-purple-500 hover:bg-purple-600 ring-purple-300' 
          : 'bg-indigo-500 hover:bg-indigo-600 ring-indigo-300';
      default:
        return '';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        ${getColors()}
        text-white 
        shadow-lg 
        transition-all
        duration-200
        relative
        ring-2
        ring-opacity-50
        ${isActive ? 'ring-4' : 'ring-0'}
        ${className}
      `}
      title={`${isActive ? 'Stop' : 'Start'} voice ${type}`}
    >
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full bg-current opacity-20"
            style={{
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
        )}
      </AnimatePresence>
      {getIcon()}
    </motion.button>
  );
};

// Main VoiceAssistant Component
const VoiceAssistant = ({ 
  onVoiceInput, 
  activeField,
  feedbackEnabled = true,
  size = 'md',
  serviceType = 'CASH_DEPOSIT'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [toast, setToast] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const { currentLanguage } = useTranslation();

  useEffect(() => {
    // Clean up any active speech or recognition on unmount
    return () => {
      stopEverything();
    };
  }, []);

  const stopEverything = async () => {
    // Stop speech recognition
    if (window.recognition) {
      window.recognition.abort();
    }
    // Stop any ongoing speech immediately
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setIsProcessing(false);
    setIsExplaining(false);

    // Ensure all states are reset
    await new Promise(resolve => setTimeout(resolve, 50));
  };

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto hide after 3 seconds
  };

  const startListening = () => {
    if (!window.webkitSpeechRecognition) {
      showToast('Speech recognition is not supported in your browser.', 'error');
      return;
    }

    if (!activeField) {
      showToast('Please click on an input field first', 'warning');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    window.recognition = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setIsProcessing(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
      window.recognition = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      setIsProcessing(false);
      window.recognition = null;
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const voiceData = { [activeField || 'command']: transcript };
      onVoiceInput(voiceData);
    };

    recognition.start();
  };

  const toggleListening = () => {
    if (isListening) {
      stopEverything();
    } else {
      startListening();
    }
  };

  const toggleVoiceFeedback = () => {
    if (voiceFeedback) {
      stopEverything();
    }
    setVoiceFeedback(!voiceFeedback);
    localStorage.setItem('voiceFeedback', (!voiceFeedback).toString());
  };

  const explainService = async () => {
    if (isExplaining) {
      await stopEverything();
      return;
    }

    try {
      setIsExplaining(true);
      const explanation = getServiceExplanation(serviceType, currentLanguage);
      
      if (!explanation) {
        throw new Error('No explanation available for this service');
      }

      await speak(explanation, currentLanguage);
    } catch (error) {
      console.error('Explanation error:', error);
      if (error.error === 'interrupted') {
        await stopEverything();
      } else {
        showToast(error.message || 'Could not play service explanation', 'error');
      }
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative min-w-[40px]">
          <VoiceControlButton
            type="input"
            isActive={isListening}
            isProcessing={isProcessing}
            onClick={toggleListening}
            size={size}
            className={activeField ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}
          />
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-red-500 w-max"
              >
                Listening...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {feedbackEnabled && (
          <div className="relative min-w-[40px]">
            <VoiceControlButton
              type="feedback"
              isActive={voiceFeedback}
              onClick={toggleVoiceFeedback}
              size={size}
            />
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-slate-500 w-max"
              >
                {voiceFeedback ? 'Feedback On' : 'Feedback Off'}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        <div className="relative min-w-[40px]">
          <VoiceControlButton
            type="explain"
            isActive={isExplaining}
            onClick={explainService}
            size={size}
          />
          <AnimatePresence>
            {isExplaining && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-purple-500 w-max"
              >
                Explaining...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;

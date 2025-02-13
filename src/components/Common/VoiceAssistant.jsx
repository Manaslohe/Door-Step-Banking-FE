import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Square } from 'lucide-react';
import { motion } from 'framer-motion';

const serviceExplanations = {
  CASH_DEPOSIT: `Welcome to the Cash Deposit service. This service allows you to schedule a cash deposit 
    pickup from your location. Our agent will come to collect the cash and deposit it in your bank account. 
    The process is secure and convenient. You'll need to provide your bank account details, 
    pickup address, preferred date and time, and the amount you wish to deposit.`
};

const formFields = {
  CASH_DEPOSIT: [
    {
      name: 'bankAccount',
      type: 'select',
      label: 'Bank Account',
      prompt: 'Which bank account would you like to use?'
    },
    {
      name: 'deliveryAddress',
      type: 'text',
      label: 'Delivery Address',
      prompt: 'Please tell me the delivery address for cash pickup.'
    },
    {
      name: 'date',
      type: 'date',
      label: 'Pickup Date',
      prompt: 'What date would you like for the pickup?'
    },
    {
      name: 'timeSlot',
      type: 'select',
      label: 'Time Slot',
      prompt: 'Which time slot do you prefer? You can say the time or the slot number.'
    },
    {
      name: 'amount',
      type: 'number',
      label: 'Amount',
      prompt: 'How much cash would you like to deposit?'
    }
  ]
};

const VoiceAssistant = ({ 
  service, 
  onVoiceInput, 
  formRefs = {}, 
  options = {}, 
  onFieldFocus,
  formData
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(-1);
  const [isGuiding, setIsGuiding] = useState(false);

  const stopAll = () => {
    if (window.recognition) {
      window.recognition.abort();
    }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setIsListening(false);
    setIsGuiding(false);
    setCurrentFieldIndex(-1);
  };

  const speak = (text, onEndCallback) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsPlaying(false);
      if (onEndCallback) onEndCallback();
    };
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const explainService = () => {
    if (isPlaying || isListening) {
      stopAll();
    } else {
      speak(serviceExplanations[service]);
    }
  };

  const findNextEmptyField = (startIndex = 0) => {
    const fields = formFields[service];
    for (let i = startIndex; i < fields.length; i++) {
      const field = fields[i];
      if (!formData[field.name] || formData[field.name] === '') {
        return i;
      }
    }
    return -1; // All fields are filled
  };

  const processNextField = (fieldIndex) => {
    const fields = formFields[service];
    
    // Find next empty field
    const nextEmptyIndex = findNextEmptyField(fieldIndex);
    
    if (nextEmptyIndex === -1) {
      speak("Great! All fields are filled. You can now submit the form.");
      stopAll();
      return;
    }

    const field = fields[nextEmptyIndex];
    setCurrentFieldIndex(nextEmptyIndex);
    
    if (onFieldFocus) {
      onFieldFocus(field.name);
    }

    if (field.type === 'select' && formRefs[field.name]?.current) {
      formRefs[field.name].current.focus();
      setTimeout(() => simulateSelectClick(formRefs[field.name]), 300);
    }

    speak(field.prompt, () => startListeningForField(field));
  };

  const startGuidedInput = () => {
    if (isListening || isGuiding) {
      stopAll();
    } else {
      setIsGuiding(true);
      const firstEmptyIndex = findNextEmptyField(0);
      if (firstEmptyIndex === -1) {
        speak("All fields are already filled. You can now submit the form.");
        return;
      }
      processNextField(firstEmptyIndex);
    }
  };

  const simulateSelectClick = (selectRef) => {
    if (!selectRef?.current) return;
    
    // Force open the select dropdown
    selectRef.current.click();
    selectRef.current.focus();
    
    // Dispatch multiple events to ensure dropdown opens
    ['mousedown', 'mouseup', 'click'].forEach(eventType => {
      const event = new MouseEvent(eventType, {
        view: window,
        bubbles: true,
        cancelable: true
      });
      selectRef.current.dispatchEvent(event);
    });
  };

  const startListeningForField = (field) => {
    if (!window.webkitSpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    window.recognition = recognition; // Store reference for stopAll
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      window.recognition = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      window.recognition = null;
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      parseFieldInput(field, transcript);
    };

    recognition.start();
  };

  const moveToNextField = () => {
    const nextEmpty = findNextEmptyField(currentFieldIndex + 1);
    if (nextEmpty !== -1) {
      setTimeout(() => processNextField(nextEmpty), 1000);
    } else {
      speak("All fields are now filled. You can submit the form.");
      stopAll();
    }
  };

  const handleFieldCompletion = (voiceData, successMessage) => {
    onVoiceInput(voiceData);
    speak(successMessage, moveToNextField);
  };

  const parseFieldInput = (field, transcript) => {
    const voiceData = {};
    const normalizedTranscript = transcript.toLowerCase().trim();

    switch (field.type) {
      case 'select':
        if (field.name === 'bankAccount') {
          const option = options[field.name]?.find(opt => {
            if (normalizedTranscript.match(/^(\d+)$/)) {
              const num = parseInt(normalizedTranscript) - 1;
              return num === options[field.name].indexOf(opt);
            }
            return opt.searchTerms.some(term => 
              normalizedTranscript.includes(term) ||
              term.includes(normalizedTranscript)
            );
          });

          if (option) {
            voiceData[field.name] = option.value;
            if (formRefs[field.name]?.current) {
              formRefs[field.name].current.value = option.value;
              formRefs[field.name].current.dispatchEvent(
                new Event('change', { bubbles: true })
              );
            }
            handleFieldCompletion(voiceData, `Selected ${option.label.split('-')[0].trim()}`);
            return;
          }
        }
        break;

      case 'text':
        voiceData[field.name] = transcript;
        handleFieldCompletion(voiceData, `Got it! Set to ${transcript}`);
        return;

      case 'number':
        const amount = transcript.replace(/[^0-9]/g, '');
        if (amount) {
          voiceData[field.name] = amount;
          handleFieldCompletion(voiceData, `Amount set to ${amount}`);
          return;
        }
        break;

      case 'date':
        const dateMatch = transcript.match(/(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
        if (dateMatch) {
          const [_, day, __, month, year] = dateMatch;
          const date = new Date(`${month} ${day}, ${year}`);
          voiceData[field.name] = date.toISOString().split('T')[0];
          handleFieldCompletion(voiceData, `Date set to ${month} ${day}, ${year}`);
          return;
        }
        break;
    }

    speak(`I didn't catch that. Please try again.`, () => {
      startListeningForField(field);
    });
  };

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={explainService}
        className={`p-3 rounded-full ${
          isPlaying ? 'bg-red-500' : 'bg-blue-500'
        } text-white shadow-lg`}
        title={isPlaying ? "Stop explanation" : "Listen to service explanation"}
      >
        {isPlaying ? <Square size={20} /> : <Volume2 size={20} />}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={startGuidedInput}
        className={`p-3 rounded-full ${
          isListening || isGuiding ? 'bg-red-500' : 'bg-blue-500'
        } text-white shadow-lg`}
        title={isListening || isGuiding ? "Stop voice input" : "Start guided voice input"}
      >
        <Mic size={20} />
      </motion.button>
    </div>
  );
};

export default VoiceAssistant;

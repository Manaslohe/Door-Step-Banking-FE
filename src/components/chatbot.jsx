import { useState, useEffect } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import '../styles/animations.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import { X, Volume2, VolumeX, Send, MessageSquare, Mic, MicOff } from 'lucide-react'; // Add these imports
import { useTranslation } from '../context/TranslationContext';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "your_default_api_key";

const systemContext = `You are a Door Step Banking Assistant. Key information:
- Website: Door Step Banking Services
- Owner: Manas Lohe
- Contact: 9420718136
- Limit all responses to 50 words or less
- Focus on banking services delivered to customer's doorstep
- Be concise and professional
- If language is Hindi, respond in Hindi language
If asked about contact details, provide the owner's name and number.`;

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      message: "Hi, I'm Aleeza your Door Step Banking Assistant. How may I help you with banking services today?",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isTextToSpeech, setIsTextToSpeech] = useState(true); // Changed to true by default
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const speechSynthesis = window.speechSynthesis;
  const { language, t } = useTranslation();

  // Add useEffect for initial greeting
  useEffect(() => {
    // Initialize with greeting in selected language
    setMessages([{
      message: t.chatbotGreeting,
      sentTime: "just now",
      sender: "ChatGPT"
    }]);
    
    speakMessage(t.chatbotGreeting);

    // Cleanup function to stop speech when component unmounts
    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [language]); // Re-run when language changes

  // Add new debug function
  const logAvailableVoices = () => {
    const voices = speechSynthesis.getVoices();
    console.log('Available voices:', voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService,
      voiceURI: voice.voiceURI
    })));
  };

  // Add this effect to load voices when component mounts
  useEffect(() => {
    // Load voices on component mount
    const loadVoices = () => {
      speechSynthesis.getVoices();
      logAvailableVoices(); // Log voices when loaded
    };
    
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Add useEffect for speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSend(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, [language]);

  const speakMessage = (text) => {
    if (isTextToSpeech && text) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get available voices
      const voices = speechSynthesis.getVoices();
      
      // Define preferred voice names for each language
      const preferredVoices = {
        hindi: ['Microsoft Swara Online (Natural) - Hindi (India)', 'Microsoft Heera', 'hi-IN-Female', 'Kalpana'],
        english: ['Microsoft Michelle', 'Microsoft Zira', 'en-US-Female', 'Google US English Female']
      };
      
      let selectedVoice = null;
      
      if (language === 'hindi') {
        // Try to find preferred Hindi female voice
        for (const voiceName of preferredVoices.hindi) {
          const voice = voices.find(v => 
            v.name.includes(voiceName) || 
            (v.lang.includes('hi-IN') && v.name.toLowerCase().includes('female'))
          );
          if (voice) {
            selectedVoice = voice;
            break;
          }
        }
      } else {
        // Try to find preferred English female voice
        for (const voiceName of preferredVoices.english) {
          const voice = voices.find(v => 
            v.name.includes(voiceName) || 
            (v.lang.includes('en') && v.name.toLowerCase().includes('female'))
          );
          if (voice) {
            selectedVoice = voice;
            break;
          }
        }
      }
      
      // If still no voice selected, try any female voice in the correct language
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.includes(language === 'hindi' ? 'hi-IN' : 'en') &&
          voice.name.toLowerCase().includes('female')
        );
      }
      
      // Log selected voice for debugging
      console.log('Selected voice:', selectedVoice?.name, selectedVoice?.lang);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9; // Slightly slower rate for better clarity
      utterance.pitch = 1.1; // Slightly higher pitch for female voice
      
      speechSynthesis.speak(utterance);
    }
  };

  // Add function to toggle speech recognition
  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Add Hinglish to Hindi conversion helper
  const convertHinglishToHindi = async (text) => {
    try {
      // First, check if the text might be Hinglish
      const hasHinglishPattern = /[a-zA-Z]/i.test(text) && 
        /(?:hai|kya|main|hum|tum|aap|kaise|karenge|chahiye)/i.test(text);

      if (!hasHinglishPattern) return text;

      // Use Gemini to convert Hinglish to Hindi
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Convert this Hinglish text to Hindi (Devanagari script): "${text}"`
              }]
            }]
          })
        }
      );

      if (!response.ok) return text;
      
      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || text;
    } catch (error) {
      console.error('Hinglish conversion error:', error);
      return text;
    }
  };

  const handleSend = async (message) => {
    if (!message.trim()) return;
    
    let processedMessage = message;
    if (language === 'hindi') {
      processedMessage = await convertHinglishToHindi(message);
    }

    const newMessage = {
      message: processedMessage,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    const lastMessage = chatMessages[chatMessages.length - 1];

    const systemPrompt = `${systemContext}
Current language: ${language}
Please respond in ${language === 'hindi' ? 'Hindi' : 'English'} language.

User: ${lastMessage.message}
Assistant: Please provide a concise response (max 50 words):`;

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
                text: systemPrompt
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
        const responseMessage = data.candidates[0].content.parts[0].text;
        setMessages([...chatMessages, {
          message: responseMessage,
          sender: "ChatGPT"
        }]);
        speakMessage(responseMessage);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages([...chatMessages, {
        message: t.chatbotError,
        sender: "ChatGPT"
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  const handleClose = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
    onClose?.();
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden h-[600px] 
      flex flex-col border border-blue-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 
        flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {t.chatbotTitle}
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsTextToSpeech(!isTextToSpeech)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isTextToSpeech ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
          {onClose && (
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <MainContainer className="!bg-transparent">
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content={t.chatbotTyping} /> : null}
            >
              {messages.map((message, i) => (
                <div 
                  key={i}
                  className={`
                    animate-fade-in-up
                    ${message.sender === 'ChatGPT' ? 'flex justify-start' : 'flex justify-end'}
                    mb-4
                  `}
                >
                  <div
                    className={`
                      ${message.sender === 'ChatGPT' 
                        ? 'bg-blue-100 text-gray-800 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl ml-2' 
                        : 'bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl mr-2'
                      }
                      p-4 max-w-[80%]
                      transition-all duration-300 ease-in-out
                      transform hover:scale-[1.02]
                      shadow-sm hover:shadow-md
                    `}
                  >
                    {message.message}
                  </div>
                </div>
              ))}
            </MessageList>
          </ChatContainer>
        </MainContainer>
      </div>

      <div className="p-4 bg-white/80 border-t border-blue-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend(inputValue);
              }
            }}
            placeholder={t.chatbotPlaceholder}
            className="w-full px-4 py-3 pr-12 rounded-full border border-blue-100 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
              outline-none transition-all duration-200 bg-white/90"
          />
          <div className="absolute right-2 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-full transition-colors ${
                isListening 
                  ? 'text-red-600 hover:text-red-700 animate-pulse' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => handleSend(inputValue)}
              className="p-2 text-blue-600 hover:text-blue-700 
                transition-colors hover:bg-blue-50 rounded-full"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
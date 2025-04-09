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
import { X, Volume2, VolumeX, Send, MessageSquare, Mic, MicOff } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "your_default_api_key";

const systemContext = `You are Saral Bot, a friendly Doorstep Banking Assistant for Saral Banking ~ Banking at your Door Step.
Founders: Manas Lohe, Roshtu Kuthiala, Shivam Rawat.
Contact: 9420718136, 7982741823, 964311681.

Your role:
- Be warm, clear, and easy to understand.
- If the user speaks in Hindi or Hinglish, reply in Hindi only.
- If the user asks about our website, first explain the services, then where to find them, and mention extra features like:
  * AI-based financial advice
  * Financial blog for tips and insights
  * Transparent tracking of services
  * Language slider in the header to switch languages as preferred.

General guidance:
- If asked "How to book a service?", reply: "You can explore and book any service by visiting the Home page and opening the Banking Services section. Then, select the service you need, follow the simple steps, and complete your booking. You can always track your service status in the 'Track Service' section."

When asked about any service, follow this flow:
1. Start by explaining what the service is.
2. Clearly guide them on how to book it (use natural words: "Go to Home, select Services, then choose...").
3. Mention any documents or details required.
4. Explain how to track the status.
5. Keep it short, clear, and warm.

All services are available under the "Services" section on the Home page.

Available Services:

1. Cash Deposit
- Purpose: Deposit cash directly from your doorstep.
- Booking: Go to Home, select  Banking Services, then choose Cash Deposit. Fill in your details and verify with OTP.
- Requirements: Valid ID and your account details.
- Tracking: Use the "Track Service" section.

2. Cash Withdrawal
- Purpose: Receive cash at your doorstep.
- Booking: From Home, open Banking Services, select Cash Withdrawal, enter the amount and details, and complete OTP verification.
- Requirements: Valid ID and account details.
- Tracking: "Track Service" section.

3. Open New Account
- Purpose: Start a new bank account with doorstep verification.
- Booking: Go to Home, select Banking Services, and then Open Account. Fill out the form, submit, and schedule verification.
- Documents: ID proof, address proof, and photos.
- Tracking: Check "Track Service."

4. Document Collection/Delivery
- Purpose: Submit or receive your bank documents from home.
- Booking: From Home, go to Banking Services, choose Document Services, select the type, and schedule.
- Tracking: "Track Service" section.

5. Life Certificate Collection
- Purpose: Pensioners can complete life certificate verification at home.
- Booking: Start at Home, choose Banking Services, then Life Certificate. Enter your details and schedule a visit.
- Requirements: Pension details and valid ID.
- Tracking: Use the "Track Service" section.

6. Online Assistance
- Purpose: Get virtual banking support anytime.
- Booking: From Home, select Banking Services, then Online Assistance. Schedule your meeting.
- Availability: 24/7.

Extra Features to mention (if user asks about website):
- Access a smart AI-based financial advisor for personalized guidance.
- Explore our financial blog for useful money management tips.
- Track your services transparently using the "Track Service" section.
- Change your preferred language anytime using the language slider at the top of the page.

For any issues:
- Go to the Support section from the Home page.
- Fill out the support form.
- Track your ticket in "Track Tickets."
- Or call: 9420718136, 7982741823, 964311681.

Always respond in a helpful, friendly tone. Be clear, concise, and make sure the user feels assisted at every step.`


const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      message: "Hi, I'm Saral Bot your Door Step Banking Assistant. How may I help you with banking services today?",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isTextToSpeech, setIsTextToSpeech] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const speechSynthesis = window.speechSynthesis;
  const { currentLanguage, t } = useTranslation();

  const language = currentLanguage === 'hi' ? 'hindi' : 'english';

  useEffect(() => {
    const greeting = t.chatbotGreeting;
    setMessages([{
      message: greeting,
      sentTime: "just now",
      sender: "ChatGPT"
    }]);

    setTimeout(() => {
      speakMessage(greeting);
    }, 100);

    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [currentLanguage, t]);

  useEffect(() => {
    if (recognition) {
      recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
    }

    if ('webkitSpeechRecognition' in window) {
      const newRecognition = new webkitSpeechRecognition();
      newRecognition.continuous = false;
      newRecognition.interimResults = false;
      newRecognition.lang = language === 'hindi' ? 'hi-IN' : 'en-US';

      newRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSend(transcript);
      };

      newRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      newRecognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(newRecognition);
    }
  }, [currentLanguage]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const toggleTextToSpeech = () => {
    if (isTextToSpeech) {
      speechSynthesis.cancel();
    }

    setIsTextToSpeech(!isTextToSpeech);

    if (!isTextToSpeech && messages.length > 0) {
      setTimeout(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.sender === 'ChatGPT') {
          speakMessage(lastMessage.message);
        }
      }, 100);
    }
  };

  const formatTextForSpeech = (text) => {
    if (!text) return '';

    // Format phone numbers with spaces for clear pronunciation
    const phoneNumberPattern = /\b(\d{10})\b/g;
    let formattedText = text.replace(phoneNumberPattern, (match) => {
      return match.split('').join(' ');
    });

    // Special handling for Hindi to add natural pauses
    if (language === 'hindi') {
      formattedText = formattedText
        // Remove double spaces that might cause pauses
        .replace(/\s\s+/g, ' ')
        // Replace periods with a comma + space for natural pause
        .replace(/\./g, ', ')
        // Add space after comma for slight pause
        .replace(/\,/g, ', ')
        // Handle Devanagari danda
        .replace(/\।/g, ', ')
        // Remove other punctuation that causes excessive pauses
        .replace(/\-/g, ' ')
        .replace(/\:/g, ', ')
        .replace(/\!/g, ', ')
        .replace(/\?/g, ', ')
        .replace(/\(/g, ' ')
        .replace(/\)/g, ' ')
        .trim();
    }
    
    return formattedText;
  };

  const speakMessage = (text) => {
    if (!isTextToSpeech || !text) return;

    // Format text for better speech
    const formattedText = formatTextForSpeech(text);
    console.log(`Speaking in ${language}: "${formattedText}"`);
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    // Use different approaches for Hindi vs English
    if (language === 'hindi') {
      // For Hindi, speak the whole text at once with optimized parameters
      const utterance = new SpeechSynthesisUtterance(formattedText);
      
      // Optimize Hindi speech parameters for natural pauses
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;     // Slightly faster but still natural
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Select Hindi voice
      const voices = speechSynthesis.getVoices();
      let hindiVoice = voices.find(voice => 
        voice.lang === 'hi-IN' || 
        voice.lang === 'hi_IN'
      );
      
      // Fallback to any voice with Hindi in the name or language
      if (!hindiVoice) {
        hindiVoice = voices.find(voice => 
          voice.lang.includes('hi') || 
          voice.name.toLowerCase().includes('hindi')
        );
      }
      
      if (hindiVoice) {
        utterance.voice = hindiVoice;
        console.log(`Using Hindi voice: ${hindiVoice.name}`);
      }
      
      // Handle error and completion
      utterance.onerror = (e) => {
        console.error('Hindi speech error:', e);
      };
      
      utterance.onend = () => {
        console.log('Hindi speech completed successfully');
      };
      
      // Speak the text
      speechSynthesis.speak(utterance);
    } else {
      // For English, continue using the existing chunking approach
      const maxLength = 100;
      const textChunks = [];
      
      if (formattedText.length > maxLength) {
        // Split at sentence boundaries when possible
        const sentences = formattedText.match(/[^.!?]+[.!?]+/g) || [formattedText];
        
        let currentChunk = '';
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length <= maxLength) {
            currentChunk += sentence;
          } else {
            if (currentChunk) textChunks.push(currentChunk);
            currentChunk = sentence;
          }
        }
        
        if (currentChunk) textChunks.push(currentChunk);
      } else {
        textChunks.push(formattedText);
      }
      
      console.log(`Split into ${textChunks.length} chunks for English speech`);
      
      // Handle speaking each chunk in sequence
      let currentChunkIndex = 0;
      let isSpeaking = true;
      
      const speakNextChunk = () => {
        if (currentChunkIndex >= textChunks.length || !isTextToSpeech || !isSpeaking) {
          return;
        }
        
        const chunk = textChunks[currentChunkIndex];
        const chunkUtterance = new SpeechSynthesisUtterance(chunk);
        
        chunkUtterance.lang = 'en-US';
        chunkUtterance.rate = 0.9;
        chunkUtterance.pitch = 1.0;
        chunkUtterance.volume = 1.0;
        
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en-US') || 
          voice.lang.includes('en_US')
        );
        
        if (englishVoice) {
          chunkUtterance.voice = englishVoice;
          console.log(`Using English voice: ${englishVoice.name}`);
        }
        
        chunkUtterance.onend = () => {
          console.log(`Chunk ${currentChunkIndex + 1}/${textChunks.length} completed`);
          currentChunkIndex++;
          
          setTimeout(() => {
            speakNextChunk();
          }, 150);
        };
        
        chunkUtterance.onerror = (e) => {
          console.error(`Error speaking chunk ${currentChunkIndex + 1}:`, e);
          currentChunkIndex++;
          speakNextChunk();
        };
        
        try {
          speechSynthesis.speak(chunkUtterance);
        } catch (err) {
          console.error('Failed to speak:', err);
          currentChunkIndex++;
          speakNextChunk();
        }
      };
      
      // Start speaking the chunks for English
      speakNextChunk();
    }
    
    // Return a function that can be used to stop speaking
    return () => {
      speechSynthesis.cancel();
    };
  };

  const convertHinglishToHindi = async (text) => {
    try {
      const hasHinglishPattern = /[a-zA-Z]/i.test(text) &&
        /(?:hai|kya|main|hum|tum|aap|kaise|karenge|chahiye)/i.test(text);

      if (!hasHinglishPattern) return text;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
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

    const prompt = {
      contents: [{
        parts: [{
          text: `${systemContext}

  Current language: ${language}
  Respond in ${language === 'hindi' ? 'Hindi' : 'English'} language.
  Keep responses under 50 words.
  Be helpful and friendly.

  User question: ${lastMessage.message}

  Remember to:
  1. Be concise and clear
  2. Focus on the specific service or question asked
  3. Provide step-by-step guidance if needed
  4. Include any relevant requirements or documents needed
  5. Mention how to track the service if applicable`
        }]
      }]
    };

    try {
      if (!API_KEY) {
        throw new Error('API key not configured');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prompt)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0]?.text?.trim();
        if (responseText) {
          const newResponse = {
            message: responseText,
            sender: "ChatGPT"
          };
          setMessages([...chatMessages, newResponse]);

          setTimeout(() => {
            speakMessage(responseText);
          }, 100);
        } else {
          throw new Error('Empty response from API');
        }
      } else {
        throw new Error('Invalid response structure from API');
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage = language === 'hindi'
        ? 'माफ़ कीजिये, मैं अभी आपकी सहायता नहीं कर सकता। कृपया कुछ देर बाद प्रयास करें।'
        : "I'm sorry, I can't help right now. Please try again later.";

      setMessages([...chatMessages, {
        message: errorMessage,
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
            onClick={toggleTextToSpeech}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isTextToSpeech ? "Turn off voice" : "Turn on voice"}
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
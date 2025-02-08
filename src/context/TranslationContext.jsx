import React, { createContext, useContext, useState } from 'react';

export const translations = {
  english: {
    // Header translations
    back: 'Back',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    
    // Dashboard translations
    servicesOffered: 'Services Offered',
    servicesDescription: 'View all banking services available at your doorstep',
    userDashboard: 'User Profile',
    userDashboardDescription: 'Manage your profile and preferences',
    blogForum: 'Blog/Forum',
    blogDescription: 'Join discussions and stay updated with latest banking news',
    support: 'Support',
    supportDescription: '24/7 customer support and assistance',
    rbiGuidelines: 'RBI Guidelines',
    rbiDescription: 'Important banking regulations and policy updates',
    pricingStructure: 'Pricing Structure',
    pricingDescription: 'View service charges and banking fees',
    
    // Financial Advice translations
    aiAdvisor: 'AI Investment Advisory',
    riskLevel: 'Risk Level',
    unableToLoad: 'Unable to load investment advice',
    tryAgainLater: 'Please try again later',

    // Chatbot translations
    chatbotGreeting: "Hi, I'm Saral Bot, your Doorstep Banking Assistant. How may I help you with banking services today?",
    chatbotTyping: "Assistant is typing",
    chatbotPlaceholder: "Type your message here...",
    chatbotTitle: "Saral Bot",
    chatbotError: "I'm sorry, I'm having trouble connecting right now. Please try again later.",

    // Sidebar translations
    dashboard: 'Home',
    needHelp: 'Need Help?',
    contactSupport: 'Contact our support team'
  },
  hindi: {
    // Header translations
    back: 'वापस',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    
    // Dashboard translations
    servicesOffered: 'बैंकिंग सेवाएं',
    servicesDescription: 'आपके द्वार पर उपलब्ध सभी बैंकिंग सेवाएं',
    userDashboard: 'यूजर प्रोफाइल',
    userDashboardDescription: 'अपनी प्रोफ़ाइल और सेटिंग्स प्रबंधित करें',
    blogForum: 'ब्लॉग/फोरम',
    blogDescription: 'चर्चाओं में शामिल हों और नवीनतम बैंकिंग समाचार प्राप्त करें',
    support: 'सहायता केंद्र',
    supportDescription: '24/7 ग्राहक सहायता और मार्गदर्शन',
    rbiGuidelines: 'आरबीआई दिशानिर्देश',
    rbiDescription: 'महत्वपूर्ण बैंकिंग नियम और नीति अपडेट',
    pricingStructure: 'शुल्क संरचना',
    pricingDescription: 'सेवा शुल्क और बैंकिंग फीस देखें',
    
    // Financial Advice translations
    aiAdvisor: 'एआई निवेश सलाहकार',
    riskLevel: 'जोखिम स्तर',
    unableToLoad: 'निवेश सलाह लोड करने में असमर्थ',
    tryAgainLater: 'कृपया बाद में पुनः प्रयास करें',

    // Chatbot translations
    chatbotGreeting: "नमस्ते, मैं सरल बॉट हूं, आपका डोरस्टेप बैंकिंग सहायक। मैं आपकी कैसे मदद कर सकता हूं?",
    chatbotTyping: "सहायक टाइप कर रही है",
    chatbotPlaceholder: "अपना संदेश यहां टाइप करें...",
    chatbotTitle: "सरल बॉट",
    chatbotError: "क्षमा करें, मैं अभी कनेक्ट होने में असमर्थ हूं। कृपया बाद में पुनः प्रयास करें।",

    // Sidebar translations
    dashboard: 'होम',
    needHelp: 'मदद चाहिए?',
    contactSupport: 'हमारी सहायता टीम से संपर्क करें'
  }
};

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('english');

  const t = translations[language];

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);

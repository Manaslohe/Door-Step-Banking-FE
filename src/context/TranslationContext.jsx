import React, { createContext, useContext, useState } from 'react';

export const translations = {
  english: {
    // Header translations
    back: 'Back',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    loggingOut: 'Logging out...',
    
    // Dashboard translations
    welcomeMessage: 'Welcome back to Saral Bank',
    welcomeSubtext: 'Your trusted financial partner for seamless banking',
    exploreServices: 'Explore Our Services',
    
    // Dashboard Stats
    alwaysAvailable: 'Always Available',
    secureBanking: 'Secure Banking',
    instantTransfers: 'Instant Transfers',
    
    // Financial Advice translations
    aiAdvisor: 'AI Investment Advisory',
    riskLevel: 'Risk Level',
    sector: 'Sector',
    timeframe: 'Timeframe',
    noAdviceAvailable: 'No investment advice available',
    
    // Sidebar translations
    home: 'Home',
    userProfile: 'User Profile',
    servicesOffered: 'Banking Services',
    rbiGuidelines: 'RBI Guidelines',
    blogForum: 'Blog/Forum',
    pricingStructure: 'Pricing Structure',
    trackService: 'Track Service',
    trackTicket: 'Track Ticket',
    support: 'Support',
    shareFeedback: 'Share Feedback',
    helpImprove: 'Help us improve our services',

    // Chatbot translations
    chatbotTitle: 'Saral Bot',
    chatbotGreeting: "Hi, I'm Saral Bot, your Doorstep Banking Assistant.",
    chatbotPlaceholder: "Type your message here...",

    // Dashboard Welcome Section
    greeting: {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening'
    },
    bankName: 'Saral Bank',
    welcomeBack: 'Welcome back to',
    trustedPartner: 'Your trusted financial partner for seamless banking',
    exploreServices: 'Explore Our Services',

    // Dashboard Stats Cards
    stats: {
      available: {
        title: '24/7',
        subtitle: 'Always Available'
      },
      secure: {
        title: '100%',
        subtitle: 'Secure Banking'
      },
      fast: {
        title: 'Fast',
        subtitle: 'Instant Transfers'
      }
    },

    // Sidebar Menu Items
    menu: {
      home: 'Home',
      userProfile: 'User Profile',
      bankingServices: 'Banking Services',
      rbiGuidelines: 'RBI Guidelines',
      blogForum: 'Blog/Forum',
      pricing: 'Pricing Structure',
      trackService: 'Track Service',
      trackTicket: 'Track Ticket',
      support: 'Support',
      feedback: {
        title: 'Share Feedback',
        subtitle: 'Help us improve our services'
      }
    },

    // Common Actions
    actions: {
      close: 'Close',
      refresh: 'Refresh',
      loading: 'Loading...',
      success: 'Success!'
    }
  },
  hindi: {
    // Header translations
    back: 'वापस',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    loggingOut: 'लॉग आउट हो रहा है...',
    
    // Dashboard translations
    welcomeMessage: 'सरल बैंक में आपका स्वागत है',
    welcomeSubtext: 'आपका विश्वसनीय वित्तीय साथी',
    exploreServices: 'सेवाएं देखें',
    
    // Dashboard Stats
    alwaysAvailable: 'हमेशा उपलब्ध',
    secureBanking: 'सुरक्षित बैंकिंग',
    instantTransfers: 'तत्काल लेनदेन',
    
    // Financial Advice translations
    aiAdvisor: 'एआई निवेश सलाहकार',
    riskLevel: 'जोखिम स्तर',
    sector: 'क्षेत्र',
    timeframe: 'समय सीमा',
    noAdviceAvailable: 'कोई निवेश सलाह उपलब्ध नहीं है',
    
    // Sidebar translations
    home: 'होम',
    userProfile: 'यूजर प्रोफाइल',
    servicesOffered: 'बैंकिंग सेवाएं',
    rbiGuidelines: 'आरबीआई दिशानिर्देश',
    blogForum: 'ब्लॉग/फोरम',
    pricingStructure: 'शुल्क संरचना',
    trackService: 'सेवा ट्रैक करें',
    trackTicket: 'टिकट ट्रैक करें',
    support: 'सहायता',
    shareFeedback: 'प्रतिक्रिया साझा करें',
    helpImprove: 'हमारी सेवाओं को बेहतर बनाने में मदद करें',

    // Chatbot translations
    chatbotTitle: 'सरल बॉट',
    chatbotGreeting: "नमस्ते, मैं सरल बॉट हूं, आपका बैंकिंग सहायक।",
    chatbotPlaceholder: "अपना संदेश यहां टाइप करें...",

    // Dashboard Welcome Section
    greeting: {
      morning: 'शुभ प्रभात',
      afternoon: 'शुभ दोपहर',
      evening: 'शुभ संध्या'
    },
    bankName: 'सरल बैंक',
    welcomeBack: 'में आपका स्वागत है',
    trustedPartner: 'आपका विश्वसनीय वित्तीय साथी सरल बैंकिंग के लिए',
    exploreServices: 'सेवाएं देखें',

    // Dashboard Stats Cards
    stats: {
      available: {
        title: '24/7',
        subtitle: 'हमेशा उपलब्ध'
      },
      secure: {
        title: '100%',
        subtitle: 'सुरक्षित बैंकिंग'
      },
      fast: {
        title: 'तेज़',
        subtitle: 'तत्काल लेनदेन'
      }
    },

    // Sidebar Menu Items
    menu: {
      home: 'होम',
      userProfile: 'उपयोगकर्ता प्रोफ़ाइल',
      bankingServices: 'बैंकिंग सेवाएं',
      rbiGuidelines: 'आरबीआई दिशानिर्देश',
      blogForum: 'ब्लॉग/फोरम',
      pricing: 'मूल्य संरचना',
      trackService: 'सेवा ट्रैक करें',
      trackTicket: 'टिकट ट्रैक करें',
      support: 'सहायता',
      feedback: {
        title: 'प्रतिक्रिया साझा करें',
        subtitle: 'हमारी सेवाओं को बेहतर बनाने में मदद करें'
      }
    },

    // Common Actions
    actions: {
      close: 'बंद करें',
      refresh: 'रीफ्रेश करें',
      loading: 'लोड हो रहा है...',
      success: 'सफल!'
    }
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

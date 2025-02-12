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
    },

    // UserDashboard translations
    trackService: 'Track Service',
    trackServiceDesc: 'Monitor your active services and stay updated with real-time status',
    trackTicket: 'Track Ticket',
    trackTicketDesc: 'Check and manage your support tickets efficiently',
    personalInformation: 'Personal Information',
    editPersonalInfo: 'Edit personal information',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    activeServices: 'Active Services',
    recentTickets: 'Recent Tickets',
    viewAll: 'View All',
    noTicketsFound: 'No tickets found',
    noServicesFound: 'No active services found',
    created: 'Created',
    status: 'Status',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    open: 'Open',
    inProgress: 'In Progress',
    pending: 'Pending',
    active: 'Active',

    // Services Offered translations
    services: {
      cashDeposit: {
        name: "CASH DEPOSIT",
        description: "Securely deposit cash into your account"
      },
      cashWithdrawal: {
        name: "CASH WITHDRAWAL",
        description: "Withdraw cash from your account"
      },
      newAccount: {
        name: "OPEN NEW ACCOUNT",
        description: "Start your banking journey with us"
      },
      documentService: {
        name: "DOCUMENT COLLECT / DELIVERY",
        description: "Convenient document handling services"
      },
      lifeCertificate: {
        name: "LIFE CERTIFICATE COLLECTION",
        description: "Easy submission of life certificates"
      },
      onlineAssistance: {
        name: "ONLINE ASSISTANCE",
        description: "24/7 support for all your banking needs"
      }
    },

    // BlogForum translations
    blog: {
      title: "Financial Insights",
      refreshContent: "Refresh Content",
      loadingInsights: "Loading fresh insights...",
      readMore: "Read more",
      showLess: "Show less",
      minRead: "min read",
      generatePrompt: "Create 4 financial blog posts. Format the response as a valid JSON array of objects. Each object should have exactly two fields: 'title' and 'content'. Example format: [{\"title\":\"First Post\",\"content\":\"Content here\"},{\"title\":\"Second Post\",\"content\":\"Content here\"}]. Focus on investment trends and banking advice.",
      errorLoading: "Error Loading Content",
      errorMessage: "Unable to generate blog posts at the moment. Please try again later.",
      categories: {
        investment: "Investment",
        banking: "Banking",
        markets: "Markets",
        personalFinance: "Personal Finance",
        error: "Error"
      },
      subtitle: "Share your financial insights with the community",
      createButton: "Create Blog",
      generating: "Generating..."
    },

    // Service Tracking translations
    serviceTracking: {
      title: {
        admin: 'All Services',
        user: 'Your Services'
      },
      search: {
        admin: "Search services by ID, type, status, or phone...",
        user: "Search services by ID, type, or status..."
      },
      totalServices: "Total Services: ",
      noServices: "No services found",
      refresh: "Refresh",
      columns: {
        serviceId: "Service ID",
        type: "Type",
        date: "Date",
        location: "Location",
        amount: "Amount",
        status: "Status"
      },
      notSpecified: "Not specified",
      currency: "₹"
    },

    // Support Page translations
    support: {
      contactMethods: {
        helpline: {
          title: "24/7 Helpline",
          info: "1800-XXX-XXXX"
        },
        email: {
          title: "Email Support",
          info: "support@dsb.com"
        },
        chat: {
          title: "Live Chat",
          info: "Available 9AM-6PM"
        }
      },
      ticketSystem: {
        title: "Create Support Ticket",
        subtitle: "We'll get back to you as soon as possible",
        form: {
          name: "Name",
          contactNumber: "Contact Number",
          ticketType: "Ticket Type",
          message: "Message",
          messagePlaceholder: "Describe your issue in detail...",
          submit: "Submit Ticket",
          submitting: "Submitting..."
        },
        types: {
          general: "General Inquiry",
          technical: "Technical Support",
          billing: "Billing Issue",
          service: "Service Related"
        }
      },
      success: {
        title: "Ticket Submitted",
        message: "Your support ticket has been created successfully!",
        details: {
          title: "Ticket Details",
          name: "Name",
          contact: "Contact",
          message: "Message"
        },
        responseTime: "Expected response time: 2-3 business days"
      },
      errors: {
        loginRequired: "Please login to create tickets",
        submitFailed: "Failed to create ticket"
      }
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
    },

    // UserDashboard translations
    trackService: 'सेवा ट्रैक करें',
    trackServiceDesc: 'अपनी सक्रिय सेवाओं की निगरानी करें और रीयल-टाइम स्थिति से अपडेट रहें',
    trackTicket: 'टिकट ट्रैक करें',
    trackTicketDesc: 'अपने सपोर्ट टिकट को कुशलतापूर्वक चेक और प्रबंधित करें',
    personalInformation: 'व्यक्तिगत जानकारी',
    editPersonalInfo: 'व्यक्तिगत जानकारी संपादित करें',
    fullName: 'पूरा नाम',
    email: 'ईमेल',
    phone: 'फोन',
    address: 'पता',
    activeServices: 'सक्रिय सेवाएं',
    recentTickets: 'हाल के टिकट',
    viewAll: 'सभी देखें',
    noTicketsFound: 'कोई टिकट नहीं मिला',
    noServicesFound: 'कोई सक्रिय सेवा नहीं मिली',
    created: 'बनाया गया',
    status: 'स्थिति',
    priority: 'प्राथमिकता',
    high: 'उच्च',
    medium: 'मध्यम',
    low: 'निम्न',
    open: 'खुला',
    inProgress: 'प्रगति में',
    pending: 'लंबित',
    active: 'सक्रिय',

    // Services Offered translations
    services: {
      cashDeposit: {
        name: "नकद जमा",
        description: "अपने खाते में सुरक्षित रूप से नकद जमा करें"
      },
      cashWithdrawal: {
        name: "नकद निकासी",
        description: "अपने खाते से नकद निकालें"
      },
      newAccount: {
        name: "नया खाता खोलें",
        description: "हमारे साथ अपनी बैंकिंग यात्रा शुरू करें"
      },
      documentService: {
        name: "दस्तावेज़ संग्रह / वितरण",
        description: "सुविधाजनक दस्तावेज़ हैंडलिंग सेवाएं"
      },
      lifeCertificate: {
        name: "जीवन प्रमाणपत्र संग्रह",
        description: "जीवन प्रमाणपत्र जमा करने की आसान सुविधा"
      },
      onlineAssistance: {
        name: "ऑनलाइन सहायता",
        description: "आपकी सभी बैंकिंग जरूरतों के लिए 24/7 सहायता"
      }
    },

    // BlogForum translations
    blog: {
      title: "वित्तीय अंतर्दृष्टि",
      refreshContent: "सामग्री रीफ्रेश करें",
      loadingInsights: "नई अंतर्दृष्टि लोड हो रही है...",
      readMore: "और पढ़ें",
      showLess: "कम दिखाएं",
      minRead: "मिनट का पढ़ना",
      generatePrompt: "4 वित्तीय ब्लॉग पोस्ट हिंदी में बनाएं। JSON ऐरे के रूप में उत्तर दें। प्रत्येक ऑब्जेक्ट में केवल दो फील्ड होनी चाहिए: 'title' और 'content'। उदाहरण: [{\"title\":\"पहला पोस्ट\",\"content\":\"सामग्री यहां\"},{\"title\":\"दूसरा पोस्ट\",\"content\":\"सामग्री यहां\"}]। निवेश रुझानों और बैंकिंग सलाह पर ध्यान दें।",
      errorLoading: "सामग्री लोड करने में त्रुटि",
      errorMessage: "इस समय ब्लॉग पोस्ट जनरेट नहीं किए जा सकते। कृपया बाद में पुनः प्रयास करें।",
      categories: {
        investment: "निवेश",
        banking: "बैंकिंग",
        markets: "बाज़ार",
        personalFinance: "व्यक्तिगत वित्त",
        error: "त्रुटि"
      },
      subtitle: "समुदाय के साथ अपनी वित्तीय अंतर्दृष्टि साझा करें",
      createButton: "ब्लॉग बनाएं",
      generating: "जनरेट हो रहा है..."
    },

    // Service Tracking translations
    serviceTracking: {
      title: {
        admin: 'सभी सेवाएं',
        user: 'आपकी सेवाएं'
      },
      search: {
        admin: "आईडी, प्रकार, स्थिति, या फोन द्वारा सेवाएं खोजें...",
        user: "आईडी, प्रकार, या स्थिति द्वारा सेवाएं खोजें..."
      },
      totalServices: "कुल सेवाएं: ",
      noServices: "कोई सेवा नहीं मिली",
      refresh: "रीफ्रेश करें",
      columns: {
        serviceId: "सेवा आईडी",
        type: "प्रकार",
        date: "दिनांक",
        location: "स्थान",
        amount: "राशि",
        status: "स्थिति"
      },
      notSpecified: "निर्दिष्ट नहीं",
      currency: "₹"
    },

    // Support Page translations
    support: {
      contactMethods: {
        helpline: {
          title: "24/7 हेल्पलाइन",
          info: "1800-XXX-XXXX"
        },
        email: {
          title: "ईमेल सहायता",
          info: "support@dsb.com"
        },
        chat: {
          title: "लाइव चैट",
          info: "सुबह 9 बजे - शाम 6 बजे उपलब्ध"
        }
      },
      ticketSystem: {
        title: "सहायता टिकट बनाएं",
        subtitle: "हम जल्द से जल्द आपसे संपर्क करेंगे",
        form: {
          name: "नाम",
          contactNumber: "संपर्क नंबर",
          ticketType: "टिकट प्रकार",
          message: "संदेश",
          messagePlaceholder: "अपनी समस्या का विस्तार से वर्णन करें...",
          submit: "टिकट जमा करें",
          submitting: "जमा किया जा रहा है..."
        },
        types: {
          general: "सामान्य पूछताछ",
          technical: "तकनीकी सहायता",
          billing: "बिलिंग समस्या",
          service: "सेवा संबंधित"
        }
      },
      success: {
        title: "टिकट जमा किया गया",
        message: "आपका सहायता टिकट सफलतापूर्वक बना दिया गया है!",
        details: {
          title: "टिकट विवरण",
          name: "नाम",
          contact: "संपर्क",
          message: "संदेश"
        },
        responseTime: "प्रतिक्रिया का अनुमानित समय: 2-3 कार्य दिवस"
      },
      errors: {
        loginRequired: "टिकट बनाने के लिए कृपया लॉगिन करें",
        submitFailed: "टिकट बनाने में विफल"
      }
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

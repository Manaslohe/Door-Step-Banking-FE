import React, { createContext, useContext, useState, useEffect } from 'react';
import { Users, AlertTriangle, Shield, Clock } from 'lucide-react';

export const translations = {
  english: {
    // Header translations
    back: 'Back',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    loggingOut: 'Logging out...',
    
    // Dashboard translations
    welcomeMessage: 'Welcome back to Saral Banking',
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
    interestRate: 'Interest Rate',
    noAdviceAvailable: 'No investment advice available',
    
    // Navigation translations
    navigation: {
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
      helpImprove: 'Help us improve our services'
    },

    // Service Tracking Section
    tracking: {
      service: {
        title: 'Track Service',
       
      },
      ticket: {
        title: 'Track Ticket',
      
      }
    },

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
    bankName: 'Saral Banking',
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

    // Read more/less translations
    readMore: "Read more",
    readLess: "Read less",

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
    },

    // RBI Guidelines Page translations
    rbiGuidelinesPage: {
      downloadPDF: 'Download PDF',
      rbiWebsite: 'RBI Website',
      masterDirectionTitle: 'Master Direction – Know Your Customer (KYC) Direction, 2016',
      masterDirectionDescription: 'These directions are issued under Section 35A of the Banking Regulation Act, 1949 and Rule 7 of Prevention of Money-Laundering (Maintenance of Records) Rules, 2005.',
      disclaimer: 'This is a summary of the guidelines. For complete details, please refer to the official RBI documentation.'
    },
    rbiGuidelinesData: [
      {
        id: 1,
        title: 'Customer Due Diligence (CDD)',
        icon: Users,
        content: 'REs shall undertake customer due diligence while establishing account-based relationships and monitor transactions of suspicious nature.',
        details: [
          'Verify customer identity',
          'Collect and validate KYC documents',
          'Assess customer risk profile',
          'Monitor ongoing transactions'
        ]
      },
      {
        id: 2,
        title: 'Risk Assessment',
        icon: AlertTriangle,
        content: 'REs shall carry out Money Laundering (ML) and Terrorist Financing (TF) Risk Assessment periodically to identify and assess ML/TF risks.',
        details: [
          'Periodic risk assessment',
          'Risk categorization of customers',
          'Enhanced due diligence for high-risk customers',
          'Regular risk review and updates'
        ]
      },
      {
        id: 3,
        title: 'Digital KYC',
        icon: Shield,
        content: 'REs can undertake live V-CIP (Video-based Customer Identification Process) to carry out customer identification remotely.',
        details: [
          'Video-based verification',
          'Digital document verification',
          'Biometric authentication',
          'Secure data storage'
        ]
      },
      {
        id: 4,
        title: 'Periodic Updates',
        icon: Clock,
        content: 'Periodic updation of KYC shall be carried out based on the risk category of customers.',
        details: [
          'High risk: Every 2 years',
          'Medium risk: Every 8 years',
          'Low risk: Every 10 years',
          'Document re-verification process'
        ]
      }
    ],

    // AdviceCard translations
    advice: {
      loading: 'Loading advice...',
      error: 'Error loading advice',
      noAdvice: 'No advice available',
      riskLevel: 'Risk',
      timeframe: 'Timeframe',
      interestRate: 'Interest Rate',
      speakText: 'Listen to advice',
      stopSpeaking: 'Stop speaking'
    },

    // Investment Categories translations
    investmentCategories: {
      aiAdvisory: "AI Investment Advisory",
      stockMarket: "Stock Market",
      bankingInvestment: "Banking Investment",
      alternativeInvestments: "Alternative Investments"
    },

    // Pricing Structure translations
    pricingStructure: {
      title: "Service Pricing Structure",
      subtitle: "Comprehensive overview of our service fees and specifications",
      sections: {
        financial: {
          title: "Financial Transaction Services",
          services: {
            cashDeposit: {
              category: "Cash Deposit",
              fee: "₹75 + GST",
              specifications: "Per transaction basis"
            },
            cashWithdrawal: {
              category: "Cash Withdrawal",
              fee: "₹75 + GST",
              specifications: "Per transaction basis"
            }
          }
        },
        document: {
          title: "Document Processing Services",
          services: {
            delivery: {
              category: "Document Delivery",
              fee: "₹75 + GST",
              specifications: "Per visit basis"
            },
            accountOpening: {
              category: "New Account Opening",
              fee: "Free",
              specifications: "Includes documentation assistance"
            }
          }
        },
        pensioner: {
          title: "Life Certificate Services for Pensioners",
          services: {
            lifeCertificate: {
              category: "Life Certificate Collection",
              fee: "₹75 + GST",
              specifications: [
                "Physical verification at residence",
                "Digital submission to authorities",
                "Confirmation receipt provided",
                "Annual or as per pension authority requirement"
              ]
            }
          }
        },
        consultation: {
          title: "Remote Consultation Services",
          services: {
            telephonic: {
              category: "Telephonic Assistance",
              fee: "Free",
              specifications: [
                "Standard business hours",
                "General inquiries and support"
              ]
            },
            videoCall: {
              category: "Google Meet Consultation",
              fee: "₹100 per session",
              specifications: [
                "Scheduled appointments",
                "Specialized assistance",
                "Documentation guidance"
              ]
            }
          }
        }
      },
      tableHeaders: {
        category: "Service Category",
        fee: "Service Fee",
        specifications: "Specifications"
      }
    },
    ticketDetails: {
      title: 'Ticket Details',
      loading: 'Loading ticket details...',
      ticketId: 'Ticket ID',
      type: 'Type',
      message: 'Message',
      contactInformation: 'Contact Information',
      created: 'Created',
      status: 'Status',
      priority: 'Priority',
      close: 'Close',
      update: 'Update',
      at: 'at'
    },
    ticketTracking: {
      title: 'Support Tickets',
      subtitle: 'Track and manage your support requests',
      stats: {
        totalTickets: 'Total Tickets',
        openTickets: 'Open Tickets'
      },
      search: {
        placeholder: 'Search tickets by ID, message or type...'
      },
      filters: {
        allStatuses: 'All Statuses'
      },
      table: {
        ticketId: 'Ticket ID',
        type: 'Type',
        message: 'Message',
        priority: 'Priority',
        status: 'Status',
        created: 'Created'
      },
      loading: 'Loading your tickets...',
      noTickets: {
        title: 'No tickets found',
        subtitle: 'Try adjusting your search or filters'
      }
    },

    // Feedback Popup translations
    feedbackPopup: {
      title: 'Share Your Feedback',
      close: 'Close',
      textareaLabel: 'Tell us more about your experience',
      textareaPlaceholder: 'What went well? What could be improved?',
      sentimentLabel: 'Sentiment Analysis',
      submitButton: 'Submit Feedback',
      submitting: 'Submitting...',
      thankYou: 'Thank You!',
      feedbackSuccess: 'Your feedback has been submitted successfully.',
      ratings: {
        1: 'Very Dissatisfied',
        2: 'Dissatisfied',
        3: 'Neutral',
        4: 'Satisfied',
        5: 'Very Satisfied'
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
    interestRate: 'ब्याज दर',
    noAdviceAvailable: 'कोई निवेश सलाह उपलब्ध नहीं है',
    
    // Navigation translations
    navigation: {
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
      helpImprove: 'हमारी सेवाओं को बेहतर बनाने में मदद करें'
    },

    // Service Tracking Section
    tracking: {
      service: {
        title: 'सेवा ट्रैक करें',        
      },
      ticket: {
        title: 'टिकट ट्रैक करें',
      }
    },

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

    // Read more/less translations
    readMore: "अधिक पढ़ें",
    readLess: "कम पढ़ें",

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
    },

    // RBI Guidelines Page translations
    rbiGuidelinesPage: {
      downloadPDF: 'पीडीएफ डाउनलोड करें',
      rbiWebsite: 'आरबीआई वेबसाइट',
      masterDirectionTitle: 'मास्टर दिशानिर्देश – अपने ग्राहक को जानिए (केवाईसी) दिशानिर्देश, 2016',
      masterDirectionDescription: 'ये दिशानिर्देश बैंकिंग विनियमन अधिनियम, 1949 की धारा 35ए और धन शोधन निवारण (अभिलेखों का रखरखाव) नियम, 2005 के नियम 7 के तहत जारी किए गए हैं।',
      disclaimer: 'यह दिशानिर्देशों का सारांश है। पूर्ण विवरण के लिए कृपया आरबीआई के आधिकारिक दस्तावेज़ देखें।'
    },
    rbiGuidelinesData: [
      {
        id: 1,
        title: 'ग्राहक उचित सावधानी (सीडीडी)',
        icon: Users,
        content: 'आरई को खाता-आधारित संबंध स्थापित करते समय ग्राहक उचित सावधानी करनी होगी और संदिग्ध प्रकृति के लेनदेन की निगरानी करनी होगी।',
        details: [
          'ग्राहक पहचान सत्यापित करें',
          'केवाईसी दस्तावेजों को एकत्र और मान्य करें',
          'ग्राहक जोखिम प्रोफाइल का आकलन करें',
          'चल रहे लेनदेन की निगरानी करें'
        ]
      },
      {
        id: 2,
        title: 'जोखिम मूल्यांकन',
        icon: AlertTriangle,
        content: 'आरई को धन शोधन (एमएल) और आतंकवादी वित्तपोषण (टीएफ) जोखिम मूल्यांकन समय-समय पर करना होगा।',
        details: [
          'आवधिक जोखिम मूल्यांकन',
          'ग्राहकों का जोखिम वर्गीकरण',
          'उच्च जोखिम वाले ग्राहकों के लिए वर्धित सावधानी',
          'नियमित जोखिम समीक्षा और अपडेट'
        ]
      },
      {
        id: 3,
        title: 'डिजिटल केवाईसी',
        icon: Shield,
        content: 'आरई दूरस्थ रूप से ग्राहक पहचान करने के लिए लाइव वी-सीआईपी (वीडियो-आधारित ग्राहक पहचान प्रक्रिया) कर सकते हैं।',
        details: [
          'वीडियो-आधारित सत्यापन',
          'डिजिटल दस्तावेज़ सत्यापन',
          'बायोमेट्रिक प्रमाणीकरण',
          'सुरक्षित डेटा भंडारण'
        ]
      },
      {
        id: 4,
        title: 'आवधिक अपडेट',
        icon: Clock,
        content: 'केवाईसी का आवधिक अपडेशन ग्राहकों की जोखिम श्रेणी के आधार पर किया जाएगा।',
        details: [
          'उच्च जोखिम: हर 2 साल',
          'मध्यम जोखिम: हर 8 साल',
          'निम्न जोखिम: हर 10 साल',
          'दस्तावेज़ पुन: सत्यापन प्रक्रिया'
        ]
      }
    ],

    // AdviceCard translations
    advice: {
      loading: 'सलाह लोड हो रही है...',
      error: 'सलाह लोड करने में त्रुटि',
      noAdvice: 'कोई सलाह उपलब्ध नहीं है',
      riskLevel: 'जोखिम',
      timeframe: 'समय सीमा',
      interestRate: 'ब्याज दर',
      speakText: 'सलाह सुनें',
      stopSpeaking: 'बोलना बंद करें'
    },

    // Investment Categories translations
    investmentCategories: {
      aiAdvisory: "एआई निवेश सलाहकार",
      stockMarket: "शेयर बाजार",
      bankingInvestment: "बैंकिंग निवेश",
      alternativeInvestments: "वैकल्पिक निवेश"
    },

    // Pricing Structure translations in Hindi
    pricingStructure: {
      title: "सेवा मूल्य संरचना",
      subtitle: "हमारी सेवा शुल्क और विनिर्देशों का व्यापक अवलोकन",
      sections: {
        financial: {
          title: "वित्तीय लेनदेन सेवाएं",
          services: {
            cashDeposit: {
              category: "नकद जमा",
              fee: "₹75 + GST",
              specifications: "प्रति लेनदेन आधार"
            },
            cashWithdrawal: {
              category: "नकद निकासी",
              fee: "₹75 + GST",
              specifications: "प्रति लेनदेन आधार"
            }
          }
        },
        document: {
          title: "दस्तावेज़ प्रसंस्करण सेवाएं",
          services: {
            delivery: {
              category: "दस्तावेज़ वितरण",
              fee: "₹75 + GST",
              specifications: "प्रति विजिट आधार"
            },
            accountOpening: {
              category: "नया खाता खोलना",
              fee: "निःशुल्क",
              specifications: "दस्तावेज़ सहायता शामिल है"
            }
          }
        },
        pensioner: {
          title: "पेंशनर्स के लिए जीवन प्रमाणपत्र सेवाएं",
          services: {
            lifeCertificate: {
              category: "जीवन प्रमाणपत्र संग्रह",
              fee: "₹75 + GST",
              specifications: [
                "निवास पर भौतिक सत्यापन",
                "प्राधिकरण को डिजिटल प्रस्तुति",
                "पुष्टि रसीद प्रदान की जाती है",
                "वार्षिक या पेंशन प्राधिकरण की आवश्यकता के अनुसार"
              ]
            }
          }
        },
        consultation: {
          title: "दूरस्थ परामर्श सेवाएं",
          services: {
            telephonic: {
              category: "टेलीफोनिक सहायता",
              fee: "निःशुल्क",
              specifications: [
                "मानक कार्य घंटे",
                "सामान्य पूछताछ और सहायता"
              ]
            },
            videoCall: {
              category: "गूगल मीट परामर्श",
              fee: "₹100 प्रति सत्र",
              specifications: [
                "निर्धारित अपॉइंटमेंट",
                "विशेष सहायता",
                "दस्तावेज़ मार्गदर्शन"
              ]
            }
          }
        }
      },
      tableHeaders: {
        category: "सेवा श्रेणी",
        fee: "सेवा शुल्क",
        specifications: "विनिर्देश"
      }
    },
    ticketDetails: {
      title: 'टिकट विवरण',
      loading: 'टिकट विवरण लोड हो रहा है...',
      ticketId: 'टिकट आईडी',
      type: 'प्रकार',
      message: 'संदेश',
      contactInformation: 'संपर्क जानकारी',
      created: 'बनाया गया',
      status: 'स्थिति',
      priority: 'प्राथमिकता',
      close: 'बंद करें',
      update: 'अपडेट करें',
      at: 'को'
    },
    ticketTracking: {
      title: 'सहायता टिकट',
      subtitle: 'अपने सहायता अनुरोधों को ट्रैक और प्रबंधित करें',
      stats: {
        totalTickets: 'कुल टिकट',
        openTickets: 'खुले टिकट'
      },
      search: {
        placeholder: 'आईडी, संदेश या प्रकार द्वारा टिकट खोजें...'
      },
      filters: {
        allStatuses: 'सभी स्थितियां'
      },
      table: {
        ticketId: 'टिकट आईडी',
        type: 'प्रकार',
        message: 'संदेश',
        priority: 'प्राथमिकता',
        status: 'स्थिति',
        created: 'बनाया गया'
      },
      loading: 'आपके टिकट लोड हो रहे हैं...',
      noTickets: {
        title: 'कोई टिकट नहीं मिला',
        subtitle: 'अपनी खोज या फ़िल्टर समायोजित करें'
      }
    },

    // Feedback Popup translations
    feedbackPopup: {
      title: 'अपनी प्रतिक्रिया साझा करें',
      close: 'बंद करें',
      textareaLabel: 'अपने अनुभव के बारे में हमें अधिक बताएं',
      textareaPlaceholder: 'क्या अच्छा रहा? क्या बेहतर हो सकता है?',
      sentimentLabel: 'भावना विश्लेषण',
      submitButton: 'प्रतिक्रिया जमा करें',
      submitting: 'जमा किया जा रहा है...',
      thankYou: 'धन्यवाद!',
      feedbackSuccess: 'आपकी प्रतिक्रिया सफलतापूर्वक जमा की गई है।',
      ratings: {
        1: 'बहुत असंतुष्ट',
        2: 'असंतुष्ट',
        3: 'तटस्थ',
        4: 'संतुष्ट',
        5: 'बहुत संतुष्ट'
      }
    }
  }
};

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('language') || 'en'
  );

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'hi' : 'en';
    setCurrentLanguage(newLang);
    localStorage.setItem('language', newLang);
    window.dispatchEvent(new Event('languagechange'));
  };

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const t = currentLanguage === 'en' ? translations.english : translations.hindi;

  const value = {
    currentLanguage,
    toggleLanguage,
    t
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);

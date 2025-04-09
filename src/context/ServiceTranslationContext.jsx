import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from './TranslationContext';

const ServiceTranslationContext = createContext();

export const serviceTranslations = {
  en: {
    // Common service translations
    selectBank: 'Select Bank',
    selectAccount: 'Select Bank Account',
    selectTime: 'Select Time',
    scheduleAppointment: 'Schedule Appointment',
    address: 'Address',
    date: 'Date',
    timeSlot: 'Time Slot',
    submit: 'Submit',

    // New Account
    newAccount: 'New Account Opening',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    accountType: 'Account Type',
    visitDate: 'Visit Date',
    visitAddress: 'Visit Address',
    savingsAccount: 'Savings Account',
    currentAccount: 'Current Account',
    fixedDeposit: 'Fixed Deposit',
    personalInfo: 'Personal Info',
    bankDetails: 'Bank Details',
    appointment: 'Appointment',

    // Cash Deposit
    cashDeposit: 'Cash Deposit Service',
    depositAmount: 'Deposit Amount',
    ifscCode: 'IFSC Code',
    deliveryAddress: 'Delivery Address',
    scheduleDeposit: 'Schedule Deposit',
    enterAmount: 'Enter amount',

    // Cash Withdrawal
    cashWithdrawal: 'Cash Withdrawal Service',
    withdrawalAmount: 'Withdrawal Amount',
    withdrawalAddress: 'Withdrawal Address',
    scheduleWithdrawal: 'Schedule Withdrawal',

    // Document Service
    documentService: 'Document Service',
    documentType: 'Document Type',
    collectionAddress: 'Collection Address',
    documentCollection: 'Document Collection',
    documentDelivery: 'Document Delivery',
    generalDocuments: 'General Documents',
    kycDocuments: 'KYC Documents',
    bankStatements: 'Bank Statements',
    checkbookCards: 'Checkbook/Cards',
    otherDocuments: 'Other Documents',
    collection: 'Collection',
    delivery: 'Delivery',

    // Progress steps
    completed: 'Completed',
    pending: 'Pending',

    // Success messages
    depositSuccess: 'Your cash deposit request has been scheduled successfully!',
    withdrawalSuccess: 'Your cash withdrawal request has been scheduled successfully!',
    accountSuccess: 'Your new account request has been scheduled successfully!',
    documentSuccess: 'Your document {type} request has been scheduled successfully!',

    // Life Certificate translations
    lifeCertificate: 'Life Certificate Verification',
    pensionAccountNo: 'Pension Account Number',
    scheduleLifeCertificate: 'Schedule Life Certificate Collection',
    lifeCertificateSuccess: 'Your life certificate collection has been scheduled successfully!',

    // Online Assistance translations
    onlineAssistance: 'Online Banking Assistance',
    bankSelection: 'Bank Selection',
    mode: 'Mode',
    assistanceMode: 'Select Assistance Mode',
    telephonic: 'Telephonic Call',
    telephonicDesc: 'Get assistance through a phone call',
    videoCall: 'Google Meet',
    videoCallDesc: 'Video call assistance through Google Meet',
    scheduleAssistance: 'Schedule Assistance',
    assistanceSuccess: 'Your assistance request has been scheduled successfully!',
    contactNumber: 'Contact Number',
    fullName: 'Full Name',

    // Validation messages for date and time
    pastDateError: "Cannot select a past date",
    pastTimeError: "Cannot select a past time slot",
    timeSlotClearedWarning: "Time slot has been cleared as it's no longer valid for the selected date",

    // Service explanations
    serviceIntroduction: "Introduction",
    serviceRequirements: "Requirements",
    serviceProcess: "Process",
    serviceNotes: "Important Notes"
  },
  hi: {
    // Common service translations
    selectBank: 'बैंक चुनें',
    selectAccount: 'बैंक खाता चुनें',
    selectTime: 'समय चुनें',
    scheduleAppointment: 'अपॉइंटमेंट शेड्यूल करें',
    address: 'पता',
    date: 'तारीख',
    timeSlot: 'समय स्लॉट',
    submit: 'जमा करें',

    // New Account
    newAccount: 'नया खाता खोलें',
    firstName: 'पहला नाम',
    lastName: 'अंतिम नाम',
    email: 'ईमेल',
    phone: 'फोन',
    accountType: 'खाता प्रकार',
    visitDate: 'विजिट की तारीख',
    visitAddress: 'विजिट का पता',
    savingsAccount: 'बचत खाता',
    currentAccount: 'चालू खाता',
    fixedDeposit: 'सावधि जमा',
    personalInfo: 'व्यक्तिगत जानकारी',
    bankDetails: 'बैंक विवरण',
    appointment: 'अपॉइंटमेंट',

    // Cash Deposit
    cashDeposit: 'नकद जमा सेवा',
    depositAmount: 'जमा राशि',
    ifscCode: 'आईएफएससी कोड',
    deliveryAddress: 'डिलीवरी का पता',
    scheduleDeposit: 'जमा शेड्यूल करें',
    enterAmount: 'राशि दर्ज करें',

    // Cash Withdrawal
    cashWithdrawal: 'नकद निकासी सेवा',
    withdrawalAmount: 'निकासी राशि',
    withdrawalAddress: 'निकासी का पता',
    scheduleWithdrawal: 'निकासी शेड्यूल करें',

    // Document Service
    documentService: 'दस्तावेज़ सेवा',
    documentType: 'दस्तावेज़ प्रकार',
    collectionAddress: 'संग्रह का पता',
    documentCollection: 'दस्तावेज़ संग्रह',
    documentDelivery: 'दस्तावेज़ वितरण',
    generalDocuments: 'सामान्य दस्तावेज़',
    kycDocuments: 'केवाईसी दस्तावेज़',
    bankStatements: 'बैंक स्टेटमेंट',
    checkbookCards: 'चेकबुक/कार्ड',
    otherDocuments: 'अन्य दस्तावेज़',
    collection: 'संग्रह',
    delivery: 'वितरण',

    // Progress steps
    completed: 'पूर्ण',
    pending: 'बाकी',

    // Success messages
    depositSuccess: 'आपका नकद जमा अनुरोध सफलतापूर्वक शेड्यूल किया गया है!',
    withdrawalSuccess: 'आपका नकद निकासी अनुरोध सफलतापूर्वक शेड्यूल किया गया है!',
    accountSuccess: 'आपका नया खाता अनुरोध सफलतापूर्वक शेड्यूल किया गया है!',
    documentSuccess: 'आपका दस्तावेज़ {type} अनुरोध सफलतापूर्वक शेड्यूल किया गया है!',

    // Life Certificate translations
    lifeCertificate: 'जीवन प्रमाणपत्र सत्यापन',
    pensionAccountNo: 'पेंशन खाता संख्या',
    scheduleLifeCertificate: 'जीवन प्रमाणपत्र संग्रह शेड्यूल करें',
    lifeCertificateSuccess: 'आपका जीवन प्रमाणपत्र संग्रह सफलतापूर्वक शेड्यूल किया गया है!',

    // Online Assistance translations
    onlineAssistance: 'ऑनलाइन बैंकिंग सहायता',
    bankSelection: 'बैंक चयन',
    schedule: 'समय-सारिणी',
    mode: 'माध्यम',
    assistanceMode: 'सहायता माध्यम चुनें',
    telephonic: 'टेलीफोनिक कॉल',
    telephonicDesc: 'फोन कॉल के माध्यम से सहायता प्राप्त करें',
    videoCall: 'गूगल मीट',
    videoCallDesc: 'गूगल मीट के माध्यम से वीडियो कॉल सहायता',
    scheduleAssistance: 'सहायता शेड्यूल करें',
    assistanceSuccess: 'आपका सहायता अनुरोध सफलतापूर्वक शेड्यूल किया गया है!',
    contactNumber: 'संपर्क नंबर',
    fullName: 'पूरा नाम',

    // Validation messages for date and time
    pastDateError: "पिछली तारीख का चयन नहीं कर सकते",
    pastTimeError: "बीते हुए समय का चयन नहीं कर सकते",
    timeSlotClearedWarning: "समय स्लॉट को साफ़ कर दिया गया है क्योंकि यह चयनित तिथि के लिए अब मान्य नहीं है",

    // Service explanations
    serviceIntroduction: "परिचय",
    serviceRequirements: "आवश्यकताएँ",
    serviceProcess: "प्रक्रिया",
    serviceNotes: "महत्वपूर्ण नोट्स"
  }
};

export const ServiceTranslationProvider = ({ children }) => {
  const { currentLanguage } = useTranslation();
  const [translations, setTranslations] = useState(serviceTranslations[currentLanguage]);

  useEffect(() => {
    const handleLanguageChange = () => {
      setTranslations(serviceTranslations[currentLanguage]);
    };

    // Initial setup
    setTranslations(serviceTranslations[currentLanguage]);

    // Listen for language changes
    window.addEventListener('languagechange', handleLanguageChange);

    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [currentLanguage]);

  return (
    <ServiceTranslationContext.Provider value={translations}>
      {children}
    </ServiceTranslationContext.Provider>
  );
};

export const useServiceTranslation = () => {
  const context = useContext(ServiceTranslationContext);
  if (!context) {
    throw new Error('useServiceTranslation must be used within a ServiceTranslationProvider');
  }
  return context;
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, Building2, Clock, Calendar, Phone, User, PhoneCall, Video } from 'lucide-react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import OtpVerificationPopup from '../Common/OtpVerificationPopup';
import SuccessPage from '../Common/SuccessPage';
import { useUser } from '../../hooks/useUser';
import { linkedBankAccounts, standardTimeSlots } from '../../data/bankData';
import { motion } from 'framer-motion';
import { speak, parseDate, findBestMatch, parseTimeSlot } from '../../utils/voiceUtils';
import VoiceAssistant from '../Common/VoiceAssistant';
import { useServiceTranslation } from '../../context/ServiceTranslationContext';

const OnlineAssistance = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const t = useServiceTranslation();

  const banks = [
    { id: 'SBI', name: 'State Bank of India' },
    { id: 'HDFC', name: 'HDFC Bank' },
    { id: 'ICICI', name: 'ICICI Bank' },
    { id: 'PNB', name: 'Punjab National Bank' },
    { id: 'BOB', name: 'Bank of Baroda' }
  ];

  const modeOptions = [
    { 
      id: 'telephonic', 
      label: t.telephonic,
      icon: PhoneCall,
      description: t.telephonicDesc
    },
    { 
      id: 'gmeet', 
      label: t.videoCall,
      icon: Video,
      description: t.videoCallDesc
    }
  ];

  const [formData, setFormData] = useState({
    bank: '',
    date: '',
    slot: '',
    contactNo: '',
    fullName: '',
    mode: ''
  });

  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setFormData(prevData => ({
        ...prevData,
        fullName: fullName,
        contactNo: user.phone || '',
      }));
    }
  }, [user]);

  const calculateProgress = () => {
    const fields = {
      bankDetails: ['bank'],
      schedule: ['date', 'slot'],
      personal: ['mode']
    };

    return {
      bankDetails: fields.bankDetails.every(field => formData[field]),
      schedule: fields.schedule.every(field => formData[field]),
      personal: fields.personal.every(field => formData[field])
    };
  };

  const handleVoiceInput = async (voiceData) => {
    const field = Object.keys(voiceData)[0];
    let value = voiceData[field].toLowerCase();

    let processedValue;
    let feedbackMessage;

    switch (field) {
      case 'bank':
        const bankOptions = banks.map(bank => ({
          value: bank.id,
          label: bank.name,
          searchTerms: [
            bank.name.toLowerCase(),
            bank.id.toLowerCase(),
            `${bank.name.toLowerCase()} bank`
          ]
        }));
        
        const matchedBank = findBestMatch(value, bankOptions);
        if (matchedBank) {
          processedValue = matchedBank.value;
          feedbackMessage = `Selected ${banks.find(b => b.id === matchedBank.value).name}`;
        } else {
          feedbackMessage = "Sorry, I couldn't find that bank. Please try again.";
        }
        break;

      case 'date':
        processedValue = parseDate(value);
        if (processedValue) {
          const date = new Date(processedValue);
          feedbackMessage = `Set appointment date to ${date.toLocaleDateString()}`;
        } else {
          feedbackMessage = "I couldn't understand the date. Please try again.";
        }
        break;

      case 'slot':
        const matchedTimeSlot = parseTimeSlot(value, standardTimeSlots);
        if (matchedTimeSlot) {
          processedValue = matchedTimeSlot;
          feedbackMessage = `Set appointment time to ${matchedTimeSlot}`;
        } else {
          feedbackMessage = "I couldn't understand the time. Please say something like '9 AM' or '2 PM'";
        }
        break;

      case 'mode':
        const modeSearchTerms = {
          'telephonic': ['phone', 'call', 'telephone', 'voice', 'audio'],
          'gmeet': ['video', 'meet', 'google meet', 'video call', 'online']
        };

        const modeMap = {
          'phone': 'telephonic',
          'call': 'telephonic',
          'video': 'gmeet',
          'meet': 'gmeet'
        };

        processedValue = modeMap[value] || value;
        if (modeSearchTerms[processedValue]) {
          feedbackMessage = `Selected ${processedValue === 'telephonic' ? 'phone call' : 'video call'} assistance`;
        } else {
          feedbackMessage = "Please select either phone call or video call mode";
        }
        break;

      default:
        processedValue = value;
        feedbackMessage = `Set ${field} to ${value}`;
    }

    if (processedValue) {
      setFormData(prev => ({
        ...prev,
        [field]: processedValue
      }));
    }

    await speak(feedbackMessage);
  };

  const handleFieldFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 md:p-2 h-[calc(95vh-95px)] overflow-y-auto bg-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border"
          >
            {/* Voice Assistant Header */}
            <div className="flex items-center justify-between gap-4 p-4 border-b">
              <h2 className="text-lg font-semibold">{t.onlineAssistance}</h2>
              <VoiceAssistant 
                onVoiceInput={handleVoiceInput}
                activeField={activeField}
                feedbackEnabled={true}
                size="md"
                serviceType="ONLINE_ASSISTANCE"
              />
            </div>

            {/* Progress Steps */}
            <div className="grid grid-cols-3 border-b">
              {[
                { key: 'bankDetails', label: t.bankSelection, icon: Building2 },
                { key: 'schedule', label: t.schedule, icon: Calendar },
                { key: 'personal', label: t.mode, icon: Phone }
              ].map((step, index) => (
                <motion.div
                  key={step.key}
                  animate={{ 
                    backgroundColor: calculateProgress()[step.key] ? 'rgb(239 246 255)' : 'transparent',
                  }}
                  className={`p-3 sm:p-4 md:p-6 ${index !== 2 ? 'border-r' : ''}`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <motion.div
                      animate={{
                        backgroundColor: calculateProgress()[step.key] ? 'rgb(59 130 246)' : 'rgb(229 231 235)',
                      }}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                    >
                      <step.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                        {step.label}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                        {calculateProgress()[step.key] ? t.completed : t.pending}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Form Content */}
            <motion.form 
              onSubmit={(e) => {
                e.preventDefault();
                setShowOtpPopup(true);
              }}
              className="p-4 sm:p-6 md:p-8"
              layout
            >
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {/* Bank Selection */}
                <div>
                  <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                    {t.selectBank}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-5 h-5" />
                    <select
                      name="bank"
                      value={formData.bank}
                      onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 appearance-none border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                      onFocus={() => handleFieldFocus('bank')}
                    >
                      <option value="">Select a bank</option>
                      {banks.map(bank => (
                        <option key={bank.id} value={bank.id}>{bank.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                      {t.date}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                        onFocus={() => handleFieldFocus('date')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                      {t.timeSlot}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-5 h-5" />
                      <select
                        name="slot"
                        value={formData.slot}
                        onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 appearance-none border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        required
                        onFocus={() => handleFieldFocus('slot')}
                      >
                        <option value="">Select Time</option>
                        {standardTimeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Personal Details */}
                <div>
                  <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                    {t.contactNumber}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.contactNo}
                      className="w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-50 text-gray-900"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                    {t.fullName}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.fullName}
                      className="w-full pl-10 pr-3 py-3 border rounded-lg bg-gray-50 text-gray-900"
                      readOnly
                    />
                  </div>
                </div>

                {/* Mode Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-3">
                    {t.assistanceMode}
                  </label>
                  <div 
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    onClick={() => handleFieldFocus('mode')}
                  >
                    {modeOptions.map((option) => (
                      <motion.div
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, mode: option.id })}
                        className={`
                          cursor-pointer rounded-xl border-2 p-4
                          ${formData.mode === option.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-200'
                          }
                          transition-all duration-200
                        `}
                      >
                        <div className="flex items-start gap-4">
                          <motion.div
                            animate={{
                              backgroundColor: formData.mode === option.id ? '#3b82f6' : '#e5e7eb',
                            }}
                            className="p-2 rounded-lg"
                          >
                            <option.icon className={`w-6 h-6 ${
                              formData.mode === option.id ? 'text-white' : 'text-gray-600'
                            }`} />
                          </motion.div>
                          <div>
                            <h3 className={`font-medium ${
                              formData.mode === option.id ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {option.label}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="md:col-span-2 bg-blue-600 text-white sm:p-5 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-medium"
                >
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                  {t.scheduleAssistance}
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        </div>

        {/* Popups */}
        {showOtpPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OtpVerificationPopup
              phoneNumber={user?.phone}
              onVerify={() => {
                setShowOtpPopup(false);
                setShowSuccess(true);
              }}
              onClose={() => setShowOtpPopup(false)}
            />
          </motion.div>
        )}

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <SuccessPage 
              message={t.assistanceSuccess}
            />
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default OnlineAssistance;

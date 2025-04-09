import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Building2, Calendar, Clock, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useUser } from '../../hooks/useUser';
import OtpVerificationPopup from '../Common/OtpVerificationPopup';
import SuccessPage from '../Common/SuccessPage';
import { useServiceRequest } from '../../hooks/useServiceRequest';
import { banksList, standardTimeSlots } from '../../data/bankData';
import { speak, parseDate, findBestMatch, parseTimeSlot } from '../../utils/voiceUtils';
import VoiceAssistant from '../Common/VoiceAssistant';
import { useServiceTranslation } from '../../context/ServiceTranslationContext';
import Toast from '../Admin/Toast';

const NewAccount = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bankId: '',
    accountType: '',
    visitDate: '',
    timeSlot: '',
    address: ''
  });
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { createServiceRequest } = useServiceRequest();
  const [activeField, setActiveField] = useState(null);
  const t = useServiceTranslation();
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '', // Pre-fill address from user data
        bankId: '',
        accountType: '',
        visitDate: '',
        timeSlot: ''
      });
    }
  }, [user]);

  // Original time slots
  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM"
  ];

  // Get current date in YYYY-MM-DD format
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];

  // Get current time
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();

  // Filter available time slots based on the selected date
  const getAvailableTimeSlots = () => {
    if (formData.visitDate === formattedToday) {
      return timeSlots.filter(slot => {
        const [startTime] = slot.split(' - ');
        const [hourStr, minuteStr] = startTime.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        
        // Convert to 24-hour format if PM
        if (startTime.includes('PM') && hour !== 12) {
          hour += 12;
        }
        // Handle 12 AM edge case
        if (startTime.includes('AM') && hour === 12) {
          hour = 0;
        }

        // Check if this time slot is in the future (with a 30-minute buffer)
        if (hour < currentHour) {
          return false;
        }
        if (hour === currentHour && minute <= currentMinute + 30) {
          return false;
        }
        return true;
      });
    }
    return timeSlots;
  };

  const availableTimeSlots = getAvailableTimeSlots();

  // Validate and adjust time slot if needed when date changes
  useEffect(() => {
    if (formData.visitDate === formattedToday && formData.timeSlot) {
      const isTimeSlotAvailable = availableTimeSlots.includes(formData.timeSlot);
      if (!isTimeSlotAvailable) {
        setFormData(prev => ({ ...prev, timeSlot: '' }));
        showToast('Selected time slot is no longer available for today', 'warning');
      }
    }
  }, [formData.visitDate]);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.bankId) {
      showToast('Please select a bank', 'error');
      return;
    }
    
    if (!formData.accountType) {
      showToast('Please select an account type', 'error');
      return;
    }
    
    if (!formData.visitDate) {
      showToast('Please select a visit date', 'error');
      return;
    }
    
    if (!formData.timeSlot) {
      showToast('Please select a time slot', 'error');
      return;
    }
    
    setShowOtpPopup(true);
  };

  const handleOtpVerification = async () => {
    try {
      if (!user?.phone) {
        throw new Error('User phone number not found');
      }

      // Check for required fields
      if (!formData.bankId || !formData.accountType) {
        throw new Error('Bank and Account Type are required');
      }

      const selectedBank = banksList.find(b => b.id === formData.bankId);
      
      // Match the structure expected by useServiceRequest
      const requestData = {
        phone: user.phone,  // Required at top level
        date: formData.visitDate,  // Required at top level
        formData: {  // Nest service-specific data under formData
          serviceType: 'NEW_ACCOUNT',
          bankId: formData.bankId,
          accountType: formData.accountType,
          timeSlot: formData.timeSlot,
          address: formData.address || 'N/A',
          firstName: formData.firstName || 'N/A',
          lastName: formData.lastName || 'N/A',
          email: formData.email || 'N/A',
          bankName: selectedBank?.name || 'N/A',
          description: `New ${formData.accountType} account opening request at ${selectedBank?.name || 'selected bank'}`
        }
      };

      console.log('Submitting request:', requestData); // Debug log
      await createServiceRequest('NEW_ACCOUNT', requestData);
      setShowOtpPopup(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating service request:', error);
      showToast(error.message || 'Failed to create service request', 'error');
    }
  };

  const calculateProgress = () => {
    const fields = {
      personalInfo: ['firstName', 'lastName', 'email', 'phone'],
      bankDetails: ['bankId', 'accountType'],
      appointment: ['visitDate', 'timeSlot', 'address']
    };

    const progress = {
      personalInfo: fields.personalInfo.every(field => formData[field]),
      bankDetails: fields.bankDetails.every(field => formData[field]),
      appointment: fields.appointment.every(field => formData[field])
    };

    return progress;
  };

  const handleVoiceInput = async (voiceData) => {
    const field = Object.keys(voiceData)[0];
    let value = voiceData[field].toLowerCase();

    let processedValue;
    let feedbackMessage;

    switch (field) {
      case 'firstName':
      case 'lastName':
        processedValue = value.charAt(0).toUpperCase() + value.slice(1);
        feedbackMessage = `Set ${field === 'firstName' ? 'first' : 'last'} name to ${processedValue}`;
        break;

      case 'email':
        // Clean up email speech input
        processedValue = value.replace(/\s+/g, '').toLowerCase();
        if (processedValue.includes('at')) {
          processedValue = processedValue.replace('at', '@');
        }
        feedbackMessage = `Set email to ${processedValue}`;
        break;

      case 'phone':
        processedValue = value.replace(/[^0-9]/g, '');
        if (processedValue) {
          feedbackMessage = `Set phone number to ${processedValue}`;
        } else {
          feedbackMessage = "I couldn't understand the phone number. Please say the digits clearly.";
        }
        break;

      case 'bankId':
        const bankOptions = banksList.map(bank => ({
          value: bank.id,
          label: bank.name,
          searchTerms: [
            bank.name.toLowerCase(),
            bank.shortName?.toLowerCase(),
            `${bank.name.toLowerCase()} bank`
          ]
        }));
        
        const matchedBank = findBestMatch(value, bankOptions);
        if (matchedBank) {
          processedValue = matchedBank.value;
          const selectedBank = banksList.find(b => b.id === matchedBank.value);
          feedbackMessage = `Selected ${selectedBank.name}`;
        } else {
          feedbackMessage = "Sorry, I couldn't find that bank. Please try again.";
        }
        break;

      case 'accountType':
        const accountTypes = [
          { value: 'savings', searchTerms: ['savings', 'saving', 'basic'] },
          { value: 'current', searchTerms: ['current', 'business'] },
          { value: 'fixed', searchTerms: ['fixed', 'fd', 'deposit'] }
        ];
        
        const matchedType = findBestMatch(value, accountTypes);
        if (matchedType) {
          processedValue = matchedType.value;
          feedbackMessage = `Selected ${matchedType.value} account type`;
        } else {
          feedbackMessage = "Please select either savings, current, or fixed deposit account";
        }
        break;

      case 'visitDate':
        processedValue = parseDate(value);
        if (processedValue) {
          const date = new Date(processedValue);
          feedbackMessage = `Set visit date to ${date.toLocaleDateString()}`;
        } else {
          feedbackMessage = "I couldn't understand the date. Please try again.";
        }
        break;

      case 'timeSlot':
        const matchedTimeSlot = parseTimeSlot(value, standardTimeSlots);
        if (matchedTimeSlot) {
          processedValue = matchedTimeSlot;
          feedbackMessage = `Set appointment time to ${matchedTimeSlot}`;
        } else {
          feedbackMessage = "I couldn't understand the time. Please say something like '9 AM' or '2 PM'";
        }
        break;

      case 'address':
        processedValue = value;
        feedbackMessage = `Set address to ${value}`;
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

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData({...formData, visitDate: selectedDate});
    
    // When switching dates, check if we need to reset the time slot
    if (selectedDate === formattedToday && formData.timeSlot) {
      if (!availableTimeSlots.includes(formData.timeSlot)) {
        setFormData(prev => ({...prev, timeSlot: ''}));
        showToast('Your previously selected time is no longer available for today', 'warning');
      }
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 md:p-2 h-[calc(90vh-80px)] overflow-y-auto bg-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border"
          >
            {/* Voice Assistant Header */}
            <div className="flex items-center justify-between gap-4 p-4 border-b">
              <h2 className="text-lg font-semibold">{t.newAccount}</h2>
              <VoiceAssistant 
                onVoiceInput={handleVoiceInput}
                activeField={activeField}
                feedbackEnabled={true}
                size="md"
                serviceType="NEW_ACCOUNT"
              />
            </div>

            {/* Progress Steps */}
            <div className="grid grid-cols-3 border-b">
              {[
                { key: 'personalInfo', label: t.personalInfo, icon: UserPlus },
                { key: 'bankDetails', label: t.bankDetails, icon: Building2 },
                { key: 'appointment', label: t.appointment, icon: Calendar }
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
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 md:p-8"
              layout
            >
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {/* Personal Info Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">{t.firstName}</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        onFocus={() => handleFieldFocus('firstName')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">{t.lastName}</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        onFocus={() => handleFieldFocus('lastName')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">{t.email}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        onFocus={() => handleFieldFocus('email')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">{t.phone}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        onFocus={() => handleFieldFocus('phone')}
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Details Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">{t.selectBank}</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="bankId"
                        value={formData.bankId}
                        onChange={(e) => setFormData({...formData, bankId: e.target.value})}
                        className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        required
                        onFocus={() => handleFieldFocus('bankId')}
                      >
                        <option value="">{t.selectBank}</option>
                        {banksList.map(bank => (
                          <option key={bank.id} value={bank.id}>{bank.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">{t.accountType}</label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                      className="w-full p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      onFocus={() => handleFieldFocus('accountType')}
                    >
                      <option value="">{t.selectAccountType}</option>
                      <option value="savings">{t.savingsAccount}</option>
                      <option value="current">{t.currentAccount}</option>
                      <option value="fixed">{t.fixedDeposit}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">{t.visitDate}</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          name="visitDate"
                          min={formattedToday}
                          value={formData.visitDate}
                          onChange={handleDateChange}
                          className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                          onFocus={() => handleFieldFocus('visitDate')}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">{t.timeSlot}</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          name="timeSlot"
                          value={formData.timeSlot}
                          onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                          className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                          required
                          onFocus={() => handleFieldFocus('timeSlot')}
                          disabled={!formData.visitDate}
                        >
                          <option value="">{t.selectTime}</option>
                          {availableTimeSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                          {formData.visitDate === formattedToday && availableTimeSlots.length === 0 && (
                            <option value="" disabled>No available time slots for today</option>
                          )}
                        </select>
                        {formData.visitDate === formattedToday && availableTimeSlots.length === 0 && (
                          <p className="text-red-500 text-xs mt-1">No available slots for today. Please select another date.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visit Address - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">{t.visitAddress}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
                      onFocus={() => handleFieldFocus('address')}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="md:col-span-2 bg-blue-600 text-white p-4 sm:p-5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-base sm:text-lg font-medium"
                >
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                  {t.scheduleAppointment}
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        </div>

        {/* Popups */}
        {showOtpPopup && (
          <OtpVerificationPopup
            phoneNumber={user?.phone}
            onVerify={handleOtpVerification}
            onClose={() => setShowOtpPopup(false)}
          />
        )}

        {showSuccess && (
          <SuccessPage 
            message={t.accountSuccess}
          />
        )}

        {/* Toast Notification */}
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast({ show: false, message: '', type: '' })} 
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default NewAccount;

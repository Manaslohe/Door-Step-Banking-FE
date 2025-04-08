import React, { useState, useEffect } from 'react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { FileCheck, ArrowLeft, User2, Calendar, MapPin, Building2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import OtpVerificationPopup from '../Common/OtpVerificationPopup';
import SuccessPage from '../Common/SuccessPage';
import { useServiceRequest } from '../../hooks/useServiceRequest';
import { linkedBankAccounts, standardTimeSlots } from '../../data/bankData';
import { motion } from 'framer-motion';
import { speak, parseDate, findBestMatch, parseTimeSlot } from '../../utils/voiceUtils';
import VoiceAssistant from '../Common/VoiceAssistant';
import { useServiceTranslation } from '../../context/ServiceTranslationContext';

const LifeCertificate = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    pensionAccountNo: '',
    bank: '',
    date: '',
    slot: '',
    phone: '',  // Changed from contactNo to phone
    address: ''
  });
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { createServiceRequest } = useServiceRequest();
  const [activeField, setActiveField] = useState(null);
  const t = useServiceTranslation();

  // Add useEffect to update form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        pensionAccountNo: user.pensionAccountNo || '',
        bank: user.bank || '',
        phone: user.phone || '',  // Changed from contactNo to phone
        address: user.address || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowOtpPopup(true);
  };

  const handleOtpVerification = async () => {
    try {
      if (!user?.phone) {
        throw new Error('User phone number not found');
      }

      if (!formData.pensionAccountNo) {
        throw new Error('Pension Account Number is required');
      }

      // Simplified request data structure
      const requestData = {
        phone: user.phone,
        date: formData.date,
        timeSlot: formData.slot,  // Note: matching the field name from form
        address: formData.address,
        pensionAccountNo: formData.pensionAccountNo,
        bank: formData.bank,
        description: `Life Certificate verification for pension account ${formData.pensionAccountNo}`
      };

      console.log('Submitting life certificate request:', requestData);
      await createServiceRequest('LIFE_CERTIFICATE', requestData);
      setShowOtpPopup(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating service request:', error);
      alert(error.message || 'Failed to create service request');
    }
  };

  const calculateProgress = () => {
    const fields = {
      personalDetails: ['pensionAccountNo', 'phone'],
      bankDetails: ['bank'],
      schedule: ['date', 'slot', 'address']
    };

    const progress = {
      personalDetails: fields.personalDetails.every(field => formData[field]),
      bankDetails: fields.bankDetails.every(field => formData[field]),
      schedule: fields.schedule.every(field => formData[field])
    };

    return progress;
  };

  // Fix animation warning by using initial and animate with proper RGB values
  const getProgressColor = (isComplete) => {
    return {
      initial: { backgroundColor: isComplete ? 'rgb(239, 246, 255)' : 'rgb(255, 255, 255)' },
      animate: { backgroundColor: isComplete ? 'rgb(239, 246, 255)' : 'rgb(255, 255, 255)' }
    };
  };

  const handleVoiceInput = async (voiceData) => {
    const field = Object.keys(voiceData)[0];
    let value = voiceData[field].toLowerCase();

    let processedValue;
    let feedbackMessage;

    switch (field) {
      case 'pensionAccountNo':
        processedValue = value.replace(/[^0-9]/g, '');
        if (processedValue) {
          feedbackMessage = `Set pension account number to ${processedValue}`;
        } else {
          feedbackMessage = "I couldn't understand the account number. Please say the numbers clearly.";
        }
        break;

      case 'phone':
        processedValue = value.replace(/[^0-9]/g, '');
        if (processedValue) {
          feedbackMessage = `Set phone number to ${processedValue}`;
        } else {
          feedbackMessage = "I couldn't understand the phone number. Please say the digits clearly.";
        }
        break;

      case 'bank':
        const bankOptions = linkedBankAccounts.map(bank => ({
          value: bank.bank,
          label: bank.bank,
          searchTerms: [bank.bank.toLowerCase(), `${bank.bank.toLowerCase()} bank`]
        }));
        
        const matchedBank = findBestMatch(value, bankOptions);
        if (matchedBank) {
          processedValue = matchedBank.value;
          feedbackMessage = `Selected ${matchedBank.value} bank`;
        } else {
          feedbackMessage = "Sorry, I couldn't find that bank. Please try again.";
        }
        break;

      case 'date':
        processedValue = parseDate(value);
        if (processedValue) {
          const date = new Date(processedValue);
          feedbackMessage = `Set verification date to ${date.toLocaleDateString()}`;
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

      case 'address':
        processedValue = value;
        feedbackMessage = `Set collection address to ${value}`;
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

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 md:p-2 min-h-[calc(90vh-90px)] overflow-y-auto bg-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border mb-6"
          >
            {/* Voice Assistant Header */}
            <div className="flex items-center justify-between gap-4 p-4 border-b">
              <h2 className="text-lg font-semibold">{t.lifeCertificate}</h2>
              <VoiceAssistant 
                onVoiceInput={handleVoiceInput}
                activeField={activeField}
                feedbackEnabled={true}
                size="md"
                serviceType="LIFE_CERTIFICATE"
              />
            </div>

            {/* Progress Steps */}
            <div className="grid grid-cols-3 border-b">
              {[
                { key: 'personalDetails', label: t.personalInfo, icon: User2 },
                { key: 'bankDetails', label: t.bankDetails, icon: Building2 },
                { key: 'schedule', label: t.appointment, icon: Calendar }
              ].map((step, index) => (
                <motion.div
                  key={step.key}
                  initial={getProgressColor(calculateProgress()[step.key]).initial}
                  animate={getProgressColor(calculateProgress()[step.key]).animate}
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
              className="p-4 sm:p-6 md:p-8 space-y-6"
              layout
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Details Section */}
                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.pensionAccountNo}
                    </label>
                    <div className="relative">
                      <User2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="text" 
                        name="pensionAccountNo"
                        value={formData.pensionAccountNo}
                        onChange={handleInputChange}
                        onFocus={() => handleFieldFocus('pensionAccountNo')}
                        className="w-full pl-10 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.contactNumber}
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onFocus={() => handleFieldFocus('phone')}
                        className="w-full pl-10 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Details Section */}
                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.selectBank}
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="bank"
                        value={formData.bank}
                        onChange={handleInputChange}
                        onFocus={() => handleFieldFocus('bank')}
                        className="w-full pl-10 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                        required
                      >
                        <option value="">{t.selectBank}</option>
                        {linkedBankAccounts.map(bank => (
                          <option key={bank.id} value={bank.bank}>
                            {bank.bank}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.preferredDate}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        onFocus={() => handleFieldFocus('date')}
                        className="w-full pl-10 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.timeSlot}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="slot"
                        value={formData.slot}
                        onChange={handleInputChange}
                        onFocus={() => handleFieldFocus('slot')}
                        className="w-full pl-10 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                        required
                      >
                        <option value="">{t.selectTimeSlot}</option>
                        {standardTimeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.collectionAddress}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        onFocus={() => handleFieldFocus('address')}
                        rows="3"
                        className="w-full pl-10 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="md:col-span-2 w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 
                    transition-colors flex items-center justify-center gap-2 text-base font-medium"
                >
                  <FileCheck className="w-5 h-5" />
                  {t.scheduleLifeCertificate}
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        </div>

        {/* Popups with animations */}
        {showOtpPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OtpVerificationPopup
              phoneNumber={user?.phone}
              onVerify={handleOtpVerification}
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
              message={t.lifeCertificateSuccess}
            />
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default LifeCertificate;

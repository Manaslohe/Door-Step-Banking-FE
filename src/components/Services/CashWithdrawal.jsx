import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Clock, Calendar, MapPin, Building2, CreditCard } from 'lucide-react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import OtpVerificationPopup from '../Common/OtpVerificationPopup';
import SuccessPage from '../Common/SuccessPage';
import { useUser } from '../../hooks/useUser';
import { useServiceRequest } from '../../hooks/useServiceRequest';
import { linkedBankAccounts, standardTimeSlots } from '../../data/bankData';
import { motion } from 'framer-motion';
import VoiceAssistant from '../Common/VoiceAssistant';
import { speak, parseDate, findBestMatch, parseTimeSlot } from '../../utils/voiceUtils';

const CashWithdrawal = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createServiceRequest } = useServiceRequest();
  const [formData, setFormData] = useState({
    bankAccount: '',
    ifscCode: '',
    accountNo: '',
    withdrawalAddress: '',
    date: '',
    timeSlot: '',
    amount: '',
    pan: '',
    serviceType: 'withdrawal' // Categorizing the service
  });

  // Replace linkedAccounts with standardized data
  const bankAccounts = linkedBankAccounts;

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const handleInputChange = (e) => {
    if (e.target.name === 'bankAccount') {
      const selectedAccount = bankAccounts.find(acc => acc.id === e.target.value);
      setFormData({ 
        ...formData, 
        bankAccount: e.target.value,
        ifscCode: selectedAccount ? selectedAccount.ifsc : '',
        bank: selectedAccount ? selectedAccount.fullName : ''
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowOtpPopup(true);
  };

  const handleOtpVerification = async () => {
    try {
      if (!user?.phone) {
        throw new Error('User phone number not found');
      }

      const requestData = {
        phone: user.phone,
        formData: {
          serviceType: 'CASH_WITHDRAWAL',
          bankAccount: formData.bankAccount,
          date: formData.date,
          timeSlot: formData.timeSlot,
          address: formData.withdrawalAddress, // Map to address
          amount: formData.amount,
          ifscCode: formData.ifscCode,
          description: `Cash withdrawal request for amount: ${formData.amount}`,
          // Additional contact info
          contactNo: user.phone,
          userPhone: user.phone
        }
      };

      await createServiceRequest('CASH_WITHDRAWAL', requestData);
      setShowOtpPopup(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating service request:', error);
      alert(error.message || 'Failed to create service request');
    }
  };

  const calculateProgress = () => {
    const fields = {
      bankDetails: ['bankAccount', 'ifscCode'],
      delivery: ['withdrawalAddress', 'date', 'timeSlot'],
      amount: ['amount']
    };

    const progress = {
      bankDetails: fields.bankDetails.every(field => formData[field]),
      delivery: fields.delivery.every(field => formData[field]),
      amount: fields.amount.every(field => formData[field])
    };

    return progress;
  };

  // Add voice input handling
  const handleVoiceInput = async (voiceData) => {
    const field = Object.keys(voiceData)[0];
    let value = voiceData[field].toLowerCase();

    // Check for form submission commands
    if (['confirm', 'send', 'submit'].includes(value)) {
      if (calculateProgress().bankDetails && 
          calculateProgress().delivery && 
          calculateProgress().amount) {
        await speak("Submitting your withdrawal request");
        handleSubmit({ preventDefault: () => {} });
        return;
      } else {
        await speak("Please fill all required fields before submitting");
        return;
      }
    }

    let processedValue;
    let feedbackMessage;

    switch (field) {
      case 'bankAccount':
        const bankOptions = bankAccounts.map(acc => ({
          value: acc.id,
          label: acc.bank,
          searchTerms: [
            acc.bank.toLowerCase(),
            acc.accountNo,
            `${acc.bank.toLowerCase()} account`,
            acc.accountNo.slice(-4)
          ]
        }));
        
        const matchedBank = findBestMatch(value, bankOptions);
        if (matchedBank) {
          const selectedAccount = bankAccounts.find(acc => acc.id === matchedBank.value);
          setFormData(prev => ({
            ...prev,
            bankAccount: matchedBank.value,
            ifscCode: selectedAccount.ifsc,
            accountNo: selectedAccount.accountNo
          }));
          feedbackMessage = `Selected ${selectedAccount.bank} account and set IFSC code`;
        } else {
          feedbackMessage = "Sorry, I couldn't find that bank account. Please try again.";
        }
        break;

      case 'withdrawalAddress':
        processedValue = value;
        feedbackMessage = `Set delivery address to ${value}`;
        break;

      case 'date':
        processedValue = parseDate(value);
        if (processedValue) {
          const date = new Date(processedValue);
          feedbackMessage = `Set withdrawal date to ${date.toLocaleDateString()}`;
        } else {
          feedbackMessage = "I couldn't understand the date. Please try again.";
        }
        break;

      case 'timeSlot':
        const matchedTimeSlot = parseTimeSlot(value, standardTimeSlots);
        if (matchedTimeSlot) {
          setFormData(prev => ({
            ...prev,
            timeSlot: matchedTimeSlot
          }));
          feedbackMessage = `Set withdrawal time to ${matchedTimeSlot}`;
        } else {
          feedbackMessage = "I couldn't understand the time. Please say something like '9 AM', '2 PM', or 'morning'";
        }
        break;

      case 'amount':
        const amountStr = value.replace(/[^0-9]/g, '');
        if (amountStr) {
          processedValue = amountStr;
          feedbackMessage = `Set withdrawal amount to ${processedValue} rupees`;
        } else {
          feedbackMessage = "I couldn't understand the amount. Please say a number.";
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

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 md:p-2 h-[calc(95vh-90px)] overflow-y-auto bg-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border"
          >
            {/* Voice Assistant Header */}
            <div className="flex items-center justify-between gap-4 p-4 border-b">
              <h2 className="text-lg font-semibold">Cash Withdrawal Service</h2>
              <VoiceAssistant 
                onVoiceInput={handleVoiceInput}
                activeField={activeField}
                feedbackEnabled={true}
                size="md"
                serviceType="CASH_WITHDRAWAL"
              />
            </div>

            {/* Progress Steps */}
            <div className="grid grid-cols-3 border-b">
              {[
                { key: 'bankDetails', label: 'Bank Details', icon: Building2 },
                { key: 'delivery', label: 'Delivery', icon: MapPin },
                { key: 'amount', label: 'Amount', icon: DollarSign }
              ].map((step, index) => (
                <motion.div
                  key={step.key}
                  initial={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}
                  animate={{ 
                    backgroundColor: calculateProgress()[step.key] 
                      ? 'rgb(239, 246, 255)' 
                      : 'rgba(255, 255, 255, 0)'
                  }}
                  className={`p-3 sm:p-4 md:p-6 ${index !== 2 ? 'border-r' : ''}`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <motion.div
                      initial={{ backgroundColor: 'rgb(229, 231, 235)' }}
                      animate={{
                        backgroundColor: calculateProgress()[step.key] 
                          ? 'rgb(59, 130, 246)' 
                          : 'rgb(229, 231, 235)',
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
                        {calculateProgress()[step.key] ? 'Completed' : 'Pending'}
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
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-6">
                {/* Bank Details Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Select Bank Account
                    </label>
                    <select
                      name="bankAccount"
                      className="w-full p-3 sm:p-4 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      onChange={handleInputChange}
                      onFocus={() => handleFieldFocus('bankAccount')}
                      value={formData.bankAccount}
                      required
                    >
                      <option value="">Select Bank Account</option>
                      {bankAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.bank} - {acc.accountNo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      className="w-full p-3 sm:p-4 text-sm sm:text-base border rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                {/* Delivery Details Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                      Withdrawal Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="withdrawalAddress"
                        value={formData.withdrawalAddress}
                        placeholder="Enter your complete address"
                        className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                        onChange={handleInputChange}
                        onFocus={() => handleFieldFocus('withdrawalAddress')}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                          onChange={handleInputChange}
                          onFocus={() => handleFieldFocus('date')}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Time Slot
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          name="timeSlot"
                          value={formData.timeSlot}
                          className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                          onChange={handleInputChange}
                          onFocus={() => handleFieldFocus('timeSlot')}
                          required
                        >
                          <option value="">Select Time</option>
                          {standardTimeSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 ">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      placeholder="Enter amount"
                      className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                      onChange={handleInputChange}
                      onFocus={() => handleFieldFocus('amount')}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="md:col-span-2 bg-blue-600 text-white p-4 sm:p-5 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-medium"
                >
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                  Schedule Withdrawal
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
              message="Your cash withdrawal request has been scheduled successfully!"
            />
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default CashWithdrawal;

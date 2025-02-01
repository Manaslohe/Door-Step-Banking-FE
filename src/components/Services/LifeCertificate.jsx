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

      const requestData = {
        serviceType: 'LIFE_CERTIFICATE',
        phone: user.phone,
        userPhone: user.phone,
        contactNo: user.phone,
        bankAccount: formData.pensionAccountNo,
        timeSlot: formData.slot,
        date: formData.date,
        address: formData.address,
        bank: formData.bank,
        pensionAccountNo: formData.pensionAccountNo, // Add this explicitly
        bankName: formData.bank
      };

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

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 md:p-2 min-h-[calc(100vh-80px)] overflow-y-auto bg-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border mb-6"
          >
            {/* Progress Steps */}
            <div className="grid grid-cols-3 border-b">
              {[
                { key: 'personalDetails', label: 'Personal Details', icon: User2 },
                { key: 'bankDetails', label: 'Bank Details', icon: Building2 },
                { key: 'schedule', label: 'Schedule', icon: Calendar }
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
              className="p-4 sm:p-6 md:p-8 space-y-6"
              layout
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Details Section */}
                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pension Account Number
                    </label>
                    <div className="relative">
                      <User2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="text" 
                        name="pensionAccountNo"
                        value={formData.pensionAccountNo}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
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
                      Select Bank
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="bank"
                        value={formData.bank}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                        required
                      >
                        <option value="">Select Bank</option>
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
                      Preferred Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slot
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="slot"
                        value={formData.slot}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                        required
                      >
                        <option value="">Select Time Slot</option>
                        {standardTimeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Collection Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
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
                  Schedule Life Certificate Collection
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
              message="Your life certificate collection has been scheduled successfully!"
            />
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default LifeCertificate;

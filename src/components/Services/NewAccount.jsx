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

  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM"
  ];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
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
      alert(error.message || 'Failed to create service request');
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
            {/* Progress Steps */}
            <div className="grid grid-cols-3 border-b">
              {[
                { key: 'personalInfo', label: 'Personal Info', icon: UserPlus },
                { key: 'bankDetails', label: 'Bank Details', icon: Building2 },
                { key: 'appointment', label: 'Appointment', icon: Calendar }
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
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {/* Personal Info Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Details Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Select Bank</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="bankId"
                        value={formData.bankId}
                        onChange={(e) => setFormData({...formData, bankId: e.target.value})}
                        className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        required
                      >
                        <option value="">Select Bank</option>
                        {banksList.map(bank => (
                          <option key={bank.id} value={bank.id}>{bank.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Account Type</label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                      className="w-full p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Account Type</option>
                      <option value="savings">Savings Account</option>
                      <option value="current">Current Account</option>
                      <option value="fixed">Fixed Deposit</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Visit Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          name="visitDate"
                          min={minDate}
                          value={formData.visitDate}
                          onChange={(e) => setFormData({...formData, visitDate: e.target.value})}
                          className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Time Slot</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          name="timeSlot"
                          value={formData.timeSlot}
                          onChange={(e) => setFormData({...formData, timeSlot: e.target.value})}
                          className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                          required
                        >
                          <option value="">Select Time</option>
                          {timeSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visit Address - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Visit Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-10 p-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
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
                  Schedule Appointment
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
            message="Your new account request has been scheduled successfully!"
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default NewAccount;

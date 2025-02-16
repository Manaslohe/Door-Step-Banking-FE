import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Building2, Calendar, Clock, MapPin, Send, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useUser } from '../../hooks/useUser';
import OtpVerificationPopup from '../Common/OtpVerificationPopup';
import SuccessPage from '../Common/SuccessPage';
import { useServiceRequest } from '../../hooks/useServiceRequest';
import { linkedBankAccounts, standardTimeSlots } from '../../data/bankData';
import { speak, parseDate, findBestMatch, parseTimeSlot } from '../../utils/voiceUtils';
import VoiceAssistant from '../Common/VoiceAssistant';

const DocumentService = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedService, setSelectedService] = useState('collect');
  const [activeField, setActiveField] = useState(null);
  
  // Add document type options
  const documentTypes = [
    { value: 'general', label: 'General Documents' },
    { value: 'kyc', label: 'KYC Documents' },
    { value: 'statement', label: 'Bank Statements' },
    { value: 'checkbook', label: 'Checkbook/Cards' },
    { value: 'other', label: 'Other Documents' }
  ];

  const [formData, setFormData] = useState({
    collectionAddress: '',
    deliveryAddress: '',
    date: '',
    timeSlot: '',
    contactNumber: '',
    bankAccount: '',
    documentType: 'general', // Set default document type
  });

  const bankAccounts = linkedBankAccounts;

  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM"
  ];

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        collectionAddress: user.address || '',
        deliveryAddress: user.address || '',
        contactNumber: user.phone || ''
      }));
    }
  }, [user]);

  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { createServiceRequest } = useServiceRequest();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['bankAccount', 'date', 'timeSlot'];
    const addressField = selectedService === 'collect' ? 'collectionAddress' : 'deliveryAddress';
    requiredFields.push(addressField);

    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate date
    if (new Date(formData.date) < new Date()) {
      alert('Please select a future date');
      return;
    }

    setShowOtpPopup(true);
  };

  // Update handleOtpVerification to include documentType
  const handleOtpVerification = async () => {
    try {
      if (!user?.phone) {
        throw new Error('User phone number not found');
      }

      const serviceType = selectedService === 'collect' ? 'DOCUMENT_COLLECTION' : 'DOCUMENT_DELIVERY';
      const selectedAccount = bankAccounts.find(acc => acc.id === formData.bankAccount);
      
      // Simplified request structure - all fields at root level
      const requestData = {
        serviceType,
        phone: user.phone,
        date: formData.date,
        timeSlot: formData.timeSlot,
        bankAccount: formData.bankAccount,
        documentType: formData.documentType || 'general',
        address: selectedService === 'collect' ? formData.collectionAddress : formData.deliveryAddress,
        bank: selectedAccount?.fullName || 'N/A',
        ifscCode: selectedAccount?.ifsc || 'N/A',
        description: `Document ${selectedService} request - ${formData.documentType} documents`
      };

      console.log('Submitting document request:', requestData);
      await createServiceRequest(serviceType, requestData);
      setShowOtpPopup(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating service request:', error);
      alert(error.message || 'Failed to create service request');
    }
  };

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

  const calculateProgress = () => {
    const fields = {
      serviceType: ['bankAccount'],
      address: [selectedService === 'collect' ? 'collectionAddress' : 'deliveryAddress'],
      schedule: ['date', 'timeSlot']
    };

    const progress = {
      serviceType: fields.serviceType.every(field => formData[field]),
      address: fields.address.every(field => formData[field]),
      schedule: fields.schedule.every(field => formData[field])
    };

    return progress;
  };

  const handleVoiceInput = async (voiceData) => {
    const field = Object.keys(voiceData)[0];
    let value = voiceData[field].toLowerCase();

    let processedValue;
    let feedbackMessage;

    switch (field) {
      case 'bankAccount':
        const bankOptions = bankAccounts.map(acc => ({
          value: acc.id,
          label: acc.fullName,
          searchTerms: [
            acc.fullName.toLowerCase(),
            acc.accountNo,
            `${acc.fullName.toLowerCase()} account`
          ]
        }));
        
        const matchedBank = findBestMatch(value, bankOptions);
        if (matchedBank) {
          const selectedAccount = bankAccounts.find(acc => acc.id === matchedBank.value);
          setFormData(prev => ({
            ...prev,
            bankAccount: matchedBank.value,
            ifscCode: selectedAccount.ifsc
          }));
          feedbackMessage = `Selected ${selectedAccount.fullName} account`;
        } else {
          feedbackMessage = "Sorry, I couldn't find that bank account.";
        }
        break;

      case 'documentType':
        const docOptions = documentTypes.map(type => ({
          value: type.value,
          label: type.label,
          searchTerms: [type.label.toLowerCase(), type.value]
        }));
        
        const matchedDoc = findBestMatch(value, docOptions);
        if (matchedDoc) {
          processedValue = matchedDoc.value;
          feedbackMessage = `Selected ${matchedDoc.label} document type`;
        } else {
          feedbackMessage = "Please select a valid document type";
        }
        break;

      case 'collectionAddress':
      case 'deliveryAddress':
        processedValue = value;
        feedbackMessage = `Set ${field === 'collectionAddress' ? 'collection' : 'delivery'} address to ${value}`;
        break;

      case 'date':
        processedValue = parseDate(value);
        if (processedValue) {
          const date = new Date(processedValue);
          feedbackMessage = `Set date to ${date.toLocaleDateString()}`;
        } else {
          feedbackMessage = "I couldn't understand the date. Please try again.";
        }
        break;

      case 'timeSlot':
        const matchedTimeSlot = parseTimeSlot(value, standardTimeSlots);
        if (matchedTimeSlot) {
          processedValue = matchedTimeSlot;
          feedbackMessage = `Set time slot to ${matchedTimeSlot}`;
        } else {
          feedbackMessage = "Please say a valid time slot like '9 AM' or '2 PM'";
        }
        break;
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
        className="p-3 sm:p-4 h-[calc(95vh-100px)] overflow-y-auto bg-gray-50" // Reduced padding
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border"
          >
            {/* Add Voice Assistant */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Document {selectedService === 'collect' ? 'Collection' : 'Delivery'}</h2>
              <VoiceAssistant 
                onVoiceInput={handleVoiceInput}
                activeField={activeField}
                feedbackEnabled={true}
                size="md"
                serviceType={selectedService === 'collect' ? 'DOCUMENT_COLLECTION' : 'DOCUMENT_DELIVERY'}
              />
            </div>

            {/* Service Type Toggle - Updated styling */}
            <div className="p-4 sm:p-5 border-b">
              <div className="flex gap-4 max-w-md mx-auto bg-gray-100 p-2 rounded-xl">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedService('collect')}
                  className={`flex-1 p-4 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    selectedService === 'collect' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Download className="w-6 h-6" />
                  <span className="font-medium text-base">Collection</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedService('deliver')}
                  className={`flex-1 p-4 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    selectedService === 'deliver' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Send className="w-6 h-6" />
                  <span className="font-medium text-base">Delivery</span>
                </motion.button>
              </div>
            </div>

            {/* Progress Steps - Updated text sizes */}
            <div className="grid grid-cols-3 border-b">
              {[
                { key: 'serviceType', label: 'Bank Account', icon: Building2 },
                { key: 'address', label: selectedService === 'collect' ? 'Collection' : 'Delivery', icon: MapPin },
                { key: 'schedule', label: 'Schedule', icon: Calendar }
              ].map((step, index) => (
                <motion.div
                  key={step.key}
                  animate={{ 
                    backgroundColor: calculateProgress()[step.key] ? 'rgb(239 246 255)' : 'transparent',
                  }}
                  className={`p-3 sm:p-4 ${index !== 2 ? 'border-r' : ''}`} // Reduced padding
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{
                        backgroundColor: calculateProgress()[step.key] ? 'rgb(59 130 246)' : 'rgb(229 231 235)',
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                    >
                      <step.icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        {step.label}
                      </p>
                      <p className="text-sm text-gray-600 hidden sm:block">
                        {calculateProgress()[step.key] ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Form Content - Updated text sizes and spacing */}
            <motion.form 
              onSubmit={handleSubmit}
              className="p-4 sm:p-5" // Reduced padding
              layout
            >
              <div className="grid md:grid-cols-2 gap-4 sm:gap-5"> {/* Reduced gap */}
                {/* Bank Account Selection */}
                <div className="md:col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Select Bank Account
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-3.5 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      required
                      onFocus={() => handleFieldFocus('bankAccount')}
                    >
                      <option value="">Select Bank Account</option>
                      {bankAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.fullName} - {acc.accountNo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Document Type Selection */}
                <div className="md:col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-3.5 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      required
                      onFocus={() => handleFieldFocus('documentType')}
                    >
                      {documentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Address Section */}
                <div className="md:col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    {selectedService === 'collect' ? 'Collection Address' : 'Delivery Address'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      name={selectedService === 'collect' ? 'collectionAddress' : 'deliveryAddress'}
                      value={selectedService === 'collect' ? formData.collectionAddress : formData.deliveryAddress}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-3.5 text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="2" // Reduced rows
                      required
                      placeholder={`Enter ${selectedService === 'collect' ? 'collection' : 'delivery'} address`}
                      onFocus={() => handleFieldFocus(selectedService === 'collect' ? 'collectionAddress' : 'deliveryAddress')}
                    />
                  </div>
                </div>

                {/* Schedule Section - Reduced margin */}
                <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Preferred Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        name="date"
                        min={minDate}
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-3.5 text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        onFocus={() => handleFieldFocus('date')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Time Slot
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={handleInputChange}
                        className="w-full pl-10 p-3.5 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        required
                        onFocus={() => handleFieldFocus('timeSlot')}
                      >
                        <option value="">Select Time Slot</option>
                        {standardTimeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="md:col-span-2 bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 text-lg font-medium"
                >
                  <FileText className="w-6 h-6" />
                  Schedule {selectedService === 'collect' ? 'Collection' : 'Delivery'}
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
              message={`Your document ${selectedService === 'collect' ? 'collection' : 'delivery'} request has been scheduled successfully!`}
            />
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default DocumentService;

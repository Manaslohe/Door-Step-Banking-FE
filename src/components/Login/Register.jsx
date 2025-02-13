import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, ArrowLeft, Upload, ChevronRight } from 'lucide-react';
import SuccessAnimation from './SuccessAnimation';
import RegisterTransition from './RegisterTransition';
import ConsentModal from './ConsentModal';
import KycVerificationForm from './KycVerificationForm';
import { registerCustomer } from '../../services/api';
import imageCompression from 'browser-image-compression';
import { auth } from '../../utils/auth';
import Toast from '../Admin/Toast';

// New PersonalDetailsForm component
const PersonalDetailsForm = React.memo(({ 
  formData, 
  onSubmit, 
  onChange, 
  onPhotoChange, 
  photoPreview, 
  error, 
  isSubmitting 
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    {error && (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
        {error}
      </div>
    )}
    <div className="flex items-center justify-center mb-6">
      <div className="relative group">
        {photoPreview ? (
          <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-400" />
          </div>
        )}
        <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer">
          <Upload className="w-4 h-4 text-white" />
          <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
        </label>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <input 
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={onChange}
        placeholder="First Name"
        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 text-sm"
        autoComplete="given-name"
        required
      />
      <input 
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={onChange}
        placeholder="Last Name"
        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 text-sm"
        autoComplete="family-name"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <input 
        type="email"
        name="email"
        value={formData.email}
        onChange={onChange}
        placeholder="Email Address"
        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 text-sm"
        autoComplete="email"
      />
      <input 
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={onChange}
        placeholder="Phone Number"
        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 text-sm"
        autoComplete="tel"
        pattern="[0-9]*"
        inputMode="numeric"
        maxLength={10}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <input 
        type="text"
        name="aadhaar"
        value={formData.aadhaar}
        onChange={onChange}
        placeholder="Aadhaar Number"
        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 text-sm"
        pattern="[0-9]*"
        inputMode="numeric"
        maxLength={12}
      />
      <input 
        type="text"
        name="pan"
        value={formData.pan}
        onChange={onChange}
        placeholder="PAN Number"
        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 text-sm"
        maxLength={10}
      />
    </div>

    <textarea 
      name="address"
      value={formData.address}
      onChange={onChange}
      placeholder="Complete Address"
      rows="2"
      className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 text-sm"
    />

    <button 
      type="submit"
      disabled={isSubmitting}
      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium disabled:opacity-50"
    >
      {isSubmitting ? (
        <span>Creating Account...</span>
      ) : (
        <>
          <span>Create Account</span>
          <ChevronRight className="w-4 h-4" />
        </>
      )}
    </button>
  </form>
));

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTransition, setShowTransition] = useState(location.state?.showTransition || false);
  const [showConsent, setShowConsent] = useState(false);
  const [currentStep, setCurrentStep] = useState('personal');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    aadhaar: '',
    pan: '',
    address: '',
    photoUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'error'
  });

  const showToast = (message, type = 'error') => {
    setToast({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true
        };
        
        const compressedFile = await imageCompression(file, options);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result.length > 2000000) {
            setError('Image size too large. Please choose a smaller image.');
            return;
          }
          setPhotoPreview(reader.result);
          setFormData(prev => ({
            ...prev,
            photoUrl: reader.result
          }));
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        setError('Error processing image. Please try another image.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let finalValue = value;
    
    if (name === 'phone') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    }
    if (name === 'aadhaar') {
      finalValue = value.replace(/\D/g, '').slice(0, 12);
    }
    if (name === 'pan') {
      finalValue = value.toUpperCase().slice(0, 10);
    }

    setFormData({
      ...formData,
      [name]: finalValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.firstName || !formData.email || !formData.phone) {
        showToast('Please fill in all required fields');
        throw new Error('Please fill in all required fields');
      }

      if (photoPreview && !formData.photoUrl) {
        showToast('Error processing photo. Please try uploading again.');
        throw new Error('Error processing photo. Please try uploading again.');
      }

      const response = await registerCustomer(formData);
      
      if (response && response.user) {
        auth.setAuth(response.token, response.user);
        setShowConsent(true);
      } else {
        showToast(response?.message || 'Registration failed');
        throw new Error(response?.message || 'Registration failed');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;
        if (errorMessage.includes('email')) {
          showToast('This email address is already registered');
        } else if (errorMessage.includes('phone')) {
          showToast('This phone number is already registered');
        } else if (errorMessage.includes('aadhaar')) {
          showToast('This Aadhaar number is already registered');
        } else if (errorMessage.includes('pan')) {
          showToast('This PAN number is already registered');
        } else {
          showToast(errorMessage);
        }
      } else {
        showToast(err.message || 'An error occurred during registration');
      }
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToKyc = () => {
    setShowConsent(false);
    setCurrentStep('kyc');
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
  };

  const handleLoginRedirect = () => {
    navigate('/', { state: { showLogin: true } });
  };

  if (showTransition) {
    return <RegisterTransition onComplete={handleTransitionComplete} />;
  }

  return (
    <>
      <div className="h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl flex overflow-hidden">
          <div className="w-1/3 bg-blue-600 p-8 text-white hidden lg:flex flex-col justify-between">
            <div>
              {currentStep === 'personal' ? (
                <>
                  <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
                  <p className="text-blue-100">Please fill in your personal details to create your account.</p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold mb-4">KYC Verification</h1>
                  <p className="text-blue-100">Complete your verification to access all features.</p>
                </>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'kyc' ? 'bg-blue-400' : 'bg-blue-500'
                }`}>
                  {currentStep === 'kyc' ? '✓' : '1'}
                </div>
                <span className="text-sm">Personal Details</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'kyc' ? 'bg-blue-500' : 'bg-blue-400'
                }`}>
                  2
                </div>
                <span className="text-sm">KYC Verification</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-8">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => currentStep === 'kyc' ? setCurrentStep('personal') : navigate('/')} className="text-blue-600 hover:text-blue-700">
                  <ArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={handleLoginRedirect} className="text-sm text-blue-600 hover:underline">
                Have an account?
              </button>
            </div>

            {currentStep === 'personal' ? (
              <PersonalDetailsForm 
                formData={formData}
                onSubmit={handleSubmit}
                onChange={handleChange}
                onPhotoChange={handlePhotoChange}
                photoPreview={photoPreview}
                error={error}
                isSubmitting={isSubmitting}
              />
            ) : (
              <KycVerificationForm onComplete={() => setShowSuccess(true)} />
            )}
          </div>
        </div>

        {showConsent && (
          <ConsentModal 
            hasAgreed={hasAgreed}
            setHasAgreed={setHasAgreed}
            onClose={() => setShowConsent(false)}
            onContinue={handleContinueToKyc}
          />
        )}
      </div>
      {showSuccess && <SuccessAnimation onComplete={handleLoginRedirect} />}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
}
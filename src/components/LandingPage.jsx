import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2 as Bank,
  UserPlus, 
  UserCheck,
  LogIn, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Key,
  Shield,
  UserCog
} from 'lucide-react';
import QuoteBar from './Login/QuoteBar';
import NewsTicker from './Login/NewsTicker';
import RegisterTransition from './Login/RegisterTransition';
import api from '../services/api';
import LoginTypeSlider from './Login/LoginTypeSlider';

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [panNumber, setPanNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [showRegisterTransition, setShowRegisterTransition] = useState(false);
  const [phoneLastDigits, setPhoneLastDigits] = useState('');
  const [loginType, setLoginType] = useState('customer');

  // Add effect to handle navigation state
  useEffect(() => {
    if (location.state?.showLogin) {
      setShowLogin(true);
      // Clear the state to prevent showing login on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Add effect to check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLoginClick = () => {
    const mainContent = document.querySelector('.main-content');
    mainContent.classList.add('content-slide-out');
    setShowLogin(true);
  };

  const handleNewUserClick = () => {
    setShowRegisterTransition(true);
  };

  const handleTransitionComplete = () => {
    navigate('/register', { state: { fromTransition: true } });
  };

  const handleBackClick = () => {
    const loginContent = document.querySelector('.login-content');
    loginContent.classList.add('content-slide-out');
    setTimeout(() => {
      setShowLogin(false);
    }, 400); // Match animation duration
  };

  // Update PAN verification to include more user data
  const handlePanSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log('Verifying PAN:', panNumber);
      const response = await api.post('/users/verify-pan', {
        pan: panNumber.toUpperCase()
      });
      
      console.log('PAN verification response:', response.data);
      
      if (response.data.success) {
        // User found - proceed with OTP
        setPhoneLastDigits(response.data.phone);
        setShowOtpField(true);
        localStorage.setItem('tempVerification', JSON.stringify(response.data));
        setError('');
      } else {
        // User not found - show error but don't navigate
        setError('No account found with this PAN number. Please check and try again.');
      }
    } catch (error) {
      console.error('PAN verification error:', error);
      setError(error.response?.data?.message || 'Failed to verify PAN');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const tempData = localStorage.getItem('tempVerification');
      if (!tempData) {
        throw new Error('Verification data not found');
      }
      
      const verificationData = JSON.parse(tempData);
      console.log('Verification data:', verificationData);
      
      if (otp === '000000') {
        const loginPayload = {
          email: verificationData.user.email,
          password: verificationData.user.phone, // Use phone as password
          pan: panNumber.toUpperCase()
        };

        console.log('Sending login payload:', loginPayload);
        
        try {
          const loginResponse = await api.post('/users/login', loginPayload);
          console.log('Login response:', loginResponse.data);
  
          if (loginResponse.data.success) {
            // Store user data and token
            const { user, token } = loginResponse.data;
            localStorage.setItem('userData', JSON.stringify(user));
            localStorage.setItem('token', token);
  
            setSuccess(true);
            setTimeout(() => {
              localStorage.removeItem('tempVerification');
              navigate('/dashboard');
            }, 1000);
          }
        } catch (loginError) {
          console.error('Login error:', loginError);
          throw loginError.response?.data || loginError;
        }
      } else {
        throw new Error('Invalid OTP. Use 000000 for testing');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderLoginButtons = () => {
    if (loginType === 'customer') {
      return (
        <>
          <button onClick={handleNewUserClick} className="bg-white rounded-xl p-6 md:p-8 shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-blue-100 hover:border-blue-300">
            <div className="flex flex-col items-center space-y-4">
              <UserPlus className="w-16 h-16 text-blue-600" />
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">New User</h3>
                <p className="text-gray-600 text-lg">Create your account</p>
              </div>
            </div>
          </button>

          <button onClick={handleLoginClick} className="bg-white rounded-xl p-6 md:p-8 shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-green-100 hover:border-green-300">
            <div className="flex flex-col items-center space-y-4">
              <UserCheck className="w-16 h-16 text-green-600" />
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Existing User</h3>
                <p className="text-gray-600 text-lg">Sign in to your account</p>
              </div>
            </div>
          </button>
        </>
      );
    } else {
      return (
        <>
          <button onClick={() => navigate('/admin-login')} className="bg-white rounded-xl p-6 md:p-8 shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-purple-100 hover:border-purple-300">
            <div className="flex flex-col items-center space-y-4">
              <Shield className="w-16 h-16 text-purple-600" />
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h3>
                <p className="text-gray-600 text-lg">Access admin dashboard</p>
              </div>
            </div>
          </button>

          <button onClick={() => navigate('/agent-login')} className="bg-white rounded-xl p-6 md:p-8 shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-orange-100 hover:border-orange-300">
            <div className="flex flex-col items-center space-y-4">
              <UserCog className="w-16 h-16 text-orange-600" />
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Agent Login</h3>
                <p className="text-gray-600 text-lg">Access agent portal</p>
              </div>
            </div>
          </button>
        </>
      );
    }
  };

  if (showRegisterTransition) {
    return <RegisterTransition onComplete={handleTransitionComplete} />;
  }

  return (
    <div className="min-h-screen h-auto bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col overflow-hidden">
      <QuoteBar />
      
      <LoginTypeSlider 
        activeType={loginType}
        onTypeChange={setLoginType}
      />
      
      <div className="flex-1 relative overflow-hidden">
        {!showLogin ? (
          <div className="main-content absolute inset-0 flex flex-col items-center justify-center p-4 md:p-6 my-4">
            {/* Landing Page Content */}
            <div className="text-center mb-8 md:mb-12">
              <div className="flex items-center justify-center mb-4">
                <Bank className="w-12 h-12 md:w-16 md:h-16 text-blue-600 mr-4" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">DoorBank</h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-600">Banking Services at Your Doorstep</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto w-full px-4">
              {renderLoginButtons()}
            </div>
          </div>
        ) : (
          <div className="login-content absolute inset-0 flex items-center justify-center p-4 content-slide-in my-4">
            <div className={`max-w-md w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 transform transition-all duration-300 ${success ? 'scale-105' : ''}`}>
              <div className="flex items-center mb-6">
                <button 
                  onClick={handleBackClick} 
                  className="p-2 hover:bg-blue-50 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95"
                >
                  <ArrowLeft className="w-6 h-6 text-blue-600" />
                </button>
                <h2 className="text-3xl font-bold text-gray-800 ml-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Welcome Back
                </h2>
              </div>

              <p className="text-gray-600 mb-8">
                {showOtpField ? 'Enter the OTP sent to your phone' : 'Sign in with your PAN number'}
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-green-600 text-sm">Login successful! Redirecting...</p>
                </div>
              )}

              <form onSubmit={showOtpField ? handleOtpSubmit : handlePanSubmit} className="space-y-6">
                {!showOtpField ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">PAN Number</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter PAN number"
                        disabled={loading || success}
                        maxLength={10}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Enter your PAN number to receive OTP on registered phone</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Enter OTP</label>
                    <p className="text-sm text-blue-600 mb-2">
                      OTP has been sent to phone number ending with {phoneLastDigits}
                    </p>
                    <div className="relative">
                      <Key className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter 6-digit OTP"
                        disabled={loading || success}
                        maxLength={6}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Use 000000 for testing</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || success || (showOtpField ? otp.length !== 6 : panNumber.length !== 10)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : success ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>{showOtpField ? 'Verify OTP' : 'Get OTP'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      
      <NewsTicker />
    </div>
  );
};

export default LandingPage;
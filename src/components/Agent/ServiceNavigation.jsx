import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Calendar, Clock, ArrowLeft, Navigation, User, Info, CheckCircle, Loader, X, AlertCircle } from 'lucide-react';
import OTPVerificationModal from './OTPVerificationModal';
import axios from 'axios';
import confetti from 'canvas-confetti';

const ServiceNavigation = () => {
  const { serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [agentLocation, setAgentLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  
  // OTP related state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Get service data from location state or fetch from API
  const service = location.state?.service || {};
  const destinationAddress = location.state?.destination || '';
  
  useEffect(() => {
    // Get agent's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAgentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setErrorMsg("Unable to get your current location. Please enable location services.");
          setLoading(false);
        }
      );
    } else {
      setErrorMsg("Geolocation is not supported by this browser.");
      setLoading(false);
    }

    // Polling for location updates
    const locationTimer = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setAgentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => console.error("Error updating location:", error)
        );
      }
    }, 60000); // Update every minute to reduce battery consumption

    // Check for destination address
    if (!destinationAddress) {
      setErrorMsg('No destination address provided');
      setLoading(false);
    }

    return () => {
      clearInterval(locationTimer);
    };
  }, [destinationAddress]);

  const getTimeSlot = () => {
    if (service.timeSlot) return service.timeSlot;
    if (service.serviceDetails?.timeSlot) return service.serviceDetails.timeSlot;
    return "Not specified";
  };

  const getCustomerName = () => {
    if (service.customerName) return service.customerName;
    if (service.serviceDetails?.userName) return service.serviceDetails.userName;
    return "Customer";
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not available';
    // Format phone number with spaces for readability - Indian format
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  const handleCallCustomer = () => {
    if (service.customerPhone) {
      window.location.href = `tel:${service.customerPhone}`;
    }
  };

  // Function to trigger confetti
  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    
    const colors = ['#4ade80', '#22c55e', '#16a34a']; // Green shades
    
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };
  
  // Function to show toast
  const showToast = (message, type = 'success', duration = 4000) => {
    setToast({ visible: true, message, type });
    
    // Hide toast after duration
    setTimeout(() => {
      setToast({ ...toast, visible: false });
    }, duration);
  };

  const handleInitiateCompletion = () => {
    if (!service.customerPhone) {
      alert("Customer phone number is not available");
      return;
    }
    
    // Open the OTP modal
    setShowOtpModal(true);
  };
  
  const handleVerificationSuccess = async () => {
    // Close the OTP modal
    setShowOtpModal(false);
    setCompleteLoading(true);
    
    try {
      // Get the API base URL from environment or use a default
      const apiBaseUrl = import.meta.env.VITE_API_URL || '';
      
      // Get authentication details from localStorage
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const agentId = userData?._id || service?.assignedAgent;
      
      console.log('Auth details for service completion:', { 
        serviceId, 
        agentId,
        hasToken: !!token,
        userData: userData ? 'present' : 'missing'
      });
      
      if (!serviceId) {
        throw new Error('Service ID is missing. Cannot complete service.');
      }
      
      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }
      
      // Construct the update data
      const updateData = {
        status: 'COMPLETED',
        agentId: agentId,
        agentDetails: {
          name: userData?.name || 'Agent',
          userId: userData?.userId || 'Agent' 
        },
        completionMethod: 'OTP_VERIFICATION',
        completedAt: new Date().toISOString()
      };
      
      console.log('Sending status update with data:', updateData);
      
      // Call the API to update service status
      const response = await axios({
        method: 'PATCH',
        url: `${apiBaseUrl}/api/services/${serviceId}/status`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: updateData
      });
      
      if (response.data && response.data.success) {
        console.log('Service completion successful:', response.data);
        // Force refresh agent data to update UI
        // This ensures local storage is updated with the latest assignments
        try {
          const agentResponse = await axios({
            method: 'GET',
            url: `${apiBaseUrl}/api/users/me`,
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (agentResponse.data && agentResponse.data.success) {
            // Update agent data in localStorage
            localStorage.setItem('userData', JSON.stringify(agentResponse.data.user));
            console.log('Agent data refreshed with updated assignments');
          }
        } catch (agentError) {
          console.warn('Could not refresh agent data:', agentError);
          // Non-critical error, continue
        }
        
        // Show toast message and confetti
        showToast('Service successfully completed!');
        triggerConfetti();
        
        // Navigate back to dashboard after a short delay to show the toast/confetti
        setTimeout(() => {
          navigate('/agent/dashboard');
        }, 2000);
      } else {
        throw new Error(response.data?.message || 'Failed to update service status');
      }
    } catch (error) {
      console.error("Error completing service:", error);
      showToast(`Failed to complete service: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setCompleteLoading(false);
    }
  };

  // Create the Google Maps URL with both starting point and destination for directions
  const getDirectionsUrl = () => {
    const destination = encodeURIComponent(destinationAddress || 'Delhi');
    
    // If we have agent location, use it as starting point
    if (agentLocation) {
      const origin = `${agentLocation.lat},${agentLocation.lng}`;
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    }
    
    // Otherwise just use destination (Google will use user's current location)
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  };

  // Get static map URL with Delhi as default fallback
  const getStaticMapUrl = () => {
    const location = destinationAddress || 'Delhi';
    // Use destination with fallback to Delhi
    return `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(location)}&zoom=13&size=600x300&scale=2&maptype=roadmap&markers=color:red%7C${encodeURIComponent(location)}&key=YOUR_API_KEY`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header bar */}
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 font-medium"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <Navigation className="w-4 h-4 mr-1" />
          <span>Navigation Mode</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {errorMsg ? (
          <div className="h-64 flex items-center justify-center bg-gray-100 p-4">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-lg inline-block mb-2">
                <Info className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600">{errorMsg}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="h-64 flex flex-col items-center justify-center bg-gray-50">
            <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-700">Preparing navigation...</p>
          </div>
        ) : (
          <div className="pb-24 sm:pb-20">
            {/* Map background with navigation button */}
            <div className="relative bg-gray-200 h-64 sm:h-80">
              <div className="absolute inset-0" aria-label="Map showing service location">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d284335.7203496808!2d76.83523163551276!3d28.69372604833725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d047309fff32f%3A0xfc5606ed1b5d46c3!2sDelhi!5e0!3m2!1sen!2sin!4v1743957886317!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Map"
                ></iframe>
              </div>
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50"></div>
              
              {/* Content on top of map */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6">
                {/* Large navigation button */}
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white py-4 sm:py-5 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center transition-colors shadow-lg mb-4"
                  aria-label="Start navigation to service location"
                >
                  <div className="flex items-center justify-center">
                    <div className="bg-white/20 p-2 rounded-full mr-3">
                      <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span>START NAVIGATION</span>
                  </div>
                </a>
                
                {/* Service type, date and time */}
                <div className="bg-white/90 p-3 rounded-xl w-full max-w-md shadow-md">
                  <h2 className="text-center font-bold text-gray-800 mb-2">{service.serviceName || 'Service Navigation'}</h2>
                  <div className="flex justify-center flex-wrap gap-2 sm:gap-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                      <span className="text-sm">{formatDateOnly(service?.date || service?.scheduledTime)}</span>
                    </div>
                    {getTimeSlot() !== "Not specified" && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-blue-600" />
                        <span className="text-sm">{getTimeSlot()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Service & location info */}
            <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto">
              {/* Destination card */}
              <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Service Location</h3>
                </div>
                
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3 break-words">
                  {destinationAddress || 'Delhi (Default location)'}
                </p>
                
                {agentLocation && (
                  <div className="flex items-center bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                    <div className="bg-emerald-100 p-1.5 rounded-full mr-2">
                      <Navigation className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm text-emerald-800">Your location detected</span>
                  </div>
                )}
              </div>
              
              {/* Customer info */}
              <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
                <div className="flex items-center mb-3">
                  <div className="bg-indigo-100 p-2 rounded-full mr-3">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Customer Details</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="mr-3 text-gray-500">Name:</div>
                    <div className="font-medium text-gray-800">{getCustomerName()}</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mr-2">
                      <div className="mr-3 text-gray-500">Phone:</div>
                      <div className="font-medium text-gray-800 truncate">{formatPhoneNumber(service?.customerPhone)}</div>
                    </div>
                    <button 
                      onClick={handleCallCustomer}
                      disabled={!service?.customerPhone}
                      className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors shrink-0"
                      aria-label="Call customer"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Transaction info (if applicable) */}
              {(service?.amount > 0 || service?.serviceDetails?.amount > 0) && (
                <div className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-100">
                  <div className="flex items-center mb-1">
                    <h3 className="font-semibold text-amber-800">Transaction Details</h3>
                  </div>
                  <p className="text-amber-700 p-2 bg-white/60 rounded-lg">
                    {service.transactionType === 'collection' ? 'Collect' : 'Provide'} ₹{(service.amount || service.serviceDetails?.amount).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed button at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-md">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleInitiateCompletion}
            disabled={loading || !!errorMsg || completeLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-xl font-medium flex items-center justify-center transition-colors shadow-md"
            aria-label="Complete Service"
          >
            {completeLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Updating service status...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Service
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 left-4 max-w-md mx-auto z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
          toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        } ${
          toast.type === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800' 
            : 'bg-red-100 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3" />
            )}
            <div className="flex-1 font-medium">{toast.message}</div>
            <button 
              onClick={() => setToast({ ...toast, visible: false })}
              className="ml-auto p-1 hover:bg-white/30 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <OTPVerificationModal
          phoneNumber={service.customerPhone}
          onVerify={handleVerificationSuccess}
          onClose={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
};

export default ServiceNavigation;
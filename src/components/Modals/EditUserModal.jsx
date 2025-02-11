import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { auth } from '../../utils/auth';
import { tokenManager } from '../../utils/tokenManager';
import { 
  Eye, Edit, Save, X, Shield, User, Mail, Phone, 
  MapPin, Calendar, Clock, AlertCircle, CheckCircle, Lock
} from 'lucide-react';

const InfoField = ({ label, value, icon: Icon, sensitive }) => (
  <div className="p-2 sm:p-4 bg-gray-50 rounded-lg flex items-start space-x-2 sm:space-x-4">
    <div className="p-1 sm:p-2 bg-white rounded-md shrink-0">
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${sensitive ? 'text-orange-500' : 'text-blue-500'}`} />
    </div>
    <div>
      <label className="text-xs sm:text-sm font-medium text-gray-500">{label}</label>
      <p className="text-sm sm:text-base font-medium text-gray-900">
        {sensitive ? (
          <span className="inline-flex items-center gap-1 sm:gap-2 text-orange-600">
            <Lock className="w-3 h-3 sm:w-4 sm:h-4" /> 
            {value}
          </span>
        ) : value}
      </p>
    </div>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return 'Not available';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString();
};

export const EditUserModal = ({ user, isOpen, onClose, onUpdate }) => {
  // Add debug logging
  useEffect(() => {
    console.log('EditUserModal - Props:', { isOpen, user });
  }, [isOpen, user]);

  const [isEditing, setIsEditing] = useState(false); // Add this state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Debug log to check if modal is being triggered
    console.log('EditUserModal mounted with props:', { isOpen, user });
  }, [isOpen, user]);

  // Reset isEditing when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Get token from both possible sources
      const token = auth.getToken() || tokenManager.getDashboardToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/users/${user._id}/update`,
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update both localStorage and auth state
        const updatedUser = { ...user, ...formData };
        auth.setAuth(token, updatedUser);
        
        setSuccessMessage('Profile updated successfully!');
        if (onUpdate) {
          onUpdate(updatedUser);
        }
        
        setTimeout(() => {
          setIsEditing(false);
          onClose();
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Error updating profile');
      
      // Try to recover if it's an auth error
      if (err.response?.status === 401) {
        const dashboardToken = tokenManager.getDashboardToken();
        if (dashboardToken) {
          // Retry with dashboard token
          try {
            const retryResponse = await axios.put(
              `${import.meta.env.VITE_APP_API_URL}/users/${user._id}/update`,
              formData,
              {
                headers: { 
                  'Authorization': `Bearer ${dashboardToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (retryResponse.data.success) {
              const updatedUser = { ...user, ...formData };
              auth.setAuth(dashboardToken, updatedUser);
              setSuccessMessage('Profile updated successfully!');
              if (onUpdate) {
                onUpdate(updatedUser);
              }
              setTimeout(() => {
                setIsEditing(false);
                onClose();
              }, 1500);
              return;
            }
          } catch (retryErr) {
            console.error('Retry update error:', retryErr);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const renderUserPhoto = () => (
    <div className="p-2 sm:p-6 bg-gray-50 rounded-xl">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-lg">
          {user?.photoUrl ? (
            <img 
              src={user.photoUrl}
              alt={`${user.firstName || ''} ${user.lastName || ''}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('Image load error, using default');
                e.target.src = '/default-avatar.png';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <User className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
        <div className="mt-2 sm:mt-4 text-center">
          <h3 className="text-sm sm:text-xl font-semibold text-gray-900">
            {user?.firstName} {user?.lastName}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 capitalize">
            {user?.userType || 'User'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderViewMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-6">
      {/* Left Column */}
      <div className="lg:col-span-4 space-y-2 sm:space-y-6">
        {renderUserPhoto()}

        {/* KYC Status Card */}
        <div className="p-2 sm:p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">Verification Status</h4>
          <div className={`p-2 sm:p-4 rounded-lg ${
            user?.kycStatus === 'verified' || user?.kycStatus === 'approved' ? 'bg-green-50' :
            user?.kycStatus === 'pending' ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center gap-3">
              <CheckCircle className={`w-6 h-6 ${
                user?.kycStatus === 'verified' || user?.kycStatus === 'approved' ? 'text-green-600' :
                user?.kycStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <span className="text-base font-medium capitalize">
                KYC {user?.kycStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-8 space-y-2 sm:space-y-6">
        {/* Personal Information */}
        <div className="space-y-2 sm:space-y-4">
          <h4 className="text-sm sm:text-base font-semibold text-gray-700">Personal Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <InfoField label="Email" value={user?.email} icon={Mail} />
            <InfoField label="Phone" value={user?.phone} icon={Phone} />
          </div>
          <InfoField label="Address" value={user?.address} icon={MapPin} />
        </div>

        {/* Secure Information */}
        <div className="space-y-2 sm:space-y-4">
          <h4 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-700">
            <Shield className="w-4 h-4 text-orange-500" />
            Secure Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <InfoField label="Aadhaar" value={user?.aadhaar || 'Not available'} icon={Lock} sensitive />
            <InfoField label="PAN" value={user?.pan || 'Not available'} icon={Lock} sensitive />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="lg:col-span-12 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-3 sm:pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Close
        </button>
        <button 
          onClick={() => setIsEditing(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
          Edit Information
        </button>
      </div>
    </div>
  );

  const renderEditMode = () => (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-6">
      {/* Left Column */}
      <div className="lg:col-span-4">
        {renderUserPhoto()}
      </div>

      {/* Right Column */}
      <div className="lg:col-span-8 space-y-3 sm:space-y-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            {/* Form fields with responsive styling */}
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">First Name</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-2 sm:px-4 py-1.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-2 sm:px-4 py-1.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-2 sm:px-4 py-1.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-2 sm:px-4 py-1.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-2 sm:px-4 py-1.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Add Aadhaar display (read-only) */}
          <div className="space-y-1 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">Aadhaar Number (Read-only)</label>
            <input
              type="text"
              value={user?.aadhaar || 'Not available'}
              className="w-full px-2 sm:px-4 py-1.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-50"
              disabled
              readOnly
            />
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="flex items-center gap-2 sm:gap-3 text-red-600 bg-red-50 p-3 sm:p-4 rounded-lg">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <p className="text-sm sm:text-base">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 sm:gap-3 text-green-600 bg-green-50 p-3 sm:p-4 rounded-lg">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <p className="text-sm sm:text-base">{successMessage}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="lg:col-span-12 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-3 sm:pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          disabled={loading}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-auto overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className={`relative bg-white rounded-xl shadow-xl w-full 
              max-w-6xl max-h-[85vh] overflow-y-auto transform 
              ${isOpen ? 'scale-100' : 'scale-95'} transition-transform duration-200`}
            >
              <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-2 sm:p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Edit className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-blue-600" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-900">
                    {isEditing ? 'Edit Personal Information' : 'Personal Information'}
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-2 sm:p-6">
                {isEditing ? renderEditMode() : renderViewMode()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
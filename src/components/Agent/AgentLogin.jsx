import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCog, 
  ArrowLeft, 
  User, 
  Lock, 
  LogIn, 
  Loader2, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { auth } from '../../utils/auth';

const AgentLogin = ({ onClose }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginPayload = {
        email: userId,
        password: password
      };
      
      const response = await api.post('/users/login', loginPayload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      const { token, user } = response.data.data;
      
      // Verify this is an agent account
      if (user.userType !== 'agent') {
        throw new Error('Unauthorized access. This portal is for agents only.');
      }

      // Use auth utility to set authentication
      const authSet = auth.setAuth(token, user);
      
      if (!authSet || !auth.isSessionValid()) {
        throw new Error('Authentication failed');
      }

      // Show success message
      setSuccess(true);
      setShowSuccessOverlay(true);

      // Add small delay before navigation
      setTimeout(() => {
        navigate('/agent/dashboard', { replace: true });
      }, 2000);

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 relative">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-3 rounded-full bg-orange-50 mb-4"
        >
          <UserCog className="w-12 h-12 text-orange-600" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800">Welcome, Runner</h2>
        <p className="text-gray-600 mt-2">Access your service portal to assist customers</p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start"
        >
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-red-600 text-sm">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-lg font-medium text-gray-700">Runner ID</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 
                  focus:border-orange-500 focus:ring-4 focus:ring-orange-100 
                  text-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your runner ID"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-lg font-medium text-gray-700">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 
                  focus:border-orange-500 focus:ring-4 focus:ring-orange-100 
                  text-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your password"
                required
                disabled={loading || success}
              />
            </div>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading || success || !userId || !password}
          whileHover={{ scale: loading || success ? 1 : 1.01 }}
          whileTap={{ scale: loading || success ? 1 : 0.99 }}
          className={`w-full py-4 rounded-xl transition-all duration-300 
            flex items-center justify-center space-x-2 text-lg font-medium
            ${loading || success 
              ? success 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 cursor-not-allowed text-gray-400' 
              : !userId || !password
                ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
            }`}
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : success ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 360] }}
              transition={{ type: "spring", duration: 0.7 }}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-6 h-6" />
              <span>Success!</span>
            </motion.div>
          ) : (
            <>
              <LogIn className="w-6 h-6" />
              <span>Access Portal</span>
            </>
          )}
        </motion.button>
      </form>

      {showSuccessOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, type: "spring" }}
            className="bg-orange-50 rounded-full p-6 mb-4"
          >
            <CheckCircle className="w-16 h-16 text-orange-500" />
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            Login Successful!
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600"
          >
            Redirecting to your dashboard...
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="h-1 bg-orange-500 mt-4 rounded-full"
          />
        </motion.div>
      )}
    </div>
  );
};

export default AgentLogin;

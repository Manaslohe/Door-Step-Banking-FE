import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  User, 
  Lock, 
  LogIn, 
  Loader2, 
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLogin = ({ onClose }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admin-login`, {  // Add /api prefix
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store both token and user data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify({
        ...data.user,
        userType: 'admin' // Ensure userType is set
      }));

      setSuccess(true); // Show success message
      
      // Add delay before navigation
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-3 rounded-full bg-purple-50 mb-4"
        >
          <Shield className="w-12 h-12 text-purple-600" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800">Welcome, Banker</h2>
        <p className="text-gray-600 mt-2">Access your administrative dashboard</p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center"
          >
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-600">Login successful! Redirecting to dashboard...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-lg font-medium text-gray-700">Banker ID</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 
                  focus:border-purple-500 focus:ring-4 focus:ring-purple-100 
                  text-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your banker ID"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-lg font-medium text-gray-700">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 
                  focus:border-purple-500 focus:ring-4 focus:ring-purple-100 
                  text-lg transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white 
            py-4 rounded-xl hover:from-purple-600 hover:to-purple-700 
            transition-all duration-300 flex items-center justify-center space-x-2 
            text-lg font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <LogIn className="w-6 h-6" />
              <span>Access Dashboard</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default AdminLogin;

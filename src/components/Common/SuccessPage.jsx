import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = ({ message, redirectPath = '/dashboard' }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectPath);
    }, 3000);

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100));
    }, 30);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate, redirectPath]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 animate-gradient" />
      
      {/* Animated circles in background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-xl animate-float" />
        <div className="absolute top-20 -right-10 w-60 h-60 bg-blue-400/20 rounded-full blur-xl animate-float-delayed" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-xl animate-float-slow" />
      </div>

      {/* Content */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slideUp">
        <div className="text-center space-y-6">
          {/* Success icon with animation */}
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto animate-pulse" />
            <CheckCircle className="w-16 h-16 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-checkmark" />
          </div>

          {/* Success message */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white animate-fadeIn">
              Success!
            </h2>
            <p className="text-blue-50 text-lg animate-fadeIn animation-delay-100">
              {message}
            </p>
          </div>

          {/* Redirect message with progress */}
          <div className="space-y-3 animate-fadeIn animation-delay-200">
            <div className="flex items-center justify-center gap-2 text-blue-100">
              <span>Redirecting to dashboard</span>
              <ArrowRight className="w-4 h-4 animate-bounce" />
            </div>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes checkmark {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-gradient {
          background-size: 400% 400%;
          animation: gradient 8s ease infinite;
        }

        .animate-checkmark {
          animation: checkmark 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-float-slow {
          animation: float 10s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fadeIn {
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default SuccessPage;
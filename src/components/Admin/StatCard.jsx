import React from 'react';
import { Loader2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, growth, format, loading }) => {
  const colorClasses = {
    blue: 'border-blue-500 from-blue-50 to-transparent',
    yellow: 'border-yellow-500 from-yellow-50 to-transparent',
    green: 'border-green-500 from-green-50 to-transparent',
    orange: 'border-orange-500 from-orange-50 to-transparent'
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
      border-l-4 ${colorClasses[color]} bg-gradient-to-r p-6 group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              format(value)
            )}
          </h3>
          <div className="mt-2 flex items-center text-xs">
            <span className="text-green-500 font-medium">{growth}</span>
            <span className="text-gray-400 ml-2">vs last month</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

import React from 'react';
import { TrendingUp, Clock, CheckCircle2, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsCards = ({ stats, loading, activeTasks, completedTasks }) => {
  const statsData = [
    { 
      title: 'Active Tasks', 
      value: stats.activeAssignments || activeTasks.length, 
      icon: <ListChecks className="h-6 w-6 text-blue-600" />,
      color: 'blue',
      gradient: 'from-blue-500/10 to-blue-600/5',
      border: 'border-blue-200'
    },
    { 
      title: 'Pending', 
      value: activeTasks.filter(t => t.status === 'pending').length, 
      icon: <Clock className="h-6 w-6 text-amber-600" />,
      color: 'amber',
      gradient: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-200'
    },
    { 
      title: 'In Progress', 
      value: activeTasks.filter(t => t.status === 'in_progress').length, 
      icon: <TrendingUp className="h-6 w-6 text-indigo-600" />,
      color: 'indigo',
      gradient: 'from-indigo-500/10 to-indigo-600/5',
      border: 'border-indigo-200'
    },
    { 
      title: 'Completed', 
      value: completedTasks.length, 
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
      color: 'emerald',
      gradient: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
          className={`bg-white rounded-xl overflow-hidden border ${stat.border} transition-all duration-300`}
        >
          <div className={`bg-gradient-to-br ${stat.gradient} p-5`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    stat.value
                  )}
                </h3>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                {stat.icon}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;

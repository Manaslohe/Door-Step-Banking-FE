import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  UserCheck 
} from 'lucide-react';

const StatusIndicator = ({ status }) => {
  const formatStatus = (status) => {
    return status.replace(/_/g, ' ');
  };

  const getStatusConfig = (status) => {
    const lowercaseStatus = status.toLowerCase();
    switch (lowercaseStatus) {
      case 'completed':
        return {
          icon: CheckCircle,
          classes: `
            bg-gradient-to-r from-emerald-50 to-green-50
            text-emerald-700 border-emerald-200
            hover:from-emerald-100 hover:to-green-100
            shadow-emerald-100/50
          `,
          iconClass: 'text-emerald-500',
          text: 'Completed'
        };
      case 'assigned':
        return {
          icon: UserCheck,
          classes: `
            bg-gradient-to-r from-blue-50 to-indigo-50
            text-blue-700 border-blue-200
            hover:from-blue-100 hover:to-indigo-100
            shadow-blue-100/50
          `,
          iconClass: 'text-blue-500',
          text: 'Assigned'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          classes: `
            bg-gradient-to-r from-purple-50 to-violet-50
            text-purple-700 border-purple-200
            hover:from-purple-100 hover:to-violet-100
            shadow-purple-100/50
          `,
          iconClass: 'text-purple-500',
          text: 'Approved'
        };
      case 'approval_pending':
        return {
          icon: Clock,
          classes: `
            bg-gradient-to-r from-amber-50 to-yellow-50
            text-amber-700 border-amber-200
            hover:from-amber-100 hover:to-yellow-100
            shadow-amber-100/50
          `,
          iconClass: 'text-amber-500',
          text: 'Pending'
        };
      case 'rejected':
      case 'not approved':
        return {
          icon: XCircle,
          classes: `
            bg-gradient-to-r from-red-50 to-rose-50
            text-red-700 border-red-200
            hover:from-red-100 hover:to-rose-100
            shadow-red-100/50
          `,
          iconClass: 'text-red-500',
          text: 'Rejected'
        };
      default:
        return {
          icon: AlertCircle,
          classes: `
            bg-gradient-to-r from-gray-50 to-slate-50
            text-gray-700 border-gray-200
            hover:from-gray-100 hover:to-slate-100
            shadow-gray-100/50
          `,
          iconClass: 'text-gray-500',
          text: formatStatus(status)
        };
    }
  };

  const { icon: Icon, classes, iconClass, text } = getStatusConfig(status);

  return (
    <span className={`
      inline-flex items-center justify-center gap-1.5 
      px-3.5 py-1.5 min-w-[110px] max-w-[140px]
      whitespace-nowrap overflow-hidden
      rounded-full text-sm font-semibold
      border shadow-sm
      transition-all duration-300 ease-in-out
      ${classes}
    `}>
      <Icon className={`w-4 h-4 flex-shrink-0 ${iconClass}`} />
      <span className="truncate">{text}</span>
    </span>
  );
};

export default StatusIndicator;

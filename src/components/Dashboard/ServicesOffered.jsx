import React, { useState } from 'react';
import { Settings, ArrowRight, DollarSign, CreditCard, UserPlus, FileText, FileCheck, Globe } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';

const ServicesOffered = () => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { t } = useTranslation();

  const services = [
    {
      name: t.services.cashDeposit.name,
      description: t.services.cashDeposit.description,
      icon: DollarSign,
      color: "from-blue-500 to-blue-600",
      path: "/services/cash-deposit"
    },
    {
      name: t.services.cashWithdrawal.name,
      description: t.services.cashWithdrawal.description,
      icon: CreditCard,
      color: "from-blue-600 to-blue-700",
      path: "/services/cash-withdrawal"
    },
    {
      name: t.services.newAccount.name,
      description: t.services.newAccount.description,
      icon: UserPlus,
      color: "from-blue-500 to-blue-600",
      path: "/services/new-account"
    },
    {
      name: t.services.documentService.name,
      description: t.services.documentService.description,
      icon: FileText,
      color: "from-blue-600 to-blue-700",
      path: "/services/document-service"
    },
    {
      name: t.services.lifeCertificate.name,
      description: t.services.lifeCertificate.description,
      icon: FileCheck,
      color: "from-blue-500 to-blue-600",
      path: "/services/life-certificate"
    },
    {
      name: t.services.onlineAssistance.name,
      description: t.services.onlineAssistance.description,
      icon: Globe,
      color: "from-blue-600 to-blue-700",
      path: "/services/online-assistance"
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-fit w-full bg-gradient-to-br from-blue-50 to-white p-6 md:p-8">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <button 
                  key={index}
                  onClick={() => navigate(service.path)}  // This handles the navigation
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`
                    relative p-6 md:p-8
                    bg-white/70 backdrop-blur-sm
                    rounded-xl
                    transform transition-all duration-500
                    hover:-translate-y-2
                    group
                    border border-blue-100
                    text-left
                    shadow-sm hover:shadow-xl
                    min-h-[200px] md:min-h-[220px]
                    flex flex-col
                    animate-fadeUpIn
                    hover:bg-gradient-to-br hover:from-blue-50 hover:to-white
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`
                      bg-gradient-to-r ${service.color}
                      p-4 rounded-xl
                      transition-all duration-500
                      group-hover:scale-110 group-hover:rotate-6
                      shadow-lg
                    `}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <ArrowRight className={`
                      w-6 h-6 transition-all duration-500
                      ${hoveredIndex === index 
                        ? 'translate-x-0 opacity-100 text-blue-600' 
                        : '-translate-x-4 opacity-0'
                      }
                    `} />
                  </div>
                  
                  <div className="mt-auto space-y-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 tracking-wide
                      group-hover:text-blue-700 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className={`
                    absolute bottom-0 left-0 right-0 h-[3px]
                    bg-gradient-to-r ${service.color}
                    rounded-b-xl
                    transition-all duration-500
                    transform origin-left
                    ${hoveredIndex === index ? 'scale-x-100' : 'scale-x-0'}
                  `} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ServicesOffered;
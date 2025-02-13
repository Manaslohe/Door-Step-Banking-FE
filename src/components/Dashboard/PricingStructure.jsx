import React from 'react';
import { DollarSign, Phone, FileText, UserPlus } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { useTranslation } from '../../context/TranslationContext';

const ServiceSection = ({ title, icon: Icon, services }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-blue-100">
      <div className="flex items-center gap-3 mb-4 border-b border-blue-50 pb-3">
        <div className="p-2.5 bg-blue-50 rounded-lg">
          <Icon className="w-7 h-7 text-blue-700" />
        </div>
        <h2 className="text-2xl font-bold text-blue-900">{title}</h2>
      </div>
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full border-spacing-y-2 border-separate">
          <thead>
            <tr className="bg-blue-50">
              <th className="text-left py-3 px-4 text-blue-900 font-bold text-lg rounded-l-lg">
                {t.pricingStructure.tableHeaders.category}
              </th>
              <th className="text-left py-3 px-4 text-blue-900 font-bold text-lg">
                {t.pricingStructure.tableHeaders.fee}
              </th>
              <th className="text-left py-3 px-4 text-blue-900 font-bold text-lg rounded-r-lg">
                {t.pricingStructure.tableHeaders.specifications}
              </th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr 
                key={index} 
                className="hover:bg-blue-50/30 transition-colors duration-200"
              >
                <td className="py-3 px-4 text-gray-900 font-semibold text-base bg-white rounded-l-lg border-l border-y border-blue-100">
                  {service.category}
                </td>
                <td className="py-3 px-4 bg-white border-y border-blue-100">
                  <span className="text-blue-700 font-bold text-base bg-blue-50/50 px-3 py-1.5 rounded-full">
                    {service.fee}
                  </span>
                </td>
                <td className="py-3 px-4 bg-white rounded-r-lg border-r border-y border-blue-100">
                  {Array.isArray(service.specifications) ? (
                    <ul className="space-y-1.5">
                      {service.specifications.map((spec, idx) => (
                        <li key={idx} className="text-gray-700 flex items-center gap-2 text-base">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <span className="leading-normal">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-700 text-base">{service.specifications}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PricingStructure = () => {
  const { t } = useTranslation();
  
  const sections = {
    financial: {
      title: t.pricingStructure.sections.financial.title,
      icon: DollarSign,
      services: Object.values(t.pricingStructure.sections.financial.services)
    },
    document: {
      title: t.pricingStructure.sections.document.title,
      icon: FileText,
      services: Object.values(t.pricingStructure.sections.document.services)
    },
    pensioner: {
      title: t.pricingStructure.sections.pensioner.title,
      icon: UserPlus,
      services: Object.values(t.pricingStructure.sections.pensioner.services)
    },
    consultation: {
      title: t.pricingStructure.sections.consultation.title,
      icon: Phone,
      services: Object.values(t.pricingStructure.sections.consultation.services)
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 bg-gradient-to-b from-blue-50/50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-8 h-8 text-blue-700" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-blue-900">
                  {t.pricingStructure.title}
                </h1>
                <p className="text-blue-700 text-lg">
                  {t.pricingStructure.subtitle}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid gap-6">
            {Object.values(sections).map((section, index) => (
              <ServiceSection key={index} {...section} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PricingStructure;
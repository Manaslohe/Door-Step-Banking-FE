import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Shield, 
  Users, 
  AlertTriangle,
  Clock,
  Download,
  ExternalLink
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { useTranslation } from '../../context/TranslationContext';

const GuidelineSection = ({ title, children, icon: Icon }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white transition-all duration-200 hover:shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-blue-600" />}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {isExpanded ? 
          <ChevronDown className="w-5 h-5 text-gray-500" /> : 
          <ChevronRight className="w-5 h-5 text-gray-500" />
        }
      </button>
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

const RBIGuidelines = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const guidelines = t.rbiGuidelinesData;

  return (
    <DashboardLayout>
      <div className="min-h-fit bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t.navigation.rbiGuidelines}</h1>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.rbi.org.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.rbiGuidelinesPage.rbiWebsite}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Guidelines Sections */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                {t.rbiGuidelinesPage.masterDirectionTitle}
              </h2>
              <p className="text-blue-600">
                {t.rbiGuidelinesPage.masterDirectionDescription}
              </p>
            </div>

            {guidelines
              .filter(guide => 
                guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                guide.content.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(guide => (
                <GuidelineSection 
                  key={guide.id} 
                  title={guide.title} 
                  icon={guide.icon}
                >
                  <p className="text-gray-700 mb-4">{guide.content}</p>
                  <ul className="space-y-2">
                    {guide.details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </GuidelineSection>
              ))
            }
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              {t.rbiGuidelinesPage.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RBIGuidelines;
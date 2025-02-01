import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Phone, Mail, MessageCircle, X, 
  Send, Clock, CheckCircle, ArrowRight
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { useUser } from '../../hooks/useUser';
import { useTickets } from '../../hooks/useTickets';
import { toast } from 'react-hot-toast';

const ContactCard = ({ icon: Icon, text, info, onClick }) => (
  <div 
    onClick={onClick}
    className="p-4 bg-white border border-blue-100 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group"
  >
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{text}</h3>
        <p className="text-sm text-blue-600 mt-1">{info}</p>
      </div>
    </div>
  </div>
);

const SuccessModal = ({ isOpen, onClose, ticketInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease-in]">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl animate-[slideUp_0.3s_ease-out]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-900">Ticket Submitted</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <p className="text-green-700 font-medium">Your support ticket has been created successfully!</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ticket Details</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">#{Math.random().toString(36).substr(2, 8)}</span>
            </div>
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <p><span className="font-medium">Name:</span> {ticketInfo.name}</p>
              <p><span className="font-medium">Contact:</span> {ticketInfo.contactNo}</p>
              <p><span className="font-medium">Message:</span> {ticketInfo.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
            <Clock className="w-4 h-4" />
            <p className="text-sm">Expected response time: 2-3 business days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Support = () => {
  const { user } = useUser();
  const { submitTicket, isSubmitting, error } = useTickets();
  const [message, setMessage] = useState('');
  const [ticketType, setTicketType] = useState('general'); // Add ticket type selection
  const [showModal, setShowModal] = useState(false);
  const [ticketInfo, setTicketInfo] = useState(null);

  // Add authentication check
  useEffect(() => {
    if (!user) {
      toast.error('Please login to create tickets');
      // Optionally redirect to login
      // navigate('/login');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to create tickets');
      return;
    }

    try {
      const ticketData = {
        userId: user._id,
        userName: `${user.firstName} ${user.lastName}`,
        contactNo: user.phone,
        email: user.email,
        message,
        type: ticketType,
        status: 'open',
        priority: 'medium',
        createdAt: new Date(),
        metadata: {
          userAddress: user.address,
          customerSince: user.createdAt
        }
      };

      console.log('Submitting ticket data:', ticketData);
      const ticket = await submitTicket(ticketData);
      setTicketInfo(ticket);
      setShowModal(true);
      setMessage('');
      toast.success('Ticket created successfully!');
    } catch (err) {
      console.error('Ticket submission error:', err);
      toast.error(err.message || 'Failed to create ticket');
    }
  };

  const ticketTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Issue' },
    { value: 'service', label: 'Service Related' }
  ];

  const contactMethods = [
    { 
      icon: Phone, 
      text: "24/7 Helpline", 
      info: "1800-XXX-XXXX",
      onClick: () => window.location.href = "tel:1800XXXXXX"
    },
    { 
      icon: Mail, 
      text: "Email Support", 
      info: "support@dsb.com",
      onClick: () => window.location.href = "mailto:support@dsb.com"
    },
    { 
      icon: MessageCircle, 
      text: "Live Chat", 
      info: "Available 9AM-6PM",
      onClick: () => alert("Live chat feature coming soon!")
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-fit bg-gray-50">
        <div className="p-6 h-full">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Contact Methods */}
            <div className="grid md:grid-cols-3 gap-4">
              {contactMethods.map((method, index) => (
                <ContactCard key={index} {...method} />
              ))}
            </div>

            {/* Ticket Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Create Support Ticket</h2>
                  <p className="text-gray-600 text-sm mt-1">We'll get back to you as soon as possible</p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                      disabled
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input 
                      type="text" 
                      value={user?.phone || ''}
                      disabled
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Type</label>
                  <select
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {ticketTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        ticketInfo={ticketInfo}
      />
    </DashboardLayout>
  );
};

export default Support;
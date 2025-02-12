import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Ticket, Users, Activity, ChevronRight } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { Card } from '@/components/ui/card';
import { EditUserModal } from '../Modals/EditUserModal';
import { useUser } from '../../hooks/useUser';
import { useTickets } from '../../hooks/useTickets'; // Add this import
import useServiceTracking from '../../hooks/useServiceTracking';
import { useTranslation } from '../../context/TranslationContext';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const { tickets: recentTickets, loading: ticketsLoading } = useTickets(user?._id);
  const { services: recentServices, loading: servicesLoading } = useServiceTracking();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { t } = useTranslation();

  const handleUserUpdate = (updatedUser) => {
    window.location.reload();
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const goToServiceTracking = () => {
    navigate('/track-service');
  };

  const goToTrackTicket = () => {
    navigate('/track-ticket');
  };

  const ActionCard = ({ icon: Icon, title, description, onClick }) => (
    <button
      onClick={onClick}
      className="w-full group p-6 bg-white/10 backdrop-blur-sm rounded-2xl
        hover:bg-white/20 transition-all duration-300 
        transform hover:-translate-y-1 hover:shadow-xl
        border border-white/20 text-left"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <Icon className="w-6 h-6 md:w-8 md:h-8 text-white 
            group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-bold text-white mb-1">{t[title]}</h2>
          <p className="text-blue-50 text-sm md:text-base leading-relaxed">{t[description]}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );

  const renderTickets = () => {
    if (ticketsLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      );
    }

    if (!recentTickets?.length) {
      return (
        <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-xl">
          <Ticket className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-500 font-medium">{t.noTicketsFound}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recentTickets.map((ticket) => (
          <div 
            key={ticket._id}
            className="group p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 
              border border-gray-100 hover:border-indigo-200 cursor-pointer"
            onClick={() => navigate(`/support/ticket/${ticket._id}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-800 group-hover:text-indigo-600 
                    transition-colors truncate">
                    {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)} Issue
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : ticket.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{ticket.message}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Created: {formatDate(ticket.createdAt)}</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    ticket.status === 'open' 
                      ? 'bg-blue-50 text-blue-700' 
                      : ticket.status === 'in-progress'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 
                transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderServices = () => {
    if (servicesLoading) {
      return [...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
      ));
    }

    if (!recentServices?.length) {
      return (
        <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-xl">
          <Package className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-500 font-medium">{t.noServicesFound}</p>
        </div>
      );
    }

    return recentServices.map(service => (
      <div 
        key={service._id}
        className="group p-4 bg-white rounded-xl shadow-sm hover:shadow-md 
          transition-all duration-300 cursor-pointer border border-gray-100 
          hover:border-blue-200"
        onClick={() => navigate(`/track-service/${service._id}`)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 group-hover:text-blue-600 
              transition-colors mb-1 truncate">
              {service.serviceType || service.serviceId}
            </h3>
            <p className="text-sm text-gray-500">
              Created: {new Date(service.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap
            ${service.status?.toLowerCase() === 'active' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
            {service.status || 'Pending'}
          </span>
        </div>
      </div>
    ));
  };

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <ActionCard
              icon={Package}
              title="trackService"
              description="trackServiceDesc"
              onClick={goToServiceTracking}
            />
            <ActionCard
              icon={Ticket}
              title="trackTicket"
              description="trackTicketDesc"
              onClick={goToTrackTicket}
            />
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Personal Information Card - More Compact Design */}
          <Card className="p-4 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {t.personalInformation}
                </h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="Edit personal information"
              >
                <Users className="w-4 h-4 text-blue-600" />
              </button>
            </div>
            
            {userLoading ? (
              <div className="grid md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-gray-500">{t.fullName}</span>
                  <span className="font-medium text-gray-900">
                    {`${user?.firstName} ${user?.lastName}`}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-gray-500">{t.email}</span>
                  <span className="font-medium text-gray-900">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-gray-500">{t.phone}</span>
                  <span className="font-medium text-gray-900">{user?.phone}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-gray-500">{t.address}</span>
                  <span className="font-medium text-gray-900">{user?.address}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Tracking Overview Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active Services */}
            <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">{t.activeServices}</h2>
                </div>
                <button
                  onClick={goToServiceTracking}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t.viewAll}
                </button>
              </div>

              <div className="h-[400px] overflow-y-auto pr-2 space-y-4 scrollbar-thin 
                scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {renderServices()}
              </div>
            </Card>

            {/* Recent Tickets */}
            <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Ticket className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">{t.recentTickets}</h2>
                </div>
                <button
                  onClick={() => navigate('/support')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {t.viewAll}
                </button>
              </div>

              <div className="h-[400px] overflow-y-auto pr-2 space-y-4 scrollbar-thin 
                scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {renderTickets()}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUserUpdate}
      />
    </DashboardLayout>
  );
};

export default UserDashboard;
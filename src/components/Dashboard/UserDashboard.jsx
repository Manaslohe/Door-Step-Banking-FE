import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Package, Ticket, Bell, Activity, Calendar } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EditUserModal } from '../Modals/EditUserModal';
import { useUser } from '../../hooks/useUser';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Spinner } from '../Common/Spinner';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading, error: userError } = useUser(); // Add loading and error from useUser
  const { 
    recentServices, 
    recentTickets, 
    notifications, 
    accountStatus,
    loading: dashboardLoading, 
    error: dashboardError 
  } = useDashboardData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleUserUpdate = (updatedUser) => {
    // Refresh user data or update local state
    window.location.reload(); // For now, just reload the page
  };

  const goToServiceTracking = () => {
    navigate('/track-service'); // This will show the list view
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

  const renderTickets = () => {
    console.log('Rendering tickets:', { loading: dashboardLoading, error: dashboardError, tickets: recentTickets });

    if (dashboardLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      );
    }

    if (dashboardError) {
      return (
        <div className="p-4 bg-red-50 rounded-xl">
          <p className="text-red-600">Error loading tickets: {dashboardError}</p>
        </div>
      );
    }

    if (!recentTickets?.length) {
      return (
        <div className="text-center p-6 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No tickets found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recentTickets.map((ticket) => (
          <div 
            key={ticket._id}
            className="group p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-indigo-200"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)} Issue
                </p>
                <p className="text-sm text-gray-500 line-clamp-1">{ticket.message}</p>
                <p className="text-xs text-gray-400">
                  Created: {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  ticket.status === 'open' 
                    ? 'bg-blue-100 text-blue-800' 
                    : ticket.status === 'in-progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  ticket.priority === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : ticket.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      {/* Hero Section with Gradient */}
      <div className="bg-blue-700 to-blue-500 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={goToServiceTracking}
              className="group p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-white/20"
            >
              <Package className="w-10 h-10 text-white mb-3 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-white mb-2">Track Service</h2>
              <p className="text-blue-50 text-sm leading-relaxed">Monitor your active services and stay updated with real-time status</p>
            </button>

            <button
              onClick={() => {
                setSelectedTracking('ticket');
                setShowTrackingModal(true);
              }}
              className="group p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-white/20"
            >
              <Ticket className="w-10 h-10 text-white mb-3 group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold text-white mb-2">Track Ticket</h2>
              <p className="text-blue-50 text-sm leading-relaxed">Check and manage your support tickets efficiently</p>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-gray-800">Personal Information</span>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-2 hover:bg-indigo-50 rounded-full transition-colors"
                  >
                    <Users className="w-4 h-4 text-indigo-600" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {userLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : userError ? (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600 text-sm">Error loading user data</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="flex justify-between text-sm">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{`${user?.firstName} ${user?.lastName}`}</span>
                    </p>
                    <p className="flex justify-between text-sm">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{user?.email}</span>
                    </p>
                    <p className="flex justify-between text-sm">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{user?.phone}</span>
                    </p>
                    <p className="flex justify-between text-sm">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{user?.address}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Status Card */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-gray-800">Account Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {dashboardLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : dashboardError ? (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600 text-sm">Error loading account status</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        accountStatus?.status === 'Active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {accountStatus?.status}
                      </span>
                    </p>
                    <p className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Login:</span>
                      <span className="font-medium">{accountStatus?.lastLogin}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-gray-800">Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {dashboardLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : dashboardError ? (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600 text-sm">Error loading notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications?.map(notification => (
                      <div key={notification.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                        <Bell className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-xs text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracking Stats */}
            <Card className="col-span-full hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-gray-800">Tracking Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Services</h3>
                    <div className="space-y-4">
                      {recentServices?.map(service => (
                        <div 
                          key={service.id} 
                          onClick={() => handleServiceTracking(service.id)}
                          className="group p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-indigo-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">{service.id}</p>
                              <p className="text-sm text-gray-500">Last updated: {service.lastUpdated}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                              service.status === 'Active' 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}>
                              {service.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Tickets</h3>
                    {renderTickets()}
                  </div>
                </div>
              </CardContent>
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
import React, { useState, useEffect } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { Search, Filter, RefreshCw, ExternalLink, MessageCircle, User, Phone, Mail, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';

const TicketTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { tickets, isLoading, error, refreshTickets, updateTicketStatus } = useTickets();
  const [filteredTickets, setFilteredTickets] = useState([]);

  // Status badge colors
  const statusColors = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-blue-100 text-blue-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  // Priority colors
  const priorityColors = {
    low: 'bg-blue-50 text-blue-600',
    medium: 'bg-yellow-50 text-yellow-600',
    high: 'bg-red-50 text-red-600',
  };

  // Apply filters
  useEffect(() => {
    if (!tickets) return;
    
    let filtered = [...tickets];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.message?.toLowerCase().includes(term) || 
        ticket.userName?.toLowerCase().includes(term) ||
        ticket.email?.toLowerCase().includes(term) ||
        ticket._id?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.type === typeFilter);
    }
    
    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, typeFilter]);

  // Handle ticket selection for details view
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    refreshTickets();
  };

  // Handle ticket status change
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      // If currently viewing this ticket, update the selected ticket
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({...selectedTicket, status: newStatus});
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get ticket type badge
  const getTypeIcon = (type) => {
    switch(type) {
      case 'general': return <MessageCircle className="h-4 w-4" />;
      case 'technical': return <AlertCircle className="h-4 w-4" />;
      case 'billing': return <Clock className="h-4 w-4" />;
      case 'service': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        {selectedTicket ? (
          // Ticket detail view
          <div className="flex flex-col h-full animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4 mr-1" />
                Back to tickets
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={handleRefresh}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">Ticket {selectedTicket._id}</h2>
                  <p className="text-sm text-gray-500 mb-4">Submitted on {formatDate(selectedTicket.createdAt)}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedTicket.status] || 'bg-gray-100'}`}>
                    {selectedTicket.status?.replace('_', ' ').charAt(0).toUpperCase() + selectedTicket.status?.replace('_', ' ').slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[selectedTicket.priority] || 'bg-gray-100'}`}>
                    {selectedTicket.priority?.charAt(0).toUpperCase() + selectedTicket.priority?.slice(1)} Priority
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600 mb-1">Customer Name</p>
                    <p className="text-sm font-medium text-gray-800">{selectedTicket.userName || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-1">Contact Number</p>
                    <p className="text-sm font-medium text-gray-800">{selectedTicket.contactNo || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-600 mb-1">Email Address</p>
                    <p className="text-sm font-medium text-gray-800">{selectedTicket.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Message</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Change Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['open', 'in_progress', 'resolved', 'closed'].map(status => (
                    <button 
                      key={status}
                      onClick={() => handleStatusChange(selectedTicket._id, status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
                        ${selectedTicket.status === status 
                          ? `${statusColors[status]} border-2 border-gray-300` 
                          : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                      disabled={selectedTicket.status === status}
                    >
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Tickets list view
          <>
            {/* Filter and Search Section */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search tickets by ID, name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <div className="relative min-w-[140px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div className="relative min-w-[140px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="service">Service</option>
                  </select>
                </div>
                
                <button 
                  onClick={handleRefresh}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-10 w-10 bg-blue-200 rounded-full mb-4 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                  </div>
                  <p className="text-gray-500">Loading tickets...</p>
                </div>
              </div>
            )}
            
            {/* No tickets message */}
            {!isLoading && filteredTickets?.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-2">No tickets found</p>
                <p className="text-sm text-gray-400">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters' 
                    : 'Customer tickets will appear here when submitted'}
                </p>
              </div>
            )}
            
            {/* Tickets Table */}
            {!isLoading && filteredTickets?.length > 0 && (
              <div className="overflow-auto flex-grow bg-white rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID/Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">#{ticket._id?.substring(0, 8) || 'N/A'}</span>
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(ticket.type)}
                              <span className="text-xs font-medium text-gray-700 capitalize">{ticket.type || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{ticket.userName || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{ticket.email || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{ticket.contactNo || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 max-w-xs truncate">
                            {ticket.message || 'No message provided'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status] || 'bg-gray-100 text-gray-800'}`}>
                            {ticket.status?.replace('_', ' ').charAt(0).toUpperCase() + ticket.status?.replace('_', ' ').slice(1) || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            onClick={() => handleSelectTicket(ticket)}
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default TicketTracker;

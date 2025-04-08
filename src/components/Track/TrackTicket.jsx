import React, { useState } from 'react';
import { Search, Loader, Filter, Calendar, Ticket as TicketIcon, ArrowUpDown } from 'lucide-react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import { useTickets } from '../../hooks/useTickets';
import { useUser } from '../../hooks/useUser';
import { useTranslation } from '../../context/TranslationContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TicketDetailsModal from './TicketDetailsModal';
import { motion } from 'framer-motion';

export const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'resolved':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const displayName = status.replace(/_/g, ' ');
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${getStatusStyles()}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${status.toLowerCase() === 'open' ? 'bg-emerald-500' : 
                                                     status.toLowerCase() === 'in_progress' ? 'bg-blue-500' : 
                                                     status.toLowerCase() === 'resolved' ? 'bg-gray-500' : 'bg-red-500'}`}></span>
      {capitalizedName}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const getPriorityStyles = () => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityStyles()}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const TrackTicket = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user } = useUser();
  const { tickets, isLoading, error, fetchTicket } = useTickets(user?._id);
  const { t } = useTranslation();

  const handleTicketClick = async (ticketId) => {
    setIsLoadingDetails(true);
    setSelectedTicket({});
    try {
      const ticketDetails = await fetchTicket(ticketId);
      setSelectedTicket(ticketDetails);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter tickets first by status if filter is active
  const statusFilteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status.toLowerCase() === filterStatus.toLowerCase());

  // Then filter by search term
  const filteredTickets = statusFilteredTickets.filter(ticket =>
    ticket._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort the filtered tickets
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'priority') {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      const valA = priorityValues[a.priority.toLowerCase()] || 0;
      const valB = priorityValues[b.priority.toLowerCase()] || 0;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    } else {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      return 0;
    }
  });

  const statusOptions = ['all', 'open', 'in_progress', 'resolved', 'closed'];

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-4">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-600 text-lg font-medium mb-2">Error loading tickets</div>
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.ticketTracking.title}</h1>
            <p className="text-gray-500 mt-1">{t.ticketTracking.subtitle}</p>
          </div>
          
          {/* Stats Cards */}
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100 flex items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                <TicketIcon size={16} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{t.ticketTracking.stats.totalTickets}</div>
                <div className="font-semibold">{tickets.length}</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100 flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Calendar size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">{t.ticketTracking.stats.openTickets}</div>
                <div className="font-semibold">
                  {tickets.filter(t => t.status.toLowerCase() === 'open').length}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t.ticketTracking.search.placeholder}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ArrowUpDown size={14} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead onClick={() => handleSort('_id')} className="cursor-pointer hover:text-emerald-600">
                    <div className="flex items-center">
                      {t.ticketTracking.table.ticketId}
                      {sortField === '_id' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('type')} className="cursor-pointer hover:text-emerald-600">
                    <div className="flex items-center">
                      {t.ticketTracking.table.type}
                      {sortField === 'type' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-full">{t.ticketTracking.table.message}</TableHead>
                  <TableHead onClick={() => handleSort('priority')} className="cursor-pointer hover:text-emerald-600">
                    <div className="flex items-center">
                      {t.ticketTracking.table.priority}
                      {sortField === 'priority' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:text-emerald-600">
                    <div className="flex items-center">
                      {t.ticketTracking.table.status}
                      {sortField === 'status' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer hover:text-emerald-600">
                    <div className="flex items-center">
                      {t.ticketTracking.table.created}
                      {sortField === 'createdAt' && (
                        <ArrowUpDown size={14} className="ml-1" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Loader className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
                        <div className="text-gray-500">{t.ticketTracking.loading}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <TicketIcon size={28} className="text-gray-400" />
                        </div>
                        <div className="text-gray-500 font-medium">{t.ticketTracking.noTickets.title}</div>
                        <div className="text-gray-400 text-sm mt-1">{t.ticketTracking.noTickets.subtitle}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTickets.map((ticket) => (
                    <motion.tr
                      key={ticket._id}
                      className="cursor-pointer group border-b last:border-b-0"
                      onClick={() => handleTicketClick(ticket._id)}
                      initial={{ backgroundColor: "transparent" }}
                      whileHover={{ 
                        backgroundColor: "rgba(16, 185, 129, 0.05)",
                        transition: { duration: 0.15 }
                      }}
                      layoutId={`ticket-row-${ticket._id}`}
                    >
                      <TableCell className="font-medium">
                        <div className="group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                          <span className="group-hover:translate-x-1 transition-transform">
                            {ticket._id.substring(ticket._id.length - 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs inline-block capitalize">
                          {ticket.type}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        <div className="line-clamp-1 group-hover:text-gray-900 transition-colors">
                          {ticket.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-gray-500 text-sm">
                        {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      <TicketDetailsModal
        ticket={selectedTicket}
        isLoading={isLoadingDetails}
        onClose={() => setSelectedTicket(null)}
      />
    </DashboardLayout>
  );
};

export default TrackTicket;
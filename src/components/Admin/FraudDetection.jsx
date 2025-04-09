import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Search, Check, X, BarChart2, Filter, Layers, Flag, User, RefreshCw, Info } from 'lucide-react';
import AdminLayout from './AdminLayout';

const FraudDetection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsItem, setDetailsItem] = useState(null);
  const [runningSimulation, setRunningSimulation] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Fetch alerts when component mounts
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!alerts.length) {
      setFilteredAlerts([]);
      return;
    }

    let result = [...alerts];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        alert => 
          alert.entity.toLowerCase().includes(term) ||
          alert.entityId.toLowerCase().includes(term) ||
          alert.reason.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (filter !== 'all') {
      result = result.filter(alert => alert.category === filter);
    }
    
    setFilteredAlerts(result);
  }, [alerts, filter, searchTerm]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Get admin token
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin authentication required');
      }

      // Fetch service data
      const servicesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/services/all`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!servicesResponse.ok) throw new Error('Failed to fetch services');
      
      const servicesData = await servicesResponse.json();
      
      // Fetch tickets data
      const ticketsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!ticketsResponse.ok) throw new Error('Failed to fetch tickets');
      
      const ticketsData = await ticketsResponse.json();
      
      // Fetch users data
      const usersResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      
      const usersData = await usersResponse.json();
      
      // Process the data to detect fraud
      const fraudAlerts = analyzeForFraud(
        servicesData.data || [], 
        ticketsData.tickets || [], 
        usersData.users || []
      );
      
      setAlerts(fraudAlerts);
      setFilteredAlerts(fraudAlerts);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to analyze data for fraud patterns
  const analyzeForFraud = (services, tickets, users) => {
    let fraudAlerts = [];
    
    // Track service patterns by user
    const userServiceCounts = {};
    const suspiciousTransactionAmounts = new Set(['999', '1999', '4999', '9999']);
    
    // Analyze services for fraud
    services.forEach(service => {
      // Initialize user stats
      if (!userServiceCounts[service.userId]) {
        userServiceCounts[service.userId] = {
          count: 0,
          largeTransactions: 0,
          suspiciousAmounts: 0,
          services: []
        };
      }
      
      const userStats = userServiceCounts[service.userId];
      userStats.count++;
      userStats.services.push(service);
      
      // Check for suspicious transaction amounts
      if (service.amount) {
        if (suspiciousTransactionAmounts.has(String(service.amount))) {
          userStats.suspiciousAmounts++;
          
          // Create an alert for suspicious amount
          if (userStats.suspiciousAmounts >= 2) {
            fraudAlerts.push({
              id: `sa-${service._id}`,
              entityId: service.userId,
              entity: service.userName || 'Unknown User',
              type: 'user',
              category: 'suspicious_activity',
              reason: 'Multiple transactions with suspicious amounts',
              confidence: 0.85,
              timestamp: new Date().toISOString(),
              status: 'pending',
              details: {
                suspiciousTransactions: userStats.services
                  .filter(s => suspiciousTransactionAmounts.has(String(s.amount)))
                  .map(s => ({
                    serviceId: s._id,
                    amount: `₹${s.amount}`,
                    date: new Date(s.createdAt).toLocaleDateString(),
                    serviceType: s.serviceType
                  }))
              }
            });
          }
        }
        
        // Check for large transactions
        if (service.amount > 8000) {
          userStats.largeTransactions++;
          
          // Create an alert for multiple large transactions
          if (userStats.largeTransactions >= 3) {
            const existingAlertIndex = fraudAlerts.findIndex(
              a => a.entityId === service.userId && a.category === 'unusual_patterns'
            );
            
            if (existingAlertIndex === -1) {
              fraudAlerts.push({
                id: `up-${service.userId}`,
                entityId: service.userId,
                entity: service.userName || 'Unknown User',
                type: 'user',
                category: 'unusual_patterns',
                reason: 'Multiple large transactions in short period',
                confidence: 0.78,
                timestamp: new Date().toISOString(),
                status: 'pending',
                details: {
                  largeTransactions: userStats.services
                    .filter(s => s.amount > 8000)
                    .map(s => ({
                      serviceId: s._id,
                      amount: `₹${s.amount}`,
                      date: new Date(s.createdAt).toLocaleDateString(),
                      serviceType: s.serviceType
                    }))
                }
              });
            }
          }
        }
      }
    });
    
    // Analyze tickets for suspicious content
    const suspiciousKeywords = [
      'money laundering', 'bypass', 'hack', 'fake id', 'illegal', 
      'bypass verification', 'fake account', 'identity theft'
    ];
    
    tickets.forEach(ticket => {
      if (ticket.message) {
        const message = ticket.message.toLowerCase();
        const flaggedWords = suspiciousKeywords.filter(keyword => 
          message.includes(keyword.toLowerCase())
        );
        
        if (flaggedWords.length > 0) {
          fraudAlerts.push({
            id: `cv-${ticket._id}`,
            entityId: ticket.userId || 'anonymous',
            entity: ticket.userName || 'Anonymous User',
            type: 'user',
            category: 'content_violation',
            reason: 'Suspicious keywords in message',
            confidence: 0.92,
            timestamp: ticket.createdAt || new Date().toISOString(),
            status: 'pending',
            details: {
              ticketId: ticket._id,
              flaggedWords,
              message: ticket.message,
              email: ticket.email,
              contactNo: ticket.contactNo
            }
          });
        }
      }
    });
    
    // Analyze agents for unusual approval patterns
    const agentApprovalStats = {};
    
    // Get agents
    const agents = users.filter(user => user.userType === 'agent');
    
    // Collect stats
    services.forEach(service => {
      if (service.agentId) {
        if (!agentApprovalStats[service.agentId]) {
          agentApprovalStats[service.agentId] = {
            totalServices: 0,
            approved: 0,
            rejected: 0,
            avgAmount: 0,
            totalAmount: 0,
            services: []
          };
        }
        
        const stats = agentApprovalStats[service.agentId];
        stats.totalServices++;
        stats.services.push(service);
        
        if (service.status === 'APPROVED') {
          stats.approved++;
        } else if (service.status === 'REJECTED') {
          stats.rejected++;
        }
        
        if (service.amount) {
          stats.totalAmount += Number(service.amount);
        }
      }
    });
    
    // Calculate averages and find anomalies
    Object.keys(agentApprovalStats).forEach(agentId => {
      const stats = agentApprovalStats[agentId];
      
      if (stats.totalServices > 0) {
        stats.avgAmount = stats.totalAmount / stats.totalServices;
        stats.approvalRate = stats.totalServices > 0 
          ? (stats.approved / stats.totalServices) * 100 
          : 0;
        
        // Find agent name
        const agent = agents.find(a => a._id === agentId);
        const agentName = agent ? agent.name : 'Unknown Agent';
        
        // Check for unusual approval rates
        if (stats.approvalRate > 95 && stats.totalServices > 10) {
          fraudAlerts.push({
            id: `agt-${agentId}`,
            entityId: agentId,
            entity: agentName,
            type: 'agent',
            category: 'unusual_patterns',
            reason: 'Abnormally high service approval rate',
            confidence: 0.88,
            timestamp: new Date().toISOString(),
            status: 'pending',
            details: {
              approvalRate: `${stats.approvalRate.toFixed(1)}%`,
              serviceCount: stats.totalServices,
              approved: stats.approved,
              rejected: stats.rejected,
              avgAmount: `₹${stats.avgAmount.toFixed(2)}`,
              recentServices: stats.services
                .slice(0, 5)
                .map(s => ({
                  id: s._id,
                  status: s.status,
                  amount: s.amount ? `₹${s.amount}` : 'N/A',
                  date: new Date(s.createdAt).toLocaleDateString(),
                  serviceType: s.serviceType
                }))
            }
          });
        }
      }
    });
    
    return fraudAlerts;
  };

  const scanDatabase = async () => {
    setIsScanning(true);
    
    try {
      // Get admin token
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('Admin authentication required');
      }

      // Perform the scan
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fraud/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullScan: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Database scan failed');
      }
      
      // Refresh alerts after scan
      await fetchAlerts();
      
    } catch (error) {
      console.error('Database scan error:', error);
      // If the API endpoint doesn't exist, fallback to client-side scanning
      await fetchAlerts();
    } finally {
      setIsScanning(false);
    }
  };

  const runSimulation = () => {
    setRunningSimulation(true);
    
    // Create a new simulated alert
    setTimeout(() => {
      const newAlert = {
        id: `sim-${Date.now()}`,
        entityId: `USR${Math.floor(1000 + Math.random() * 9000)}`,
        entity: 'Simulated User',
        type: 'user',
        category: 'unusual_patterns',
        reason: 'Unusual transaction pattern detected',
        confidence: 0.89,
        timestamp: new Date().toISOString(),
        status: 'pending',
        details: {
          transactions: [
            { amount: '₹25,000', date: 'Today', location: 'Mumbai' },
            { amount: '₹30,000', date: 'Today', location: 'Bangalore' },
            { amount: '₹15,000', date: 'Today', location: 'Delhi' },
          ],
          pattern: 'Multiple high-value transactions across different cities within 2 hours',
          risk: 'High',
        }
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      setRunningSimulation(false);
    }, 3000);
  };

  const updateAlertStatus = (id, newStatus) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, status: newStatus } 
          : alert
      )
    );
    
    if (detailsItem && detailsItem.id === id) {
      setDetailsItem(prev => ({ ...prev, status: newStatus }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.9) return 'text-red-600 bg-red-50';
    if (score >= 0.7) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'suspicious_activity': return 'Suspicious Activity';
      case 'unusual_patterns': return 'Unusual Patterns';
      case 'content_violation': return 'Content Violation';
      default: return category;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="bg-blue-600 rounded-xl shadow-lg mb-6">
          <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Fraud Detection System</h1>
                <p className="text-blue-100">Monitor and investigate suspicious activities</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={scanDatabase}
                disabled={isScanning}
                className="px-4 py-2 bg-white text-blue-700 rounded-lg font-medium flex items-center shadow-sm hover:bg-blue-50 transition-colors"
              >
                {isScanning ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                {isScanning ? 'Scanning...' : 'Scan Database'}
              </button>
              <button 
                onClick={runSimulation}
                disabled={runningSimulation}
                className="px-4 py-2 bg-white text-blue-700 rounded-lg font-medium flex items-center shadow-sm hover:bg-blue-50 transition-colors"
              >
                {runningSimulation ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                {runningSimulation ? 'Running...' : 'Run Simulation'}
              </button>
              <button 
                onClick={fetchAlerts}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium flex items-center shadow-sm hover:bg-blue-400 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          <div className="bg-blue-700 px-6 py-3 rounded-b-xl flex flex-wrap items-center">
            <div className="text-blue-100 flex items-center mr-6">
              <BarChart2 className="h-4 w-4 mr-2" />
              <span>Total Alerts: <span className="font-medium">{alerts.length}</span></span>
            </div>
            <div className="text-green-100 flex items-center mr-6">
              <Check className="h-4 w-4 mr-2" />
              <span>Reviewed: <span className="font-medium">{alerts.filter(a => a.status !== 'pending').length}</span></span>
            </div>
            <div className="text-yellow-100 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>Pending: <span className="font-medium">{alerts.filter(a => a.status === 'pending').length}</span></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Filters and Alert List */}
          <div className="lg:col-span-2 flex flex-col h-full">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search alerts by ID, name, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative min-w-[180px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="suspicious_activity">Suspicious Activity</option>
                  <option value="unusual_patterns">Unusual Patterns</option>
                  <option value="content_violation">Content Violation</option>
                </select>
              </div>
            </div>

            {/* Alerts List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-grow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-blue-600" />
                  Fraud Alerts
                </h2>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Showing {filteredAlerts.length} of {alerts.length}
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-pulse flex flex-col items-center">
                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-3" />
                    <p className="text-gray-500">Loading alerts...</p>
                  </div>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="p-6 text-center">
                  <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-gray-500 font-medium mb-1">No Alerts Found</h3>
                  <p className="text-gray-400 text-sm">
                    {searchTerm || filter !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'All systems are running normally'}
                  </p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[600px]">
                  <ul className="divide-y divide-gray-200">
                    {filteredAlerts.map(alert => (
                      <li 
                        key={alert.id} 
                        className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${detailsItem?.id === alert.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setDetailsItem(alert)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-blue-100 text-blue-600'}`}>
                              <User className="h-5 w-5" />
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-800">{alert.entity}</p>
                              <p className="text-xs text-gray-500">
                                {alert.type === 'user' ? 'User' : 'Agent'} • ID: {alert.entityId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                              ${alert.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : alert.status === 'confirmed' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'}`
                            }>
                              {alert.status === 'pending' ? 'Pending' : alert.status === 'confirmed' ? 'Confirmed' : 'Dismissed'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Reason:</span> {alert.reason}
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 mr-2">
                                {getCategoryLabel(alert.category)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-md ${getConfidenceColor(alert.confidence)}`}>
                                Confidence: {(alert.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(alert.timestamp)}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Alert Details */}
          <div className="lg:col-span-1">
            {detailsItem ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-600" />
                    Alert Details
                  </h3>
                  <button 
                    onClick={() => setDetailsItem(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Alert ID</p>
                      <p className="font-medium">{detailsItem.id}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${detailsItem.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : detailsItem.status === 'confirmed' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'}`
                    }>
                      {detailsItem.status === 'pending' ? 'Pending' : detailsItem.status === 'confirmed' ? 'Confirmed' : 'Dismissed'}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${detailsItem.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-blue-100 text-blue-600'}`}>
                        <User className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-lg text-gray-800">{detailsItem.entity}</h3>
                        <p className="text-sm text-gray-500">{detailsItem.type === 'user' ? 'User' : 'Agent'} • {detailsItem.entityId}</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-blue-800 mb-1">Detection Reason</p>
                      <p className="text-sm text-blue-700">{detailsItem.reason}</p>
                      <div className="mt-3 flex items-center">
                        <span className={`text-xs px-2 py-1 rounded-md ${getConfidenceColor(detailsItem.confidence)}`}>
                          Confidence Score: {(detailsItem.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
                      <span className="text-sm px-3 py-1 rounded-md bg-blue-50 text-blue-700">
                        {getCategoryLabel(detailsItem.category)}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Detected On</p>
                      <p className="text-sm text-gray-600">{formatDate(detailsItem.timestamp)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Evidence Details</p>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm">
                        {detailsItem.category === 'suspicious_activity' && detailsItem.details.suspiciousTransactions && (
                          <div>
                            <p className="font-medium mb-2">Suspicious Transactions:</p>
                            <ul className="space-y-2">
                              {detailsItem.details.suspiciousTransactions.map((transaction, idx) => (
                                <li key={idx} className="bg-white p-2 rounded border border-gray-200">
                                  <p><span className="font-medium">Service ID:</span> {transaction.serviceId}</p>
                                  <p><span className="font-medium">Amount:</span> {transaction.amount}</p>
                                  <p><span className="font-medium">Date:</span> {transaction.date}</p>
                                  <p><span className="font-medium">Type:</span> {transaction.serviceType}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {detailsItem.category === 'unusual_patterns' && detailsItem.type === 'agent' && (
                          <div>
                            <p className="mb-2"><span className="font-medium">Approval Rate:</span> {detailsItem.details.approvalRate}</p>
                            <p className="mb-2"><span className="font-medium">Service Count:</span> {detailsItem.details.serviceCount}</p>
                            <p className="mb-2"><span className="font-medium">Approved:</span> {detailsItem.details.approved}</p>
                            <p className="mb-2"><span className="font-medium">Rejected:</span> {detailsItem.details.rejected}</p>
                            <p className="mb-4"><span className="font-medium">Avg. Amount:</span> {detailsItem.details.avgAmount}</p>
                            
                            <p className="font-medium mb-2">Recent Services:</p>
                            <ul className="space-y-2">
                              {detailsItem.details.recentServices?.map((service, idx) => (
                                <li key={idx} className="bg-white p-2 rounded border border-gray-200">
                                  <p><span className="font-medium">ID:</span> {service.id}</p>
                                  <p><span className="font-medium">Status:</span> {service.status}</p>
                                  <p><span className="font-medium">Amount:</span> {service.amount}</p>
                                  <p><span className="font-medium">Date:</span> {service.date}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {detailsItem.category === 'content_violation' && (
                          <div>
                            <p className="mb-2"><span className="font-medium">Flagged Words:</span> {detailsItem.details.flaggedWords?.join(', ')}</p>
                            <p className="mb-2"><span className="font-medium">Ticket ID:</span> {detailsItem.details.ticketId}</p>
                            <p className="mb-2"><span className="font-medium">Email:</span> {detailsItem.details.email}</p>
                            <p className="mb-2"><span className="font-medium">Contact:</span> {detailsItem.details.contactNo}</p>
                            <div className="mt-3">
                              <p className="font-medium mb-1">Message:</p>
                              <div className="bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap">
                                {detailsItem.details.message}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {detailsItem.category === 'unusual_patterns' && detailsItem.type === 'user' && detailsItem.details.largeTransactions && (
                          <div>
                            <p className="font-medium mb-2">Large Transactions:</p>
                            <ul className="space-y-2">
                              {detailsItem.details.largeTransactions.map((transaction, idx) => (
                                <li key={idx} className="bg-white p-2 rounded border border-gray-200">
                                  <p><span className="font-medium">Service ID:</span> {transaction.serviceId}</p>
                                  <p><span className="font-medium">Amount:</span> {transaction.amount}</p>
                                  <p><span className="font-medium">Date:</span> {transaction.date}</p>
                                  <p><span className="font-medium">Type:</span> {transaction.serviceType}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {detailsItem.category === 'unusual_patterns' && detailsItem.type === 'user' && detailsItem.details.transactions && (
                          <div>
                            <p className="mb-2"><span className="font-medium">Pattern:</span> {detailsItem.details.pattern}</p>
                            <p className="mb-2"><span className="font-medium">Risk Level:</span> {detailsItem.details.risk}</p>
                            <div className="mt-3">
                              <p className="font-medium mb-1">Recent Transactions:</p>
                              <ul className="space-y-2">
                                {detailsItem.details.transactions.map((t, i) => (
                                  <li key={i} className="bg-white p-2 rounded border border-gray-200">
                                    <div className="flex justify-between">
                                      <span>{t.amount}</span>
                                      <span className="text-gray-500">{t.date}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Location: {t.location}</div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 flex space-x-3">
                    {detailsItem.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => updateAlertStatus(detailsItem.id, 'confirmed')}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                          Mark as Fraud
                        </button>
                        <button
                          onClick={() => updateAlertStatus(detailsItem.id, 'dismissed')}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => updateAlertStatus(detailsItem.id, 'pending')}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Reset Status
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Flag className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="mt-4 font-medium text-gray-800">Select an Alert</h3>
                  <p className="mt-2 text-sm text-gray-500">Click on an alert from the list to view detailed information</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FraudDetection;

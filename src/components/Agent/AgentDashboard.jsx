import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import AgentSidebar from './AgentSidebar';
import MobileHeader from './MobileHeader';
import StatsCards from './StatsCards';
import TasksSection from './components/TasksSection';
import DashboardHeader from './components/DashboardHeader';
import { formatDateTime, formatPhoneNumber, getStatusColor, getServiceIcon } from './utils/formatters';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeAssignments: 0,
    pendingApplications: 0,
    completedAssignments: 0
  });
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [agentProfile, setAgentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch agent information directly from localStorage
    loadAgentData();
  }, [navigate]);

  const loadAgentData = async () => {
    setLoading(true);
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('userData');
      if (!userData) {
        navigate('/agent-login');
        return;
      }
      
      const user = JSON.parse(userData);
      if (user.userType !== 'agent') {
        navigate('/agent-login');
        return;
      }
      
      // Set agent profile
      setAgentProfile(user);
      
      // Update stats from user data
      setStats({
        totalCustomers: 0, // This might not be available in the user data
        activeAssignments: user.activeAssignments || 0,
        pendingApplications: 0, // This might not be available in the user data
        completedAssignments: 0 // This might need to be calculated
      });
      
      // Process assignments if available
      if (user.assignments && Array.isArray(user.assignments)) {
        await fetchAndProcessAssignments(user.assignments);
      } else {
        setAssignedTasks([]);
      }
      
    } catch (err) {
      console.error("Error loading agent data:", err);
      setError('Failed to load your profile. Please try logging in again.');
      setTimeout(() => navigate('/agent-login'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchAndProcessAssignments = async (assignments) => {
    if (!assignments || !Array.isArray(assignments)) {
      setAssignedTasks([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/agent-login');
        return;
      }
      
      console.log('Starting to fetch service details for assignments:', assignments);
      
      // Fetch service details for each assignment
      const processedTasks = await Promise.all(assignments.map(async assignment => {
        // Extract the service ID - ensuring we're getting the correct ObjectId
        const serviceId = assignment.serviceId?.$oid || 
                          (assignment.serviceId && typeof assignment.serviceId === 'string' ? assignment.serviceId : null) || 
                          assignment._id?.$oid;
        
        console.log(`Processing assignment with serviceId: ${serviceId}`);
        
        if (!serviceId) {
          console.error('No valid serviceId found in assignment:', assignment);
          return null;
        }
        
        // Map service types and statuses
        const serviceTypeMap = {
          'CASH_DEPOSIT': 'Cash Deposit',
          'CASH_WITHDRAWAL': 'Cash Withdrawal',
          'NEW_ACCOUNT': 'New Account Opening',
          'DOCUMENT_SERVICE': 'Document Service',
          'LIFE_CERTIFICATE': 'Life Certificate',
          'ONLINE_ASSISTANCE': 'Online Assistance'
        };
        
        const statusMap = {
          'ASSIGNED': 'pending',
          'IN_PROGRESS': 'in_progress',
          'COMPLETED': 'completed',
          'CANCELLED': 'cancelled'
        };
        
        // Create the base task object
        const task = {
          id: serviceId,
          serviceName: serviceTypeMap[assignment.serviceType] || assignment.serviceType,
          serviceType: assignment.serviceType,
          status: statusMap[assignment.status] || 'pending',
          customerPhone: assignment.customerPhone,
          scheduledTime: assignment.assignedAt?.$date,
          location: assignment.location || 'Customer Location'
        };
        
        console.log('Base task object created:', task);
        
        // Fetch additional service details from the ServiceRequest database using the serviceId
        try {
          console.log(`Fetching service details for ID: ${serviceId}`);
          
          // Use the VITE_API_URL environment variable or default to relative path
          const apiUrl = import.meta.env.VITE_API_URL || '';
          const url = `${apiUrl}/api/services/${serviceId}`;
          
          console.log('Service API request URL:', url);
          
          const serviceResponse = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          console.log('Service API response status:', serviceResponse.status);
          
          if (serviceResponse.ok) {
            const responseText = await serviceResponse.text();
            console.log('Raw service response:', responseText);
            
            try {
              const serviceData = JSON.parse(responseText);
              console.log('Parsed service data:', serviceData);
              
              if (serviceData.success && serviceData.service) {
                const serviceDetails = serviceData.service;
                
                // Format the service data properly
                const enhancedTask = {
                  ...task,
                  // Get customer name/phone from the service
                  customerName: serviceDetails.userName || 'Customer',
                  customerPhone: serviceDetails.userPhone || task.customerPhone,
                  
                  // Get address and location details
                  address: serviceDetails.address,
                  
                  // Get financial details
                  amount: serviceDetails.amount || 0,
                  bankAccount: serviceDetails.bankAccount,
                  bankName: serviceDetails.bankName,
                  ifscCode: serviceDetails.ifscCode,
                  
                  // Get scheduling details
                  timeSlot: serviceDetails.timeSlot,
                  date: serviceDetails.date,
                  
                  // Get additional details
                  description: serviceDetails.description,
                  notes: serviceDetails.notes,
                  pensionAccountNo: serviceDetails.pensionAccountNo,
                  documentType: serviceDetails.documentType,
                  
                  // Store the complete service details for reference
                  serviceDetails: serviceDetails
                };
                
                console.log('Enhanced task with service details:', enhancedTask);
                console.log('Address from service:', serviceDetails.address);
                
                return enhancedTask;
              } else {
                console.warn('Service data does not contain expected service object:', serviceData);
              }
            } catch (parseError) {
              console.error('Error parsing service response JSON:', parseError);
            }
          } else {
            console.error(`Service fetch failed with status: ${serviceResponse.status}`);
            // Try to get response text for more info
            const errorText = await serviceResponse.text();
            console.error('Error response:', errorText);
          }
        } catch (error) {
          console.error(`Failed to fetch details for service ${serviceId}:`, error);
        }
        
        console.log('Returning base task without service details:', task);
        return task;
      }));
      
      // Filter out null tasks
      const validTasks = processedTasks.filter(task => task !== null);
      console.log('All processed tasks:', validTasks);
      
      setAssignedTasks(validTasks);
    } catch (err) {
      console.error("Error processing assignments:", err);
      setError('Failed to load your assignments. Please try refreshing.');
    }
  };

  const refreshData = () => {
    setRefreshing(true);
    loadAgentData();
    setTimeout(() => setRefreshing(false), 1000); // Visual feedback
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/agent-login');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Filter tasks based on status and type
  const getFilteredTasks = () => {
    const statusFiltered = assignedTasks.filter(task => 
      showCompletedTasks 
        ? (task.status === 'completed' || task.status === 'cancelled')
        : (task.status === 'pending' || task.status === 'in_progress')
    );
    
    if (filterType === 'all') {
      return statusFiltered;
    }
    
    return statusFiltered.filter(task => 
      task.serviceType === filterType
    );
  };

  const activeTasks = assignedTasks.filter(task => 
    task.status === 'pending' || task.status === 'in_progress'
  );
  
  const completedTasks = assignedTasks.filter(task => 
    task.status === 'completed' || task.status === 'cancelled'
  );

  // Tasks to display after applying filters
  const tasksToDisplay = getFilteredTasks();

  // Get unique service types for filter
  const serviceTypes = [...new Set(assignedTasks.map(task => task.serviceType))];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <MobileHeader toggleSidebar={toggleSidebar} profile={agentProfile} />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed to show on desktop */}
      <div className="hidden md:block md:w-64 md:min-h-screen md:sticky md:top-0 md:h-screen">
        <AgentSidebar 
          agentProfile={agentProfile} 
          handleLogout={handleLogout} 
          sidebarOpen={true}
          closeSidebar={() => {}}
          assignedTasks={assignedTasks}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <AgentSidebar 
          agentProfile={agentProfile} 
          handleLogout={handleLogout} 
          sidebarOpen={sidebarOpen}
          closeSidebar={closeSidebar}
          assignedTasks={assignedTasks}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <DashboardHeader agentProfile={agentProfile} error={error} />

          {/* Stats Cards with animation */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <StatsCards 
              stats={stats} 
              loading={loading} 
              activeTasks={activeTasks} 
              completedTasks={completedTasks} 
            />
          </motion.div>

          {/* Tasks Section */}
          <TasksSection 
            showCompletedTasks={showCompletedTasks}
            setShowCompletedTasks={setShowCompletedTasks}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filterType={filterType}
            setFilterType={setFilterType}
            refreshData={refreshData}
            refreshing={refreshing}
            loading={loading}
            tasksToDisplay={tasksToDisplay}
            serviceTypes={serviceTypes}
            formatDateTime={formatDateTime}
            formatPhoneNumber={formatPhoneNumber}
            getStatusColor={getStatusColor}
            getServiceIcon={getServiceIcon}
          />
        </div>
      </main>
    </div>
  );
};

export default AgentDashboard;

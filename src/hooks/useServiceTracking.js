import { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../utils/auth';

const useServiceTracking = (serviceId = null) => {
  const [services, setServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getBaseUrl = () => {
    const isDevelopment = import.meta.env.MODE === 'development';
    return isDevelopment 
      ? 'http://localhost:5000/api'
      : 'https://saralbe.vercel.app/api';
  };

  const formatServiceData = (service) => {
    if (!service) return null;

    // Debug log
    console.log('Formatting raw service data:', service);

    return {
      _id: service._id,
      serviceType: service.serviceType || '',
      userPhone: service.userPhone || '',
      status: service.status || 'APPROVAL_PENDING',
      progress: service.progress || 'PENDING',
      
      // Required fields with fallbacks
      date: service.date || null,
      timeSlot: service.timeSlot || '',
      address: service.address || '',
      bankAccount: service.bankAccount || '',
      ifscCode: service.ifscCode || '',
      bankName: service.bankName || '',
      amount: typeof service.amount === 'number' ? service.amount : 0,
      
      // Optional service-specific fields
      documentType: service.documentType || '',
      assistanceMode: service.assistanceMode || '',
      pensionAccountNo: service.pensionAccountNo || '',
      accountType: service.accountType || '',
      bankId: service.bankId || '',

      // Assignment details
      assignedAgent: service.assignedAgent || null,
      assignmentDetails: service.assignmentDetails ? {
        assignedAt: service.assignmentDetails.assignedAt || null,
        assignedBy: service.assignmentDetails.assignedBy ? {
          id: service.assignmentDetails.assignedBy.id || '',
          name: service.assignmentDetails.assignedBy.name || '',
          role: service.assignmentDetails.assignedBy.role || ''
        } : null,
        agentInfo: service.assignmentDetails.agentInfo ? {
          name: service.assignmentDetails.agentInfo.name || '',
          phone: service.assignmentDetails.agentInfo.phone || '',
          userId: service.assignmentDetails.agentInfo.userId || ''
        } : null,
        status: service.assignmentDetails.status || 'PENDING'
      } : null,

      // Timestamps
      timestamps: {
        created: service.timestamps?.created || service.createdAt || null,
        approved: service.timestamps?.approved || null,
        agentAssigned: service.timestamps?.agentAssigned || null,
        completed: service.timestamps?.completed || null
      },

      // Additional fields
      statusHistory: (service.statusHistory || []).map(history => ({
        status: history.status || '',
        timestamp: history.timestamp || null,
        updatedBy: {
          id: history.updatedBy?.id || '',
          name: history.updatedBy?.name || '',
          role: history.updatedBy?.role || ''
        },
        notes: history.notes || '',
        _id: history._id || ''
      })),

      notes: service.notes || '',
      description: service.description || '',
      attachments: service.attachments || [],
      createdAt: service.createdAt || null,
      updatedAt: service.updatedAt || null
    };
  };

  const fetchServiceDetails = async (id, config) => {
    const baseUrl = getBaseUrl();
    try {
      const { data } = await axios.get(`${baseUrl}/services/${id}`, {
        ...config,
        params: {
          populate: 'assignedAgent,statusHistory'
        }
      });
      
      console.log('Raw service data:', data);
      return formatServiceData(data?.service || data);
    } catch (error) {
      console.error('Error fetching service details:', error);
      throw error;
    }
  };

  const fetchServices = async (userPhone, config) => {
    const baseUrl = getBaseUrl();
    try {
      // Check if admin token exists
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        // Fetch all services for admin
        const { data } = await axios.get(`${baseUrl}/services/all`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        return data?.data || [];
      }

      // Regular user service fetch
      const { data } = await axios.get(`${baseUrl}/services`, {
        ...config,
        params: { 
          userPhone,
          includeDetails: true,
          includeAssignment: true,
          includeHistory: true,
          includeAgent: true
        }
      });

      const services = data?.services || data?.data || [];
      return services.map(formatServiceData);
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const checkAuthAndFetchData = async () => {
      if (!auth.isSessionValid()) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        const userData = auth.getUserData();
        const token = auth.getToken();

        if (!userData?.phone) {
          throw new Error('User phone number not found');
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        const userPhone = userData.phone.replace(/[^0-9]/g, '');
        
        let servicesData;
        
        if (serviceId) {
          const serviceData = await fetchServiceDetails(serviceId, config);
          if (mounted) {
            setServiceDetails(serviceData);
            servicesData = [serviceData];
          }
        } else {
          servicesData = await fetchServices(userPhone, config);
        }

        if (mounted && servicesData) {
          console.log('Processed services:', servicesData);
          setServices(servicesData);
        }
      } catch (err) {
        console.error('Service tracking error:', err);
        if (mounted) {
          setError(err.response?.data?.message || 'Failed to fetch services');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuthAndFetchData();
    
    return () => { mounted = false; };
  }, [serviceId]);

  const refreshServices = async () => {
    setLoading(true);
    setError(null);
    const userData = auth.getUserData();
    if (userData?.phone) {
      console.log('Refreshing services for phone:', userData.phone);
      try {
        const token = auth.getToken();
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        const servicesData = await fetchServices(userData.phone, config);
        setServices(servicesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return { services, serviceDetails, loading, error, refreshServices };
};

export default useServiceTracking;

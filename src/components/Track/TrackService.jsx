import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Calendar, MapPin, Phone, User, FileText, AlertCircle, ArrowLeft, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import useUserServices from '../../hooks/useUserServices';
import useServiceTracking from '../../hooks/useServiceTracking';
import DashboardLayout from '../Dashboard/DashboardLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/index";

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'APPROVAL_PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles()}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const ProgressTimeline = ({ history }) => {
  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
            {index < history.length - 1 && <div className="w-0.5 h-full bg-gray-200" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{item.status.replace(/_/g, ' ')}</p>
            <p className="text-xs text-gray-500">
              {new Date(item.timestamp).toLocaleString()}
            </p>
            {item.notes && (
              <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const ServiceList = ({ services, onServiceSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services.filter(service => 
    service.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-4">
      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-600">
          Total Services: {services.length}
        </div>
      </div>

      {/* Services Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time Slot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No services found
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow 
                  key={service.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="font-medium">
                    {service.id}
                  </TableCell>
                  <TableCell>
                    {service.serviceType.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell>
                    {new Date(service.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{service.timeSlot}</TableCell>
                  <TableCell>
                    <StatusBadge status={service.status} />
                  </TableCell>
                  <TableCell>
                    {service.amount ? `₹${service.amount}` : '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {service.address}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const TrackService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { services, loading: servicesLoading, error: servicesError } = useUserServices();
  const { serviceDetails, loading: detailsLoading, error: detailsError } = useServiceTracking();

  const handleServiceSelect = (id) => {
    console.log('Navigating to service:', id);
    navigate(`/track-service/${id}`);
  };

  if (servicesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (servicesError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg font-medium text-gray-900">Error loading services</p>
          <p className="text-gray-600 mb-4">{servicesError}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4">
        {serviceId ? (
          // Show service details
          <div className="space-y-4">
            <button
              onClick={() => navigate('/track-service')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Services
            </button>
            
            {/* Existing service details UI */}
            {detailsLoading ? (
              <div className="flex items-center justify-center h-[40vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            ) : detailsError ? (
              <div className="text-center text-red-600 p-4">
                {detailsError}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Service Header */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Service Request #{serviceDetails?.id}
                      </h1>
                      <p className="text-gray-600">
                        {serviceDetails?.serviceType.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <StatusBadge status={serviceDetails?.status} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Service Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Service Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            {new Date(serviceDetails?.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{serviceDetails?.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{serviceDetails?.address}</span>
                        </div>
                        {serviceDetails?.amount && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">₹{serviceDetails.amount}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Agent Details (if assigned) */}
                    {serviceDetails?.assignedAgent && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Agent Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{serviceDetails.assignedAgent.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{serviceDetails.assignedAgent.phone}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Progress Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressTimeline history={serviceDetails?.statusHistory || []} />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          // Show services list
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Services</h1>
            <ServiceList 
              services={services} 
              onServiceSelect={handleServiceSelect}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrackService;

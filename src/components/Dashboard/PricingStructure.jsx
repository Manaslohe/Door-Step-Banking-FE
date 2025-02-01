import React from 'react';
import { DollarSign } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const PricingStructure = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-blue-900">Pricing Structure</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-blue-800">Service Charges</h2>
              <div className="grid gap-4">
                {[
                  { service: "Cash Deposit", charge: "₹100/visit" },
                  { service: "Cash Withdrawal", charge: "₹150/visit" },
                  { service: "Cheque Collection", charge: "₹50/cheque" },
                  { service: "Document Collection", charge: "₹200/visit" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between p-4 border-b border-blue-100">
                    <span>{item.service}</span>
                    <span className="font-medium text-blue-700">{item.charge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PricingStructure;

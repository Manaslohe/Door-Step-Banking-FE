import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Register from './components/Login/Register'
import Dashboard from './components/Dashboard'
import ServicesOffered from './components/Dashboard/ServicesOffered'
import UserDashboard from './components/Dashboard/UserDashboard'
import BlogForum from './components/Dashboard/BlogForum'
import Support from './components/Dashboard/Support'
import RBIGuidelines from './components/Dashboard/RBIGuidelines'
import PricingStructure from './components/Dashboard/PricingStructure'
import CashDeposit from './components/Services/CashDeposit';
import CashWithdrawal from './components/Services/CashWithdrawal';
import NewAccount from './components/Services/NewAccount';
import DocumentService from './components/Services/DocumentService';
import LifeCertificate from './components/Services/LifeCertificate';
import OnlineAssistance from './components/Services/OnlineAssistance';
import { TranslationProvider } from './context/TranslationContext';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import AgentLogin from './components/Agent/AgentLogin';
import AgentDashboard from './components/Agent/AgentDashboard';
import ManageAgents from './components/Admin/ManageAgents';

const App = () => {
  return (
    <TranslationProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/agent-login" element={<AgentLogin />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services-offered" element={<ServicesOffered />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/blog-forum" element={<BlogForum />} />
            <Route path="/support" element={<Support />} />
            <Route path="/rbi-guidelines" element={<RBIGuidelines />} />
            <Route path="/pricing-structure" element={<PricingStructure />} />
            <Route path="/services/cash-deposit" element={<CashDeposit />} />
            <Route path="/services/cash-withdrawal" element={<CashWithdrawal />} />
            <Route path="/services/new-account" element={<NewAccount />} />
            <Route path="/services/document-service" element={<DocumentService />} />
            <Route path="/services/life-certificate" element={<LifeCertificate />} />
            <Route path="/services/online-assistance" element={<OnlineAssistance />} />
          </Route>

          {/* Admin protected routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-agents" element={<ManageAgents />} />

          {/* Agent protected routes */}
          <Route path="/agent/dashboard" element={<AgentDashboard />} />

          {/* Catch all route - redirect to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </TranslationProvider>
  )
}

// Updated ProtectedRoute component using Outlet
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');

  if (!token || !userData) {
    localStorage.clear(); // Clear any partial data
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default App

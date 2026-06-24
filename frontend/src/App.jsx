// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React from 'react';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import useSocket from './hooks/useSocket';

import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './admin/components/AdminPrivateRoute';
import AdminLayout from './admin/components/AdminLayout';
import DeptLayout from './admin/components/DeptLayout';

// ── Legacy admin pages ─────────────────────────────────────────────────────
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Bookings from './pages/Bookings';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Consultations from './pages/Consultations';
import Revenue from './pages/Revenue';
import Settings from './pages/Settings';
import DeptStaff from './pages/DeptStaff';
import AdminChatControl from './pages/AdminChatControl';
import AdminRevenueDashboard from './pages/AdminRevenueDashboard';

// ── Public pages ───────────────────────────────────────────────────────────
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';
import Calculator from './pages/Calculator';
import ConsultLanding from './pages/ConsultLanding';
import ConsultBook from './pages/ConsultBook';
import PublicServices from './pages/PublicServices';
import Contact from './pages/Contact';
import TrackTicket from './pages/TrackTicket';
import SessionsPage from './admin/pages/playstation/Sessions';
import PublicWebPortal from './pages/PublicWebPortal';
import HelpDesk from './pages/HelpDesk';

// ── Department specific pages ──────────────────────────────────────────────
import JobCards from './admin/pages/repair/JobCards'; // Import the JobCards page


// ── Public layouts ─────────────────────────────────────────────────────────
import PublicLayout from './layouts/PublicLayout';



// ── Admin components ───────────────────────────────────────────────────────
import { SuperAdminLayout } from './admin/pages/super/SuperDashboard';
import SuperDashboard from './admin/pages/super/SuperDashboard';
import UserManagement from './admin/pages/super/UserManagement';
import Soon from './admin/components/Soon';
import InventoryPage from './admin/pages/shared/InventoryPage';
import TicketsPage from './admin/pages/shared/TicketsPage';
import StaffPortalAdmin from './admin/pages/shared/StaffPortalAdmin';
import MessagesPage from './admin/pages/shared/MessagesPage';
import StaffInvitation from './admin/pages/shared/StaffInvitation';
import CRMPage from './admin/pages/shared/CRMPage'; // Import the enhanced CRM page
import BillingPage from './admin/pages/shared/BillingPage'; // Import the enhanced Billing page

// ── Staff & Client portals ─────────────────────────────────────────────────
import StaffDashboard from './pages/staff/StaffDashboard';
import ClientPortal from './pages/client/ClientPortal';

// ── Staff invitation page ──────────────────────────────────────────────────
import SetPassword from './pages/staff/SetPassword';

// ── Callbacks page ─────────────────────────────────────────────────────────
import Callbacks from './pages/Callbacks';

// ── Chat widget (public only) ──────────────────────────────────────────────
import ChatWidget from './components/ChatWidget';

import DBStatusBanner from './components/DBStatusBanner';
import { Spinner } from './components/UI';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function RedirectToAppropriatePage() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/store" replace />;
}

function ConditionalChatWidget() {
  const location = useLocation();

  // Hide the customer-facing widget on admin/staff/client areas,
  // plus any admin chat UI routes (chat overlays/modals).
  const isNonPublicRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/client') ||
    location.pathname === '/chat'; // Also hide on dedicated chat route

  if (isNonPublicRoute) return null;
  return <ChatWidget isAdmin={false} />;
}

export default function App() {
  // Initialize global socket connection
  useSocket();

  return (
    <div data-testid="app-container">
      <BrowserRouter>
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              <ScrollToTop />
              <DBStatusBanner />

              <Routes>
                {/* ── Public pages ── */}
                {/* NOTE: public /services must be registered before legacy admin routes */}
                <Route path="/services" element={<PublicServices />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Login />} />
                <Route path="/forgot" element={<Login />} />
                <Route path="/reset/:token" element={<Login />} />
                <Route path="/verify/:token" element={<Login />} />
                <Route path="/403" element={<div>Access Denied</div>} />
                <Route path="/404" element={<div>Page Not Found</div>} />
                <Route path="/500" element={<div>Server Error</div>} />
                <Route path="/maintenance" element={<div>Maintenance Mode</div>} />
                <Route path="/offline" element={<div>Offline</div>} />
                <Route path="/legal" element={<div>Legal</div>} />
                <Route path="/contact" element={<Contact />} />

                {/* ── Direct support chat route ── */}
                <Route path="/chat" element={<MessagesPage />} />

                {/* ── Callbacks route ── */}
                <Route path="/callbacks" element={<Callbacks />} />

                {/* ── Staff password setup ── */}
                <Route path="/staff/set-password" element={<SetPassword />} />

                {/* ── Admin entry ── */}
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

                {/* ── Legacy admin routes ── */}
                <Route element={<AdminLayout />}>
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
                  <Route path="/services" element={<PrivateRoute><Services /></PrivateRoute>} />
                  <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
                  <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
                  <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                  <Route path="/consultations" element={<PrivateRoute><Consultations /></PrivateRoute>} />
                  <Route path="/revenue" element={<PrivateRoute><Revenue /></PrivateRoute>} />
                  <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                  <Route path="/staff-accounts" element={<PrivateRoute><DeptStaff /></PrivateRoute>} />
                  <Route path="/admin/chat-control" element={<PrivateRoute><AdminChatControl /></PrivateRoute>} />
                  <Route path="/admin/revenue" element={<PrivateRoute><AdminRevenueDashboard /></PrivateRoute>} />
                </Route>

                {/* ── Super Admin ── */}
                <Route path="/admin/super" element={<AdminPrivateRoute><SuperAdminLayout /></AdminPrivateRoute>}>
                  <Route index element={<SuperDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="email" element={<Soon label="Email Allocation" />} />
                  <Route path="finance" element={<Soon label="Finance" />} />
                  <Route path="tickets" element={<TicketsPage color="#ff3366" />} />
                  <Route path="inventory" element={<InventoryPage color="#00d4ff" />} />
                  <Route path="audit" element={<Soon label="Audit Log" />} />
                  <Route path="broadcast" element={<Soon label="Broadcast" />} />
                  <Route path="settings" element={<Soon label="System Settings" />} />
                  <Route path="chat" element={<MessagesPage />} />
                  <Route path="staff-invitation" element={<StaffInvitation color="#a78bfa" />} />
                </Route>

                {/* ── Departments ── */}
                <Route path="/admin/internet" element={<DeptLayout slug="internet" title="Internet Distribution" />}>
                  <Route index element={<Soon label="Internet Distribution" />} />
                  <Route path="clients" element={<Soon label="ISP Clients" />} />
                  <Route path="transactions" element={<Soon label="Transactions" />} />
                  <Route path="crm" element={<CRMPage color="#00d4ff" />} /> {/* Changed from Soon to CRMPage */}
                  <Route path="billing" element={<BillingPage color="#00d4ff" />} /> {/* Changed from Soon to BillingPage */}
                  <Route path="inventory" element={<InventoryPage color="#00d4ff" />} />
                  <Route path="tickets" element={<TicketsPage color="#00d4ff" />} />
                  <Route path="staff-portal" element={<StaffPortalAdmin color="#00d4ff" />} />
                  <Route path="staff" element={<StaffInvitation color="#00d4ff" />} />
                  <Route path="expenses" element={<Soon label="Expenses" />} />
                  <Route path="audit" element={<Soon label="Audit Log" />} />
                  <Route path="settings" element={<Soon label="Settings" />} />
                  <Route path="chat" element={<MessagesPage />} />
                  <Route path="staff-invitation" element={<StaffInvitation color="#00d4ff" />} />
                </Route>

                <Route path="/admin/webdev" element={<DeptLayout slug="webdev" title="Web Development" />}>
                  <Route index element={<Soon label="Web Development" />} />
                  <Route path="projects" element={<Soon label="Projects" />} />
                  <Route path="transactions" element={<Soon label="Transactions" />} />
                  <Route path="crm" element={<CRMPage color="#a78bfa" />} /> {/* Changed from Soon to CRMPage */}
                  <Route path="billing" element={<BillingPage color="#a78bfa" />} /> {/* Changed from Soon to BillingPage */}
                  <Route path="inventory" element={<InventoryPage color="#a78bfa" />} />
                  <Route path="tickets" element={<TicketsPage color="#a78bfa" />} />
                  <Route path="staff-portal" element={<StaffPortalAdmin color="#a78bfa" />} />
                  <Route path="staff" element={<StaffInvitation color="#a78bfa" />} />
                  <Route path="expenses" element={<Soon label="Expenses" />} />
                  <Route path="audit" element={<Soon label="Audit Log" />} />
                  <Route path="settings" element={<Soon label="Settings" />} />
                  <Route path="chat" element={<MessagesPage />} />
                  <Route path="staff-invitation" element={<StaffInvitation color="#a78bfa" />} />
                </Route>

                <Route path="/admin/playstation" element={<DeptLayout slug="playstation" title="PlayStation Arena" />}>
                  <Route index element={<Soon label="PlayStation Arena" />} />
                  <Route path="sessions" element={<SessionsPage />} />

                  <Route path="transactions" element={<Soon label="Transactions" />} />
                  <Route path="crm" element={<CRMPage color="#ffd700" />} /> {/* Changed from Soon to CRMPage */}
                  <Route path="billing" element={<BillingPage color="#ffd700" />} /> {/* Changed from Soon to BillingPage */}
                  <Route path="inventory" element={<InventoryPage color="#ffd700" />} />
                  <Route path="tickets" element={<TicketsPage color="#ffd700" />} />
                  <Route path="staff-portal" element={<StaffPortalAdmin color="#ffd700" />} />
                  <Route path="staff" element={<StaffInvitation color="#ffd700" />} />
                  <Route path="expenses" element={<Soon label="Expenses" />} />
                  <Route path="audit" element={<Soon label="Audit Log" />} />
                  <Route path="settings" element={<Soon label="Settings" />} />
                  <Route path="chat" element={<MessagesPage />} />
                  <Route path="staff-invitation" element={<StaffInvitation color="#ffd700" />} />
                </Route>

                <Route path="/admin/repair" element={<DeptLayout slug="repair" title="Hardware Repair" />}>
                  <Route index element={<Soon label="Hardware Repair" />} />
                  <Route path="jobcards" element={<JobCards />} /> {/* Changed from Soon to JobCards */}
                  <Route path="transactions" element={<Soon label="Transactions" />} />
                  <Route path="crm" element={<CRMPage color="#ff8800" />} /> {/* Changed from Soon to CRMPage */}
                  <Route path="billing" element={<BillingPage color="#ff8800" />} /> {/* Changed from Soon to BillingPage */}
                  <Route path="inventory" element={<InventoryPage color="#ff8800" />} />
                  <Route path="tickets" element={<TicketsPage color="#ff8800" />} />
                  <Route path="staff-portal" element={<StaffPortalAdmin color="#ff8800" />} />
                  <Route path="staff" element={<StaffInvitation color="#ff8800" />} />
                  <Route path="expenses" element={<Soon label="Expenses" />} />
                  <Route path="audit" element={<Soon label="Audit Log" />} />
                  <Route path="settings" element={<Soon label="Settings" />} />
                  <Route path="chat" element={<MessagesPage />} />
                  <Route path="staff-invitation" element={<StaffInvitation color="#ff8800" />} />
                </Route>

                <Route path="/admin/cybersecurity" element={<DeptLayout slug="cybersecurity" title="Cybersecurity" />}>
                  <Route index element={<Soon label="Cybersecurity" />} />
                  <Route path="contracts" element={<Soon label="Contracts" />} />
                  <Route path="transactions" element={<Soon label="Transactions" />} />
                  <Route path="crm" element={<CRMPage color="#ff3366" />} /> {/* Changed from Soon to CRMPage */}
                  <Route path="billing" element={<BillingPage color="#ff3366" />} /> {/* Changed from Soon to BillingPage */}
                  <Route path="inventory" element={<InventoryPage color="#ff3366" />} />
                  <Route path="tickets" element={<TicketsPage color="#ff3366" />} />
                  <Route path="staff-portal" element={<StaffPortalAdmin color="#ff3366" />} />
                  <Route path="staff" element={<StaffInvitation color="#ff3366" />} />
                  <Route path="expenses" element={<Soon label="Expenses" />} />
                  <Route path="audit" element={<Soon label="Audit Log" />} />
                  <Route path="settings" element={<Soon label="Settings" />} />
                  <Route path="chat" element={<MessagesPage />} />
                  <Route path="staff-invitation" element={<StaffInvitation color="#ff3366" />} />
                </Route>

                <Route path="/admin/govadmin" element={<DeptLayout slug="govadmin" title="Gov Admin Assistance" />}>
                  <Route index element={<Soon label="Gov Admin Assistance" />} />
                  <Route path="govdocs" element={<Soon label="Documents" />} />
                  <Route path="transactions" element={<Soon label="Transactions" />} />
                  <Route path="crm" element={<CRMPage color="#00ff88" />} /> {/* Changed from Soon to CRMPage */}
                  <Route path="billing" element={<BillingPage color="#00ff88" />} /> {/* Changed from Soon to BillingPage */}
                  <Route path="inventory" element={<InventoryPage color="#00ff88" />} />
                  <Route path="tickets" element={<TicketsPage color="#00ff88" />} />
                  <Route path="staff-portal" element={<StaffPortalAdmin color="#00ff88" />} />
                  <Route path="staff" element={<StaffInvitation color="#00ff88" />} />
                  <Route path="expenses" element={<Soon label="Expenses" />} />
                  <Route path="audit" element={<Soon label="Audit Log" />} />
                  <Route path="settings" element={<Soon label="Settings" />} />
                  <Route path="chat" element={<MessagesPage />} />
                  <Route path="staff-invitation" element={<StaffInvitation color="#00ff88" />} />
                </Route>

                {/* ── Staff Portal ── */}
                <Route path="/staff/:slug/dashboard" element={<StaffDashboard />} />
                <Route path="/staff" element={<Navigate to="/login" replace />} />

                {/* ── Client Portal ── */}
                <Route path="/client/:slug" element={<ClientPortal />} />
                <Route path="/client" element={<Navigate to="/" replace />} />

                {/* ── Public store ── */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<RedirectToAppropriatePage />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/store/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-status" element={<OrderStatus />} />
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/consult" element={<ConsultLanding />} />
                  <Route path="/consult/book" element={<ConsultBook />} />
                  <Route path="/services" element={<PublicServices />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/help" element={<HelpDesk />} />
                  <Route path="/track" element={<TrackTicket />} />
                  <Route path="/client/portal/:projectToken" element={<PublicWebPortal />} />
                </Route>
              </Routes>

              <ConditionalChatWidget />
              <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
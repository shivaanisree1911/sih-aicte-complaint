import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { PublicComplaintPage } from './pages/PublicComplaintPage';
import { PublicTrackingPage } from './pages/PublicTrackingPage';
import { DashboardPage } from './pages/DashboardPage';
import { InstitutionListPage } from './pages/InstitutionListPage';
import { InstitutionDetailPage } from './pages/InstitutionDetailPage';
import { ComplaintListPage } from './pages/ComplaintListPage';
import { CreateComplaintPage } from './pages/CreateComplaintPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { OverlapMonitoringPage } from './pages/OverlapMonitoringPage';
import { OverlapDetailPage } from './pages/OverlapDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { ROLES } from './utils/constants';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/lodge-complaint" element={<PublicComplaintPage />} />
            <Route path="/track-complaint" element={<PublicTrackingPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Authenticated Application Shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              <Route path="institutions" element={<InstitutionListPage />} />
              <Route path="institutions/:id" element={<InstitutionDetailPage />} />
              
              <Route path="complaints" element={<ComplaintListPage />} />
              <Route path="complaints/new" element={<CreateComplaintPage />} />
              <Route path="complaints/:id" element={<ComplaintDetailPage />} />
              
              <Route path="overlaps" element={<OverlapMonitoringPage />} />
              <Route path="overlaps/:id" element={<OverlapDetailPage />} />
              
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              
              {/* Role Protected Admin Routes */}
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.AUDITOR]}>
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="profile" element={<UserProfilePage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

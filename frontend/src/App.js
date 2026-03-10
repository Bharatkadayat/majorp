import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import VerifyPage from './pages/public/VerifyPage';
import CertificateDetailsPage from './pages/public/CertificateDetailsPage';

// Institute Pages
import InstituteLayout from './pages/institute/InstituteLayout';
import InstituteDashboard from './pages/institute/InstituteDashboard';
import UploadCertificate from './pages/institute/UploadCertificate';
import ManageRecords from './pages/institute/ManageRecords';
import InstituteAnalytics from './pages/institute/AnalyticsDashboard';
import InstituteProfile from './pages/institute/InstituteProfile';
import SuccessPage from './pages/institute/SuccessPage';
import BatchIssuePage from './pages/institute/BatchIssuePage';
import StudentRegistryPage from './pages/institute/StudentRegistryPage';
import StudentRegistrySavedPage from './pages/institute/StudentRegistrySavedPage';

// Student Pages
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentRecords from './pages/student/StudentRecords';
import StudentShare from './pages/student/StudentShare';
import StudentProfile from './pages/student/StudentProfile';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageInstitutions from './pages/admin/ManageInstitutions';
import RegisterInstitute from './pages/admin/RegisterInstitute';
import SystemSettings from './pages/admin/SystemSettings';
import SecurityCenter from './pages/admin/SecurityCenter';
import AdminAnalytics from './pages/admin/AnalyticsDashboard';
import AdminProfile from './pages/admin/AdminProfile';
import InstitutionDetails from './pages/admin/InstitutionDetails';
import WebsiteContent from './pages/admin/WebsiteContent';
import RoleGuard from './components/RoleGuard';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/certificate/:id" element={<AuthGuard><CertificateDetailsPage /></AuthGuard>} />
        <Route path="/site-content" element={<WebsiteContent />} />

        {/* Institute Routes */}
        <Route path="/institute" element={<RoleGuard expectedRole="institute"><InstituteLayout /></RoleGuard>}>
          <Route index element={<Navigate to="/institute/dashboard" replace />} />
          <Route path="dashboard" element={<InstituteDashboard />} />
          <Route path="upload" element={<UploadCertificate />} />
          <Route path="students" element={<StudentRegistryPage />} />
          <Route path="students/saved" element={<StudentRegistrySavedPage />} />
          <Route path="batch" element={<BatchIssuePage />} />
          <Route path="records" element={<ManageRecords />} />
          <Route path="analytics" element={<InstituteAnalytics />} />
          <Route path="profile" element={<InstituteProfile />} />
          <Route path="success" element={<SuccessPage />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<RoleGuard expectedRole="student"><StudentLayout /></RoleGuard>}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="records" element={<StudentRecords />} />
          <Route path="share" element={<StudentShare />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<RoleGuard expectedRole="admin"><AdminLayout /></RoleGuard>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="institutions" element={<ManageInstitutions />} />
          <Route path="register-institute" element={<RegisterInstitute />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="security" element={<SecurityCenter />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="site-content" element={<WebsiteContent />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="institutions/:address" element={<InstitutionDetails />} />
        </Route>

        {/* 404 - Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/app-layout";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/superadmin/AdminLogin";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Inquiry from "@/pages/Inquiry";
import Customers from "@/pages/Customers";
import NotFound from "@/pages/NotFound";

import PrivateRoute from "./PrivateRoute";
import SuperadminDashboard from "@/pages/superadmin/Dashboard";
import StaffPage from "@/pages/Staff";
import ImportInquiry from "@/pages/ImportInquiry";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/superadmin/login" element={<AdminLogin />} />
          <Route path="/superadmin-dashboard" element={
            <PrivateRoute>
              <SuperadminDashboard />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="inquiries/new" element={<Inquiry />} />
            <Route path="inquiries/import" element={<ImportInquiry />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

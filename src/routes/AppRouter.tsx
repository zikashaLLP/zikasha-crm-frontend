import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/app-layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Inquiry from "@/pages/Inquiry";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inquiries/new" element={<Inquiry />} />
            <Route path="settings" element={<Settings />} />
          </Route>
      </Routes>
    </BrowserRouter>
  );
}

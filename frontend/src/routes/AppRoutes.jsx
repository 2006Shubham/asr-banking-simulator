import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Route Guard
import ProtectedRoute from "./ProtectedRoute";

// Public Pages
import HomePage from "../pages/public/HomePage";
import ProductsPage from "../pages/public/ProductsPage";
import AboutPage from "../pages/public/AboutPage";
import ContactPage from "../pages/public/ContactPage";

// Auth Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// Customer Dashboard Pages
import OverviewPage from "../pages/dashboard/OverviewPage";
import AccountsPage from "../pages/dashboard/AccountsPage";
import TransactionsPage from "../pages/dashboard/TransactionsPage";
import LoansPage from "../pages/dashboard/LoansPage";
import FDPage from "../pages/dashboard/FDPage";
import CardsPage from "../pages/dashboard/CardsPage";
import ProfilePage from "../pages/dashboard/ProfilePage";
import CustomerInquiriesPage from "../pages/customer/CustomerInquiriesPage";

// Employee Pages
import EmployeeDashboardPage from "../pages/employee/EmployeeDashboardPage";
import EmployeeInquiriesPage from "../pages/employee/EmployeeInquiriesPage";
import EmployeeCustomerLookupPage from "../pages/employee/EmployeeCustomerLookupPage";
import EmployeeProfilePage from "../pages/employee/EmployeeProfilePage";

// Manager Pages
import ManagerDashboardPage from "../pages/manager/ManagerDashboardPage";
import ManagerInquiriesPage from "../pages/manager/ManagerInquiriesPage";
import ManagerEmployeesPage from "../pages/manager/ManagerEmployeesPage";
import ManagerReportsPage from "../pages/manager/ManagerReportsPage";
import ManagerProfilePage from "../pages/manager/ManagerProfilePage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected NetBanking Customer Portal */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Customer", "Admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<OverviewPage />} />
          <Route path="/dashboard/accounts" element={<AccountsPage />} />
          <Route path="/dashboard/transactions" element={<TransactionsPage />} />
          <Route path="/dashboard/loans" element={<LoansPage />} />
          <Route path="/dashboard/fd" element={<FDPage />} />
          <Route path="/dashboard/cards" element={<CardsPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/customer/inquiries" element={<CustomerInquiriesPage />} />
        </Route>

        {/* Protected Employee Workspace */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Employee", "Admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
          <Route path="/employee/inquiries" element={<EmployeeInquiriesPage />} />
          <Route path="/employee/customers" element={<EmployeeCustomerLookupPage />} />
          <Route path="/employee/profile" element={<EmployeeProfilePage />} />
        </Route>

        {/* Protected Branch Manager Workspace */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Manager", "Admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
          <Route path="/manager/inquiries" element={<ManagerInquiriesPage />} />
          <Route path="/manager/employees" element={<ManagerEmployeesPage />} />
          <Route path="/manager/reports" element={<ManagerReportsPage />} />
          <Route path="/manager/profile" element={<ManagerProfilePage />} />
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

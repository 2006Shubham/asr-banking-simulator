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

// Auth Page
import LoginPage from "../pages/auth/LoginPage";

// Dashboard Pages
import OverviewPage from "../pages/dashboard/OverviewPage";
import AccountsPage from "../pages/dashboard/AccountsPage";
import TransactionsPage from "../pages/dashboard/TransactionsPage";
import LoansPage from "../pages/dashboard/LoansPage";
import FDPage from "../pages/dashboard/FDPage";
import CardsPage from "../pages/dashboard/CardsPage";
import ProfilePage from "../pages/dashboard/ProfilePage";

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

        {/* Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected NetBanking Customer Portal */}
        <Route
          element={
            <ProtectedRoute>
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
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

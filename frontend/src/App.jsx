// File Path: frontend/src/App.jsx
import React, { useState } from "react";
import { Toaster } from "./components/ui/toaster";
import useAuthStore from "./store/authStore";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserManagementPage from "./pages/UserManagementPage";

function App() {
  const { user, logout } = useAuthStore();
  
  const [authPage, setAuthPage] = useState("login");
  const [mainView, setMainView] = useState("dashboard"); // 'dashboard' or 'users'

  const navigate = (page) => {
    if (page === "logout") {
      logout();
      setAuthPage("login");
      setMainView("dashboard"); // Reset view on logout
    } else if (page === 'login' || page === 'register') {
      setAuthPage(page);
    } else {
      setMainView(page);
    }
  };
  
  const renderMainContent = () => {
    if (!user) {
      return authPage === "login" ? (
        <LoginPage navigate={navigate} />
      ) : (
        <RegisterPage navigate={navigate} />
      );
    }
    
    if (mainView === 'users' && user.role === 'admin') {
      return <UserManagementPage />;
    }
    
    // Default to dashboard
    return <DashboardPage />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Navbar user={user} navigate={navigate} currentView={mainView} />
      <main className="p-4 sm:p-6 lg:p-6 max-w-7xl mx-auto">
        {renderMainContent()}
      </main>
      <Toaster />
    </div>
  );
}

export default App;

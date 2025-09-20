// File Path: frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import useAuthStore from "./store/authStore";
import useCartStore from "./store/cartStore";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserManagementPage from "./pages/UserManagementPage";
import { CartDialog } from "./components/CartDialog";

function App() {
  const { user, logout } = useAuthStore();
  const { getCart, clearCart } = useCartStore();
  
  const [authPage, setAuthPage] = useState("login");
  const [mainView, setMainView] = useState("dashboard");
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (user) {
      getCart();
    } else {
      clearCart();
    }
  }, [user, getCart, clearCart]);

  const handleLogout = () => {
    logout();
    setAuthPage("login");
    setMainView("dashboard");
  };

  const navigate = (page) => {
    if (page === "logout") {
      handleLogout();
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
    
    return <DashboardPage />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Navbar user={user} navigate={navigate} currentView={mainView} onCartClick={() => setIsCartOpen(true)} />
      <main className="p-4 sm:p-6 lg:p-6 max-w-7xl mx-auto">
        {renderMainContent()}
      </main>
      <CartDialog open={isCartOpen} onOpenChange={setIsCartOpen} />
      <Toaster />
    </div>
  );
}

export default App;
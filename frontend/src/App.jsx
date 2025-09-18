// File Path: frontend/src/App.jsx
import React, { useState } from "react";
import { Toaster } from "./components/ui/toaster";
import  useAuthStore  from "./store/authStore";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  const { user, logout } = useAuthStore();
  
  // This state will now only toggle between 'login' and 'register' when logged out.
  const [authPage, setAuthPage] = useState("login");

  const navigate = (page) => {
    if (page === "logout") {
      logout();
      // After logout, always default to the login page.
      setAuthPage("login"); 
    } else {
      // Used for switching between login/register forms.
      setAuthPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Pass user and navigate directly to Navbar */}
      <Navbar user={user} navigate={navigate} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* The rendering logic is now directly tied to the presence of the user object. */}
        {user ? (
          // DashboardPage no longer needs navigate prop
          <DashboardPage />
        ) : (
          authPage === "login" ? (
            <LoginPage navigate={navigate} />
          ) : (
            <RegisterPage navigate={navigate} />
          )
        )}
      </main>
      <Toaster />
    </div>
  );
}

export default App;


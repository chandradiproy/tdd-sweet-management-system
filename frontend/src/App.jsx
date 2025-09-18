// File Path: client/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Placeholder Pages - We will create these next
const LoginPage = () => <div className="text-center p-8">Login Page Placeholder</div>;
const RegisterPage = () => <div className="text-center p-8">Register Page Placeholder</div>;
const DashboardPage = () => <div className=" text-center p-8">Dashboard Page Placeholder</div>;
const NotFoundPage = () => <div className="text-center p-8">404 - Page Not Found</div>;

function App() {
  return (
    <div className="min-h-screen font-sans">
      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

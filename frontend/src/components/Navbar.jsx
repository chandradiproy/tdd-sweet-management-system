// File Path: frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { LogOut, UserPlus, LogIn, Moon, Sun, Menu, X, Candy } from 'lucide-react';

const Navbar = ({ user, navigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  const navItems = user
    ? [{ label: "Logout", icon: LogOut, action: () => navigate("logout") }]
    : [
        { label: "Login", icon: LogIn, action: () => navigate("login") },
        { label: "Register", icon: UserPlus, action: () => navigate("register") },
      ];

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('dashboard')}>
             <Candy className="h-8 w-8 text-pink-500" />
            <span className="ml-2 font-bold text-xl text-gray-800 dark:text-white">SweetScape</span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
                <Button key={item.label} variant="ghost" onClick={item.action}>
                    <item.icon className="mr-2 h-4 w-4" /> {item.label}
                </Button>
            ))}
             <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
             </Button>
          </div>
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
             </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {navItems.map((item) => (
                <Button key={item.label} variant="ghost" className="w-full justify-start" onClick={() => { item.action(); setIsMenuOpen(false); }}>
                    <item.icon className="mr-2 h-4 w-4" /> {item.label}
                </Button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


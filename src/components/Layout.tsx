import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { signIn, signOut } from '../firebase';
import { Home, BookOpen, Clock, Book, Bot, LogOut, Settings as SettingsIcon, Baby, Syringe } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Tổng quan', path: '/', icon: Home },
    { name: 'Lịch EASY', path: '/easy', icon: Clock },
    { name: 'Tiêm chủng', path: '/vaccines', icon: Syringe },
    { name: 'Kiến thức', path: '/knowledge', icon: BookOpen },
    { name: 'Nhật ký', path: '/diary', icon: Book },
    { name: 'Trợ lý AI', path: '/assistant', icon: Bot },
    { name: 'Cài đặt', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="h-screen bg-rose-50 flex flex-col font-sans overflow-hidden pb-[72px] md:pb-0">
      <header className="bg-white border-b border-rose-100 shadow-sm sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Baby className="h-8 w-8 text-rose-500 mr-2" />
              <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
                Nuôi<span className="text-rose-500">Con</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive 
                        ? 'border-rose-500 text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-1 justify-end md:flex-none">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="hidden sm:inline text-sm text-gray-500">{user.email}</span>
                  <button
                    onClick={signOut}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={signIn}
                  className="rounded-md bg-rose-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[72px] pb-[env(safe-area-inset-bottom)] z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 ${
                isActive ? 'text-rose-600 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-rose-50/50' : ''}`} />
              <span className="text-[9px] font-medium leading-none">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

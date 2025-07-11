import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const {
  FiHome,
  FiUsers,
  FiBarChart3,
  FiSettings,
  FiMenu,
  FiX,
  FiDollarSign,
  FiCalendar,
  FiLogOut
} = FiIcons;

// 메뉴 항목 정의
const navigation = [
  { name: '대시보드', href: '/', icon: FiHome },
  { name: 'CRM 관리', href: '/crm', icon: FiUsers },
  { name: '영업 캘린더', href: '/calendar', icon: FiCalendar },
  { name: '영업통계', href: '/analytics', icon: FiBarChart3 },
  { name: '매출관리', href: '/revenue', icon: FiDollarSign },
  { name: '설정', href: '/settings', icon: FiSettings },
];

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { profile } = useProfile();
  const { logout } = useAuth();
  const { theme } = useTheme();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
  };

  const getProfileInitials = () => {
    if (profile.name) {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  const isActive = (href) => {
    if (location.pathname === href) return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          <SafeIcon icon={isOpen ? FiX : FiMenu} className="w-6 h-6" />
        </button>
      </div>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-6 bg-primary-600 dark:bg-primary-800 text-white">
            <h1 className="text-xl font-bold">EmotionEngineCRM</h1>
          </div>

          {profile.name && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="프로필" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-600 dark:text-primary-300 font-semibold text-sm">
                      {getProfileInitials()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {profile.name}
                  </p>
                  {profile.position && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {profile.position}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${
                      active
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-r-2 border-primary-500'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }
                  `}
                  aria-current={active ? 'page' : undefined}
                >
                  <SafeIcon icon={item.icon} className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
            >
              <SafeIcon icon={FiLogOut} className="w-5 h-5 mr-3" />
              로그아웃
            </button>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              © 2025 YJM All right reserved
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
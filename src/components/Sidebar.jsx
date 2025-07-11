import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';

const { FiHome, FiUsers, FiBarChart3, FiSettings, FiMenu, FiX, FiDollarSign, FiUser, FiCalendar, FiLogOut } = FiIcons;

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

  // 현재 경로가 메뉴 항목과 일치하는지 확인하는 함수
  const isActive = (href) => {
    // 정확한 경로 매칭 (예: '/calendar'는 '/calendar'와 정확히 일치)
    if (location.pathname === href) return true;
    // 하위 경로 매칭 (예: '/calendar/event/123'는 '/calendar'의 하위 경로)
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-white shadow-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          <SafeIcon icon={isOpen ? FiX : FiMenu} className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Fixed on desktop, slide on mobile */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo - 높이를 header와 동일하게 조정 */}
          <div className="flex items-center justify-center h-16 px-6 bg-primary-600 text-white">
            <h1 className="text-xl font-bold">EmotionEngineCRM</h1>
          </div>

          {/* User Profile Section */}
          {profile.name && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-600 font-semibold text-sm">
                      {getProfileInitials()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile.name}
                  </p>
                  {profile.position && (
                    <p className="text-xs text-gray-500 truncate">
                      {profile.position}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
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
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <SafeIcon icon={FiLogOut} className="w-5 h-5 mr-3" />
              로그아웃
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © 2025 YJM All right reserved
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
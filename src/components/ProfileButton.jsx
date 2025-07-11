import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ProfileModal from './ProfileModal';
import ThemeToggle from './ThemeToggle';

const {
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
} = FiIcons;

function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const menuSections = [
    {
      type: 'profile',
      title: '프로필 관리',
      items: [
        {
          icon: FiUser,
          label: '내 프로필',
          onClick: () => {
            setShowProfileModal(true);
            setIsOpen(false);
          },
          description: '개인정보 및 프로필 설정'
        },
        {
          icon: FiSettings,
          label: '설정',
          onClick: () => {
            navigate('/settings');
            setIsOpen(false);
          },
          description: '시스템 설정 및 보안'
        }
      ]
    },
    {
      type: 'account',
      title: '계정',
      items: [
        {
          icon: FiLogOut,
          label: '로그아웃',
          onClick: handleLogout,
          description: '시스템에서 로그아웃',
          className: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:text-red-400'
        }
      ]
    }
  ];

  const getProfileInitials = () => {
    if (profile.name) {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt="프로필"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-primary-600 dark:text-primary-300 font-semibold">
              {getProfileInitials()}
            </span>
          )}
        </div>
        <SafeIcon
          icon={FiChevronDown}
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-40 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* User Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="프로필"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-600 dark:text-primary-300 font-bold text-xl">
                        {getProfileInitials()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{profile.name || '사용자'}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
                    {profile.position && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">{profile.position}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Sections */}
              <div className="py-2">
                {/* 테마 전환 버튼 추가 */}
                <div className="px-2 mb-2">
                  <ThemeToggle />
                </div>
                
                <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                
                {menuSections.map((section, index) => (
                  section.items.length > 0 && (
                    <div key={section.type} className="px-2">
                      {section.title && (
                        <h5 className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {section.title}
                        </h5>
                      )}
                      <div className="space-y-1">
                        {section.items.map((item, itemIndex) => (
                          <button
                            key={itemIndex}
                            onClick={item.onClick}
                            className={`w-full px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-3 ${item.className || ''}`}
                          >
                            <SafeIcon 
                              icon={item.icon} 
                              className={`w-5 h-5 ${
                                item.className ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
                              }`} 
                            />
                            <div className="flex-1">
                              <span className={`block font-medium ${
                                item.className 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {item.label}
                              </span>
                              {item.description && (
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      {index < menuSections.length - 1 && (
                        <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                      )}
                    </div>
                  )
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ProfileModal */}
      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}

export default ProfileButton;
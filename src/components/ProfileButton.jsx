import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const {
  FiUser,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiMoon,
  FiSun,
  FiChevronRight,
  FiBell,
  FiKey
} = FiIcons;

function ProfileButton() {
  const { profile } = useProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);

  // 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProfileInitials = () => {
    if (profile.name) {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      type: 'section',
      items: [
        {
          icon: FiUser,
          label: '내 프로필',
          onClick: () => navigate('/settings/profile'),
          info: profile.email
        },
      ]
    },
    {
      type: 'section',
      items: [
        {
          icon: FiBell,
          label: '알림 설정',
          onClick: () => navigate('/settings/notifications')
        },
        {
          icon: FiKey,
          label: '보안 설정',
          onClick: () => navigate('/settings/security')
        },
        {
          icon: isDarkMode ? FiSun : FiMoon,
          label: '테마 변경',
          onClick: () => setIsDarkMode(!isDarkMode),
          info: isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'
        }
      ]
    },
    {
      type: 'section',
      items: [
        {
          icon: FiSettings,
          label: '환경설정',
          onClick: () => navigate('/settings')
        },
        {
          icon: FiHelpCircle,
          label: '도움말',
          onClick: () => window.open('https://docs.example.com', '_blank')
        }
      ]
    },
    {
      type: 'section',
      items: [
        {
          icon: FiLogOut,
          label: '로그아웃',
          onClick: handleLogout,
          danger: true
        }
      ]
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* 프로필 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="프로필 메뉴"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-500 flex items-center justify-center">
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt="프로필"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {getProfileInitials()}
            </span>
          )}
        </div>
      </button>

      {/* 드롭다운 메뉴 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            {/* 프로필 헤더 */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-500 flex items-center justify-center">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {getProfileInitials()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {profile.email}
                  </p>
                  {profile.position && (
                    <p className="text-xs text-gray-500 truncate">
                      {profile.position}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 메뉴 아이템 */}
            <div className="py-2">
              {menuItems.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={item.onClick}
                      className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <SafeIcon
                          icon={item.icon}
                          className={`w-4 h-4 ${
                            item.danger ? 'text-red-500' : 'text-gray-400'
                          }`}
                        />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      {item.info ? (
                        <span className="text-xs text-gray-400">{item.info}</span>
                      ) : (
                        <SafeIcon
                          icon={FiChevronRight}
                          className="w-4 h-4 text-gray-400"
                        />
                      )}
                    </button>
                  ))}
                  {sectionIndex < menuItems.length - 1 && (
                    <div className="my-2 border-b border-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 로그아웃 확인 모달 */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                로그아웃 확인
              </h3>
              <p className="text-gray-600 mb-6">
                정말 로그아웃 하시겠습니까? 로그아웃 후에는 다시 로그인해야 합니다.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfileButton;
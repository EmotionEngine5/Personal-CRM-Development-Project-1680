import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const { FiSun, FiMoon } = FiIcons;

function ThemeToggle({ className = '', minimal = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  if (minimal) {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors ${
          isDarkMode 
            ? 'text-gray-300 hover:text-yellow-300' 
            : 'text-gray-600 hover:text-blue-600'
        } ${className}`}
        aria-label={isDarkMode ? '일반 모드로 전환' : '다크 모드로 전환'}
      >
        <SafeIcon icon={isDarkMode ? FiSun : FiMoon} className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${
        isDarkMode 
          ? 'hover:bg-gray-700 text-gray-200' 
          : 'hover:bg-gray-100 text-gray-700'
      } ${className}`}
      aria-label={isDarkMode ? '일반 모드로 전환' : '다크 모드로 전환'}
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className={`p-2 rounded-full ${
            isDarkMode ? 'bg-blue-900' : 'bg-yellow-100'
          }`}
        >
          <SafeIcon 
            icon={isDarkMode ? FiSun : FiMoon} 
            className={`w-4 h-4 ${
              isDarkMode ? 'text-blue-300' : 'text-yellow-600'
            }`} 
          />
        </motion.div>
      </div>
      <div className="flex-1">
        <span className="block font-medium">
          {isDarkMode ? '일반 모드로 전환' : '다크 모드로 전환'}
        </span>
        <span className="block text-xs text-gray-500">
          {isDarkMode ? '밝은 테마로 변경합니다' : '어두운 테마로 변경합니다'}
        </span>
      </div>
    </button>
  );
}

export default ThemeToggle;
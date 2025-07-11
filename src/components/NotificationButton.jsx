import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const { FiBell } = FiIcons;

function NotificationButton() {
  const { unreadCount, toggleNotificationPanel } = useNotification();

  return (
    <button
      onClick={toggleNotificationPanel}
      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative"
      aria-label="알림"
    >
      <SafeIcon icon={FiBell} className="w-5 h-5" />
      
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default NotificationButton;
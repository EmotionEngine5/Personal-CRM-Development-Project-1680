import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useNotification } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const { FiX, FiCheck } = FiIcons;

function NotificationPanel() {
  const { 
    notifications, 
    isOpen, 
    closeNotificationPanel, 
    markAsRead, 
    markAllAsRead 
  } = useNotification();

  const handleNotificationClick = (id, link) => {
    markAsRead(id);
    closeNotificationPanel();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={closeNotificationPanel}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">알림</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  모두 읽음
                </button>
                <button
                  onClick={closeNotificationPanel}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-primary-50' : ''}`}
                    >
                      <Link
                        to={notification.link || '#'}
                        onClick={() => handleNotificationClick(notification.id, notification.link)}
                        className="block"
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ko })}
                            </p>
                          </div>
                          {!notification.read ? (
                            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                          ) : (
                            <SafeIcon icon={FiCheck} className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <p>새로운 알림이 없습니다</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default NotificationPanel;
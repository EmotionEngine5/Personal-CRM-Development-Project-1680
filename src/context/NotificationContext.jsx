import React, { createContext, useContext, useReducer, useEffect } from 'react';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false
};

// 로컬 스토리지 키
const STORAGE_KEY = 'crm-notifications';

// 예시 알림 데이터
const sampleNotifications = [
  {
    id: '1',
    title: '신규 기능 업데이트',
    message: '고객 대시보드에 신규 통계 기능이 추가되었습니다.',
    createdAt: new Date().toISOString(),
    read: false,
    link: '/analytics'
  },
  {
    id: '2',
    title: '중요 알림',
    message: '다음 주 정기 시스템 점검이 예정되어 있습니다.',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1일 전
    read: false,
    link: '/settings'
  },
  {
    id: '3',
    title: '신규 태그 추가',
    message: 'CRM 관리에 새로운 태그 관리 기능이 추가되었습니다.',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2일 전
    read: false,
    link: '/crm'
  }
];

function notificationReducer(state, action) {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length
      };
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length
      };
    case 'MARK_AS_READ':
      const updatedNotifs = state.notifications.map(n => 
        n.id === action.payload ? { ...n, read: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifs,
        unreadCount: updatedNotifs.filter(n => !n.read).length
      };
    case 'MARK_ALL_AS_READ':
      const allReadNotifs = state.notifications.map(n => ({ ...n, read: true }));
      return {
        ...state,
        notifications: allReadNotifs,
        unreadCount: 0
      };
    case 'TOGGLE_NOTIFICATION_PANEL':
      return {
        ...state,
        isOpen: !state.isOpen
      };
    case 'CLOSE_NOTIFICATION_PANEL':
      return {
        ...state,
        isOpen: false
      };
    default:
      return state;
  }
}

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // 초기 로드 시 로컬 스토리지에서 알림 가져오기
  useEffect(() => {
    const savedNotifications = localStorage.getItem(STORAGE_KEY);
    
    if (savedNotifications) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: JSON.parse(savedNotifications) });
    } else {
      // 예시 알림 데이터 (실제 구현 시 삭제 또는 수정)
      dispatch({ type: 'SET_NOTIFICATIONS', payload: sampleNotifications });
    }
  }, []);

  // 알림 상태가 변경될 때마다 로컬 스토리지 업데이트
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notifications));
  }, [state.notifications]);

  // 알림 추가
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
      ...notification
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  // 알림 읽음 표시
  const markAsRead = (id) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  // 모든 알림 읽음 표시
  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  // 알림 패널 토글
  const toggleNotificationPanel = () => {
    dispatch({ type: 'TOGGLE_NOTIFICATION_PANEL' });
  };

  // 알림 패널 닫기
  const closeNotificationPanel = () => {
    dispatch({ type: 'CLOSE_NOTIFICATION_PANEL' });
  };

  const value = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    toggleNotificationPanel,
    closeNotificationPanel
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
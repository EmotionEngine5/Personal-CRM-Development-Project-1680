import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { format, addMinutes } from 'date-fns';

const CalendarContext = createContext();

const initialState = {
  events: [],
  loading: false,
  error: null,
  selectedEvent: null,
  showEventModal: false
};

// 로컬 스토리지 키
const STORAGE_KEY = 'crm-calendar-events';

// 샘플 데이터
const sampleEvents = [
  {
    id: '1',
    title: '신규 고객 미팅',
    start: '2024-12-19T10:00:00',
    end: '2024-12-19T11:00:00',
    type: 'meeting',
    customerId: 'sample1',
    description: '새로운 SaaS 솔루션 도입 논의',
    location: '강남구 사무실',
    priority: 'high',
    backgroundColor: '#4f46e5',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'ABC회사 팔로업 통화',
    start: '2024-12-20T14:00:00',
    end: '2024-12-20T14:30:00',
    type: 'call',
    customerId: 'sample2',
    description: '견적서 검토 결과 확인',
    priority: 'medium',
    backgroundColor: '#0ea5e9',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: '제품 데모 준비',
    start: '2024-12-21T09:00:00',
    end: '2024-12-21T10:00:00',
    type: 'task',
    description: '내일 고객 데모를 위한 준비 작업',
    priority: 'high',
    backgroundColor: '#8b5cf6',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: '123 컴퍼니 미팅',
    start: new Date(Date.now() + 86400000).toISOString(), // 내일
    end: new Date(Date.now() + 86400000 + 3600000).toISOString(), // 내일 + 1시간
    type: 'meeting',
    customerId: 'sample3',
    description: '신규 프로젝트 논의',
    priority: 'high',
    backgroundColor: '#4f46e5',
    createdAt: new Date().toISOString()
  }
];

function calendarReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_EVENTS':
      return { ...state, events: action.payload, loading: false, error: null };
    case 'ADD_EVENT':
      const newEvents = [...state.events, action.payload];
      return { ...state, events: newEvents };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.payload.id ? action.payload : event
        ),
        selectedEvent: state.selectedEvent?.id === action.payload.id ? action.payload : state.selectedEvent
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
        selectedEvent: state.selectedEvent?.id === action.payload ? null : state.selectedEvent,
        showEventModal: state.selectedEvent?.id === action.payload ? false : state.showEventModal
      };
    case 'SELECT_EVENT':
      return { ...state, selectedEvent: action.payload, showEventModal: true };
    case 'CLOSE_EVENT_MODAL':
      return { ...state, showEventModal: false, selectedEvent: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function CalendarProvider({ children }) {
  const [state, dispatch] = useReducer(calendarReducer, initialState);

  // 초기 로드 시 로컬 스토리지에서 이벤트 가져오기
  useEffect(() => {
    const loadEvents = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const savedEvents = localStorage.getItem(STORAGE_KEY);
        if (savedEvents) {
          const parsedEvents = JSON.parse(savedEvents);
          // 데이터 유효성 검사
          const validEvents = parsedEvents.filter(event => 
            event && event.id && event.title && event.start
          );
          dispatch({ type: 'SET_EVENTS', payload: validEvents });
        } else {
          // 샘플 데이터 로드 (첫 방문 시)
          dispatch({ type: 'SET_EVENTS', payload: sampleEvents });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEvents));
        }
      } catch (error) {
        console.error('이벤트 로드 오류:', error);
        dispatch({ type: 'SET_ERROR', payload: '일정 데이터를 불러오는 중 오류가 발생했습니다.' });
        // 오류 발생 시 샘플 데이터 사용
        dispatch({ type: 'SET_EVENTS', payload: sampleEvents });
      }
    };
    loadEvents();
  }, []);

  // 이벤트 상태가 변경될 때마다 로컬 스토리지 업데이트
  useEffect(() => {
    if (state.events.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
      } catch (error) {
        console.error('이벤트 저장 오류:', error);
      }
    }
  }, [state.events]);

  // 이벤트 추가
  const addEvent = (eventData) => {
    try {
      if (!eventData.title || !eventData.start) {
        throw new Error('제목과 시작 시간은 필수입니다.');
      }
      
      // 시작 및 종료 시간을 10분 단위로 조정
      const startDate = new Date(eventData.start);
      const roundStartMinutes = Math.round(startDate.getMinutes() / 10) * 10;
      startDate.setMinutes(roundStartMinutes, 0, 0);
      
      let endDate;
      if (eventData.end) {
        endDate = new Date(eventData.end);
        const roundEndMinutes = Math.round(endDate.getMinutes() / 10) * 10;
        endDate.setMinutes(roundEndMinutes, 0, 0);
      } else {
        // 종료 시간이 없으면 시작 시간 + 1시간으로 설정
        endDate = addMinutes(startDate, 60);
      }
      
      const newEvent = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...eventData,
        start: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
        end: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_EVENT', payload: newEvent });
      return newEvent;
    } catch (error) {
      console.error('이벤트 추가 오류:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || '이벤트를 추가하는 중 오류가 발생했습니다.' });
      return null;
    }
  };

  // 이벤트 업데이트
  const updateEvent = (id, updates) => {
    try {
      const event = state.events.find(e => e.id === id);
      if (!event) {
        throw new Error('해당 이벤트를 찾을 수 없습니다.');
      }
      
      // 시작 및 종료 시간을 10분 단위로 조정
      let updatedStart = updates.start;
      let updatedEnd = updates.end;
      
      if (updatedStart) {
        const startDate = new Date(updatedStart);
        const roundStartMinutes = Math.round(startDate.getMinutes() / 10) * 10;
        startDate.setMinutes(roundStartMinutes, 0, 0);
        updatedStart = format(startDate, "yyyy-MM-dd'T'HH:mm:ss");
      }
      
      if (updatedEnd) {
        const endDate = new Date(updatedEnd);
        const roundEndMinutes = Math.round(endDate.getMinutes() / 10) * 10;
        endDate.setMinutes(roundEndMinutes, 0, 0);
        updatedEnd = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");
      }

      const updatedEvent = {
        ...event,
        ...updates,
        start: updatedStart || event.start,
        end: updatedEnd || event.end,
        id: event.id, // ID는 변경되지 않도록
        updatedAt: new Date().toISOString()
      };
      
      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
      return updatedEvent;
    } catch (error) {
      console.error('이벤트 업데이트 오류:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || '이벤트를 업데이트하는 중 오류가 발생했습니다.' });
      return null;
    }
  };

  // 이벤트 삭제
  const deleteEvent = (id) => {
    try {
      const event = state.events.find(e => e.id === id);
      if (!event) {
        throw new Error('해당 이벤트를 찾을 수 없습니다.');
      }
      dispatch({ type: 'DELETE_EVENT', payload: id });
      return true;
    } catch (error) {
      console.error('이벤트 삭제 오류:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || '이벤트를 삭제하는 중 오류가 발생했습니다.' });
      return false;
    }
  };

  // 이벤트 선택 (모달 열기)
  const selectEvent = (event) => {
    try {
      if (!event || !event.id) {
        throw new Error('유효하지 않은 이벤트입니다.');
      }
      dispatch({ type: 'SELECT_EVENT', payload: event });
    } catch (error) {
      console.error('이벤트 선택 오류:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || '이벤트를 선택하는 중 오류가 발생했습니다.' });
    }
  };

  // 모달 닫기
  const closeEventModal = () => {
    dispatch({ type: 'CLOSE_EVENT_MODAL' });
  };

  // 오류 클리어
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // 고객 ID로 이벤트 조회
  const getEventsByCustomerId = (customerId) => {
    try {
      if (!customerId) return [];
      return state.events.filter(event => event.customerId === customerId);
    } catch (error) {
      console.error('고객 이벤트 조회 오류:', error);
      return [];
    }
  };

  // 특정 날짜에 이벤트가 있는지 확인
  const hasEventsOnDate = (date) => {
    try {
      if (!date) return false;
      const targetDate = new Date(date).toISOString().split('T')[0];
      return state.events.some(event => {
        if (!event.start) return false;
        const eventDate = new Date(event.start).toISOString().split('T')[0];
        return eventDate === targetDate;
      });
    } catch (error) {
      console.error('날짜별 이벤트 확인 오류:', error);
      return false;
    }
  };

  // 고객 이름 조회 함수 (CRM 컨텍스트가 없을 때 대비)
  const getCustomerName = (customerId) => {
    try {
      if (!customerId) return '';
      
      // 샘플 고객 데이터 (실제로는 CRM 컨텍스트에서 가져와야 함)
      const sampleCustomers = {
        'sample1': 'ABC 테크놀로지',
        'sample2': 'XYZ 솔루션',
        'sample3': '123 컴퍼니'
      };
      
      return sampleCustomers[customerId] || `고객-${customerId}`;
    } catch (error) {
      console.error('고객 정보 조회 오류:', error);
      return '고객 정보 없음';
    }
  };

  // 고객별 이벤트 통계
  const getCustomerEventStats = (customerId) => {
    try {
      if (!customerId) {
        return {
          total: 0,
          meetings: 0,
          calls: 0,
          followups: 0,
          lastContact: null
        };
      }
      
      const customerEvents = getEventsByCustomerId(customerId);
      const sortedEvents = customerEvents.sort((a, b) => 
        new Date(b.start) - new Date(a.start)
      );
      
      return {
        total: customerEvents.length,
        meetings: customerEvents.filter(e => e.type === 'meeting').length,
        calls: customerEvents.filter(e => e.type === 'call').length,
        followups: customerEvents.filter(e => e.type === 'followup').length,
        lastContact: sortedEvents.length > 0 ? sortedEvents[0].start : null
      };
    } catch (error) {
      console.error('고객 이벤트 통계 오류:', error);
      return {
        total: 0,
        meetings: 0,
        calls: 0,
        followups: 0,
        lastContact: null
      };
    }
  };

  const value = {
    ...state,
    addEvent,
    updateEvent,
    deleteEvent,
    selectEvent,
    closeEventModal,
    clearError,
    getEventsByCustomerId,
    hasEventsOnDate,
    getCustomerName,
    getCustomerEventStats
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
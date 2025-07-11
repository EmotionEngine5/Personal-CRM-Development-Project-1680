import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCalendar } from '../context/CalendarContext';
import { format, parseISO } from 'date-fns';

const { FiCalendar, FiClock, FiTag, FiMessageSquare, FiEdit, FiPhone, FiCheck, FiRepeat } = FiIcons;

// 이벤트 유형에 따른 색상 및 아이콘
const eventTypeConfig = {
  meeting: { color: '#4f46e5', icon: FiCalendar },
  call: { color: '#0ea5e9', icon: FiPhone },
  task: { color: '#10b981', icon: FiCheck },
  followup: { color: '#f59e0b', icon: FiRepeat },
  deadline: { color: '#ef4444', icon: FiClock }
};

function CalendarEvents({ customerId }) {
  const { getEventsByCustomerId, selectEvent } = useCalendar();
  const customerEvents = getEventsByCustomerId(customerId);

  if (customerEvents.length === 0) {
    return (
      <div className="text-center py-8">
        <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">등록된 일정이 없습니다</h4>
        <p className="text-gray-500 mb-4">
          이 고객과 관련된 미팅, 통화, 할 일 등의 일정을 추가해보세요.
        </p>
        <Link to="/calendar" className="text-primary-600 font-medium hover:text-primary-700">
          일정 관리로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">일정 내역</h3>
        <Link to="/calendar" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          전체 일정 보기
        </Link>
      </div>

      {customerEvents
        .sort((a, b) => new Date(b.start) - new Date(a.start))
        .map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mt-1"
                  style={{ 
                    backgroundColor: (eventTypeConfig[event.type] && eventTypeConfig[event.type].color) || '#0ea5e9'
                  }}
                >
                  <SafeIcon
                    icon={(eventTypeConfig[event.type] && eventTypeConfig[event.type].icon) || FiCalendar}
                    className="w-4 h-4 text-white"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <SafeIcon icon={FiClock} className="w-3 h-3 mr-1" />
                    <span>
                      {format(parseISO(event.start), 'yyyy년 MM월 dd일 HH:mm')}
                      {event.end && ` ~ ${format(parseISO(event.end), 'HH:mm')}`}
                    </span>
                  </div>
                  {event.description && (
                    <div className="mt-2 text-sm text-gray-600">
                      <SafeIcon icon={FiMessageSquare} className="w-3 h-3 inline mr-1" />
                      {event.description}
                    </div>
                  )}
                  <div className="mt-2">
                    <span
                      className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${(eventTypeConfig[event.type] && eventTypeConfig[event.type].color) || '#0ea5e9'}20`,
                        color: (eventTypeConfig[event.type] && eventTypeConfig[event.type].color) || '#0ea5e9'
                      }}
                    >
                      <SafeIcon icon={FiTag} className="w-3 h-3 mr-1" />
                      {event.type === 'meeting' ? '미팅' : 
                       event.type === 'call' ? '통화' : 
                       event.type === 'task' ? '할 일' : 
                       event.type === 'followup' ? '재확인' : 
                       event.type === 'deadline' ? '마감일' : '기타'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => selectEvent(event)}
                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                aria-label="편집"
              >
                <SafeIcon icon={FiEdit} className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
    </div>
  );
}

export default CalendarEvents;
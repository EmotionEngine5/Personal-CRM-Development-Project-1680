import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, isToday, isSameMonth, isWithinInterval, addDays, 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  parseISO, formatISO, addMonths, subMonths, 
  differenceInCalendarDays, isSameDay, isWeekend
} from 'date-fns';
import { ko } from 'date-fns/locale';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCalendar } from '../context/CalendarContext';
import { useCRM } from '../context/CRMContext';
import { useNotification } from '../context/NotificationContext';
import EventForm from '../components/EventForm';
import CustomerDetail from '../components/CustomerDetail';

const {
  FiPlus,
  FiCalendar,
  FiFilter,
  FiUser,
  FiTag,
  FiSearch,
  FiList,
  FiGrid,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiCheckCircle,
  FiPhone,
  FiMail,
  FiBriefcase,
  FiAlertCircle,
  FiRefreshCw,
  FiSliders
} = FiIcons;

// 이벤트 유형별 설정
const eventTypeConfig = {
  meeting: { color: '#4285F4', icon: FiBriefcase, label: '미팅', priority: 'high' },
  call: { color: '#0B8043', icon: FiPhone, label: '통화', priority: 'medium' },
  email: { color: '#3F51B5', icon: FiMail, label: '이메일', priority: 'low' },
  task: { color: '#7986CB', icon: FiCheckCircle, label: '할 일', priority: 'medium' },
  followup: { color: '#F4511E', icon: FiRefreshCw, label: '팔로업', priority: 'high' },
  deadline: { color: '#E67C73', icon: FiAlertCircle, label: '마감일', priority: 'high' }
};

// 한국 공휴일 데이터
const koreanHolidays = {
  '2024-01-01': '신정',
  '2024-02-09': '설날 연휴',
  '2024-02-10': '설날',
  '2024-02-11': '설날 연휴',
  '2024-02-12': '대체공휴일',
  '2024-03-01': '삼일절',
  '2024-05-05': '어린이날',
  '2024-05-06': '대체공휴일',
  '2024-05-15': '부처님오신날',
  '2024-06-06': '현충일',
  '2024-08-15': '광복절',
  '2024-09-16': '추석 연휴',
  '2024-09-17': '추석',
  '2024-09-18': '추석 연휴',
  '2024-10-03': '개천절',
  '2024-10-09': '한글날',
  '2024-12-25': '성탄절'
};

function Calendar() {
  const { events, addEvent, updateEvent, deleteEvent, selectedEvent, selectEvent, closeEventModal } = useCalendar();
  const { customers } = useCRM();
  const { addNotification } = useNotification();
  const calendarRef = useRef(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('dayGridMonth');
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [initialDate, setInitialDate] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    eventTypes: Object.keys(eventTypeConfig),
    customerIds: [],
    searchTerm: '',
    showCompleted: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 이벤트 필터링
  useEffect(() => {
    try {
      const filtered = events.filter(event => {
        if (!event) return false;
        
        // 이벤트 타입 필터
        if (event.type && !filters.eventTypes.includes(event.type)) return false;
        
        // 고객 필터
        if (filters.customerIds.length > 0 && event.customerId && !filters.customerIds.includes(event.customerId)) return false;
        
        // 검색어 필터
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          const titleMatch = event.title?.toLowerCase().includes(searchLower) || false;
          const descMatch = event.description?.toLowerCase().includes(searchLower) || false;
          const locationMatch = event.location?.toLowerCase().includes(searchLower) || false;
          
          if (!titleMatch && !descMatch && !locationMatch) return false;
        }
        
        // 완료된 이벤트 필터
        if (!filters.showCompleted && event.completed) return false;
        
        return true;
      });
      
      setFilteredEvents(filtered);
    } catch (error) {
      console.error('이벤트 필터링 오류:', error);
      setFilteredEvents([]);
    }
  }, [events, filters]);

  // 날짜 변경 핸들러
  const handleDateChange = (direction) => {
    try {
      if (!calendarRef.current) return;
      
      const calendarApi = calendarRef.current.getApi();
      
      if (direction === 'prev') {
        calendarApi.prev();
      } else if (direction === 'next') {
        calendarApi.next();
      } else if (direction === 'today') {
        calendarApi.today();
      }
      
      setCurrentDate(calendarApi.getDate());
    } catch (error) {
      console.error('날짜 변경 오류:', error);
    }
  };

  // 뷰 변경 핸들러
  const handleViewChange = (type) => {
    try {
      setViewType(type);
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView(type);
      }
    } catch (error) {
      console.error('뷰 변경 오류:', error);
    }
  };

  // 이벤트 클릭 핸들러
  const handleEventClick = (info) => {
    try {
      if (!info || !info.event) return;
      
      const eventId = info.event.id;
      const event = events.find(e => e && e.id === eventId);
      if (event) {
        selectEvent(event);
      }
    } catch (error) {
      console.error('이벤트 클릭 오류:', error);
    }
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (info) => {
    try {
      if (!info || !info.dateStr) return;
      
      setInitialDate(info.dateStr);
      setShowEventForm(true);
    } catch (error) {
      console.error('날짜 클릭 오류:', error);
    }
  };

  // 이벤트 드래그 핸들러
  const handleEventDrop = (info) => {
    try {
      if (!info || !info.event) return;
      
      const eventId = info.event.id;
      const startDate = info.event.start;
      const endDate = info.event.end;
      
      const event = events.find(e => e && e.id === eventId);
      if (event && startDate) {
        const updatedEvent = {
          ...event,
          start: formatISO(startDate),
          end: endDate ? formatISO(endDate) : null
        };
        
        updateEvent(eventId, updatedEvent);
        addNotification({
          title: '일정 변경됨',
          message: `"${event.title}" 일정이 ${format(startDate, 'yyyy년 MM월 dd일')}로 변경되었습니다.`,
          type: 'info'
        });
      }
    } catch (error) {
      console.error('이벤트 드래그 오류:', error);
    }
  };

  // 이벤트 크기 변경 핸들러
  const handleEventResize = (info) => {
    try {
      if (!info || !info.event) return;
      
      const eventId = info.event.id;
      const startDate = info.event.start;
      const endDate = info.event.end;
      
      const event = events.find(e => e && e.id === eventId);
      if (event && startDate && endDate) {
        const updatedEvent = {
          ...event,
          start: formatISO(startDate),
          end: formatISO(endDate)
        };
        
        updateEvent(eventId, updatedEvent);
        addNotification({
          title: '일정 시간 변경됨',
          message: `"${event.title}" 일정의 시간이 변경되었습니다.`,
          type: 'info'
        });
      }
    } catch (error) {
      console.error('이벤트 크기 변경 오류:', error);
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (filterType, value) => {
    try {
      setFilters(prev => {
        if (filterType === 'eventTypes') {
          const updatedTypes = prev.eventTypes.includes(value)
            ? prev.eventTypes.filter(t => t !== value)
            : [...prev.eventTypes, value];
          
          return { ...prev, eventTypes: updatedTypes };
        } 
        else if (filterType === 'customerIds') {
          const updatedCustomers = prev.customerIds.includes(value)
            ? prev.customerIds.filter(id => id !== value)
            : [...prev.customerIds, value];
          
          return { ...prev, customerIds: updatedCustomers };
        }
        else if (filterType === 'searchTerm') {
          return { ...prev, searchTerm: value || '' };
        }
        else if (filterType === 'showCompleted') {
          return { ...prev, showCompleted: Boolean(value) };
        }
        
        return prev;
      });
    } catch (error) {
      console.error('필터 변경 오류:', error);
    }
  };

  // 고객 클릭 핸들러
  const handleCustomerClick = (customerId) => {
    try {
      if (!customerId || !customers) return;
      
      const customer = customers.find(c => c && c.id === customerId);
      if (customer) {
        setSelectedCustomer(customer);
        setShowCustomerDetail(true);
      }
    } catch (error) {
      console.error('고객 클릭 오류:', error);
    }
  };

  // 달력 렌더링 시 스타일 적용 - 안전한 방식으로 수정
  const handleDayCellDidMount = (info) => {
    try {
      if (!info || !info.date || !info.el) return;
      
      const dateStr = format(info.date, 'yyyy-MM-dd');
      const holiday = koreanHolidays[dateStr];
      const isWeekendDay = isWeekend(info.date);
      
      // 주말 스타일링
      if (isWeekendDay && info.el.style) {
        info.el.style.backgroundColor = '#f8fafc';
        
        const dayNumberEl = info.el.querySelector('.fc-daygrid-day-number');
        if (dayNumberEl && dayNumberEl.style) {
          dayNumberEl.style.color = '#64748b';
        }
      }
      
      // 공휴일 스타일링
      if (holiday && info.el.style) {
        info.el.style.backgroundColor = '#fee2e2';
        
        const dayNumberEl = info.el.querySelector('.fc-daygrid-day-number');
        if (dayNumberEl) {
          dayNumberEl.innerHTML = `
            ${info.date.getDate()}
            <span class="text-xs block text-red-600">${holiday}</span>
          `;
          if (dayNumberEl.style) {
            dayNumberEl.style.color = '#dc2626';
          }
        }
      }
      
      // 오늘 날짜 스타일링
      if (isToday(info.date)) {
        const dayNumberEl = info.el.querySelector('.fc-daygrid-day-number');
        if (dayNumberEl && dayNumberEl.style) {
          dayNumberEl.style.color = '#4285F4';
          dayNumberEl.style.fontWeight = '700';
        }
      }
      
      // 현재 월이 아닌 날짜 스타일링
      if (!isSameMonth(info.date, currentDate) && info.el.style) {
        info.el.style.opacity = '0.5';
      }
    } catch (error) {
      console.error('날짜 셀 스타일링 오류:', error);
    }
  };

  // 이벤트 렌더링 핸들러 - 안전한 방식으로 수정
  const renderEvent = (info) => {
    try {
      if (!info || !info.event || !info.el) return;
      
      const { event } = info;
      const eventData = event.extendedProps || {};
      const eventType = eventData.type || 'meeting';
      const config = eventTypeConfig[eventType] || eventTypeConfig.meeting;
      
      // 이벤트 색상 설정
      if (info.el.style) {
        info.el.style.backgroundColor = config.color;
        info.el.style.borderColor = config.color;
        
        // 완료된 이벤트 스타일 적용
        if (eventData.completed) {
          info.el.style.textDecoration = 'line-through';
          info.el.style.opacity = '0.7';
        }
      }
      
      // 고객 정보가 있는 이벤트 표시
      if (eventData.customerId && customers) {
        const customer = customers.find(c => c && c.id === eventData.customerId);
        if (customer) {
          const dotEl = document.createElement('div');
          dotEl.className = 'w-2 h-2 rounded-full absolute right-1 top-1';
          dotEl.style.backgroundColor = '#fff';
          
          try {
            info.el.appendChild(dotEl);
          } catch (appendError) {
            console.warn('도트 요소 추가 실패:', appendError);
          }
          
          // 툴팁 정보 추가
          info.el.title = `${event.title} - ${customer.companyName} (${customer.contactName})`;
        }
      }
    } catch (error) {
      console.error('이벤트 렌더링 오류:', error);
    }
  };

  // 일정 헤더 렌더링
  const headerToolbar = isSmallScreen
    ? {
        left: 'title',
        center: '',
        right: 'prev,next'
      }
    : {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      };

  // 안전한 이벤트 데이터 생성
  const safeEvents = filteredEvents
    .filter(event => event && event.id && event.title && event.start)
    .map(event => {
      try {
        return {
          id: event.id,
          title: event.title || '제목 없음',
          start: event.start,
          end: event.end,
          allDay: Boolean(event.allDay),
          extendedProps: {
            ...event
          },
          backgroundColor: eventTypeConfig[event.type]?.color || '#4285F4',
          borderColor: eventTypeConfig[event.type]?.color || '#4285F4',
        };
      } catch (error) {
        console.error('이벤트 데이터 생성 오류:', error);
        return null;
      }
    })
    .filter(Boolean);

  // 안전한 오늘 일정 필터링
  const todayEvents = events
    .filter(event => {
      if (!event || !event.start) return false;
      try {
        return isToday(parseISO(event.start));
      } catch (error) {
        console.error('오늘 일정 필터링 오류:', error);
        return false;
      }
    })
    .sort((a, b) => {
      try {
        return new Date(a.start) - new Date(b.start);
      } catch (error) {
        return 0;
      }
    });

  // 안전한 다가오는 일정 필터링
  const upcomingEvents = events
    .filter(event => {
      if (!event || !event.start) return false;
      try {
        const eventDate = parseISO(event.start);
        return (
          !isToday(eventDate) && 
          eventDate > new Date() && 
          differenceInCalendarDays(eventDate, new Date()) <= 14
        );
      } catch (error) {
        console.error('다가오는 일정 필터링 오류:', error);
        return false;
      }
    })
    .sort((a, b) => {
      try {
        return new Date(a.start) - new Date(b.start);
      } catch (error) {
        return 0;
      }
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">영업 캘린더</h1>
          <p className="text-gray-600">고객 미팅, 통화, 팔로업 일정을 관리하세요</p>
        </div>

        <div className="flex items-center space-x-2">
          {isSmallScreen && (
            <div className="flex space-x-1">
              <button
                onClick={() => handleViewChange('dayGridMonth')}
                className={`p-2 rounded-md ${viewType === 'dayGridMonth' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
              >
                <SafeIcon icon={FiCalendar} className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleViewChange('timeGridWeek')}
                className={`p-2 rounded-md ${viewType === 'timeGridWeek' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
              >
                <SafeIcon icon={FiGrid} className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleViewChange('listWeek')}
                className={`p-2 rounded-md ${viewType === 'listWeek' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
              >
                <SafeIcon icon={FiList} className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <SafeIcon icon={FiSliders} className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => {
              setInitialDate(format(new Date(), "yyyy-MM-dd"));
              setShowEventForm(true);
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span className={isSmallScreen ? "hidden" : ""}>새 일정</span>
          </button>
        </div>
      </motion.div>

      {/* 필터 패널 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 이벤트 타입 필터 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">일정 유형</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(eventTypeConfig).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange('eventTypes', type)}
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1
                        ${filters.eventTypes.includes(type) 
                          ? 'bg-opacity-20 border border-opacity-40' 
                          : 'bg-gray-100 text-gray-500'}`}
                      style={{
                        backgroundColor: filters.eventTypes.includes(type) ? `${config.color}20` : '',
                        borderColor: filters.eventTypes.includes(type) ? `${config.color}` : '',
                        color: filters.eventTypes.includes(type) ? config.color : ''
                      }}
                    >
                      <SafeIcon icon={config.icon} className="w-3 h-3" />
                      <span>{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 고객 필터 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">고객 필터</h3>
                <div className="flex flex-col space-y-1 max-h-24 overflow-y-auto">
                  {customers && customers.length > 0 ? (
                    customers.map(customer => customer && customer.id ? (
                      <label key={customer.id} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={filters.customerIds.includes(customer.id)}
                          onChange={() => handleFilterChange('customerIds', customer.id)}
                          className="mr-2 h-4 w-4 text-primary-600 rounded"
                        />
                        {customer.companyName || '회사명 없음'}
                      </label>
                    ) : null)
                  ) : (
                    <p className="text-sm text-gray-500">등록된 고객이 없습니다</p>
                  )}
                </div>
              </div>

              {/* 검색 및 기타 필터 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">검색 및 기타</h3>
                <div className="space-y-2">
                  <div className="relative">
                    <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      placeholder="일정 검색..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.showCompleted}
                      onChange={(e) => handleFilterChange('showCompleted', e.target.checked)}
                      className="mr-2 h-4 w-4 text-primary-600 rounded"
                    />
                    완료된 일정 표시
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 캘린더 그리드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden google-calendar-style"
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={viewType}
          headerToolbar={headerToolbar}
          events={safeEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventDidMount={renderEvent}
          dayCellDidMount={handleDayCellDidMount}
          height="auto"
          aspectRatio={1.5}
          locale="ko"
          firstDay={0}
          buttonText={{
            today: '오늘',
            month: '월간',
            week: '주간',
            day: '일간',
            list: '목록'
          }}
          dayMaxEvents={3}
          moreLinkContent={({ num }) => `+${num}개`}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false
          }}
          allDayText="하루종일"
          nowIndicator={true}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEventRows={true}
        />
      </motion.div>

      {/* 오늘 및 다가오는 일정 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 오늘 일정 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘 일정</h3>
          <div className="space-y-3">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => event && event.id ? (
                <div 
                  key={event.id}
                  onClick={() => selectEvent(event)}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <div 
                    className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" 
                    style={{ backgroundColor: eventTypeConfig[event.type]?.color || '#4285F4' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {event.start ? format(parseISO(event.start), 'HH:mm') : '시간 미정'}
                      {event.end && ` - ${format(parseISO(event.end), 'HH:mm')}`}
                    </p>
                    {event.customerId && customers && (
                      <p 
                        className="text-xs text-primary-600 mt-1 truncate cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomerClick(event.customerId);
                        }}
                      >
                        {customers.find(c => c && c.id === event.customerId)?.companyName || ''}
                      </p>
                    )}
                  </div>
                </div>
              ) : null)
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">오늘은 일정이 없습니다</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 다가오는 일정 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">다가오는 일정</h3>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => event && event.id ? (
                <div 
                  key={event.id}
                  onClick={() => selectEvent(event)}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center" 
                      style={{ backgroundColor: eventTypeConfig[event.type]?.color || '#4285F4' }}
                    >
                      <SafeIcon 
                        icon={eventTypeConfig[event.type]?.icon || FiCalendar} 
                        className="w-5 h-5 text-white" 
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {event.start ? format(parseISO(event.start), 'yyyy년 MM월 dd일 (EEE) HH:mm', { locale: ko }) : '날짜 미정'}
                    </p>
                    {event.customerId && customers && (
                      <p 
                        className="text-xs text-primary-600 mt-1 cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomerClick(event.customerId);
                        }}
                      >
                        {customers.find(c => c && c.id === event.customerId)?.companyName || ''}
                      </p>
                    )}
                  </div>
                </div>
              ) : null)
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">다가오는 일정이 없습니다</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 이벤트 폼 모달 */}
      {showEventForm && (
        <EventForm 
          isOpen={showEventForm} 
          onClose={() => setShowEventForm(false)} 
          initialDate={initialDate}
        />
      )}

      {/* 이벤트 상세 모달 (선택된 이벤트가 있을 때) */}
      {selectedEvent && (
        <EventForm 
          isOpen={true} 
          onClose={closeEventModal}
          editMode={true}
          eventToEdit={selectedEvent}
        />
      )}

      {/* 고객 상세 모달 */}
      {showCustomerDetail && selectedCustomer && (
        <CustomerDetail 
          customer={selectedCustomer} 
          onClose={() => setShowCustomerDetail(false)} 
        />
      )}
    </div>
  );
}

export default Calendar;
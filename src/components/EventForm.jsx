import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCalendar } from '../context/CalendarContext';
import { useCRM } from '../context/CRMContext';
import { useNotification } from '../context/NotificationContext';
import { format, isValid, parseISO, addMinutes } from 'date-fns';

const { FiX, FiCalendar, FiClock, FiEdit, FiTrash2, FiUser, FiMessageSquare, FiTag, FiMapPin, FiAlertCircle, FiBriefcase, FiPhone, FiMail, FiCheckCircle, FiRefreshCw, FiSave } = FiIcons;

const eventTypes = [
  { value: 'meeting', label: '미팅', color: '#4f46e5', icon: FiBriefcase, description: '고객과의 대면/화상 미팅' },
  { value: 'call', label: '통화', color: '#0ea5e9', icon: FiPhone, description: '전화 상담 및 통화' },
  { value: 'email', label: '이메일', color: '#10b981', icon: FiMail, description: '이메일 발송 및 답변' },
  { value: 'task', label: '할 일', color: '#8b5cf6', icon: FiCheckCircle, description: '개인 업무 및 작업' },
  { value: 'followup', label: '팔로업', color: '#f59e0b', icon: FiRefreshCw, description: '고객 재연락 및 추적' },
  { value: 'deadline', label: '마감일', color: '#ef4444', icon: FiAlertCircle, description: '중요 마감일 및 데드라인' }
];

const priorityLevels = [
  { value: 'low', label: '낮음', color: '#6b7280' },
  { value: 'medium', label: '보통', color: '#f59e0b' },
  { value: 'high', label: '높음', color: '#ef4444' }
];

function EventForm({ isOpen, onClose, initialDate, editMode = false, eventToEdit = null }) {
  const { addEvent, updateEvent, deleteEvent, selectedEvent, closeEventModal } = useCalendar();
  const { customers } = useCRM();
  const { addNotification } = useNotification();

  // 현재 날짜와 시간 기본값 생성 - 10분 단위로 조정
  const getDefaultDateTime = (baseDate = null) => {
    const now = baseDate ? new Date(baseDate) : new Date();
    const roundedMinutes = Math.ceil(now.getMinutes() / 10) * 10;
    now.setMinutes(roundedMinutes, 0, 0);
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  const getDefaultEndDateTime = (startDate) => {
    const start = new Date(startDate);
    const end = addMinutes(start, 60); // 1시간 후
    return format(end, "yyyy-MM-dd'T'HH:mm");
  };

  const [formData, setFormData] = useState({
    title: '',
    start: getDefaultDateTime(initialDate),
    end: '',
    customerId: '',
    type: 'meeting',
    description: '',
    location: '',
    priority: 'medium',
    allDay: false,
    reminder: false,
    reminderTime: 30,
    expectedRevenue: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // 초기 end 시간 설정
  useEffect(() => {
    if (formData.start && !formData.end) {
      setFormData(prev => ({
        ...prev,
        end: getDefaultEndDateTime(prev.start)
      }));
    }
  }, [formData.start]);

  // 선택된 이벤트나 편집할 이벤트가 있으면 폼 데이터 설정
  useEffect(() => {
    const eventData = selectedEvent || eventToEdit;
    if (eventData && isOpen) {
      try {
        const startDate = eventData.start ? new Date(eventData.start) : new Date();
        const endDate = eventData.end ? new Date(eventData.end) : new Date(startDate.getTime() + 60 * 60 * 1000);
        
        // 시작 시간과 종료 시간을 10분 단위로 맞추기
        const roundStartMinutes = Math.round(startDate.getMinutes() / 10) * 10;
        const roundEndMinutes = Math.round(endDate.getMinutes() / 10) * 10;
        
        startDate.setMinutes(roundStartMinutes, 0, 0);
        endDate.setMinutes(roundEndMinutes, 0, 0);
        
        setFormData({
          title: eventData.title || '',
          start: isValid(startDate) ? format(startDate, "yyyy-MM-dd'T'HH:mm") : getDefaultDateTime(),
          end: isValid(endDate) ? format(endDate, "yyyy-MM-dd'T'HH:mm") : getDefaultEndDateTime(startDate),
          customerId: eventData.customerId || '',
          type: eventData.type || 'meeting',
          description: eventData.description || '',
          location: eventData.location || '',
          priority: eventData.priority || 'medium',
          allDay: eventData.allDay || false,
          reminder: eventData.reminder || false,
          reminderTime: eventData.reminderTime || 30,
          expectedRevenue: eventData.expectedRevenue || '',
          notes: eventData.notes || ''
        });
        setFormErrors({});
      } catch (error) {
        console.error("이벤트 데이터 설정 오류:", error);
        // 오류 발생 시 기본값으로 초기화
        const defaultStart = getDefaultDateTime(initialDate);
        setFormData({
          title: '',
          start: defaultStart,
          end: getDefaultEndDateTime(defaultStart),
          customerId: '',
          type: 'meeting',
          description: '',
          location: '',
          priority: 'medium',
          allDay: false,
          reminder: false,
          reminderTime: 30,
          expectedRevenue: '',
          notes: ''
        });
      }
    } else if (isOpen && !eventData) {
      // 새 이벤트 생성 시 초기값 설정
      const startTime = getDefaultDateTime(initialDate);
      setFormData({
        title: '',
        start: startTime,
        end: getDefaultEndDateTime(startTime),
        customerId: '',
        type: 'meeting',
        description: '',
        location: '',
        priority: 'medium',
        allDay: false,
        reminder: false,
        reminderTime: 30,
        expectedRevenue: '',
        notes: ''
      });
      setFormErrors({});
    }
  }, [selectedEvent, eventToEdit, isOpen, initialDate]);

  // 폼 유효성 검사
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = '제목은 필수입니다.';
    }
    if (!formData.start) {
      errors.start = '시작 시간은 필수입니다.';
    }
    if (!formData.end) {
      errors.end = '종료 시간은 필수입니다.';
    }
    if (formData.start && formData.end) {
      const startDate = new Date(formData.start);
      const endDate = new Date(formData.end);
      if (endDate <= startDate) {
        errors.end = '종료 시간은 시작 시간보다 늦어야 합니다.';
      }
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      // 시작 및 종료 시간을 10분 단위로 조정
      const startDate = new Date(formData.start);
      const endDate = new Date(formData.end);
      
      const roundStartMinutes = Math.round(startDate.getMinutes() / 10) * 10;
      const roundEndMinutes = Math.round(endDate.getMinutes() / 10) * 10;
      
      startDate.setMinutes(roundStartMinutes, 0, 0);
      endDate.setMinutes(roundEndMinutes, 0, 0);
      
      // 이벤트 데이터 구성
      const eventData = {
        ...formData,
        start: format(startDate, "yyyy-MM-dd'T'HH:mm"),
        end: format(endDate, "yyyy-MM-dd'T'HH:mm"),
        backgroundColor: eventTypes.find(type => type.value === formData.type)?.color || '#0ea5e9',
        borderColor: eventTypes.find(type => type.value === formData.type)?.color || '#0ea5e9'
      };

      let result;
      if (selectedEvent || eventToEdit) {
        const eventId = (selectedEvent || eventToEdit).id;
        result = updateEvent(eventId, eventData);
        if (result) {
          addNotification({
            title: '일정 수정 완료',
            message: `${formData.title} 일정이 성공적으로 수정되었습니다.`,
            link: '/calendar'
          });
        }
      } else {
        result = addEvent(eventData);
        if (result) {
          addNotification({
            title: '새 일정 추가 완료',
            message: `${formData.title} 일정이 성공적으로 추가되었습니다.`,
            link: '/calendar'
          });
        }
      }

      if (result) {
        handleClose();
      } else {
        throw new Error('이벤트 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('이벤트 저장 오류:', error);
      addNotification({
        title: '오류 발생',
        message: error.message || '일정 저장 중 오류가 발생했습니다.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('이 일정을 정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const eventId = (selectedEvent || eventToEdit).id;
      const success = deleteEvent(eventId);
      if (success) {
        addNotification({
          title: '일정 삭제 완료',
          message: `${formData.title} 일정이 삭제되었습니다.`,
          link: '/calendar'
        });
        handleClose();
      } else {
        throw new Error('일정 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('이벤트 삭제 오류:', error);
      addNotification({
        title: '삭제 실패',
        message: error.message || '일정 삭제 중 오류가 발생했습니다.',
        type: 'error'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // 시작 시간이 변경되면 종료 시간도 자동 조정
      if (name === 'start' && value) {
        // 시작 시간이 변경되면 종료 시간을 1시간 후로 설정
        const startDate = new Date(value);
        
        // 시작 시간을 10분 단위로 조정
        const roundedMinutes = Math.round(startDate.getMinutes() / 10) * 10;
        startDate.setMinutes(roundedMinutes, 0, 0);
        
        // 종료 시간을 1시간 후로 설정
        const endDate = addMinutes(startDate, 60);
        newData.end = format(endDate, "yyyy-MM-dd'T'HH:mm");
        newData.start = format(startDate, "yyyy-MM-dd'T'HH:mm");
      }

      return newData;
    });

    // 해당 필드의 오류 메시지 제거
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleClose = () => {
    if (selectedEvent) {
      closeEventModal();
    }
    if (onClose) {
      onClose();
    }

    // 폼 초기화
    const defaultStart = getDefaultDateTime();
    setFormData({
      title: '',
      start: defaultStart,
      end: getDefaultEndDateTime(defaultStart),
      customerId: '',
      type: 'meeting',
      description: '',
      location: '',
      priority: 'medium',
      allDay: false,
      reminder: false,
      reminderTime: 30,
      expectedRevenue: '',
      notes: ''
    });
    setFormErrors({});
    setIsSubmitting(false);
  };

  const getSelectedCustomer = () => {
    return customers.find(c => c.id === formData.customerId);
  };

  // 모달이 닫혀 있으면 렌더링하지 않음
  if (!isOpen && !selectedEvent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedEvent || editMode ? '일정 수정' : '새 일정 추가'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="일정 제목을 입력하세요"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    formErrors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 inline mr-2" />
                  시작 시간 *
                </label>
                <input
                  type="datetime-local"
                  name="start"
                  value={formData.start}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    formErrors.start ? 'border-red-300' : 'border-gray-300'
                  }`}
                  step="600" // 10분 단위로 선택 가능 (60초 * 10분 = 600초)
                />
                {formErrors.start && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.start}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">10분 단위로 설정됩니다</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiClock} className="w-4 h-4 inline mr-2" />
                  종료 시간 *
                </label>
                <input
                  type="datetime-local"
                  name="end"
                  value={formData.end}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    formErrors.end ? 'border-red-300' : 'border-gray-300'
                  }`}
                  step="600" // 10분 단위로 선택 가능 (60초 * 10분 = 600초)
                />
                {formErrors.end && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.end}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">10분 단위로 설정됩니다</p>
              </div>
            </div>

            {/* 고객 및 우선순위 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiUser} className="w-4 h-4 inline mr-2" />
                  관련 고객
                </label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">선택 안 함</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.companyName} ({customer.contactName})
                    </option>
                  ))}
                </select>
                {getSelectedCustomer() && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      📧 {getSelectedCustomer().email}
                      {getSelectedCustomer().phone && ` | 📞 ${getSelectedCustomer().phone}`}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  우선순위
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {priorityLevels.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 일정 유형 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiTag} className="w-4 h-4 inline mr-2" />
                일정 유형
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {eventTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    disabled={isSubmitting}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.type === type.value
                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center mb-1">
                      <SafeIcon icon={type.icon} className="w-4 h-4 mr-2" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 위치 및 매출 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiMapPin} className="w-4 h-4 inline mr-2" />
                  위치
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="미팅 장소 또는 온라인 링크"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {formData.type === 'meeting' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예상 매출 (원)
                  </label>
                  <input
                    type="number"
                    name="expectedRevenue"
                    value={formData.expectedRevenue}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="예상 계약 금액"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* 상세 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMessageSquare} className="w-4 h-4 inline mr-2" />
                상세 설명
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={3}
                placeholder="일정에 대한 상세 내용을 입력하세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* 추가 옵션 */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allDay"
                  name="allDay"
                  checked={formData.allDay}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700">
                  하루 종일
                </label>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <input
                  type="checkbox"
                  id="reminder"
                  name="reminder"
                  checked={formData.reminder}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="reminder" className="block text-sm text-gray-700">
                  알림 설정
                </label>

                {formData.reminder && (
                  <select
                    name="reminderTime"
                    value={formData.reminderTime}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="10">10분 전</option>
                    <option value="30">30분 전</option>
                    <option value="60">1시간 전</option>
                    <option value="1440">1일 전</option>
                  </select>
                )}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              {(selectedEvent || editMode) && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  <span>삭제</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={selectedEvent || editMode ? FiEdit : FiSave} className="w-4 h-4" />
                    <span>{selectedEvent || editMode ? '수정' : '추가'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default EventForm;
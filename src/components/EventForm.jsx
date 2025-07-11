```jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCalendar } from '../context/CalendarContext';
import { useCRM } from '../context/CRMContext';
import CustomerSearchSelect from './CustomerSearchSelect';
import { format } from 'date-fns';

const {
  FiX,
  FiCalendar,
  FiClock,
  FiUser,
  FiMessageSquare,
  FiMapPin,
  FiTag,
  FiCheck
} = FiIcons;

const eventTypes = [
  { value: 'meeting', label: '미팅', color: '#4f46e5' },
  { value: 'call', label: '통화', color: '#0ea5e9' },
  { value: 'task', label: '할 일', color: '#10b981' },
  { value: 'followup', label: '팔로업', color: '#f59e0b' },
  { value: 'deadline', label: '마감일', color: '#ef4444' }
];

function EventForm({ isOpen, onClose, editMode = false, eventToEdit = null, initialDate = null }) {
  const { addEvent, updateEvent, deleteEvent } = useCalendar();
  const { customers } = useCRM();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting',
    start: initialDate ? `${initialDate}T09:00` : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end: initialDate ? `${initialDate}T10:00` : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    customerId: '',
    description: '',
    location: '',
    priority: 'medium',
    completed: false
  });

  useEffect(() => {
    if (editMode && eventToEdit) {
      setFormData({
        ...eventToEdit,
        start: format(new Date(eventToEdit.start), "yyyy-MM-dd'T'HH:mm"),
        end: eventToEdit.end ? format(new Date(eventToEdit.end), "yyyy-MM-dd'T'HH:mm") : ''
      });
    }
  }, [editMode, eventToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editMode) {
        await updateEvent(eventToEdit.id, formData);
      } else {
        await addEvent(formData);
      }
      onClose();
    } catch (error) {
      console.error('일정 저장 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      try {
        await deleteEvent(eventToEdit.id);
        onClose();
      } catch (error) {
        console.error('일정 삭제 오류:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getSelectedCustomer = () => {
    return customers.find(c => c.id === formData.customerId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editMode ? '일정 수정' : '새 일정'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                일정 유형
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {eventTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange({
                      target: { name: 'type', value: type.value }
                    })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.type === type.value
                        ? 'bg-opacity-10 border-opacity-50'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: formData.type === type.value ? `${type.color}20` : '',
                      borderColor: formData.type === type.value ? type.color : '',
                      color: formData.type === type.value ? type.color : 'inherit'
                    }}
                  >
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMessageSquare} className="w-4 h-4 inline mr-2" />
                제목
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="일정 제목을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 inline mr-2" />
                  시작 일시
                </label>
                <input
                  type="datetime-local"
                  name="start"
                  value={formData.start}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiClock} className="w-4 h-4 inline mr-2" />
                  종료 일시
                </label>
                <input
                  type="datetime-local"
                  name="end"
                  value={formData.end}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiUser} className="w-4 h-4 inline mr-2" />
                관련 고객
              </label>
              <CustomerSearchSelect
                customers={customers}
                value={formData.customerId}
                onChange={(customerId) => handleChange({
                  target: { name: 'customerId', value: customerId }
                })}
                disabled={isSubmitting}
              />
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
                <SafeIcon icon={FiMapPin} className="w-4 h-4 inline mr-2" />
                장소
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="장소를 입력하세요 (선택사항)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMessageSquare} className="w-4 h-4 inline mr-2" />
                설명
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="일정에 대한 설명을 입력하세요 (선택사항)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiTag} className="w-4 h-4 inline mr-2" />
                우선순위
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="high">높음</option>
                <option value="medium">중간</option>
                <option value="low">낮음</option>
              </select>
            </div>

            {editMode && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="completed"
                  id="completed"
                  checked={formData.completed}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="completed" className="ml-2 block text-sm text-gray-900">
                  완료됨
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              {editMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  disabled={isSubmitting}
                >
                  삭제
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                disabled={isSubmitting}
              >
                <SafeIcon icon={FiCheck} className="w-4 h-4" />
                <span>{editMode ? '수정' : '추가'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default EventForm;
```
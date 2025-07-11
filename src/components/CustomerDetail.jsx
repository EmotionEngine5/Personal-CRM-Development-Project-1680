import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCRM } from '../context/CRMContext';
import { useCalendar } from '../context/CalendarContext';
import CalendarEvents from './CalendarEvents';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const { 
  FiUser, FiMail, FiPhone, FiBriefcase, FiMapPin, FiCalendar, 
  FiDollarSign, FiTag, FiMessageSquare, FiEdit, FiPlus, FiUsers
} = FiIcons;

function CustomerDetail({ customer, onClose }) {
  const { getCustomerEventStats } = useCalendar();
  const [activeTab, setActiveTab] = useState('info');
  
  if (!customer) return null;
  
  const eventStats = getCustomerEventStats(customer.id);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiBriefcase} className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{customer.companyName}</h2>
                <p className="text-gray-600">{customer.contactName} • {customer.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <SafeIcon icon={FiEdit} className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'info' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              고객 정보
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'events' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              컨택 이력 ({eventStats.total})
            </button>
          </div>
          
          {activeTab === 'info' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">담당자</p>
                      <p className="font-medium">{customer.contactName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">이메일</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  </div>
                  
                  {customer.phone && (
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiPhone} className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">연락처</p>
                        <p className="font-medium">{customer.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">등록일</p>
                      <p className="font-medium">
                        {format(new Date(customer.createdAt), 'yyyy년 MM월 dd일')}
                        {' '}
                        ({formatDistanceToNow(new Date(customer.createdAt), {
                          addSuffix: true,
                          locale: ko
                        })})
                      </p>
                    </div>
                  </div>
                </div>
                
                {customer.notes && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">메모</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-line">{customer.notes}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">계약 정보</h3>
                <div className="space-y-3">
                  {customer.users && (
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiUsers} className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">사용자 수</p>
                        <p className="font-medium">{customer.users}명</p>
                      </div>
                    </div>
                  )}
                  
                  {customer.monthlyFee && (
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">월 요금</p>
                        <p className="font-medium">{formatCurrency(customer.monthlyFee)}</p>
                      </div>
                    </div>
                  )}
                  
                  {customer.meetingDate && (
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">약속 일정</p>
                        <p className="font-medium">
                          {format(new Date(customer.meetingDate), 'yyyy년 MM월 dd일 HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {customer.tags && customer.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">태그</h3>
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 컨택 요약 */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">컨택 요약</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-600">{eventStats.meetings}</p>
                      <p className="text-sm text-gray-500">미팅</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{eventStats.calls}</p>
                      <p className="text-sm text-gray-500">통화</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{eventStats.followups}</p>
                      <p className="text-sm text-gray-500">팔로업</p>
                    </div>
                  </div>
                  {eventStats.lastContact && (
                    <div className="mt-3 text-center text-sm text-gray-600">
                      마지막 컨택: {formatDistanceToNow(parseISO(eventStats.lastContact), {
                        addSuffix: true,
                        locale: ko
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">컨택 이력</h3>
                <Link to="/calendar" className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium">
                  <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1" />
                  <span>새 일정 추가</span>
                </Link>
              </div>
              <CalendarEvents customerId={customer.id} />
            </div>
          )}
          
          <div className="flex justify-end mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CustomerDetail;
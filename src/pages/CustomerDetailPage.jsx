import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCRM } from '../context/CRMContext';
import { useCalendar } from '../context/CalendarContext';
import CalendarEvents from '../components/CalendarEvents';
import EventForm from '../components/EventForm';
import { format, differenceInDays } from 'date-fns';

const { 
  FiArrowLeft, FiEdit, FiTrash2, FiMail, FiPhone, FiUsers, 
  FiDollarSign, FiCalendar, FiPlus, FiMessageSquare, FiTag
} = FiIcons;

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomerById, deleteCustomer } = useCRM();
  const { getCustomerEventStats } = useCalendar();
  const [showEventForm, setShowEventForm] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  
  const customer = getCustomerById(id);
  
  useEffect(() => {
    if (!customer) {
      navigate('/crm');
    }
  }, [customer, navigate]);
  
  if (!customer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">고객을 찾을 수 없습니다</h3>
        <button 
          onClick={() => navigate('/crm')} 
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          CRM으로 돌아가기
        </button>
      </div>
    );
  }
  
  const eventStats = getCustomerEventStats(customer.id);
  
  const handleDelete = () => {
    if (window.confirm('정말로 이 고객을 삭제하시겠습니까?')) {
      deleteCustomer(id);
      navigate('/crm');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount || 0);
  };
  
  const daysSinceLastContact = eventStats.lastContact 
    ? differenceInDays(new Date(), new Date(eventStats.lastContact))
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/crm')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.companyName}</h1>
            <p className="text-gray-600">{customer.contactName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate(`/crm/edit/${customer.id}`)}
            className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
          >
            <SafeIcon icon={FiEdit} className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
          >
            <SafeIcon icon={FiTrash2} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 font-medium ${
              activeTab === 'info' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            고객 정보
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-3 font-medium ${
              activeTab === 'events' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            컨택 이력 ({eventStats.total})
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'info' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">이메일</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  </div>
                  
                  {customer.phone && (
                    <div className="flex items-start space-x-3">
                      <SafeIcon icon={FiPhone} className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">연락처</p>
                        <p className="font-medium">{customer.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {customer.users && (
                    <div className="flex items-start space-x-3">
                      <SafeIcon icon={FiUsers} className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">사용자 수</p>
                        <p className="font-medium">{customer.users}명</p>
                      </div>
                    </div>
                  )}
                  
                  {customer.monthlyFee && (
                    <div className="flex items-start space-x-3">
                      <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">월 요금</p>
                        <p className="font-medium">{formatCurrency(customer.monthlyFee)}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {customer.tags && customer.tags.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-500 mb-2">태그</p>
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                        >
                          <SafeIcon icon={FiTag} className="w-3 h-3 inline mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {customer.notes && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-500 mb-2">메모</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-line">{customer.notes}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="bg-primary-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">컨택 요약</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-primary-600">{eventStats.meetings}</p>
                      <p className="text-xs text-gray-500">미팅</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-blue-600">{eventStats.calls}</p>
                      <p className="text-xs text-gray-500">통화</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-orange-600">{eventStats.followups}</p>
                      <p className="text-xs text-gray-500">팔로업</p>
                    </div>
                  </div>
                  
                  {eventStats.lastContact ? (
                    <div className={`text-center p-2 rounded-lg ${
                      daysSinceLastContact > 14 ? 'bg-red-100 text-red-700' : 
                      daysSinceLastContact > 7 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      <p className="text-sm font-medium">
                        마지막 컨택: {format(new Date(eventStats.lastContact), 'yyyy년 MM월 dd일')}
                        {' '}({daysSinceLastContact}일 전)
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-2 bg-red-100 text-red-700 rounded-lg">
                      <p className="text-sm font-medium">아직 기록된 컨택이 없습니다</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">등록일</p>
                        <p className="font-medium">
                          {format(new Date(customer.createdAt), 'yyyy년 MM월 dd일')}
                        </p>
                      </div>
                    </div>
                    
                    {customer.meetingDate && (
                      <div className="flex items-start space-x-3">
                        <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">약속 일정</p>
                          <p className="font-medium">
                            {format(new Date(customer.meetingDate), 'yyyy년 MM월 dd일 HH:mm')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">컨택 이력</h3>
                <button
                  onClick={() => setShowEventForm(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  <span>새 컨택 추가</span>
                </button>
              </div>
              <CalendarEvents customerId={customer.id} />
            </div>
          )}
        </div>
      </div>
      
      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          isOpen={showEventForm}
          onClose={() => setShowEventForm(false)}
          initialValues={{ customerId: customer.id }}
        />
      )}
    </div>
  );
}

export default CustomerDetailPage;
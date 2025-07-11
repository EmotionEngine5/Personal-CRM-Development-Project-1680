import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCRM } from '../context/CRMContext';
import { useCalendar } from '../context/CalendarContext';
import CustomerForm from '../components/CustomerForm';
import CalendarEvents from '../components/CalendarEvents';
import { format } from 'date-fns';
import { formatNumber, formatCurrency } from '../utils/formatters';

const { FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiMail, FiPhone, FiUsers, FiDollarSign, FiCalendar, FiBriefcase, FiChevronDown, FiChevronUp } = FiIcons;

function CRM() {
  const { customers, deleteCustomer } = useCRM();
  const { hasEventsOnDate } = useCalendar();
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || customer.tags?.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('정말로 이 고객을 삭제하시겠습니까?')) {
      deleteCustomer(id);
      if (selectedCustomerId === id) {
        setSelectedCustomerId(null);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const toggleCustomerDetails = (customerId) => {
    setSelectedCustomerId(selectedCustomerId === customerId ? null : customerId);
  };

  const allTags = [...new Set(customers.flatMap(customer => customer.tags || []))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM 고객 관리</h1>
          <p className="text-gray-600">SaaS 영업 고객 정보를 관리하세요</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>신규 고객 등록</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="고객사명, 담당자명, 이메일로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <SafeIcon icon={FiFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">모든 태그</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCustomers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiBriefcase} className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{customer.companyName}</h3>
                      <p className="text-sm text-gray-500">{customer.contactName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <SafeIcon icon={FiEdit} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <SafeIcon icon={FiMail} className="w-4 h-4" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <SafeIcon icon={FiPhone} className="w-4 h-4" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {customer.users && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <SafeIcon icon={FiUsers} className="w-4 h-4" />
                        <span>{formatNumber(customer.users)}명</span>
                      </div>
                    )}
                    {customer.monthlyFee && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <SafeIcon icon={FiDollarSign} className="w-4 h-4" />
                        <span>{formatCurrency(customer.monthlyFee)}</span>
                      </div>
                    )}
                    {customer.meetingDate && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                        <span>{format(new Date(customer.meetingDate), 'yyyy-MM-dd HH:mm')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {customer.tags && customer.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {customer.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {customer.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{customer.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>등록일: {format(new Date(customer.createdAt), 'yyyy-MM-dd')}</span>
                  <button
                    onClick={() => toggleCustomerDetails(customer.id)}
                    className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <span>컨택 이력</span>
                    <SafeIcon
                      icon={selectedCustomerId === customer.id ? FiChevronUp : FiChevronDown}
                      className="w-4 h-4 ml-1"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 일정 목록 (선택적으로 표시) */}
            {selectedCustomerId === customer.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <CalendarEvents customerId={customer.id} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiUsers} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 고객이 없습니다</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterTag ? '검색 조건을 조정해보세요.' : '첫 번째 고객을 등록해보세요.'}
          </p>
          {!searchTerm && !filterTag && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              신규 고객 등록
            </button>
          )}
        </div>
      )}

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm customer={editingCustomer} onClose={handleCloseForm} />
      )}
    </div>
  );
}

export default CRM;
```jsx
import React, { useState, useEffect, useRef } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { motion, AnimatePresence } from 'framer-motion';

const { FiSearch, FiUser, FiBriefcase, FiMail, FiX } = FiIcons;

function CustomerSearchSelect({ customers, value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const listRef = useRef(null);
  
  const selectedCustomer = customers.find(c => c.id === value);

  // 검색어에 따른 고객 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.companyName?.toLowerCase().includes(searchLower) ||
        customer.contactName?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredCustomers(filtered);
    setHighlightedIndex(filtered.length > 0 ? 0 : -1);
  }, [searchTerm, customers]);

  // 클릭 이벤트 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        listRef.current && !listRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 키보드 네비게이션 처리
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCustomers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : prev
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCustomers[highlightedIndex]) {
          handleSelect(filteredCustomers[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (customer) => {
    onChange(customer.id);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <div className="relative">
        {selectedCustomer ? (
          // 선택된 고객 표시
          <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-semibold text-sm">
                  {selectedCustomer.companyName?.[0] || 'C'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {selectedCustomer.companyName}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {selectedCustomer.contactName}
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full"
              disabled={disabled}
            >
              <SafeIcon icon={FiX} className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          // 검색 입력창
          <div className="relative">
            <SafeIcon
              icon={FiSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="고객사명 또는 담당자명으로 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={disabled}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && !selectedCustomer && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
          >
            {filteredCustomers.length > 0 ? (
              <ul className="py-1">
                {filteredCustomers.map((customer, index) => (
                  <motion.li
                    key={customer.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleSelect(customer)}
                    className={`px-4 py-2 cursor-pointer flex items-start space-x-3 ${
                      index === highlightedIndex
                        ? 'bg-primary-50 text-primary-900'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-semibold text-sm">
                        {customer.companyName?.[0] || 'C'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {customer.companyName}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <SafeIcon icon={FiUser} className="w-3 h-3 mr-1" />
                          {customer.contactName}
                        </span>
                        {customer.email && (
                          <span className="flex items-center truncate">
                            <SafeIcon icon={FiMail} className="w-3 h-3 mr-1" />
                            {customer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <SafeIcon icon={FiBriefcase} className="w-6 h-6 mx-auto mb-2" />
                <p>검색 결과가 없습니다</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CustomerSearchSelect;
```
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCRM } from '../context/CRMContext';
import NotificationButton from './NotificationButton';
import ProfileButton from './ProfileButton';

const { FiSearch } = FiIcons;

const pageNames = {
  '/': '대시보드',
  '/crm': 'CRM 관리',
  '/analytics': '영업통계',
  '/revenue': '매출관리',
  '/settings': '설정',
  '/calendar': '영업 캘린더'
};

function Header() {
  const location = useLocation();
  const { customers } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const currentPage = pageNames[location.pathname] || 'EmotionEngineCRM';

  const filteredCustomers = customers.filter(customer =>
    customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  };

  const handleSearchResultClick = () => {
    setShowSearchResults(false);
    setSearchTerm('');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentPage}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <SafeIcon
              icon={FiSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
            />
            <input
              type="text"
              placeholder="고객사명으로 검색..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm && setShowSearchResults(true)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-80"
            />

            {/* Search Results */}
            {showSearchResults && filteredCustomers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {filteredCustomers.slice(0, 10).map(customer => (
                  <div
                    key={customer.id}
                    onClick={handleSearchResultClick}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{customer.companyName}</div>
                    <div className="text-sm text-gray-500">
                      {customer.contactName} • {customer.email}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <NotificationButton />

          {/* Profile */}
          <ProfileButton />
        </div>
      </div>
    </header>
  );
}

export default Header;
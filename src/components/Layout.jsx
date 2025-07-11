import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

// 오류 폴백 컴포넌트
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
    <h2 className="text-lg font-semibold text-red-700 mb-2">오류가 발생했습니다</h2>
    <p className="text-red-600 mb-4">{error.message || "알 수 없는 오류가 발생했습니다."}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
    >
      다시 시도
    </button>
  </div>
);

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content area with left margin for desktop sidebar */}
      <div className="lg:ml-64">
        <Header />
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
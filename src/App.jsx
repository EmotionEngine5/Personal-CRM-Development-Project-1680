import React, { Suspense, lazy } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { CRMProvider } from './context/CRMContext'
import { NotificationProvider } from './context/NotificationContext'
import { ProfileProvider } from './context/ProfileContext'
import { CalendarProvider } from './context/CalendarContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import NotificationPanel from './components/NotificationPanel'
import RequireAuth from './components/RequireAuth'
import Login from './pages/Login'

// 동적 임포트를 사용한 지연 로딩
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CRM = lazy(() => import('./pages/CRM'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Revenue = lazy(() => import('./pages/Revenue'))
const Settings = lazy(() => import('./pages/Settings'))
const CustomerDetailPage = lazy(() => import('./pages/CustomerDetailPage'))

// 오류 폴백 컴포넌트
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
    <h2 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">오류가 발생했습니다</h2>
    <p className="text-red-600 dark:text-red-400 mb-4">{error.message || "알 수 없는 오류가 발생했습니다."}</p>
    <button 
      onClick={resetErrorBoundary} 
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-500"
    >
      다시 시도
    </button>
  </div>
)

// 404 페이지 컴포넌트
const NotFound = () => (
  <div className="text-center py-12">
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">페이지를 찾을 수 없습니다</h3>
    <p className="text-gray-600 dark:text-gray-400">요청하신 페이지가 존재하지 않습니다.</p>
  </div>
)

// 로딩 컴포넌트
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
    <span className="ml-3 text-gray-600 dark:text-gray-400">로딩 중...</span>
  </div>
)

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <ThemeProvider>
          <CRMProvider>
            <NotificationProvider>
              <ProfileProvider>
                <CalendarProvider>
                  <Router>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route
                        path="/*"
                        element={
                          <RequireAuth>
                            <Layout>
                              <Suspense fallback={<Loading />}>
                                <Routes>
                                  <Route path="/" element={<Dashboard />} />
                                  <Route path="/crm" element={<CRM />} />
                                  <Route path="/crm/customer/:id" element={<CustomerDetailPage />} />
                                  <Route path="/calendar/*" element={<Calendar />} />
                                  <Route path="/analytics" element={<Analytics />} />
                                  <Route path="/revenue" element={<Revenue />} />
                                  <Route path="/settings" element={<Settings />} />
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </Suspense>
                              <NotificationPanel />
                            </Layout>
                          </RequireAuth>
                        }
                      />
                    </Routes>
                  </Router>
                </CalendarProvider>
              </ProfileProvider>
            </NotificationProvider>
          </CRMProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
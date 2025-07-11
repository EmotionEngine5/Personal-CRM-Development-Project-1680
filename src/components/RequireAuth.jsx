import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'

const { FiWifi, FiWifiOff } = FiIcons

function RequireAuth({ children }) {
  const { user, loading, isOnline } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 정보를 확인하고 있습니다...</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <SafeIcon icon={isOnline ? FiWifi : FiWifiOff} className={`w-4 h-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? '온라인' : '오프라인 모드'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default RequireAuth
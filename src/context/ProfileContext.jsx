import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'

// Context 생성
const ProfileContext = createContext()

// 초기 상태 정의
const initialState = {
  profile: {
    name: '',
    email: '',
    phone: '',
    position: '',
    company: '',
    department: '',
    profileImage: null,
    bio: '',
    address: '',
    website: ''
  },
  isLoading: false,
  error: null
}

// 로컬 스토리지 키
const STORAGE_KEY = 'crm-profile'

// 리듀서 함수
function profileReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, isLoading: false }
    
    case 'UPDATE_PROFILE':
      return { 
        ...state, 
        profile: { ...state.profile, ...action.payload }
      }
    
    case 'UPDATE_PROFILE_IMAGE':
      return {
        ...state,
        profile: { ...state.profile, profileImage: action.payload }
      }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

// Provider 컴포넌트
export function ProfileProvider({ children }) {
  const [state, dispatch] = useReducer(profileReducer, initialState)
  const { user } = useAuth()

  // 사용자 정보와 프로필 동기화
  useEffect(() => {
    if (user) {
      // 사용자 정보로 프로필 초기화
      const userProfile = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        position: user.position || '',
        company: user.company || 'EmotionEngine',
        department: user.department || '',
        profileImage: user.profileImage || null,
        bio: user.bio || '',
        address: user.address || '',
        website: user.website || ''
      }

      // 로컬 스토리지에서 추가 프로필 정보 로드
      try {
        const savedProfile = localStorage.getItem(`${STORAGE_KEY}-${user.id}`)
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile)
          dispatch({
            type: 'SET_PROFILE',
            payload: { ...userProfile, ...parsedProfile }
          })
        } else {
          dispatch({ type: 'SET_PROFILE', payload: userProfile })
        }
      } catch (error) {
        console.error('프로필 로드 오류:', error)
        dispatch({ type: 'SET_PROFILE', payload: userProfile })
      }
    } else {
      // 로그아웃 시 프로필 초기화
      dispatch({ type: 'SET_PROFILE', payload: initialState.profile })
    }
  }, [user])

  // 프로필 상태가 변경될 때마다 로컬 스토리지 업데이트
  useEffect(() => {
    if (user && state.profile.name) {
      try {
        localStorage.setItem(
          `${STORAGE_KEY}-${user.id}`,
          JSON.stringify(state.profile)
        )
      } catch (error) {
        console.error('프로필 저장 오류:', error)
      }
    }
  }, [state.profile, user])

  // 프로필 업데이트
  const updateProfile = (profileData) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profileData })
  }

  // 프로필 이미지 업데이트
  const updateProfileImage = (imageFile) => {
    if (imageFile) {
      // 파일 크기 검사 (5MB 제한)
      if (imageFile.size > 5 * 1024 * 1024) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: '이미지 파일 크기는 5MB를 초과할 수 없습니다.' 
        })
        return
      }

      // 파일 타입 검사
      if (!imageFile.type.startsWith('image/')) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: '이미지 파일만 업로드할 수 있습니다.' 
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        dispatch({
          type: 'UPDATE_PROFILE_IMAGE',
          payload: e.target.result
        })
      }
      reader.onerror = () => {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: '이미지 로드 중 오류가 발생했습니다.' 
        })
      }
      reader.readAsDataURL(imageFile)
    }
  }

  // Base64를 Blob으로 변환하는 헬퍼 함수
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  // 프로필 이미지 제거
  const removeProfileImage = () => {
    dispatch({
      type: 'UPDATE_PROFILE_IMAGE',
      payload: null
    })
  }

  // 프로필 초기화
  const clearProfile = () => {
    if (user) {
      localStorage.removeItem(`${STORAGE_KEY}-${user.id}`)
    }
    dispatch({ type: 'SET_PROFILE', payload: initialState.profile })
  }

  // 오류 클리어
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // 컨텍스트 값
  const value = {
    ...state,
    updateProfile,
    updateProfileImage,
    removeProfileImage,
    clearProfile,
    clearError,
    dataURLtoBlob
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

// 커스텀 훅
export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
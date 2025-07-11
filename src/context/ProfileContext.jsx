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
      return { ...state, profile: { ...state.profile, ...action.payload } }
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
      const reader = new FileReader()
      reader.onload = (e) => {
        dispatch({ 
          type: 'UPDATE_PROFILE', 
          payload: { profileImage: e.target.result } 
        })
      }
      reader.readAsDataURL(imageFile)
    }
  }

  // 프로필 초기화
  const clearProfile = () => {
    if (user) {
      localStorage.removeItem(`${STORAGE_KEY}-${user.id}`)
    }
    dispatch({ type: 'SET_PROFILE', payload: initialState.profile })
  }

  // 컨텍스트 값
  const value = {
    ...state,
    updateProfile,
    updateProfileImage,
    clearProfile
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
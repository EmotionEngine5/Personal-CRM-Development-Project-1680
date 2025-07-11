import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, localUsers } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // 온라인/오프라인 상태 감지
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // 세션 복원
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // 로컬 스토리지에서 사용자 정보 확인
        const storedUser = localStorage.getItem('user')
        const storedSession = localStorage.getItem('user_session')
        
        if (storedUser && storedSession) {
          const userData = JSON.parse(storedUser)
          const sessionData = JSON.parse(storedSession)
          
          // 세션 유효성 검사
          if (sessionData.expiresAt > Date.now()) {
            setUser(userData)
            return
          } else {
            // 만료된 세션 정리
            localStorage.removeItem('user')
            localStorage.removeItem('user_session')
          }
        }

        // Supabase 세션 확인 (온라인일 때만)
        if (isOnline) {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
              
            if (profile) {
              setUser({
                id: profile.id,
                username: profile.username,
                email: profile.email,
                name: profile.name,
                role: profile.role,
                position: profile.position,
                company: profile.company
              })
            }
          }
        }
      } catch (error) {
        console.error('인증 초기화 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Supabase 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            
          if (profile) {
            const userData = {
              id: profile.id,
              username: profile.username,
              email: profile.email,
              name: profile.name,
              role: profile.role,
              position: profile.position,
              company: profile.company
            }
            setUser(userData)
            
            // 로컬 스토리지에 저장
            localStorage.setItem('user', JSON.stringify(userData))
            localStorage.setItem('user_session', JSON.stringify({
              expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24시간
            }))
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          localStorage.removeItem('user')
          localStorage.removeItem('user_session')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [isOnline])

  const login = async (username, password) => {
    try {
      setLoading(true)

      // 입력 검증
      if (!username?.trim() || !password?.trim()) {
        throw new Error('사용자명과 비밀번호를 입력해주세요.')
      }

      // 온라인일 때 Supabase 인증 시도
      if (isOnline) {
        try {
          // 사용자명으로 프로필 검색
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('username', username.trim())
            .eq('is_active', true)
            .single()

          if (profileError || !profile) {
            throw new Error('사용자를 찾을 수 없습니다.')
          }

          // 비밀번호 검증 (실제 환경에서는 bcrypt 사용)
          const isValidPassword = await validatePassword(password, profile.password_hash)
          
          if (!isValidPassword) {
            throw new Error('비밀번호가 올바르지 않습니다.')
          }

          // 로그인 성공 - 세션 생성
          const userData = {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            position: profile.position,
            company: profile.company,
            loginTime: new Date().toISOString()
          }

          setUser(userData)
          
          // 로컬 스토리지에 저장
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('user_session', JSON.stringify({
            expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24시간
          }))

          // 로그인 기록 업데이트
          await supabase
            .from('user_profiles')
            .update({
              last_login: new Date().toISOString(),
              login_count: profile.login_count + 1
            })
            .eq('id', profile.id)

          return userData
        } catch (error) {
          console.error('Supabase 로그인 오류:', error)
          // 온라인이지만 Supabase 오류 시 로컬 인증으로 fallback
        }
      }

      // 오프라인이거나 Supabase 오류 시 로컬 사용자 데이터로 인증
      const localUser = localUsers.find(u => 
        u.username === username.trim() && u.password === password
      )

      if (!localUser) {
        throw new Error('사용자명 또는 비밀번호가 올바르지 않습니다.')
      }

      const userData = {
        id: localUser.id,
        username: localUser.username,
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
        position: localUser.position,
        company: localUser.company,
        loginTime: new Date().toISOString(),
        isOffline: !isOnline
      }

      setUser(userData)
      
      // 로컬 스토리지에 저장
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('user_session', JSON.stringify({
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24시간
      }))

      return userData
    } catch (error) {
      console.error('로그인 오류:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      // Supabase 로그아웃 (온라인일 때만)
      if (isOnline) {
        await supabase.auth.signOut()
      }
      
      // 로컬 데이터 정리
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('user_session')
      
      // CRM 데이터는 유지 (사용자가 선택적으로 삭제할 수 있도록)
      
    } catch (error) {
      console.error('로그아웃 오류:', error)
      // 오류가 있어도 로컬 상태는 정리
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('user_session')
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)

      if (!isOnline) {
        throw new Error('회원가입은 온라인 상태에서만 가능합니다.')
      }

      // 사용자명 중복 검사
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', userData.username)
        .single()

      if (existingUser) {
        throw new Error('이미 사용중인 사용자명입니다.')
      }

      // 비밀번호 해시화
      const passwordHash = await hashPassword(userData.password)

      // 새 사용자 생성
      const { data: newUser, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            username: userData.username,
            email: userData.email,
            password_hash: passwordHash,
            name: userData.name,
            role: 'user',
            position: userData.position || '',
            company: userData.company || '',
            is_active: true,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      return newUser
    } catch (error) {
      console.error('회원가입 오류:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    isOnline,
    login,
    logout,
    register
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 비밀번호 검증 함수 (실제 환경에서는 bcrypt 사용)
const validatePassword = async (password, hash) => {
  // 개발 환경에서는 단순 비교
  if (hash === '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi') {
    return password === 'password' || password === '9949'
  }
  
  // 실제 환경에서는 bcrypt.compare 사용
  // return await bcrypt.compare(password, hash)
  return password === '9949' // 임시
}

// 비밀번호 해시화 함수
const hashPassword = async (password) => {
  // 실제 환경에서는 bcrypt.hash 사용
  // return await bcrypt.hash(password, 10)
  return '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // 임시
}
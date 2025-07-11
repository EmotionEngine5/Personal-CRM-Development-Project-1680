import { createClient } from '@supabase/supabase-js'

// Supabase 프로젝트 정보 - 실제 배포 시에는 환경변수로 관리
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// 사용자 테이블 초기화
export const initializeUserTables = async () => {
  try {
    // 사용자 프로필 테이블 생성 쿼리
    const { error } = await supabase.rpc('create_user_tables')
    
    if (error && !error.message.includes('already exists')) {
      console.error('테이블 생성 오류:', error)
    }
    
    // 기본 관리자 계정 생성
    await createDefaultAdmin()
  } catch (error) {
    console.error('초기화 오류:', error)
  }
}

// 기본 관리자 계정 생성
const createDefaultAdmin = async () => {
  try {
    const { data: existingAdmin } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('username', 'admin')
      .single()

    if (!existingAdmin) {
      const { error } = await supabase
        .from('user_profiles')
        .insert([
          {
            username: 'admin',
            email: 'admin@emotionengine.com',
            password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
            name: '시스템 관리자',
            role: 'admin',
            position: 'Administrator',
            company: 'EmotionEngine',
            is_active: true,
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        console.error('관리자 계정 생성 오류:', error)
      }
    }
  } catch (error) {
    console.error('관리자 계정 확인 오류:', error)
  }
}

// 로컬 개발용 임시 사용자 데이터
export const localUsers = [
  {
    id: 'admin',
    username: 'admin',
    password: '9949',
    email: 'admin@emotionengine.com',
    name: '시스템 관리자',
    role: 'admin',
    position: 'Administrator',
    company: 'EmotionEngine'
  },
  {
    id: 'demo',
    username: 'demo',
    password: 'demo123',
    email: 'demo@emotionengine.com',
    name: '데모 사용자',
    role: 'user',
    position: '영업 담당자',
    company: 'EmotionEngine'
  },
  {
    id: 'sales',
    username: 'sales',
    password: 'sales2024',
    email: 'sales@emotionengine.com',
    name: '김영업',
    role: 'sales',
    position: '영업 팀장',
    company: 'EmotionEngine'
  }
]
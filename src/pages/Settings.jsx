import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCRM } from '../context/CRMContext';
import { useProfile } from '../context/ProfileContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

const {
  FiSave,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiTag,
  FiPlus,
  FiX,
  FiSettings,
  FiShield,
  FiBell,
  FiDatabase,
  FiActivity,
  FiClock,
  FiLock,
  FiEye,
  FiMonitor,
  FiSmartphone,
  FiMail,
  FiSun,
  FiMoon,
  FiLayout
} = FiIcons;

function Settings() {
  const { customers, interactions, tags } = useCRM();
  const { profile } = useProfile();
  const { addNotification } = useNotification();
  const { theme, setTheme } = useTheme();
  
  const [customTags, setCustomTags] = useState(tags);
  const [newTag, setNewTag] = useState('');
  const [activeSection, setActiveSection] = useState('appearance');

  const handleExportData = () => {
    const data = {
      customers,
      interactions,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification({
      title: '데이터 내보내기 완료',
      message: 'CRM 데이터가 성공적으로 내보내졌습니다.',
      type: 'success'
    });
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          console.log('가져온 데이터:', data);
          addNotification({
            title: '데이터 가져오기',
            message: '데이터 가져오기 기능이 구현될 예정입니다',
            type: 'info'
          });
        } catch (error) {
          addNotification({
            title: '가져오기 실패',
            message: '올바르지 않은 파일 형식입니다',
            type: 'error'
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      localStorage.removeItem('crm-customers');
      localStorage.removeItem('crm-interactions');
      addNotification({
        title: '데이터 삭제 완료',
        message: '모든 CRM 데이터가 삭제되었습니다. 페이지를 새로고침합니다.',
        type: 'success'
      });
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()]);
      setNewTag('');
      addNotification({
        title: '태그 추가됨',
        message: `"${newTag.trim()}" 태그가 추가되었습니다.`,
        type: 'success'
      });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove));
    addNotification({
      title: '태그 제거됨',
      message: `"${tagToRemove}" 태그가 제거되었습니다.`,
      type: 'info'
    });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('crm-tags', JSON.stringify(customTags));
    addNotification({
      title: '설정 저장됨',
      message: '모든 설정이 성공적으로 저장되었습니다!',
      type: 'success'
    });
  };

  // 테마 모드 변경 핸들러
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    addNotification({
      title: '테마 변경됨',
      message: `${newTheme === 'dark' ? '다크 모드' : '일반 모드'}로 변경되었습니다.`,
      type: 'success'
    });
  };

  const settingSections = [
    {
      id: 'appearance',
      title: '화면 설정',
      icon: FiLayout,
      description: '테마 및 화면 설정'
    },
    {
      id: 'security',
      title: '보안 설정',
      icon: FiShield,
      description: '비밀번호 및 보안 옵션'
    },
    {
      id: 'notifications',
      title: '알림 설정',
      icon: FiBell,
      description: '알림 및 이메일 설정'
    },
    {
      id: 'data',
      title: '데이터 관리',
      icon: FiDatabase,
      description: '백업 및 데이터 관리'
    },
    {
      id: 'system',
      title: '시스템 설정',
      icon: FiSettings,
      description: '일반 시스템 설정'
    }
  ];

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      {/* 테마 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">테마 모드 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 일반 모드 (라이트 모드) */}
          <div 
            onClick={() => handleThemeChange('light')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              theme === 'light' 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <SafeIcon icon={FiSun} className="w-8 h-8 text-yellow-500" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">일반 모드</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                밝은 배경의 깔끔한 테마로 가독성을 높여줍니다
              </p>
              
              {theme === 'light' && (
                <span className="mt-3 px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  현재 선택됨
                </span>
              )}
            </div>
          </div>
          
          {/* 다크 모드 */}
          <div 
            onClick={() => handleThemeChange('dark')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              theme === 'dark' 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <SafeIcon icon={FiMoon} className="w-8 h-8 text-blue-300" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">다크 모드</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                어두운 배경의 클래식한 테마로 눈의 피로를 줄여줍니다
              </p>
              
              {theme === 'dark' && (
                <span className="mt-3 px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  현재 선택됨
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>참고:</strong> 테마 설정은 자동으로 저장되며, 다음에 접속할 때도 유지됩니다.
          </p>
        </div>
      </div>

      {/* 인터페이스 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">인터페이스 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiActivity} className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">애니메이션 효과</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">화면 전환 및 UI 애니메이션</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiClock} className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">자동 로그아웃</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">30분 미활동 시 자동 로그아웃</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      {/* 비밀번호 변경 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">비밀번호 변경</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">현재 비밀번호</label>
            <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-gray-100" placeholder="현재 비밀번호를 입력하세요" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">새 비밀번호</label>
            <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-gray-100" placeholder="새 비밀번호를 입력하세요" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">비밀번호 확인</label>
            <input type="password" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-gray-100" placeholder="새 비밀번호를 다시 입력하세요" />
          </div>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-500 transition-colors">
            비밀번호 변경
          </button>
        </div>
      </div>

      {/* 보안 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">보안 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiLock} className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">2단계 인증</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">추가 보안 계층으로 계정을 보호합니다</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              활성화
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiEye} className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">로그인 알림</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">새로운 기기에서 로그인 시 이메일 알림</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 활성 세션 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">활성 세션</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiMonitor} className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">현재 세션 (Chrome)</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Seoul, South Korea • 현재 활성</p>
              </div>
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">활성</span>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiSmartphone} className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">모바일 앱</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Seoul, South Korea • 2시간 전</p>
              </div>
            </div>
            <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">종료</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      {/* 이메일 알림 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">이메일 알림</h3>
        <div className="space-y-4">
          {[
            { label: '새로운 고객 등록', description: '새 고객이 추가될 때 알림' },
            { label: '일정 알림', description: '예정된 미팅 및 일정 알림' },
            { label: '시스템 업데이트', description: '새로운 기능 및 업데이트 소식' },
            { label: '보안 알림', description: '계정 보안 관련 중요 알림' },
            { label: '주간 리포트', description: '주간 성과 및 통계 리포트' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{item.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={index < 3} />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 알림 방식 설정 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">알림 방식</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">이메일 주소</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <label className="flex items-center space-x-3">
                <input type="radio" name="notification-frequency" defaultChecked className="text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">즉시</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">알림 발생 시 즉시 전송</p>
                </div>
              </label>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <label className="flex items-center space-x-3">
                <input type="radio" name="notification-frequency" className="text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">일일 요약</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">하루 한 번 요약해서 전송</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      {/* 데이터 백업 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">데이터 백업</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleExportData}
            className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
          >
            <SafeIcon icon={FiDownload} className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-blue-600 dark:text-blue-400 font-medium">데이터 내보내기</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">JSON 파일로 백업</span>
          </button>

          <label className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-800/40 transition-colors cursor-pointer">
            <SafeIcon icon={FiUpload} className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-green-600 dark:text-green-400 font-medium">데이터 가져오기</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">백업 파일 복원</span>
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>

          <button
            onClick={handleClearAllData}
            className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/40 transition-colors"
          >
            <SafeIcon icon={FiTrash2} className="w-8 h-8 text-red-600 dark:text-red-400 mb-2" />
            <span className="text-red-600 dark:text-red-400 font-medium">데이터 삭제</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">모든 데이터 제거</span>
          </button>
        </div>
      </div>

      {/* 저장공간 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">저장공간 사용량</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 dark:text-gray-300">고객 데이터</span>
              <span className="text-gray-700 dark:text-gray-300">{customers.length}개 항목</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 dark:text-gray-300">상호작용 기록</span>
              <span className="text-gray-700 dark:text-gray-300">{interactions.length}개 항목</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 dark:text-gray-300">첨부파일</span>
              <span className="text-gray-700 dark:text-gray-300">2.3 MB</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between font-medium">
              <span className="text-gray-700 dark:text-gray-300">총 사용량</span>
              <span className="text-gray-700 dark:text-gray-300">4.7 MB / 100 MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSection = () => (
    <div className="space-y-6">
      {/* 태그 관리 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">태그 관리</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="새 태그 추가..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-gray-100"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {customTags.map(tag => (
              <div
                key={tag}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full group hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <SafeIcon icon={FiTag} className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <SafeIcon icon={FiX} className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 시스템 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">시스템 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">애플리케이션</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">버전</span>
                <span className="text-gray-900 dark:text-gray-100">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">빌드</span>
                <span className="text-gray-900 dark:text-gray-100">20241220</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">환경</span>
                <span className="text-gray-900 dark:text-gray-100">Production</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">브라우저</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">이름</span>
                <span className="text-gray-900 dark:text-gray-100">Chrome</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">버전</span>
                <span className="text-gray-900 dark:text-gray-100">119.0.6045.199</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">플랫폼</span>
                <span className="text-gray-900 dark:text-gray-100">Windows 11</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return renderAppearanceSection();
      case 'security':
        return renderSecuritySection();
      case 'notifications':
        return renderNotificationsSection();
      case 'data':
        return renderDataSection();
      case 'system':
        return renderSystemSection();
      default:
        return renderAppearanceSection();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">설정</h1>
          <p className="text-gray-600 dark:text-gray-400">시스템, 보안, 알림 및 데이터 설정을 관리하세요</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-500 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiSave} className="w-4 h-4" />
          <span>설정 저장</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 사이드바 네비게이션 */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full px-4 py-4 text-left flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary-50 dark:bg-primary-900/50 border-r-2 border-primary-500 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <SafeIcon
                  icon={section.icon}
                  className={`w-5 h-5 ${
                    activeSection === section.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
                <div>
                  <p className="font-medium text-sm">{section.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{section.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
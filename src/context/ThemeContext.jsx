import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // localStorage에서 테마 설정을 가져오거나 기본값으로 'dark' 사용
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark'; // 기본값은 다크 모드
  });

  // 테마 변경 시 localStorage에 저장 및 HTML 클래스 업데이트
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // HTML의 data-theme 속성 업데이트
    document.documentElement.setAttribute('data-theme', theme);
    
    // 다크 모드일 때 dark 클래스 추가, 아닐 때는 제거
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 테마 토글 함수
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // 특정 테마로 설정하는 함수
  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setTheme(newTheme);
    }
  };

  const value = {
    theme,
    isDarkMode: theme === 'dark',
    toggleTheme,
    setTheme: setSpecificTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
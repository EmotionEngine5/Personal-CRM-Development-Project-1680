import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 전역 오류 핸들러 설정
window.addEventListener('error', (event) => {
  console.error('전역 오류:', event.error);
});

// 비동기 오류 핸들러 설정
window.addEventListener('unhandledrejection', (event) => {
  console.error('비동기 오류:', event.reason);
});

// React 18 createRoot API 사용
const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
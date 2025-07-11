/**
 * 숫자 포맷팅 유틸리티 함수 모음
 */

/**
 * 숫자에 천 단위 쉼표를 추가하는 함수
 * @param {number|string} value - 포맷팅할 숫자 또는 숫자 문자열
 * @param {boolean} forceNumber - 강제로 숫자로 변환할지 여부 (기본값: false)
 * @returns {string} 천 단위 쉼표가 포함된 문자열
 */
export const formatNumber = (value, forceNumber = false) => {
  // null, undefined 체크
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  
  // 숫자가 아닌 경우 처리
  if (isNaN(Number(value)) && !forceNumber) {
    return String(value);
  }
  
  try {
    // 숫자로 변환하여 천 단위 쉼표 추가
    return Number(value).toLocaleString('ko-KR');
  } catch (error) {
    console.error('숫자 포맷팅 오류:', error);
    return String(value);
  }
};

/**
 * 통화 형식으로 포맷팅하는 함수
 * @param {number|string} value - 포맷팅할 금액
 * @param {string} currency - 통화 코드 (기본값: 'KRW')
 * @returns {string} 통화 형식으로 포맷팅된 문자열
 */
export const formatCurrency = (value, currency = 'KRW') => {
  if (value === null || value === undefined || value === '') {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency }).format(0);
  }
  
  try {
    return new Intl.NumberFormat('ko-KR', { 
      style: 'currency', 
      currency,
      maximumFractionDigits: 0 // 소수점 제거
    }).format(Number(value));
  } catch (error) {
    console.error('통화 포맷팅 오류:', error);
    return String(value);
  }
};

/**
 * 퍼센트 형식으로 포맷팅하는 함수
 * @param {number|string} value - 포맷팅할 값 (0-100 또는 0-1)
 * @param {boolean} isDecimal - 값이 0-1 사이의 소수인지 여부 (기본값: false)
 * @returns {string} 퍼센트 형식으로 포맷팅된 문자열
 */
export const formatPercent = (value, isDecimal = false) => {
  if (value === null || value === undefined || value === '') {
    return '0%';
  }
  
  try {
    const numValue = Number(value);
    // 0-1 사이의 소수를 퍼센트로 변환
    const percentValue = isDecimal ? numValue * 100 : numValue;
    
    return new Intl.NumberFormat('ko-KR', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(percentValue / 100);
  } catch (error) {
    console.error('퍼센트 포맷팅 오류:', error);
    return String(value) + '%';
  }
};

/**
 * 숫자 단위 축약 포맷팅 (예: 1,000 -> 1K, 1,000,000 -> 1M)
 * @param {number|string} value - 포맷팅할 숫자
 * @returns {string} 단위가 축약된 문자열
 */
export const formatCompactNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  
  try {
    return new Intl.NumberFormat('ko-KR', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(Number(value));
  } catch (error) {
    console.error('축약 숫자 포맷팅 오류:', error);
    return String(value);
  }
};
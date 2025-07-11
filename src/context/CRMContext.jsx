import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { format } from 'date-fns';

const CRMContext = createContext();

const initialState = {
  customers: [],
  interactions: [],
  tags: ['신규고객', '기존고객', '잠재고객', '계약완료', '협의중', '보류'],
  loading: false,
  error: null
};

// 샘플 데이터
const sampleCustomers = [
  {
    id: 'sample1',
    companyName: 'ABC 테크놀로지',
    contactName: '김영수',
    email: 'youngsoo.kim@abctech.co.kr',
    phone: '02-1234-5678',
    users: 25,
    monthlyFee: 500000,
    meetingDate: '2024-12-25T14:00',
    notes: '클라우드 솔루션 도입을 검토 중인 중견기업입니다.',
    tags: ['신규고객', '협의중'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5일 전
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample2',
    companyName: 'XYZ 솔루션',
    contactName: '박민정',
    email: 'minjung.park@xyzsol.com',
    phone: '02-9876-5432',
    users: 50,
    monthlyFee: 1200000,
    meetingDate: '2024-12-28T10:00',
    notes: '기존 시스템 교체를 위한 SaaS 솔루션 검토 중',
    tags: ['기존고객', '계약완료'],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30일 전
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample3',
    companyName: '123 컴퍼니',
    contactName: '이철수',
    email: 'chulsoo.lee@123company.kr',
    phone: '02-5555-1234',
    users: 10,
    monthlyFee: 300000,
    notes: '스타트업으로 빠르게 성장하고 있는 회사',
    tags: ['잠재고객'],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10일 전
    updatedAt: new Date().toISOString()
  }
];

const sampleInteractions = [
  {
    id: 'interaction1',
    customerId: 'sample1',
    type: 'call',
    subject: '제품 설명 및 데모 일정 조율',
    notes: '담당자와 제품 기능에 대해 상세히 논의했습니다. 다음 주 데모 일정을 잡기로 했습니다.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2일 전
  },
  {
    id: 'interaction2',
    customerId: 'sample2',
    type: 'meeting',
    subject: '계약 체결 완료',
    notes: '최종 계약서에 서명하고 프로젝트 킥오프 미팅을 진행했습니다.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString() // 7일 전
  },
  {
    id: 'interaction3',
    customerId: 'sample1',
    type: 'email',
    subject: '견적서 발송',
    notes: '요청사항을 반영한 견적서를 이메일로 발송했습니다.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString() // 1일 전
  }
];

function crmReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CUSTOMERS':
      return { ...state, customers: action.payload, loading: false };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? action.payload : customer
        )
      };
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload)
      };
    case 'ADD_INTERACTION':
      return { ...state, interactions: [...state.interactions, action.payload] };
    case 'SET_INTERACTIONS':
      return { ...state, interactions: action.payload };
    default:
      return state;
  }
}

export function CRMProvider({ children }) {
  const [state, dispatch] = useReducer(crmReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem('crm-customers');
      const savedInteractions = localStorage.getItem('crm-interactions');

      if (savedCustomers) {
        const parsedCustomers = JSON.parse(savedCustomers);
        dispatch({ type: 'SET_CUSTOMERS', payload: parsedCustomers });
      } else {
        // 샘플 데이터로 초기화
        dispatch({ type: 'SET_CUSTOMERS', payload: sampleCustomers });
        localStorage.setItem('crm-customers', JSON.stringify(sampleCustomers));
      }

      if (savedInteractions) {
        const parsedInteractions = JSON.parse(savedInteractions);
        dispatch({ type: 'SET_INTERACTIONS', payload: parsedInteractions });
      } else {
        // 샘플 인터랙션 데이터로 초기화
        dispatch({ type: 'SET_INTERACTIONS', payload: sampleInteractions });
        localStorage.setItem('crm-interactions', JSON.stringify(sampleInteractions));
      }
    } catch (error) {
      console.error('CRM 데이터 로드 오류:', error);
      dispatch({ type: 'SET_ERROR', payload: 'CRM 데이터를 불러오는 중 오류가 발생했습니다.' });
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      if (state.customers.length > 0) {
        localStorage.setItem('crm-customers', JSON.stringify(state.customers));
      }
    } catch (error) {
      console.error('고객 데이터 저장 오류:', error);
    }
  }, [state.customers]);

  useEffect(() => {
    try {
      if (state.interactions.length > 0) {
        localStorage.setItem('crm-interactions', JSON.stringify(state.interactions));
      }
    } catch (error) {
      console.error('인터랙션 데이터 저장 오류:', error);
    }
  }, [state.interactions]);

  const addCustomer = (customerData) => {
    try {
      const newCustomer = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...customerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
      return newCustomer;
    } catch (error) {
      console.error('고객 추가 오류:', error);
      dispatch({ type: 'SET_ERROR', payload: '고객을 추가하는 중 오류가 발생했습니다.' });
      return null;
    }
  };

  const updateCustomer = (id, updates) => {
    try {
      const customer = state.customers.find(c => c.id === id);
      if (customer) {
        const updatedCustomer = {
          ...customer,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
        return updatedCustomer;
      }
      return null;
    } catch (error) {
      console.error('고객 업데이트 오류:', error);
      dispatch({ type: 'SET_ERROR', payload: '고객 정보를 업데이트하는 중 오류가 발생했습니다.' });
      return null;
    }
  };

  const deleteCustomer = (id) => {
    try {
      dispatch({ type: 'DELETE_CUSTOMER', payload: id });
      return true;
    } catch (error) {
      console.error('고객 삭제 오류:', error);
      dispatch({ type: 'SET_ERROR', payload: '고객을 삭제하는 중 오류가 발생했습니다.' });
      return false;
    }
  };

  const addInteraction = (customerId, interactionData) => {
    try {
      const newInteraction = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        customerId,
        ...interactionData,
        createdAt: new Date().toISOString()
      };
      dispatch({ type: 'ADD_INTERACTION', payload: newInteraction });
      return newInteraction;
    } catch (error) {
      console.error('인터랙션 추가 오류:', error);
      dispatch({ type: 'SET_ERROR', payload: '인터랙션을 추가하는 중 오류가 발생했습니다.' });
      return null;
    }
  };

  const getCustomerById = (id) => {
    try {
      return state.customers.find(customer => customer.id === id);
    } catch (error) {
      console.error('고객 조회 오류:', error);
      return null;
    }
  };

  const getInteractionsByCustomerId = (customerId) => {
    try {
      return state.interactions.filter(interaction => interaction.customerId === customerId);
    } catch (error) {
      console.error('인터랙션 조회 오류:', error);
      return [];
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value = {
    ...state,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addInteraction,
    getCustomerById,
    getInteractionsByCustomerId,
    clearError
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
}

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCRM } from '../context/CRMContext';
import { useCalendar } from '../context/CalendarContext';
import { format, parseISO, subDays, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import WisdomQuote from '../components/WisdomQuote';

const { FiTrendingUp, FiUsers, FiDollarSign, FiTarget, FiCalendar, FiPhone, FiMail, FiCheck, FiClock } = FiIcons;

function Dashboard() {
  const { customers } = useCRM();
  const { events } = useCalendar();
  const [selectedDate] = useState(new Date());

  // 영업 통계 데이터 계산
  // 고객 증가 추이 (최근 6개월)
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });
  
  const customerGrowthData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const count = customers.filter(customer => {
      const createdDate = new Date(customer.createdAt);
      return isWithinInterval(createdDate, { start: monthStart, end: monthEnd });
    }).length;
    
    return {
      date: format(month, 'yyyy년 MM월'),
      count: count
    };
  });

  // 최근 통계
  const recentCustomers = customers.filter(customer => 
    isAfter(new Date(customer.createdAt), subDays(new Date(), 7))
  ).length;
  
  const totalRevenue = customers.reduce((sum, customer) => sum + (customer.monthlyFee || 0), 0);
  const avgRevenue = customers.length > 0 ? totalRevenue / customers.length : 0;

  // 오늘 일정
  const todayEvents = events
    .filter(event => {
      if (!event || !event.start) return false;
      try {
        return format(parseISO(event.start), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
      } catch (error) {
        return false;
      }
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  // 다가오는 일정
  const upcomingEvents = events
    .filter(event => {
      if (!event || !event.start) return false;
      try {
        const eventDate = parseISO(event.start);
        return eventDate > new Date() && format(eventDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd');
      } catch (error) {
        return false;
      }
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 5);

  // 차트 옵션 설정
  const customerGrowthOption = {
    title: {
      text: '고객 증가 추이 (최근 6개월)',
      left: 'left',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}명'
    },
    xAxis: {
      type: 'category',
      data: customerGrowthData.map(item => item.date),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '신규 고객 수',
      nameTextStyle: {
        padding: [0, 0, 0, 40]
      }
    },
    series: [{
      name: '신규 고객',
      data: customerGrowthData.map(item => item.count),
      type: 'bar',
      itemStyle: {
        color: '#0ea5e9'
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}명'
      }
    }]
  };

  // 주요 통계 데이터
  const stats = [
    {
      name: '총 고객 수',
      value: customers.length,
      change: `+${recentCustomers} 이번 주`,
      icon: FiUsers,
      color: 'bg-blue-500'
    },
    {
      name: '월 총 매출',
      value: `${Math.round(totalRevenue / 10000)}만원`,
      change: `평균 ${Math.round(avgRevenue / 10000)}만원`,
      icon: FiDollarSign,
      color: 'bg-green-500'
    },
    {
      name: '일정 수',
      value: events.length,
      change: '모든 일정',
      icon: FiCalendar,
      color: 'bg-purple-500'
    },
    {
      name: '전환율',
      value: `${Math.round((customers.filter(c => c.tags?.includes('계약완료')).length / customers.length) * 100) || 0}%`,
      change: '계약완료 고객 비율',
      icon: FiTrendingUp,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">안녕하세요!</h2>
          <p className="mb-4 opacity-90">오늘도 성공적인 영업 활동을 기원합니다.</p>
          <WisdomQuote />
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-white opacity-5 transform rotate-45 translate-x-1/4"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <SafeIcon icon={stat.icon} className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 고객 증가 추이 차트 - 단독으로 표시 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <ReactECharts option={customerGrowthOption} style={{ height: '400px' }} />
      </motion.div>

      {/* Today's Events & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘 일정</h3>
          <div className="space-y-3">
            {todayEvents.length > 0 ? (
              todayEvents.slice(0, 5).map(event => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getEventColor(event.type) }}>
                    <SafeIcon icon={getEventIcon(event.type)} className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {event.start ? format(parseISO(event.start), 'HH:mm') : '시간 미정'}
                      {event.end && ` - ${format(parseISO(event.end), 'HH:mm')}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">오늘은 일정이 없습니다</p>
              </div>
            )}
            {todayEvents.length > 5 && (
              <Link to="/calendar" className="block text-center text-primary-600 hover:text-primary-700 mt-2">
                더보기 ({todayEvents.length - 5}개 더)
              </Link>
            )}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">다가오는 일정</h3>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getEventColor(event.type) }}>
                    <SafeIcon icon={getEventIcon(event.type)} className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {event.start ? format(parseISO(event.start), 'yyyy년 MM월 dd일 (EEE) HH:mm', { locale: ko }) : '날짜 미정'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">다가오는 일정이 없습니다</p>
              </div>
            )}
            <Link to="/calendar" className="block text-center text-primary-600 hover:text-primary-700 mt-2">
              모든 일정 보기
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// 이벤트 타입에 따른 색상 반환
function getEventColor(type) {
  switch (type) {
    case 'meeting': return '#4f46e5';
    case 'call': return '#0ea5e9';
    case 'email': return '#10b981';
    case 'task': return '#8b5cf6';
    case 'followup': return '#f59e0b';
    case 'deadline': return '#ef4444';
    default: return '#6b7280';
  }
}

// 이벤트 타입에 따른 아이콘 반환
function getEventIcon(type) {
  switch (type) {
    case 'meeting': return FiCalendar;
    case 'call': return FiPhone;
    case 'email': return FiMail;
    case 'task': return FiCheck;
    case 'followup': return FiPhone;
    case 'deadline': return FiClock;
    default: return FiCalendar;
  }
}

export default Dashboard;
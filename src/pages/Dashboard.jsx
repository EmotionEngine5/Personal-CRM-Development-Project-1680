import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCRM } from '../context/CRMContext';
import { useCalendar } from '../context/CalendarContext';
import { format, parseISO, subDays, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth, isWithinInterval, addDays, isAfter, isBefore, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import WisdomQuote from '../components/WisdomQuote';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';

const { FiTrendingUp, FiUsers, FiDollarSign, FiTarget, FiCalendar, FiPhone, FiMail, FiCheck, FiClock, FiAlertCircle, FiFlag, FiActivity, FiPieChart, FiBriefcase, FiMessageSquare, FiStar, FiTrendingDown, FiBarChart, FiRefreshCw, FiEye, FiArrowUp, FiArrowDown, FiZap } = FiIcons;

function Dashboard() {
  const { customers } = useCRM();
  const { events } = useCalendar();
  const [selectedDateRange] = useState('month');

  // 현재 시간 기준점들
  const now = new Date();
  const weekAgo = subDays(now, 7);
  const monthAgo = subDays(now, 30);
  const quarterAgo = subDays(now, 90);

  // 주요 KPI 계산 - 안전한 데이터 처리
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeEvents = Array.isArray(events) ? events : [];

  // 최근 7일간 신규 고객
  const recentCustomers = safeCustomers.filter(customer => {
    if (!customer || !customer.createdAt) return false;
    try {
      return isAfter(new Date(customer.createdAt), weekAgo);
    } catch (error) {
      console.warn('날짜 파싱 오류:', customer.createdAt);
      return false;
    }
  }).length;

  // 매출 관련 계산
  const totalRevenue = safeCustomers.reduce((sum, customer) => {
    return sum + (customer?.monthlyFee || 0);
  }, 0);
  const avgRevenue = safeCustomers.length > 0 ? totalRevenue / safeCustomers.length : 0;
  
  // '계약완료' 상태인 고객만 필터링
  const contractCompletedCustomers = safeCustomers.filter(customer => 
    customer.tags && customer.tags.includes('계약완료')
  );
  
  // '계약완료' 상태인 고객들의 총 사용자 수
  const totalContractCompletedUsers = contractCompletedCustomers.reduce(
    (sum, customer) => sum + (customer.users || 0), 
    0
  );
  
  // '계약완료' 상태인 고객들의 평균 사용자 수 (소수점 한 자리까지)
  const avgContractCompletedUsers = contractCompletedCustomers.length > 0 
    ? (totalContractCompletedUsers / contractCompletedCustomers.length).toFixed(1) 
    : 0;

  // 영업 파이프라인 데이터 - 안전한 태그 확인
  const pipelineData = {
    initial: safeCustomers.filter(c => c?.tags?.includes('신규고객')).length,
    meeting: safeCustomers.filter(c => c?.tags?.includes('협의중')).length,
    proposal: safeCustomers.filter(c => c?.tags?.includes('잠재고객')).length,
    negotiation: safeCustomers.filter(c => c?.tags?.includes('협의중')).length,
    contract: contractCompletedCustomers.length
  };

  // 오늘의 일정
  const todayEvents = safeEvents.filter(event => {
    if (!event || !event.start) return false;
    try {
      const eventDate = new Date(event.start);
      return format(eventDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    } catch (error) {
      return false;
    }
  });

  // 우선순위가 높은 할 일 - 미래 일정만
  const highPriorityTasks = safeEvents
    .filter(event => {
      if (!event || !event.start) return false;
      try {
        const eventDate = new Date(event.start);
        return (
          (event.priority === 'high' || event.type === 'deadline') &&
          !event.completed &&
          isAfter(eventDate, now)
        );
      } catch (error) {
        return false;
      }
    })
    .sort((a, b) => {
      try {
        return new Date(a.start) - new Date(b.start);
      } catch (error) {
        return 0;
      }
    })
    .slice(0, 5);

  // 이번 주 일정 개수
  const weekEvents = safeEvents.filter(event => {
    if (!event || !event.start) return false;
    try {
      const eventDate = new Date(event.start);
      return isAfter(eventDate, weekAgo) && isBefore(eventDate, addDays(now, 7));
    } catch (error) {
      return false;
    }
  }).length;

  // 매출 목표 대비 달성률
  const monthlyTarget = 50000000; // 5천만원 목표
  const achievementRate = monthlyTarget > 0 ? (totalRevenue / monthlyTarget) * 100 : 0;

  // 최근 활동 계산
  const recentActivities = [
    {
      icon: FiUsers,
      text: `신규 고객 ${formatNumber(recentCustomers)}개 등록`,
      time: '이번 주',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: FiCalendar,
      text: `이번 주 일정 ${formatNumber(weekEvents)}개`,
      time: '예정',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: FiDollarSign,
      text: `월 매출 ${formatNumber(Math.round(totalRevenue / 10000))}만원`,
      time: '현재까지',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: FiTarget,
      text: `목표 달성률 ${formatNumber(Math.round(achievementRate))}%`,
      time: '이번 달',
      color: achievementRate >= 70 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
    }
  ];

  // KPI 카드 데이터
  const kpiCards = [
    {
      title: '이번 달 매출',
      value: `${formatNumber(Math.round(totalRevenue / 10000))}만원`,
      change: `목표 달성률 ${formatNumber(Math.round(achievementRate))}%`,
      trend: achievementRate >= 70 ? 'up' : 'down',
      icon: FiDollarSign,
      color: achievementRate >= 100 ? 'bg-green-500' : achievementRate >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
    },
    {
      title: '신규 고객',
      value: formatNumber(recentCustomers),
      change: '이번 주 신규',
      trend: recentCustomers > 0 ? 'up' : 'neutral',
      icon: FiUsers,
      color: 'bg-purple-500'
    },
    {
      title: '평균 사용자 수',
      value: formatNumber(avgContractCompletedUsers),
      change: '계약완료 고객 기준',
      trend: avgContractCompletedUsers > 0 ? 'up' : 'neutral',
      icon: FiTarget,
      color: 'bg-indigo-500'
    },
    {
      title: '오늘 일정',
      value: formatNumber(todayEvents.length),
      change: `이번 주 ${formatNumber(weekEvents)}개`,
      trend: todayEvents.length > 0 ? 'up' : 'neutral',
      icon: FiCalendar,
      color: 'bg-emerald-500'
    }
  ];

  // 차트 설정 - 안전한 데이터로 구성
  const pipelineChartOption = {
    title: {
      text: '영업 파이프라인 현황',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}건 ({d}%)'
    },
    series: [{
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}: {c}건'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      emphasis: {
        label: {
          fontSize: 14
        }
      },
      data: [
        { value: pipelineData.initial, name: '신규 리드', itemStyle: { color: '#4299E1' } },
        { value: pipelineData.meeting, name: '협의중', itemStyle: { color: '#48BB78' } },
        { value: pipelineData.proposal, name: '잠재고객', itemStyle: { color: '#9F7AEA' } },
        { value: pipelineData.contract, name: '계약완료', itemStyle: { color: '#38B2AC' } }
      ]
    }]
  };

  // 월별 매출 데이터 (샘플 데이터 - 실제로는 데이터베이스에서 가져와야 함)
  const monthlyRevenueData = [3200, 4500, 5600, 4800, 6200, Math.round(totalRevenue / 10000)];
  const monthlyTargetData = [3000, 4000, 5000, 5000, 6000, Math.round(monthlyTarget / 10000)];

  const revenueChartOption = {
    title: {
      text: '월별 매출 추이',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach(param => {
          result += `${param.seriesName}: ${formatNumber(param.value)}만원<br/>`;
        });
        return result;
      }
    },
    legend: {
      top: 30,
      data: ['실제 매출', '목표 매출']
    },
    xAxis: {
      type: 'category',
      data: ['1월', '2월', '3월', '4월', '5월', '6월']
    },
    yAxis: {
      type: 'value',
      name: '매출 (만원)',
      axisLabel: {
        formatter: '{value}만원'
      }
    },
    series: [
      {
        name: '실제 매출',
        type: 'line',
        data: monthlyRevenueData,
        itemStyle: {
          color: '#4C51BF'
        },
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(76,81,191,0.3)' },
              { offset: 1, color: 'rgba(76,81,191,0.1)' }
            ]
          }
        }
      },
      {
        name: '목표 매출',
        type: 'line',
        data: monthlyTargetData,
        itemStyle: {
          color: '#E53E3E'
        },
        lineStyle: {
          type: 'dashed'
        },
        smooth: true
      }
    ]
  };

  // 고객 성장 차트
  const customerGrowthOption = {
    title: {
      text: '고객 성장 현황',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return params.map(param => 
          `${param.seriesName}: ${formatNumber(param.value)}${param.seriesName === '신규 고객' ? '개' : '명'}`
        ).join('<br>');
      }
    },
    xAxis: {
      type: 'category',
      data: ['1월', '2월', '3월', '4월', '5월', '6월']
    },
    yAxis: {
      type: 'value',
      name: '고객 수',
      axisLabel: {
        formatter: value => formatNumber(value)
      }
    },
    series: [
      {
        name: '누적 고객',
        type: 'bar',
        data: [12, 18, 25, 32, 38, safeCustomers.length],
        itemStyle: {
          color: '#10B981'
        }
      },
      {
        name: '신규 고객',
        type: 'line',
        data: [12, 6, 7, 7, 6, recentCustomers],
        itemStyle: {
          color: '#F59E0B'
        },
        smooth: true
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* 영업 모티베이션 섹션 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">안녕하세요!</h2>
          <p className="mb-4 opacity-90">오늘도 성공적인 영업 활동을 기원합니다.</p>
          <WisdomQuote />
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-white opacity-5 transform rotate-45 translate-x-1/4"></div>
      </div>

      {/* KPI 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.trend === 'up' && (
                    <SafeIcon icon={FiArrowUp} className="w-4 h-4 text-green-500" />
                  )}
                  {stat.trend === 'down' && (
                    <SafeIcon icon={FiArrowDown} className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <SafeIcon icon={stat.icon} className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <ReactECharts option={pipelineChartOption} style={{ height: '400px' }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <ReactECharts option={revenueChartOption} style={{ height: '400px' }} />
        </motion.div>
      </div>

      {/* 고객 성장 차트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <ReactECharts option={customerGrowthOption} style={{ height: '350px' }} />
      </motion.div>

      {/* 하단 정보 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 우선순위 할 일 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <SafeIcon icon={FiZap} className="w-5 h-5 text-orange-500 mr-2" />
              우선순위 할 일
            </h3>
            <Link to="/calendar" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              전체보기
            </Link>
          </div>
          <div className="space-y-3">
            {highPriorityTasks.length > 0 ? (
              highPriorityTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(task.start), 'M월 d일 HH:mm', { locale: ko })}
                    </p>
                    {task.customerId && (
                      <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                        고객 관련
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiCheck} className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500">우선순위 할 일이 없습니다</p>
                <p className="text-sm text-gray-400">모든 중요한 작업을 완료했습니다!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 최근 활동 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiActivity} className="w-5 h-5 text-blue-500 mr-2" />
            최근 활동
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${activity.color}`}>
                  <SafeIcon icon={activity.icon} className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 영업 목표 현황 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiTarget} className="w-5 h-5 text-green-500 mr-2" />
            영업 목표 현황
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">월 매출 목표</span>
                <span className="font-medium text-gray-900">{formatNumber(Math.round(achievementRate))}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    achievementRate >= 100
                      ? 'bg-green-500'
                      : achievementRate >= 70
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(achievementRate, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(Math.round(totalRevenue / 10000))}만원 / {formatNumber(Math.round(monthlyTarget / 10000))}만원
              </p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">신규 고객 목표</span>
                <span className="font-medium text-gray-900">{formatNumber(Math.round((recentCustomers / 10) * 100))}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((recentCustomers / 10) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatNumber(recentCustomers)}개 / 10개 (이번 주)</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">계약 전환율</span>
                <span className="font-medium text-gray-900">
                  {formatNumber(safeCustomers.length > 0 ? Math.round((pipelineData.contract / safeCustomers.length) * 100) : 0)}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-purple-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      safeCustomers.length > 0
                        ? Math.min((pipelineData.contract / safeCustomers.length) * 100, 100)
                        : 0
                    }%`
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatNumber(pipelineData.contract)}건 / {formatNumber(safeCustomers.length)}건</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiFlag} className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">이번 달 핵심 목표</span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    achievementRate >= 70 ? 'text-green-500' : 'text-orange-500'
                  }`}
                >
                  {achievementRate >= 70 ? '순조' : '노력필요'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                신규 고객사 10개 이상 확보 및 매출 목표 달성
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
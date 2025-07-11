import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCRM } from '../context/CRMContext';
import { format, subDays, eachDayOfInterval, isAfter } from 'date-fns';

const { FiTrendingUp, FiUsers, FiDollarSign, FiTarget, FiPhone, FiMail, FiMessageSquare, FiBriefcase } = FiIcons;

function Analytics() {
  const { customers, interactions } = useCRM();

  // 고객 증가 추이 (최근 30일)
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const customerGrowthData = last30Days.map(day => {
    const count = customers.filter(customer =>
      isAfter(new Date(customer.createdAt), subDays(day, 1)) &&
      !isAfter(new Date(customer.createdAt), day)
    ).length;
    return {
      date: format(day, 'MM-dd'),
      count: count
    };
  });

  // 태그별 고객 분포
  const tagDistribution = customers.reduce((acc, customer) => {
    if (customer.tags) {
      customer.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
    }
    return acc;
  }, {});

  // 매출 분석
  const revenueData = customers.map(customer => ({
    name: customer.companyName,
    value: customer.monthlyFee || 0,
    users: customer.users || 0
  })).sort((a, b) => b.value - a.value);

  // 최근 통계
  const recentCustomers = customers.filter(customer =>
    isAfter(new Date(customer.createdAt), subDays(new Date(), 7))
  ).length;

  const totalRevenue = customers.reduce((sum, customer) => sum + (customer.monthlyFee || 0), 0);
  const avgRevenue = customers.length > 0 ? totalRevenue / customers.length : 0;

  const customerGrowthOption = {
    title: {
      text: '고객 증가 추이 (최근 30일)',
      left: 'left',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: customerGrowthData.map(item => item.date),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: customerGrowthData.map(item => item.count),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(14, 165, 233, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(14, 165, 233, 0.1)'
          }]
        }
      },
      lineStyle: {
        color: '#0ea5e9'
      },
      itemStyle: {
        color: '#0ea5e9'
      }
    }]
  };

  const tagDistributionOption = {
    title: {
      text: '고객 태그 분포',
      left: 'left',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: Object.entries(tagDistribution).map(([tag, count]) => ({
        value: count,
        name: tag
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const revenueOption = {
    title: {
      text: '고객별 월 매출 현황',
      left: 'left',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: revenueData.slice(0, 10).map(item => item.name),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}만원'
      }
    },
    series: [{
      data: revenueData.slice(0, 10).map(item => Math.round(item.value / 10000)),
      type: 'bar',
      itemStyle: {
        color: '#10b981'
      }
    }]
  };

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
      name: '평균 사용자 수',
      value: customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + (c.users || 0), 0) / customers.length) : 0,
      change: '고객당 평균',
      icon: FiTarget,
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <ReactECharts option={customerGrowthOption} style={{ height: '300px' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <ReactECharts option={tagDistributionOption} style={{ height: '300px' }} />
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <ReactECharts option={revenueOption} style={{ height: '400px' }} />
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">영업 현황 요약</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <SafeIcon icon={FiUsers} className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {customers.filter(c => c.tags?.includes('신규고객')).length}
            </p>
            <p className="text-sm text-gray-500">신규 고객</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <SafeIcon icon={FiTarget} className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {customers.filter(c => c.tags?.includes('협의중')).length}
            </p>
            <p className="text-sm text-gray-500">협의중</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <SafeIcon icon={FiDollarSign} className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {customers.filter(c => c.tags?.includes('계약완료')).length}
            </p>
            <p className="text-sm text-gray-500">계약완료</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Analytics;
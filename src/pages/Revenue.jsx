import React from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useCRM } from '../context/CRMContext';
import { formatNumber, formatCurrency } from '../utils/formatters';

const { FiDollarSign, FiTrendingUp, FiUsers, FiTarget } = FiIcons;

function Revenue() {
  const { customers } = useCRM();

  const totalRevenue = customers.reduce((sum, customer) => sum + (customer.monthlyFee || 0), 0);
  const avgRevenue = customers.length > 0 ? totalRevenue / customers.length : 0;
  const totalUsers = customers.reduce((sum, customer) => sum + (customer.users || 0), 0);

  const revenueByCustomer = customers
    .filter(customer => customer.monthlyFee > 0)
    .sort((a, b) => b.monthlyFee - a.monthlyFee);

  const revenueStats = [
    {
      name: '월 총 매출',
      value: `${formatNumber(Math.round(totalRevenue / 10000))}만원`,
      change: '+12% 전월 대비',
      icon: FiDollarSign,
      color: 'bg-green-500'
    },
    {
      name: '평균 고객 단가',
      value: `${formatNumber(Math.round(avgRevenue / 10000))}만원`,
      change: '고객당 평균',
      icon: FiTarget,
      color: 'bg-blue-500'
    },
    {
      name: '총 사용자 수',
      value: formatNumber(totalUsers),
      change: '전체 고객사',
      icon: FiUsers,
      color: 'bg-purple-500'
    },
    {
      name: 'ARPU',
      value: `${formatNumber(Math.round(totalRevenue / (totalUsers || 1) / 10000))}만원`,
      change: '사용자당 평균',
      icon: FiTrendingUp,
      color: 'bg-orange-500'
    }
  ];

  const revenueChartOption = {
    title: {
      text: '고객별 월 매출 현황',
      left: 'left',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        return `${params[0].name}<br/>월 매출: ${formatNumber(params[0].value)}만원`;
      }
    },
    xAxis: {
      type: 'category',
      data: revenueByCustomer.slice(0, 15).map(customer => customer.companyName),
      axisLabel: { rotate: 45, interval: 0 }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: value => `${formatNumber(value)}만원`
      }
    },
    series: [{
      data: revenueByCustomer.slice(0, 15).map(customer => Math.round(customer.monthlyFee / 10000)),
      type: 'bar',
      itemStyle: { color: '#10b981' }
    }]
  };

  const userDistributionOption = {
    title: {
      text: '사용자 수별 고객 분포',
      left: 'left',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return `${params.name}: ${formatNumber(params.value)}개 (${params.percent}%)`;
      }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: customers.filter(c => (c.users || 0) <= 10).length, name: '1-10명' },
        { value: customers.filter(c => (c.users || 0) > 10 && (c.users || 0) <= 50).length, name: '11-50명' },
        { value: customers.filter(c => (c.users || 0) > 50 && (c.users || 0) <= 100).length, name: '51-100명' },
        { value: customers.filter(c => (c.users || 0) > 100).length, name: '100명 이상' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0,0,0,0.5)'
        }
      }
    }]
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueStats.map((stat, index) => (
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <ReactECharts option={revenueChartOption} style={{ height: '400px' }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <ReactECharts option={userDistributionOption} style={{ height: '400px' }} />
        </motion.div>
      </div>

      {/* Revenue Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">고객별 매출 상세</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">고객사</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">담당자</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">사용자 수</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">월 요금</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">사용자당 단가</th>
              </tr>
            </thead>
            <tbody>
              {revenueByCustomer.map((customer, index) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{customer.companyName}</td>
                  <td className="py-3 px-4 text-gray-600">{customer.contactName}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{formatNumber(customer.users || 0)}명</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatCurrency(customer.monthlyFee)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {customer.users > 0 ? 
                      formatCurrency(Math.round(customer.monthlyFee / customer.users)) : 
                      formatCurrency(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default Revenue;
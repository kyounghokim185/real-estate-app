'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Property {
  id: string;
  case_number: string;
  address: string;
  demolition_cost: number;
  carpentry_cost: number;
  tile_cost: number;
  labor_cost: number;
  total_remodeling_cost: number;
}

// 기업용 대시보드 색상 팔레트
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function StatisticsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, case_number, address, demolition_cost, carpentry_cost, tile_cost, labor_cost, total_remodeling_cost');

      if (error) {
        throw error;
      }

      setProperties(data || []);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 공종별 총 비용 계산
  const categoryData = useMemo(() => {
    const totals = {
      철거: 0,
      설비: 0,
      목공: 0,
      타일: 0,
      전기: 0,
      기타: 0,
    };

    properties.forEach((prop) => {
      totals.철거 += prop.demolition_cost || 0;
      totals.설비 += prop.labor_cost || 0;
      totals.목공 += prop.carpentry_cost || 0;
      totals.타일 += prop.tile_cost || 0;
      // 전기와 기타는 현재 데이터베이스에 없으므로 0으로 설정
      // 추후 데이터베이스에 필드가 추가되면 업데이트 필요
      totals.전기 += 0;
      totals.기타 += 0;
    });

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .filter((item) => item.value > 0); // 값이 0보다 큰 항목만 표시
  }, [properties]);

  // 계획 예산 대비 실제 지출 비교 데이터
  const budgetComparisonData = useMemo(() => {
    return properties
      .filter((prop) => prop.total_remodeling_cost > 0)
      .map((prop) => {
        // 계획 예산은 각 항목의 합으로 계산 (실제로는 별도 필드가 있을 수 있음)
        const plannedBudget =
          (prop.demolition_cost || 0) +
          (prop.carpentry_cost || 0) +
          (prop.tile_cost || 0) +
          (prop.labor_cost || 0);
        const actualSpending = prop.total_remodeling_cost || 0;

        return {
          name: prop.case_number || prop.address.substring(0, 10) + '...',
          계획예산: plannedBudget,
          실제지출: actualSpending,
        };
      })
      .slice(0, 10); // 최대 10개만 표시
  }, [properties]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">공종별 비용 통계</h1>
        <p className="mt-2 text-gray-600">
          리모델링 공종별 비용 분석 및 예산 대비 지출 현황을 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 공종별 비용 파이 차트 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            공종별 비용 분포
          </h2>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              데이터가 없습니다.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* 범례 */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center space-x-2 text-sm"
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
                <span className="text-gray-700">{item.name}</span>
                <span className="text-gray-500 ml-auto">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 공종별 비용 상세 테이블 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            공종별 총 비용
          </h2>
          <div className="space-y-4">
            {categoryData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                데이터가 없습니다.
              </p>
            ) : (
              categoryData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                    <span className="font-medium text-gray-900">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))
            )}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-gray-900">총계</span>
                <span className="font-bold text-lg text-gray-900">
                  {formatCurrency(
                    categoryData.reduce((sum, item) => sum + item.value, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 계획 예산 대비 실제 지출 막대 그래프 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          계획 예산 대비 실제 지출 비교
        </h2>
        {budgetComparisonData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            비교할 데이터가 없습니다.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={budgetComparisonData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) =>
                  `${(value / 1000000).toFixed(0)}M`
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 mb-2">
                          {payload[0].payload.name}
                        </p>
                        {payload.map((entry: any, index: number) => (
                          <p
                            key={index}
                            className="text-sm"
                            style={{ color: entry.color }}
                          >
                            {entry.name}: {formatCurrency(entry.value)}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="계획예산"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                name="계획 예산"
              />
              <Bar
                dataKey="실제지출"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                name="실제 지출"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

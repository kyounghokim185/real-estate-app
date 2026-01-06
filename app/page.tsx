'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Supabase 테이블 구조에 맞는 타입
interface Property {
  id: string;
  case_number: string;
  address: string;
  appraisal_price: number;
  minimum_price: number;
  purchase_price: number;
  total_remodeling_cost: number;
  auction_date: string | null;
  expected_sale_price: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

const statusColors = {
  upcoming: 'bg-yellow-100 text-yellow-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  upcoming: '예정',
  ongoing: '진행중',
  completed: '완료',
  cancelled: '취소',
};

type SortOption = 'roi_desc' | 'created_desc';

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>('created_desc');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*');

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

  // 정렬된 물건 목록
  const sortedProperties = useMemo(() => {
    const sorted = [...properties];
    
    sorted.forEach((prop) => {
      const totalInvestment =
        (prop.purchase_price || 0) + (prop.total_remodeling_cost || 0);
      const expectedSalePrice = prop.expected_sale_price || 0;
      const roi =
        totalInvestment > 0
          ? ((expectedSalePrice - totalInvestment) / totalInvestment) * 100
          : 0;
      (prop as any).calculatedRoi = roi;
    });

    if (sortOption === 'roi_desc') {
      sorted.sort((a, b) => {
        const roiA = (a as any).calculatedRoi || 0;
        const roiB = (b as any).calculatedRoi || 0;
        return roiB - roiA;
      });
    } else if (sortOption === 'created_desc') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
    }

    return sorted;
  }, [properties, sortOption]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 통계 계산
  const totalInvestment = properties.reduce(
    (sum, prop) => sum + (prop.purchase_price || 0) + (prop.total_remodeling_cost || 0),
    0
  );

  const activeProperties = properties.filter(
    (prop) => prop.status === 'ongoing' || prop.status === 'upcoming'
  ).length;

  const totalExpectedSale = properties.reduce(
    (sum, prop) => sum + (prop.expected_sale_price || 0),
    0
  );

  const expectedProfit = totalExpectedSale - totalInvestment;
  const expectedProfitRate =
    totalInvestment > 0 ? (expectedProfit / totalInvestment) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">부동산 경매 대시보드</h1>
          <p className="mt-2 text-gray-600">
            투자 현황과 관리 중인 물건들을 한눈에 확인하세요.
          </p>
        </div>
        <Link
          href="/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          물건 등록
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        {/* 총 투자 금액 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    총 투자 금액
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatCurrency(totalInvestment)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 진행 중인 물건 수 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    진행 중인 물건 수
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {activeProperties}건
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 예상 수익률 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    예상 수익률
                  </dt>
                  <dd
                    className={`text-lg font-semibold ${
                      expectedProfitRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {expectedProfitRate >= 0 ? '+' : ''}
                    {expectedProfitRate.toFixed(2)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 물건 목록 테이블 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            관리 중인 물건 목록
          </h2>
          <div className="flex items-center space-x-2">
            <label
              htmlFor="sort-select"
              className="text-sm font-medium text-gray-700"
            >
              정렬:
            </label>
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="roi_desc">수익률 높은 순</option>
              <option value="created_desc">최신 등록 순</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">
            데이터를 불러오는 중...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    사건번호
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    주소
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    감정가
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    최저가
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    낙찰가
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    리모델링 비용
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    총 투자 금액
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    예상 판매가
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    예상 수익률
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      관리 중인 물건이 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedProperties.map((property) => {
                    const totalInvestment =
                      (property.purchase_price || 0) + (property.total_remodeling_cost || 0);
                    const expectedSalePrice = property.expected_sale_price || 0;
                    // ROI 계산: (매각 예상가 - 총 투자금) / 총 투자금 * 100
                    const roi =
                      totalInvestment > 0
                        ? ((expectedSalePrice - totalInvestment) / totalInvestment) * 100
                        : 0;
                    
                    // 색상 결정: 15% 이상 초록색, 5% 미만 빨간색, 그 외 기본
                    const getRoiColor = () => {
                      if (roi >= 15) return 'text-green-600 font-bold';
                      if (roi < 5) return 'text-red-600 font-bold';
                      return roi >= 0 ? 'text-green-600' : 'text-red-600';
                    };

                    return (
                      <tr
                        key={property.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {property.case_number}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {property.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(property.appraisal_price || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(property.minimum_price || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(property.purchase_price || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(property.total_remodeling_cost || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(totalInvestment)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(property.expected_sale_price || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${getRoiColor()}`}>
                            {roi >= 0 ? '+' : ''}
                            {roi.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[property.status]
                            }`}
                          >
                            {statusLabels[property.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

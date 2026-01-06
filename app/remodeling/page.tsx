'use client';

import { useState } from 'react';
import type { RemodelingCost } from '@/types';

// 임시 데이터
const mockRemodelingCosts: RemodelingCost[] = [
  {
    id: '1',
    propertyId: 'prop-1',
    propertyName: '서울시 강남구 아파트',
    category: 'kitchen',
    itemName: '주방 싱크대 교체',
    cost: 1500000,
    contractor: 'ABC 인테리어',
    date: '2024-01-15',
    notes: '스테인리스 싱크대 설치',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    propertyId: 'prop-1',
    propertyName: '서울시 강남구 아파트',
    category: 'bathroom',
    itemName: '욕실 타일 교체',
    cost: 2000000,
    contractor: 'XYZ 타일',
    date: '2024-01-20',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-20',
  },
  {
    id: '3',
    propertyId: 'prop-2',
    propertyName: '부산시 해운대구 오피스텔',
    category: 'flooring',
    itemName: '바닥재 교체',
    cost: 5000000,
    contractor: 'DEF 바닥재',
    date: '2024-01-25',
    notes: '전체 바닥재 교체',
    createdAt: '2024-01-22',
    updatedAt: '2024-01-25',
  },
];

const categoryLabels = {
  kitchen: '주방',
  bathroom: '욕실',
  flooring: '바닥재',
  electrical: '전기',
  plumbing: '배관',
  painting: '도배',
  other: '기타',
};

const categoryColors = {
  kitchen: 'bg-orange-100 text-orange-800',
  bathroom: 'bg-blue-100 text-blue-800',
  flooring: 'bg-amber-100 text-amber-800',
  electrical: 'bg-yellow-100 text-yellow-800',
  plumbing: 'bg-cyan-100 text-cyan-800',
  painting: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

export default function RemodelingPage() {
  const [remodelingCosts] = useState<RemodelingCost[]>(mockRemodelingCosts);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const totalCost = remodelingCosts.reduce((sum, item) => sum + item.cost, 0);

  // 부동산별로 그룹화
  const groupedByProperty = remodelingCosts.reduce((acc, item) => {
    if (!acc[item.propertyName]) {
      acc[item.propertyName] = [];
    }
    acc[item.propertyName].push(item);
    return acc;
  }, {} as Record<string, RemodelingCost[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">리모델링 비용 관리</h1>
          <p className="mt-2 text-gray-600">
            리모델링 비용을 기록하고 관리하세요.
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          비용 추가
        </button>
      </div>

      {/* 총 비용 요약 */}
      <div className="mb-6 bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">총 리모델링 비용</h2>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalCost)}
          </p>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          총 {remodelingCosts.length}건의 리모델링 비용이 기록되었습니다.
        </p>
      </div>

      {/* 부동산별 리모델링 비용 */}
      {Object.entries(groupedByProperty).map(([propertyName, costs]) => {
        const propertyTotal = costs.reduce((sum, item) => sum + item.cost, 0);
        return (
          <div key={propertyName} className="mb-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {propertyName}
                </h3>
                <span className="text-sm font-medium text-gray-600">
                  합계: {formatCurrency(propertyTotal)}
                </span>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {costs.map((item) => (
                <li key={item.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-base font-medium text-gray-900">
                          {item.itemName}
                        </h4>
                        <span
                          className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            categoryColors[item.category]
                          }`}
                        >
                          {categoryLabels[item.category]}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>날짜: {formatDate(item.date)}</span>
                        {item.contractor && (
                          <span>시공사: {item.contractor}</span>
                        )}
                        <span className="font-semibold text-green-600">
                          비용: {formatCurrency(item.cost)}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="mt-2 text-sm text-gray-600">
                          비고: {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                        수정
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {remodelingCosts.length === 0 && (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">등록된 리모델링 비용이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Auction } from '@/types';

// 임시 데이터
const mockAuctions: Auction[] = [
  {
    id: '1',
    propertyName: '서울시 강남구 아파트',
    address: '서울시 강남구 테헤란로 123',
    auctionDate: '2024-02-15',
    startingPrice: 500000000,
    currentBid: 520000000,
    status: 'ongoing',
    notes: '1층 상가 포함',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
  },
  {
    id: '2',
    propertyName: '부산시 해운대구 오피스텔',
    address: '부산시 해운대구 해운대해변로 456',
    auctionDate: '2024-02-20',
    startingPrice: 300000000,
    status: 'upcoming',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
  },
];

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

export default function AuctionsPage() {
  const [auctions] = useState<Auction[]>(mockAuctions);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">경매 관리</h1>
          <p className="mt-2 text-gray-600">
            부동산 경매 정보를 관리하고 추적하세요.
          </p>
        </div>
        <Link
          href="/auctions/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
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
          새 경매 등록
        </Link>
      </div>

      {/* 경매 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {auctions.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              등록된 경매가 없습니다.
            </li>
          ) : (
            auctions.map((auction) => (
              <li key={auction.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {auction.propertyName}
                      </h3>
                      <span
                        className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[auction.status]
                        }`}
                      >
                        {statusLabels[auction.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {auction.address}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        경매일: {formatDate(auction.auctionDate)}
                      </span>
                      <span>
                        시작가: {formatCurrency(auction.startingPrice)}
                      </span>
                      {auction.currentBid && (
                        <span className="font-semibold text-blue-600">
                          현재 입찰가: {formatCurrency(auction.currentBid)}
                        </span>
                      )}
                    </div>
                    {auction.notes && (
                      <p className="mt-2 text-sm text-gray-600">
                        비고: {auction.notes}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      상세보기
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

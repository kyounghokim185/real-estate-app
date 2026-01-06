'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';

export default function AddPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    caseNumber: '',
    appraisalPrice: '',
    minimumPrice: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('properties').insert([
        {
          case_number: formData.caseNumber,
          address: formData.address,
          appraisal_price: parseInt(formData.appraisalPrice) || 0,
          minimum_price: parseInt(formData.minimumPrice) || 0,
          status: 'upcoming',
        },
      ]);

      if (error) {
        throw error;
      }

      // 성공 시 메인 페이지로 이동
      router.push('/');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving property:', error);
      alert('저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">부동산 물건 등록</h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* 물건명 */}
          <div>
            <label
              htmlFor="propertyName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              물건명
            </label>
            <input
              type="text"
              id="propertyName"
              name="propertyName"
              value={formData.propertyName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 서울시 강남구 아파트"
            />
          </div>

          {/* 주소 */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              주소
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 서울시 강남구 테헤란로 123"
            />
          </div>

          {/* 사건번호 */}
          <div>
            <label
              htmlFor="caseNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              사건번호
            </label>
            <input
              type="text"
              id="caseNumber"
              name="caseNumber"
              value={formData.caseNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 2024타경12345"
            />
          </div>

          {/* 감정가 */}
          <div>
            <label
              htmlFor="appraisalPrice"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              감정가 (원)
            </label>
            <input
              type="number"
              id="appraisalPrice"
              name="appraisalPrice"
              value={formData.appraisalPrice}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 500000000"
            />
          </div>

          {/* 최저가 */}
          <div>
            <label
              htmlFor="minimumPrice"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              최저가 (원)
            </label>
            <input
              type="number"
              id="minimumPrice"
              name="minimumPrice"
              value={formData.minimumPrice}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="예: 400000000"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { AuctionFormData } from '@/types';
import { supabase } from '@/lib/supabase';

export default function NewAuctionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AuctionFormData>({
    caseNumber: '',
    address: '',
    appraisalPrice: 0,
    minimumPrice: 0,
    purchasePrice: 0,
    demolitionCost: 0,
    carpentryCost: 0,
    tileCost: 0,
    laborCost: 0,
    auctionDate: '',
    vacateDate: '',
    constructionStartDate: '',
    acquisitionTaxRate: 0,
    expectedSalePrice: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes('Cost') || name.includes('Price')
          ? value === ''
            ? 0
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 총 리모델링 비용 계산
      const totalRemodelingCost =
        formData.demolitionCost +
        formData.carpentryCost +
        formData.tileCost +
        formData.laborCost;

      // 총 투자금 계산
      const totalInvestment = formData.purchasePrice + totalRemodelingCost;

      // 취득세 계산
      const acquisitionTax = (totalInvestment * formData.acquisitionTaxRate) / 100;

      // 총 투자금액 (세금 포함)
      const totalInvestmentWithTax = totalInvestment + acquisitionTax;

      // Supabase에 저장할 데이터
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            case_number: formData.caseNumber,
            address: formData.address,
            appraisal_price: formData.appraisalPrice,
            minimum_price: formData.minimumPrice,
            purchase_price: formData.purchasePrice,
            demolition_cost: formData.demolitionCost,
            carpentry_cost: formData.carpentryCost,
            tile_cost: formData.tileCost,
            labor_cost: formData.laborCost,
            total_remodeling_cost: totalRemodelingCost,
            auction_date: formData.auctionDate || null,
            vacate_date: formData.vacateDate || null,
            construction_start_date: formData.constructionStartDate || null,
            acquisition_tax_rate: formData.acquisitionTaxRate,
            acquisition_tax: acquisitionTax,
            total_investment: totalInvestment,
            total_investment_with_tax: totalInvestmentWithTax,
            expected_sale_price: formData.expectedSalePrice,
            net_profit: formData.expectedSalePrice - totalInvestmentWithTax,
            roi:
              totalInvestmentWithTax > 0
                ? ((formData.expectedSalePrice - totalInvestmentWithTax) /
                    totalInvestmentWithTax) *
                  100
                : 0,
            status: 'upcoming',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      // 저장 성공 후 경매 목록 페이지로 이동
      router.push('/auctions');
    } catch (error: any) {
      console.error('저장 중 오류 발생:', error);
      alert(
        `저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value === 0) return '';
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const parseCurrency = (value: string) => {
    return value.replace(/,/g, '');
  };

  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof AuctionFormData
  ) => {
    const value = parseCurrency(e.target.value);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value === '' ? 0 : Number(value),
    }));
  };

  const handlePercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof AuctionFormData
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value === '' ? 0 : Number(value),
    }));
  };

  // 총 투자금 계산 (낙찰가 + 리모델링 비용)
  const totalInvestment =
    formData.purchasePrice +
    formData.demolitionCost +
    formData.carpentryCost +
    formData.tileCost +
    formData.laborCost;

  // 취득세 계산
  const acquisitionTax = (totalInvestment * formData.acquisitionTaxRate) / 100;

  // 총 투자금액 (낙찰가 + 리모델링 비용 + 취득세)
  const totalInvestmentWithTax = totalInvestment + acquisitionTax;

  // 순수익 계산 (매각 예상가 - 총 투자금액)
  const netProfit = formData.expectedSalePrice - totalInvestmentWithTax;

  // ROI 계산 (수익률)
  const roi = totalInvestmentWithTax > 0 
    ? (netProfit / totalInvestmentWithTax) * 100 
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/auctions"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
        >
          ← 경매 목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">새 경매 물건 등록</h1>
        <p className="mt-2 text-gray-600">
          경매 물건 정보를 입력하고 등록하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본정보 섹션 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            기본정보
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="caseNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                사건번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="caseNumber"
                name="caseNumber"
                required
                value={formData.caseNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 2024타경12345"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                물건주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 서울시 강남구 테헤란로 123"
              />
            </div>

            <div>
              <label
                htmlFor="appraisalPrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                감정가 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="appraisalPrice"
                  name="appraisalPrice"
                  required
                  value={formatCurrency(formData.appraisalPrice)}
                  onChange={(e) => handleCurrencyChange(e, 'appraisalPrice')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-gray-500">원</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="minimumPrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                최저가 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="minimumPrice"
                  name="minimumPrice"
                  required
                  value={formatCurrency(formData.minimumPrice)}
                  onChange={(e) => handleCurrencyChange(e, 'minimumPrice')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-gray-500">원</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="purchasePrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                낙찰가
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="purchasePrice"
                  name="purchasePrice"
                  value={formatCurrency(formData.purchasePrice)}
                  onChange={(e) => handleCurrencyChange(e, 'purchasePrice')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-gray-500">원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 리모델링 예산 섹션 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            리모델링 예산
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="demolitionCost"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                철거비
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="demolitionCost"
                  name="demolitionCost"
                  value={formatCurrency(formData.demolitionCost)}
                  onChange={(e) => handleCurrencyChange(e, 'demolitionCost')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-gray-500">원</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="carpentryCost"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                목공비
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="carpentryCost"
                  name="carpentryCost"
                  value={formatCurrency(formData.carpentryCost)}
                  onChange={(e) => handleCurrencyChange(e, 'carpentryCost')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-gray-500">원</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="tileCost"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                타일비
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="tileCost"
                  name="tileCost"
                  value={formatCurrency(formData.tileCost)}
                  onChange={(e) => handleCurrencyChange(e, 'tileCost')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-gray-500">원</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="laborCost"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                인건비
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="laborCost"
                  name="laborCost"
                  value={formatCurrency(formData.laborCost)}
                  onChange={(e) => handleCurrencyChange(e, 'laborCost')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-gray-500">원</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                총 리모델링 예산
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                }).format(
                  formData.demolitionCost +
                    formData.carpentryCost +
                    formData.tileCost +
                    formData.laborCost
                )}
              </span>
            </div>
          </div>
        </div>

        {/* 일정 섹션 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">일정</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label
                htmlFor="auctionDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                낙찰일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="auctionDate"
                name="auctionDate"
                required
                value={formData.auctionDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="vacateDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                명도예정일
              </label>
              <input
                type="date"
                id="vacateDate"
                name="vacateDate"
                value={formData.vacateDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="constructionStartDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                공사시작일
              </label>
              <input
                type="date"
                id="constructionStartDate"
                name="constructionStartDate"
                value={formData.constructionStartDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 수익 계산 섹션 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            수익 계산
          </h2>
          
          {/* 총 투자금 표시 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                총 투자금 (낙찰가 + 리모델링 비용)
              </span>
              <span className="text-lg font-semibold text-blue-900">
                {new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                }).format(totalInvestment)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="acquisitionTaxRate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                취득세율 (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="acquisitionTaxRate"
                  name="acquisitionTaxRate"
                  min="0"
                  max="12.4"
                  step="0.1"
                  value={formData.acquisitionTaxRate || ''}
                  onChange={(e) => handlePercentageChange(e, 'acquisitionTaxRate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1.1 ~ 12.4"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                취득세율 범위: 1.1% ~ 12.4%
              </p>
            </div>

            <div>
              <label
                htmlFor="expectedSalePrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                매각 예상가
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="expectedSalePrice"
                  name="expectedSalePrice"
                  value={formatCurrency(formData.expectedSalePrice)}
                  onChange={(e) => handleCurrencyChange(e, 'expectedSalePrice')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-gray-500">원</span>
              </div>
            </div>
          </div>

          {/* 계산 결과 */}
          {(formData.acquisitionTaxRate > 0 || formData.expectedSalePrice > 0) && (
            <div className="mt-6 space-y-3">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">취득세</div>
                    <div className="text-base font-medium text-gray-900">
                      {new Intl.NumberFormat('ko-KR', {
                        style: 'currency',
                        currency: 'KRW',
                      }).format(acquisitionTax)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">총 투자금액 (세금 포함)</div>
                    <div className="text-base font-medium text-gray-900">
                      {new Intl.NumberFormat('ko-KR', {
                        style: 'currency',
                        currency: 'KRW',
                      }).format(totalInvestmentWithTax)}
                    </div>
                  </div>
                </div>
              </div>

              {formData.expectedSalePrice > 0 && (
                <div className="p-4 bg-green-50 rounded-md border border-green-200">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">순수익</div>
                      <div
                        className={`text-xl font-bold ${
                          netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {netProfit >= 0 ? '+' : ''}
                        {new Intl.NumberFormat('ko-KR', {
                          style: 'currency',
                          currency: 'KRW',
                        }).format(netProfit)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">ROI (수익률)</div>
                      <div
                        className={`text-xl font-bold ${
                          roi >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {roi >= 0 ? '+' : ''}
                        {roi.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/auctions"
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}

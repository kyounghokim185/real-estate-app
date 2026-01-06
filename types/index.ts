// 경매 관련 타입
export interface Auction {
  id: string;
  propertyName: string;
  address: string;
  auctionDate: string;
  startingPrice: number;
  currentBid?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 리모델링 비용 관련 타입
export interface RemodelingCost {
  id: string;
  propertyId: string;
  propertyName: string;
  category: 'kitchen' | 'bathroom' | 'flooring' | 'electrical' | 'plumbing' | 'painting' | 'other';
  itemName: string;
  cost: number;
  contractor?: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 대시보드 통계 타입
export interface DashboardStats {
  totalAuctions: number;
  activeAuctions: number;
  totalRemodelingCost: number;
  recentAuctions: Auction[];
  recentRemodeling: RemodelingCost[];
}

// 물건(Property) 타입
export interface Property {
  id: string;
  propertyName: string;
  address: string;
  auctionDate: string;
  purchasePrice: number; // 낙찰가 또는 시작가
  remodelingCost: number; // 총 리모델링 비용
  expectedSalePrice: number; // 예상 판매가
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
}

// 경매 등록 폼 데이터 타입
export interface AuctionFormData {
  // 기본정보
  caseNumber: string; // 사건번호
  address: string; // 물건주소
  appraisalPrice: number; // 감정가
  minimumPrice: number; // 최저가
  purchasePrice: number; // 낙찰가
  
  // 리모델링 예산
  demolitionCost: number; // 철거비
  carpentryCost: number; // 목공비
  tileCost: number; // 타일비
  laborCost: number; // 인건비
  
  // 일정
  auctionDate: string; // 낙찰일
  vacateDate: string; // 명도예정일
  constructionStartDate: string; // 공사시작일
  
  // 수익 계산
  acquisitionTaxRate: number; // 취득세율 (%)
  expectedSalePrice: number; // 매각 예상가
}

# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인합니다.
2. 새 프로젝트를 생성합니다.
3. 프로젝트가 생성될 때까지 기다립니다 (약 2분 소요).

## 2. 환경 변수 설정

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 환경 변수 값 찾기

1. Supabase 대시보드에서 프로젝트를 선택합니다.
2. 좌측 메뉴에서 **Settings** → **API**를 클릭합니다.
3. 다음 정보를 복사합니다:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`에 입력
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 입력

## 3. 데이터베이스 테이블 생성

Supabase 대시보드에서 SQL Editor를 열고 다음 SQL을 실행하세요:

```sql
-- properties 테이블 생성
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT NOT NULL,
  address TEXT NOT NULL,
  appraisal_price BIGINT NOT NULL,
  minimum_price BIGINT NOT NULL,
  purchase_price BIGINT DEFAULT 0,
  demolition_cost BIGINT DEFAULT 0,
  carpentry_cost BIGINT DEFAULT 0,
  tile_cost BIGINT DEFAULT 0,
  labor_cost BIGINT DEFAULT 0,
  total_remodeling_cost BIGINT DEFAULT 0,
  auction_date DATE,
  vacate_date DATE,
  construction_start_date DATE,
  acquisition_tax_rate DECIMAL(5,2) DEFAULT 0,
  acquisition_tax BIGINT DEFAULT 0,
  total_investment BIGINT DEFAULT 0,
  total_investment_with_tax BIGINT DEFAULT 0,
  expected_sale_price BIGINT DEFAULT 0,
  net_profit BIGINT DEFAULT 0,
  roi DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정 (개발용)
-- 프로덕션에서는 더 엄격한 정책을 설정하세요
CREATE POLICY "Enable all access for all users" ON properties
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 4. 개발 서버 재시작

환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

## 5. 확인

1. 브라우저에서 `http://localhost:3000/auctions/new`로 이동합니다.
2. 경매 물건 정보를 입력하고 저장 버튼을 클릭합니다.
3. Supabase 대시보드의 **Table Editor**에서 `properties` 테이블을 확인하여 데이터가 저장되었는지 확인합니다.

## 문제 해결

### "Missing Supabase environment variables" 오류
- `.env.local` 파일이 프로젝트 루트에 있는지 확인하세요.
- 환경 변수 이름이 정확한지 확인하세요 (`NEXT_PUBLIC_` 접두사 필수).
- 개발 서버를 재시작했는지 확인하세요.

### RLS 정책 오류
- Supabase 대시보드에서 RLS 정책을 확인하세요.
- 개발 단계에서는 위의 정책을 사용하고, 프로덕션에서는 인증된 사용자만 접근할 수 있도록 수정하세요.

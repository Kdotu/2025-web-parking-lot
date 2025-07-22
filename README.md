# 세종시청 주차장 현황 대시보드

세종시청의 실시간 주차장 현황과 CCTV 모니터링을 제공하는 스마트 대시보드입니다.

## 🚀 주요 기능

- **실시간 주차 현황**: 세종시청 내 모든 주차장의 실시간 사용 현황
- **인터랙티브 지도**: 주차장과 CCTV 위치를 직관적으로 표시
- **CCTV 모니터링**: 실시간 CCTV 영상 스트리밍 (모달 방식)
- **통계 대시보드**: 주차장 사용률, 가용 공간 등 종합 통계
- **반응형 디자인**: 데스크톱과 모바일 모든 환경 지원
- **자동 새로고침**: 30초마다 자동으로 최신 데이터 업데이트

## 🛠 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안전성
- **Tailwind CSS v4** - 스타일링
- **ShadCN UI** - UI 컴포넌트 라이브러리
- **Lucide React** - 아이콘
- **Vite** - 빌드 도구

### Backend
- **Supabase** - 백엔드 서비스
- **Supabase Edge Functions** - 서버리스 API
- **Hono** - 웹 프레임워크
- **PostgreSQL** - 데이터베이스 (KV Store)

## 📦 설치 및 실행

### 필수 조건
- Node.js 18 이상
- npm 또는 yarn

### 설치
```bash
# 저장소 클론
git clone <repository-url>
cd sejong-parking-dashboard

# 의존성 설치
npm install

# 또는 yarn 사용
yarn install
```

### 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### 미리보기
```bash
npm run preview
```

## 🏗 프로젝트 구조

```
├── components/                 # React 컴포넌트
│   ├── ui/                    # ShadCN UI 컴포넌트
│   ├── CCTVModal.tsx          # CCTV 모달 컴포넌트
│   └── ParkingDashboard.tsx   # 메인 대시보드 컴포넌트
├── supabase/                  # Supabase 관련 파일
│   └── functions/server/      # Edge Functions
├── utils/                     # 유틸리티 함수
├── styles/                    # CSS 스타일
├── public/                    # 정적 파일
└── types/                     # TypeScript 타입 정의
```

## 🎯 API 엔드포인트

### 주차장 정보
- `GET /make-server-3c019203/parking-lots` - 모든 주차장 정보
- `GET /make-server-3c019203/parking-lots/:id` - 특정 주차장 정보
- `PUT /make-server-3c019203/parking-lots/:id` - 주차장 정보 업데이트

### CCTV 정보
- `GET /make-server-3c019203/cctv-cameras` - 모든 CCTV 정보
- `GET /make-server-3c019203/cctv-cameras/:id` - 특정 CCTV 정보

### 통계
- `GET /make-server-3c019203/statistics` - 전체 통계 정보

### 헬스체크
- `GET /make-server-3c019203/health` - 서버 상태 확인

## 🔧 개발 가이드

### 코드 스타일
- ESLint와 TypeScript를 사용하여 코드 품질 관리
- Prettier는 설정되지 않음 (Tailwind CSS 클래스 정렬 우선)

### 커스텀 컴포넌트 추가
1. `components/` 디렉토리에 새 컴포넌트 생성
2. TypeScript 인터페이스 정의
3. ShadCN UI 컴포넌트 재사용 권장

### API 호출
```typescript
import { projectId, publicAnonKey } from '../utils/supabase/info';

const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3c019203/endpoint`, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`,
    'Content-Type': 'application/json'
  }
});
```

## 🚦 배포

### Vercel 배포
```bash
npm i -g vercel
vercel --prod
```

### Netlify 배포
```bash
npm run build
# dist 폴더를 Netlify에 업로드
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**세종시청 스마트시티 프로젝트** 🏛️
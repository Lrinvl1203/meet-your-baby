# Google Gemini API 사용 가이드

**업데이트**: 2025-09-14 - API 엔드포인트 및 모델명 수정 완료

## 🔧 **API 수정사항**

### ❌ **이전 (작동하지 않음)**
```javascript
// 잘못된 모델명과 엔드포인트
model: 'gemini-2.5-flash-image-preview'
url: '...?key=${apiKey}'
```

### ✅ **수정됨 (올바른 방법)**
```javascript
// 올바른 모델명과 헤더
model: 'models/gemini-2.5-flash-image-preview'
headers: { 'x-goog-api-key': apiKey }
url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent'
```

## 🚀 **API 키 발급 방법**

1. **Google AI Studio 접속**: https://aistudio.google.com
2. **API 키 생성**: "Get API Key" 클릭
3. **새 프로젝트 생성** 또는 기존 프로젝트 선택
4. **API 키 복사** 및 안전하게 보관

## 📝 **올바른 API 호출 방법**

### REST API 호출 형식
```javascript
const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': 'YOUR_API_KEY_HERE'
    },
    body: JSON.stringify({
        contents: [{
            parts: [
                {
                    inline_data: {
                        mime_type: 'image/jpeg',
                        data: 'BASE64_ENCODED_IMAGE_DATA'
                    }
                },
                {
                    text: 'Your prompt here'
                }
            ]
        }]
    })
});
```

### 요청 데이터 구조
```json
{
    "contents": [{
        "parts": [
            {
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": "BASE64_IMAGE_DATA_WITHOUT_PREFIX"
                }
            },
            {
                "text": "Generate a baby face based on these parent photos..."
            }
        ]
    }]
}
```

### 응답 데이터 구조
```json
{
    "candidates": [{
        "content": {
            "parts": [{
                "inline_data": {
                    "mime_type": "image/png",
                    "data": "BASE64_ENCODED_RESULT_IMAGE"
                }
            }]
        }
    }]
}
```

## 🔍 **API 테스트 방법**

### 1. 간단한 테스트 (cURL)
```bash
curl -X POST \
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent' \
  -H 'Content-Type: application/json' \
  -H 'x-goog-api-key: YOUR_API_KEY' \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Generate a simple baby face image"
      }]
    }]
  }'
```

### 2. 브라우저 개발자 도구 테스트
```javascript
// 브라우저 콘솔에서 실행
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': 'YOUR_API_KEY_HERE'
    },
    body: JSON.stringify({
        contents: [{
            parts: [{
                text: 'Generate a baby face'
            }]
        }]
    })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
```

## ❌ **일반적인 오류 및 해결법**

### 1. **429 Too Many Requests / Quota Exceeded** ⚠️
```
"You exceeded your current quota, please check your plan and billing details"
"Quota exceeded for quota metric 'Generate Content API requests per day'"
```
**원인**: API 사용량 한도 초과 (무료: 15 req/min, 1500 req/day)

**즉시 해결법**:
1. **새 API 키 생성**: Google AI Studio → 기존 키 삭제 → 새 키 발급
2. **시간 대기**: 24시간 후 할당량 재설정 대기
3. **유료 플랜**: Pay-per-use 모델로 업그레이드

**예방법**:
- 요청 간 4초 간격 유지
- 하루 최대 10-15회 테스트 권장
- 불필요한 재시도 방지

### 2. **403 Forbidden**
```
"You don't have permission to access this resource"
```
**해결법**: API 키가 잘못되었거나 권한이 없음. 새 API 키 생성

### 3. **400 Bad Request**
```
"Invalid model name"
```
**해결법**: 모델명을 `models/gemini-2.5-flash-image-preview`로 수정

### 4. **Invalid image format**
```
"Unsupported image format"
```
**해결법**: 지원 형식 사용 (JPEG, PNG, WebP, HEIC, HEIF)

## 🔒 **보안 모범 사례**

### 1. API 키 관리
- ✅ 로컬 스토리지에 저장 (클라이언트 사이드)
- ✅ 환경 변수 사용 (서버 사이드)
- ❌ 코드에 하드코딩 금지
- ❌ 공개 저장소에 커밋 금지

### 2. 사용량 관리
- 요청 간 간격 두기 (rate limiting)
- 에러 시 exponential backoff 적용
- 불필요한 요청 최소화

## 📊 **성능 최적화**

### 1. 이미지 최적화
- 이미지 크기: 최대 20MB
- 권장 해상도: 1024x1024 이하
- 압축: JPEG 품질 80-90%

### 2. 요청 최적화
- 배치 처리: 한 번에 여러 이미지 처리
- 병렬 처리 제한: 동시 요청 3개 이하
- 캐싱: 동일한 요청 결과 캐싱

## 🧪 **실제 테스트 예제**

### 앱에서 테스트하는 방법
1. **vanilla-version/index.html** 브라우저에서 열기
2. **API 키 입력** (Google AI Studio에서 발급받은 키)
3. **부모 사진 업로드** (JPEG/PNG 형식)
4. **설정 완료** 후 "Predict Baby's Face" 클릭
5. **결과 확인** - 성공 시 아기 사진 생성

### 에러 발생 시 확인사항
1. **브라우저 개발자 도구** (F12) → Network 탭
2. **API 요청/응답 확인**
3. **에러 메시지 분석**
4. **API 키 유효성 재확인**

---

**이제 수정된 API로 정상 작동해야 합니다!**
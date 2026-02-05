## 2024-05-23 - Visual Regression Testing with Auth Mocking
**Learning:** Playwright scripts checking authenticated routes must verify `API_ENDPOINTS` config to mock the exact URL (e.g., `/auth/me` vs `/api/auth/me`) and ensure response structure matches `ApiResponse<T>` (wrapper object `{ success: true, data: ... }`) instead of raw data.
**Action:** When mocking API calls in verification scripts, always inspect `api.ts` and `api-endpoints.ts` to confirm the URL prefix and response envelope structure.

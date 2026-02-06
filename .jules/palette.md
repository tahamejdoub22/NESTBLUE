## 2024-05-23 - Visual Regression Testing with Auth Mocking
**Learning:** Playwright scripts checking authenticated routes must verify `API_ENDPOINTS` config to mock the exact URL (e.g., `/auth/me` vs `/api/auth/me`) and ensure response structure matches `ApiResponse<T>` (wrapper object `{ success: true, data: ... }`) instead of raw data.
**Action:** When mocking API calls in verification scripts, always inspect `api.ts` and `api-endpoints.ts` to confirm the URL prefix and response envelope structure.

## 2024-05-24 - Empty State Recovery
**Learning:** Empty states caused by search/filtering are dead ends if they don't offer a recovery action. Users are forced to scan the UI to find the reset controls.
**Action:** Always include a "Clear Filters" or "Reset Search" button directly within the "No results found" component to allow immediate recovery.

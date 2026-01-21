## 2026-01-21 - [Missing Rate Limiting on Auth]
**Vulnerability:** Login endpoint was completely exposed to brute-force attacks without any rate limiting.
**Learning:** Even if documentation or memory suggests a security control exists, always verify its presence in the codebase. The `RateLimiterGuard` was missing despite being referenced.
**Prevention:** Implement a standard, reusable RateLimiterGuard that can be applied to sensitive endpoints via `@UseGuards`.

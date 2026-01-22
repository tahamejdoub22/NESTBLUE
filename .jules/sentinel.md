## 2026-01-20 - Custom Rate Limiter Pattern
**Vulnerability:** Missing rate limiting on sensitive endpoints like login.
**Learning:** `nestjs/throttler` was not used/allowed, requiring a custom in-memory implementation.
**Prevention:** Use the `RateLimiterGuard` (located in `backend/src/common/guards/rate-limiter.guard.ts`) for other sensitive endpoints. It uses a self-cleaning `Map` to track request counts by IP.

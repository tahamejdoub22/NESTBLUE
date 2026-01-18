## 2024-05-23 - Custom In-Memory Rate Limiting
**Vulnerability:** Missing rate limiting on sensitive auth endpoints (login) allows brute force attacks.
**Learning:** The application lacks a global rate limiting solution (like Redis or @nestjs/throttler). Adding a full dependency might be overkill for a single endpoint fix.
**Prevention:** Implemented a lightweight, in-memory `RateLimiterGuard` using a static `Map` to track IP hits. This provides immediate protection without infrastructure changes, but is limited to a single instance (not distributed).

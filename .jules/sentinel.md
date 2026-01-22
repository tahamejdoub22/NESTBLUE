## 2024-05-22 - Missing Rate Limiting on Login
**Vulnerability:** The login endpoint was vulnerable to brute force attacks due to missing rate limiting. The `ThrottlerModule` was missing despite memory suggesting it should be there.
**Learning:** External dependencies (like `@nestjs/throttler`) might be missing or removed, leaving gaps. A simple in-memory implementation can serve as a lightweight fallback or critical fix without adding dependencies.
**Prevention:** Always verify that security controls (like rate limits) are actually active and tested, not just assumed to be present from documentation/memory. Use custom guards for critical endpoints if dependency management is restricted.

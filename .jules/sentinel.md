## 2026-01-22 - Missing Critical Security Guard
**Vulnerability:** The RateLimiterGuard for the login endpoint was completely missing from the codebase.
**Learning:** Security controls assumed to be present (like rate limiting on auth) must be explicitly verified in the code.
**Prevention:** Always verify the existence and application of security guards during security reviews.

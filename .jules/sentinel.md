## 2026-01-22 - Missing Critical Security Guard
**Vulnerability:** The RateLimiterGuard for the login endpoint was completely missing from the codebase.
**Learning:** Security controls assumed to be present (like rate limiting on auth) must be explicitly verified in the code.
**Prevention:** Always verify the existence and application of security guards during security reviews.

## 2026-01-22 - Incomplete Rate Limiting Coverage
**Vulnerability:** Rate limiting was implemented but only applied to the login endpoint, leaving registration and password reset exposed to abuse.
**Learning:** Having a security control (Guard) defined does not mean it is applied everywhere it should be. The error message was also hardcoded for "login", masking its reusability.
**Prevention:** When reviewing security controls, verify coverage across all sensitive endpoints, not just the primary one. Ensure reusable guards use generic error messages.

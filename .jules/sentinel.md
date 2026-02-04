## 2026-01-22 - Missing Critical Security Guard
**Vulnerability:** The RateLimiterGuard for the login endpoint was completely missing from the codebase.
**Learning:** Security controls assumed to be present (like rate limiting on auth) must be explicitly verified in the code.
**Prevention:** Always verify the existence and application of security guards during security reviews.

## 2026-01-28 - Tightly Coupled Security Guards
**Vulnerability:** The `RateLimiterGuard` was hardcoded with a "Too many login attempts" error message, discouraging its use on other sensitive endpoints like registration.
**Learning:** Security components often become single-purpose if they leak implementation details (like error messages) into their logic.
**Prevention:** Design security guards to be generic (e.g., "Too many requests") or configurable to ensure they can be easily applied across the entire application.

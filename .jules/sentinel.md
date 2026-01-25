## 2026-01-22 - Missing Critical Security Guard
**Vulnerability:** The RateLimiterGuard for the login endpoint was completely missing from the codebase.
**Learning:** Security controls assumed to be present (like rate limiting on auth) must be explicitly verified in the code.
**Prevention:** Always verify the existence and application of security guards during security reviews.

## 2026-01-25 - Public Auth Endpoints Left Vulnerable
**Vulnerability:** Registration and Password Reset endpoints were protected only by a loose global throttler (100 req/min), exposing the application to potential abuse (spam, DoS).
**Learning:** Security guards like `RateLimiterGuard` must be explicitly applied to ALL mutation endpoints, not just Login. A "Login" guard often implies it handles auth generally, but it doesn't.
**Prevention:** Audit `AuthController` and similar public-facing controllers to ensure every `@Post` method has an explicit rate limiting strategy.

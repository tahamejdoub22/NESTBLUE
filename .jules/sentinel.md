## 2026-01-22 - Missing Critical Security Guard
**Vulnerability:** The RateLimiterGuard for the login endpoint was completely missing from the codebase.
**Learning:** Security controls assumed to be present (like rate limiting on auth) must be explicitly verified in the code.
**Prevention:** Always verify the existence and application of security guards during security reviews.

## 2026-01-27 - Missing Rate Limiting on Sensitive Auth Endpoints
**Vulnerability:** Rate limiting was only applied to `login`, leaving `register`, `forgot-password`, `reset-password`, and `verify-email` exposed to abuse.
**Learning:** Applying security controls to one endpoint (like login) doesn't automatically protect related sensitive flows.
**Prevention:** Audit all authentication and account management endpoints to ensure consistent application of security guards.

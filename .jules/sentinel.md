## 2026-01-22 - Missing Critical Security Guard
**Vulnerability:** The RateLimiterGuard for the login endpoint was completely missing from the codebase.
**Learning:** Security controls assumed to be present (like rate limiting on auth) must be explicitly verified in the code.
**Prevention:** Always verify the existence and application of security guards during security reviews.

## 2026-01-29 - IDOR in Read Operations
**Vulnerability:** `ProjectsController` read endpoints (`findOne`, `getTasksByProject`) allowed access to project data via UID without verifying user membership.
**Learning:** Service methods like `findOne` that are used for both internal logic and external data retrieval must have optional access control checks enforced at the controller level.
**Prevention:** Introduce `checkAccess` parameters or separate `findOneWithAccess` methods for controller consumption to ensure ownership/membership is always verified for protected resources.

## 2026-01-22 - Missing Critical Security Guard
**Vulnerability:** The RateLimiterGuard for the login endpoint was completely missing from the codebase.
**Learning:** Security controls assumed to be present (like rate limiting on auth) must be explicitly verified in the code.
**Prevention:** Always verify the existence and application of security guards during security reviews.

## 2026-01-22 - IDOR in MessagesService
**Vulnerability:** The `MessagesService` exposed conversation data and operations (update/delete) via ID without checking if the requesting user was a participant.
**Learning:** Checking for authentication (JWT) is not enough; authorization (checking access to specific resources) is critical.
**Prevention:** Implement resource-level access control checks (e.g., `checkConversationAccess`) at the beginning of service methods.

## 2026-01-22 - IDOR in ProjectsService
**Vulnerability:** The `ProjectsService.findOne` method allowed any authenticated user to retrieve full project details by guessing the UID, bypassing membership checks.
**Learning:** API endpoints for retrieving resources (GET) are often overlooked for access control compared to modification endpoints (POST/PUT/DELETE).
**Prevention:** Ensure `findOne` methods accept a `checkAccessForUserId` parameter and validate ownership or membership before returning data.

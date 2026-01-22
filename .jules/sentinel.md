## 2026-01-10 - IDOR in UsersController
**Vulnerability:** UsersController allowed any authenticated user to update or delete any other user because authorization checks were missing.
**Learning:** NestJS Guards (like JwtAuthGuard) only handle authentication. Authorization (who can do what) must be handled by Role Guards or manual checks in the controller/service.
**Prevention:** Always check if 'req.user.userId === params.id' or 'req.user.role === admin' before performing sensitive operations on specific resources.

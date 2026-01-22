# Sentinel Journal

## 2024-05-23 - Hardcoded Secrets in Setup Script
**Vulnerability:** A setup script (`backend/setup-env.js`) contained hardcoded real credentials for a Neon PostgreSQL database and Neon API key, as well as sensitive configuration defaults.
**Learning:** Helper scripts often bypass security reviews because they are seen as "dev tools", but if they are committed to the repo, they expose secrets to everyone.
**Prevention:** Never include real credentials in any committed file, even templates or setup scripts. Use obvious placeholders like `your_password_here`.

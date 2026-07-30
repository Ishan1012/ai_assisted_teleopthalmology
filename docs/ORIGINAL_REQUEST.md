# Original User Request

## 2026-07-30T15:35:39Z

Verify and finalize ClearSight — a single-user AI-assisted tele-ophthalmology glaucoma screening demo application using Spring Boot 4.1.0, FastAPI, PostgreSQL/MongoDB, and Vite+React (with TailwindCSS and shadcn/ui).

Working directory: e:\Class Notes\research\vision test\ai_assisted_teleopthalmology
Integrity mode: development

## Requirements

### R1. Spring Boot Gateway & Auth Service (`backend/spring-api`)
- Verify Spring Boot compilation (`./mvnw clean test-compile` or `./mvnw test`).
- Ensure REST endpoints (`/api/auth/me`, `/api/scans/upload`, `/api/auth/login`, `/api/auth/register`) correctly handle user sessions and scan persistence.

### R2. Minimalist Frontend Application (`dashboard`)
- Run Vite production build (`npm run build` in `/dashboard`) and ensure zero compilation or type errors.
- Confirm all newly added pages (`/`, `/about`, `/dashboard`, `/login`, `/register`), sample fundus scan pickers, and empirical research figures load without errors.

### R3. Service Orchestration & Verification
- Ensure `.env.example` and `docker-compose.yml` are complete and ready for local deployment.
- Verify FastAPI service configuration and endpoint readiness.

## Acceptance Criteria

- [ ] Spring Boot builds cleanly with `./mvnw test-compile` or `./mvnw test`.
- [ ] React frontend builds cleanly with `npm run build` in `dashboard/`.
- [ ] End-to-end environment configuration (`docker-compose.yml`) is verified.

## Follow-up — 2026-07-30T15:42:04Z

Complete production-grade Google OAuth 2.0 authentication flow across Spring Boot backend (`backend/spring-api`) and Vite+React frontend (`dashboard`), eliminating any prompt popups or mock dialogs.

Working directory: e:\Class Notes\research\vision test\ai_assisted_teleopthalmology
Integrity mode: development

## Requirements

### R1. Spring Boot Google OAuth 2.0 & JWT Handler (`backend/spring-api`)
- Configure `application.yml` for Spring Security OAuth2 client (`spring.security.oauth2.client.registration.google`).
- Complete `OAuth2SuccessHandler.java` to extract Google user profile (googleId, email, name, picture), save or update user in PostgreSQL/MongoDB database, generate signed JWT token via `JwtTokenProvider`, and redirect to frontend callback URL with token.
- Add `/api/auth/google` POST endpoint to allow direct Google ID token / Auth code verification and JWT issuance.

### R2. Frontend Google OAuth Flow & Callback Handler (`dashboard`)
- Update `LoginPage.tsx`, `RegisterPage.tsx`, and `Navbar.tsx` "Sign in with Google" buttons to initiate authentic Google OAuth 2.0 authorization redirect.
- Create `/oauth/callback` route or handle query parameter token extraction in `useAuth.ts`, setting `localStorage` JWT and updating authenticated user context state.
- Ensure smooth transition from Google login to the `/dashboard` route.

## Acceptance Criteria

### Frontend App (`dashboard`)
- [ ] Clicking "Continue with Google" redirects to backend `/oauth2/authorization/google` endpoint or Google OAuth consent.
- [ ] Token parsing from Google OAuth callback seamlessly sets session JWT and navigates to `/dashboard`.
- [ ] Vite build (`npm run build` in `dashboard`) passes with 0 compilation errors.

### Backend API (`backend/spring-api`)
- [ ] Spring Boot compiles cleanly (`.\mvnw compile` or `.\mvnw package`).
- [ ] `OAuth2SuccessHandler` and `/api/auth/google` handle OAuth login, user creation/persistence, and JWT generation correctly.

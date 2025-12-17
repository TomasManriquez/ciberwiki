# Authentication Implementation Plan

## Goal
Implement secure Google OAuth authentication for the Allware Wiki. Users should be able to sign in with their Google accounts, and the application should create/update their user records and maintain a secure session.

## User Review Required
> [!IMPORTANT]
> You will need to provide **Google OAuth Credentials** (Client ID and Client Secret) in the `.env` file.
> I will set up the structure, but the actual login will fail until valid credentials are provided.

## Proposed Changes

### Backend (`apps/api`)

#### [DONE] `src/services/auth.service.ts`
- Logic to verify Google token (or handle code exchange).
- Logic to find or create a user in the `users` table based on email.
- Logic to generate a session JWT.

#### [DONE] `src/controllers/auth.controller.ts`
- `login`: Redirects to Google Consent Screen.
- `callback`: Handles Google callback, exchanges code for token, gets user info, creates session, sets HTTP-only cookie, redirects to frontend.
- `logout`: Clears session cookie.
- `me`: Returns current user info based on session cookie.

#### [DONE] `src/routers/auth.router.ts`
- Define routes: `GET /google`, `GET /google/callback`, `POST /logout`, `GET /me`.

#### [NEW] `src/middleware/auth.middleware.ts`
- Hono middleware to verify session cookie on protected routes.

#### [MODIFY] `src/index.ts`
- Register `authRouter`.

### Frontend (`apps/web`)

#### [MODIFY] `src/components/Navigation.astro`
- Update "Sign In" button to link to `http://localhost:3000/api/auth/google`.
- If user is logged in (check via API), show User Avatar/Name and "Sign Out" button.

#### [MODIFY] `src/layouts/Layout.astro`
- Add script to check auth status on load (optional, or do it in specific pages).

## Verification Plan

### Automated Tests
- Unit tests for `AuthService` (mocking Google API responses).

### Manual Verification
1. Click "Sign In" on frontend.
2. Verify redirect to Google.
3. Verify redirect back to app.
4. Verify `users` table has the new user.
5. Verify secure cookie is set.
6. Verify "Sign In" button changes to User Profile.

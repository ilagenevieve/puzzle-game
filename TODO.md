 # Developer Task List: Authentication & UI Cleanup

 ## 1. 🔒 Backend / API
- [x] **1.1** Verify that `POST /auth/register` sets a session cookie or returns a JWT on success.
- [x] **1.2** Ensure your CORS configuration allows credentials from your dev origin:
  - `origin: http://localhost:5173`, `credentials: true`.
- [ ] **1.3** Confirm `GET /users/me` returns `200` with a `{ user }` payload when a valid session is present.

 ## 2. 🧠 Frontend Logic
- [x] **2.1** Remove the demo-mode bypass in `App.svelte`.
- [ ] **2.2** Prevent or debounce repeated `GET /users/me` calls after failure.
- [ ] **2.3** Only call `navigate('/dashboard')` after `getCurrentUser()` succeeds and `userStore` is populated.
- [ ] **2.4** Audit your API service wrapper to ensure **every fetch** uses `{ credentials: 'include' }`.

 ## 3. 🧭 Routing & Accessibility
- [ ] **3.1** Fix the `<Route>` focus warning:
  - Add a focusable element (e.g., `<h1>`) in each route *or*
  - Pass `primary={false}` to protected routes in `<Route>`.
- [ ] **3.2** Remove or migrate unused global CSS selectors flagged in `FormInput.svelte`.
- [ ] **3.3** Replace all `autofocus` attributes with a controlled custom `focus` action.
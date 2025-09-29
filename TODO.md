
# TODO: Implement Admin Login Protection

## Steps:

- [x] Update backend/package.json to add "express-session": "^1.18.0" as a dependency
- [x] Run `cd backend && npm install` to install the new dependency
- [x] Update backend/server.js to include session middleware (app.use(session(...)))
- [x] Modify backend/routes/admin.js:
  - Add hardcoded admin credentials (e.g., username: 'admin', password: 'password')
  - Add POST /login route for authentication
  - Add GET /check-auth route to verify session
  - Add POST /logout route to end session
  - Create requireAuth middleware
  - Apply requireAuth to all existing admin routes (upload-image, products, categories)
- [x] Create new file frontend/src/components/Login.jsx with login form component
- [x] Update frontend/src/layouts/AdminLayout.jsx:
  - Add authentication state management (useState, useEffect)
  - Fetch /admin/check-auth on mount
  - Conditionally render Login component if not authenticated, else admin layout
  - Add logout button when authenticated
- [ ] Run backend server and frontend dev server if needed
- [ ] Test login at http://localhost:3000/admin/ and verify protection

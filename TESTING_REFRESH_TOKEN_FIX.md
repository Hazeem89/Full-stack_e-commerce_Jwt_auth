# Testing Refresh Token Expiration Fix

## What Was Fixed

### Frontend Changes (frontend/src/services/api.js)
- **Before:** When refresh token expired, the page reloaded but user data remained in localStorage, causing an infinite reload loop
- **After:** When refresh token expires:
  - Clears all user-related data from localStorage (`user`, `adminToken`, `favorites`, `cart`)
  - Clears the Authorization header
  - Redirects to the appropriate login page (`/login` for users, `/admin` for admins)

### Backend Changes (backend/routes/admin.js)
- Fixed admin refresh token expiry from `3m` (3 minutes) to `7d` (7 days) to match user tokens
- Fixed `secure` cookie flag from `true` to `false` for development (line 60 and 108)
- Fixed maxAge calculation from `3 * 60 * 1000` to `7 * 24 * 60 * 60 * 1000`

## How to Test

### Method 1: Quick Test (Recommended for Development)

1. **Temporarily shorten the refresh token lifetime:**

   Edit `backend/routes/users.js` line 81 and `backend/routes/admin.js` line 49:
   ```javascript
   // Change from:
   { expiresIn: "7d" }

   // To:
   { expiresIn: "1m" }  // 1 minute for testing
   ```

2. **Restart the backend server:**
   ```bash
   cd backend
   npm start
   ```

3. **Test User Flow:**
   - Open the frontend in your browser
   - Login as a regular user at `http://localhost:3000/login`
   - Wait 1 minute (refresh token expires)
   - Try to add an item to cart or toggle a favorite
   - **Expected Result:** You should be redirected to `/login` and all localStorage is cleared

4. **Test Admin Flow:**
   - Login as admin at `http://localhost:3000/admin`
   - Wait 1 minute (refresh token expires)
   - Try to create a product or category
   - **Expected Result:** You should be redirected to `/admin` login and all localStorage is cleared

5. **Verify localStorage is cleared:**
   - Open Browser DevTools (F12)
   - Go to Application > Local Storage
   - Verify that `user`, `adminToken`, `favorites`, and `cart` are removed

6. **Remember to change the expiry back to "7d" after testing!**

### Method 2: Manual Cookie Deletion

1. **Login to the application** (user or admin)
2. **Open Browser DevTools** (F12)
3. **Go to Application > Cookies**
4. **Delete the `refreshToken` cookie** manually
5. **Try to perform an action** that requires authentication
6. **Expected Result:** Redirect to login page with localStorage cleared

### Method 3: Simulate Expired Token with Modified Backend

1. **Add a test endpoint** to force token expiration (temporary, for testing only):

   In `backend/routes/users.js`:
   ```javascript
   // TEST ENDPOINT - Remove after testing
   router.post('/test-expire-token', (req, res) => {
     res.clearCookie('refreshToken');
     res.json({ message: 'Refresh token cleared' });
   });
   ```

2. **Call this endpoint** from the browser console:
   ```javascript
   fetch('http://localhost:8000/users/test-expire-token', {
     method: 'POST',
     credentials: 'include'
   }).then(() => {
     // Now try to use the app
     console.log('Token cleared, try using the app now');
   });
   ```

3. **Try to use the app** - it should redirect to login

## Verification Checklist

- [ ] User refresh token expiration redirects to `/login`
- [ ] Admin refresh token expiration redirects to `/admin`
- [ ] `localStorage.getItem('user')` returns `null` after token expiry
- [ ] `localStorage.getItem('adminToken')` returns `null` after admin token expiry
- [ ] `localStorage.getItem('favorites')` returns `null` after token expiry
- [ ] `localStorage.getItem('cart')` returns `null` after token expiry
- [ ] No infinite reload loop occurs
- [ ] User can login again successfully after token expiration
- [ ] Network tab shows the refresh call returning 401

## What to Look For in Network Tab

1. **Open DevTools > Network tab**
2. **When token expires, you should see:**
   ```
   POST /users/refresh → Status: 401 Unauthorized
   Error: "Session expired. Please login again"
   ```
3. **Then the browser redirects to the login page**

## Common Issues

### Issue: Still seeing infinite reload
**Cause:** localStorage not being cleared properly
**Solution:** Manually clear localStorage and try again

### Issue: Not redirecting after refresh fails
**Cause:** Cached version of api.js
**Solution:** Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Cookies not being cleared on backend
**Cause:** `secure` flag mismatch
**Solution:** Ensure `secure: false` in development (already fixed)

## Production Considerations

When deploying to production:

1. Change `secure: false` to `secure: true` in both:
   - `backend/routes/users.js` line 92
   - `backend/routes/admin.js` line 60 and 108

2. Ensure you're using HTTPS in production

3. Update CORS settings in `backend/server.js` to use your production domain

4. Test the flow in production environment as well

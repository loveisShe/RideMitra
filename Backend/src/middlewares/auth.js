/**
 * DEPRECATED — DO NOT USE
 *
 * Bug #13 fix: this middleware only verified the JWT payload but did NOT perform
 * a database lookup. A deleted user's token would still pass this check.
 *
 * Use `authMiddleware` from `./authMiddleware.js` instead — it verifies the token
 * AND confirms the user still exists in the database.
 */
throw new Error(
  "[auth.js] This file is intentionally disabled. " +
  "Import authMiddleware from './authMiddleware.js' instead."
);
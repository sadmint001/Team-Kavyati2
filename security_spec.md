# Team Kavyati Security Specification

## 1. Data Invariants
- A user profile must have a valid role ('user' or 'admin').
- A user cannot set their own role to 'admin'.
- Subscription tiers are limited to 'bronze', 'silver', or 'gold'.
- Audit logs are only writable by admins.
- Users can only read/write their own profiles (with limitations on role/tier).

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Privilege Escalation**: Attempting to create a user with `role: 'admin'`.
2. **Identity Spoofing**: Attempting to create a user profile with a `userId` different from `request.auth.uid`.
3. **Shadow Update**: Adding a field `isVerified: true` to the user profile update.
4. **Subscription Tampering**: A user trying to update their own `subscription_tier` to 'gold'.
5. **PII Leak**: An unauthenticated user attempting to `get` another user's profile.
6. **Orphaned Record**: Creating a subscription for a non-existent `userId`.
7. **Temporal Poisoning**: Setting `created_at` to a past or future date instead of `request.time`.
8. **Resource Exhaustion**: Sending a 1MB string as `full_name`.
9. **ID Injection**: Using a 2KB string for `subId`.
10. **State Shortcut**: Updating a subscription status from 'expired' to 'active' without admin permission.
11. **Admin Impersonation**: A regular user trying to access `/audit_logs`.
12. **Blanket Read**: Authenticated user trying to `list` the `/users` collection.

## 3. The Test Runner (Mock Tests Logic)
- `tests/privilege_escalation.test.ts`: Verify `create` fails if `role == 'admin'` for non-admin request.
- `tests/identity_spoofing.test.ts`: Verify `create` fails if `userId != auth.uid`.
- etc.

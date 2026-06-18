# Firebase Security Specifications & Relational Invariants

This specification defines the access control policies, data invariants, and attack surface test suites for the Cute Planet incremental game.

## 1. Data Invariants
- **Identity Invariant**: A user's progress save document MUST reside strictly under `/saves/{userId}` where `userId` matches the authenticated caller's Firebase User UID (`request.auth.uid`). No cross-user reads or writes are allowed.
- **Temproal Immutability**: `createdAt` is verified on creation and is immutable thereafter. `updatedAt` must be synced to the absolute server/database timestamp `request.time` during every update action.
- **Strict Keys**: Non-whitelisted fields ("ghost properties") are rejected during both creation and update phases through precise schema verification helpers.
- **Value Integrity**: Numerical values of life, levels, counts, and exp must be positive numbers.

## 2. The "Dirty Dozen" Vulnerability Payloads (To Be Blocked)
1. **Unauthentic Write**: Unauthenticated writer attempts to create or fetch a progress save document.
2. **Access Hijack**: Authenticated User A tries to read User B's progress.
3. **Save Hijack / Spoofing**: Authenticated User A tries to write under `/saves/user_b` or change fields specifying `userId` as `user_b`.
4. **Negative Balance Exploitation**: Writing negative values to `life` or `totalLifeEarned`.
5. **Level Shortcut injection**: Directly writing `planetLevel = 999999` with zero matching `planetExp`.
6. **Ghost Key Injection**: Attempting to slip non-standard administrative fields like `isModerator: true` or `isAdmin: true` into the `saves` schema.
7. **Creation Timestamp Alteration**: Attempting to alter `createdAt` on an existing save update transaction.
8. **Client Timestamp Spoofing**: Supplying custom local system time for `updatedAt` instead of `request.time` (Server Value).
9. **Identity Poisoning ID Bloat**: Trying to use a very long, malicious junk character sequence as `userId` during save creation or access.
10. **Type Mismatch Insertion**: Sending `planetLevel` as a String instead of a Number.
11. **Star Exploitation**: Writing an impossible number of flying stars (e.g. `starsCount: 1e12`).
12. **Bypassing Verification Gates**: Accessing or updating document paths without an authenticated, active Firebase session.

## 3. Recommended Security Rules Architecture (Draft)
A comprehensive `DRAFT_firestore.rules` containing helper validations will enforce these rules flawlessly.

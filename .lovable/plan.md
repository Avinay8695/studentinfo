

# Audit Logs Enhancement Plan

Two features: (1) Capture IP/device info on login events, (2) Add "Restore" button for deleted students.

---

## Feature 1: IP Address & Device/Browser Info on Login

**Approach**: Capture `navigator.userAgent` and fetch IP from a free API (`https://api.ipify.org?format=json`) at login time, then store in the audit log `details` JSON.

**Changes**:
- **`src/utils/logger.ts`**: Update `logUserLogin()` to accept optional `{ ip, userAgent }` params and include them in `details` as `ip_address`, `user_agent`, `browser`, `os` (parse from UA string).
- **`src/pages/Auth.tsx`**: At login time, fetch IP and pass `navigator.userAgent` + IP to `logUserLogin()`.
- **`src/pages/AuditLogs.tsx`** (Detail Sheet): For LOGIN events, display IP address, browser, and device info in the detail panel under a "Security Info" section with `Globe` and `Monitor` icons.

**No database changes needed** — IP/device data goes into the existing `details` JSONB column.

---

## Feature 2: Restore Deleted Students

**Approach**: For DELETE + STUDENT audit logs that have `before` data, show a "Restore Student" button in the detail sheet. Clicking it re-inserts the student into the `students` table using the stored `before` snapshot, then generates fresh monthly payments.

**Changes**:
- **`src/pages/AuditLogs.tsx`**:
  - Import `RotateCcw` icon from lucide-react
  - Add a `restoreStudent` async function that:
    1. Takes the `before` data from the selected log
    2. Inserts a new student record (new UUID, original name/course/batch/fees/etc.)
    3. Generates and inserts monthly payments using `generateMonthlyPayments` from `useStudents.ts`
    4. Logs the restore as a CREATE action in audit logs
    5. Shows success/error toast
  - In the Detail Sheet, when `action_type === 'DELETE'` and `entity_type === 'STUDENT'` and `details.before` exists, render a prominent "Restore Student" button below the deleted record details
  - Add loading state for the restore operation

**Security**: Only admins can see audit logs and only admins can INSERT students (RLS enforced), so this is safe.

---

## Summary of File Changes

| File | Change |
|------|--------|
| `src/utils/logger.ts` | Add IP/UA params to `logUserLogin`, add UA parser helper |
| `src/pages/Auth.tsx` | Fetch IP + pass device info at login |
| `src/pages/AuditLogs.tsx` | Show security info for LOGIN events + Restore button for deleted students |


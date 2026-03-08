

# Header Enhancement Plan

Current header has: animated gradient, scroll-shrink animation, desktop user card, notification bell, theme toggle, dropdown menu. It's solid but here are meaningful improvements:

## Possible Enhancements

### 1. **Online Status Indicator (Green Dot)**
- User avatar icon ke saath ek green pulse dot dikhana — shows the user is online/active

### 2. **Breadcrumb / Current Page Indicator**
- Subtitle area me current page name dikhana (e.g., "Dashboard", "User Management", "Audit Logs") instead of static "Student Management" — useful when navigating between pages

### 3. **Quick Search in Header (Cmd+K)**
- Header me ek search icon add karna jo click pe Command Palette (cmdk) open kare — students, pages, actions quickly search kar sake
- `cmdk` package already installed hai

### 4. **Last Login Info in Dropdown**
- Dropdown menu me user ke last login time dikhana — "Last login: 2 hours ago"
- Audit logs se fetch kar sakte hain

### 5. **Glassmorphism Effect on Scroll**
- Jab scroll ho tab header background ko gradient se glassmorphism (blur + semi-transparent) me transition karna — modern look + content readability improve hoti hai

---

## Recommended Priority

| # | Enhancement | Effort | Impact |
|---|------------|--------|--------|
| 1 | Quick Search (Cmd+K) | Medium | High |
| 2 | Glassmorphism on scroll | Low | Medium |
| 3 | Breadcrumb / page indicator | Low | Medium |
| 4 | Online status dot | Low | Low |
| 5 | Last login in dropdown | Medium | Low |

## Files to Change
- `src/components/Header.tsx` — all enhancements
- New `src/components/CommandPalette.tsx` — for Cmd+K search
- `src/pages/Index.tsx`, `src/pages/AuditLogs.tsx`, `src/pages/UserManagement.tsx` — pass page name prop if breadcrumb approach chosen

Bataiye kaunse improvements chahiye — ek ya multiple select kar sakte hain!


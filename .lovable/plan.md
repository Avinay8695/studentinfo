## Plan: SD Assistant ko "Action Agent" banao (kaam bhi kare, sirf jawab nahi)

Abhi AI sirf data padhke jawab deta hai. Iske baad AI **actions** bhi perform karega — jaise WhatsApp reminder bhejna, payment mark karna, student dhundhna, export trigger karna, etc. Yeh OpenAI-compatible **tool calling** se hoga (Lovable AI Gateway supports it).

Sab actions sirf **admin** ke liye. Regular users ke liye sirf read-only Q&A (jaisa hai waisa).

---

### Kya kar sakega AI (Tools)

Admin chat me likhega: *"Rahul ko WhatsApp reminder bhejo"* ya *"November ka payment mark paid kardo Priya ka"* — AI tool call karega, frontend execute karega, result chat me dikhega.

**Read-only tools (auto-execute, no confirm):**
1. `find_student` — naam/mobile/course se student dhundo, full details return
2. `list_overdue_students` — overdue list with mobile + pending months + amount
3. `get_revenue_summary` — date-range wise collection/pending breakdown
4. `get_course_stats` — course-wise students, revenue, collection rate
5. `top_defaulters` — top N defaulters by overdue amount

**Write/action tools (confirmation chip dikhayega chat me, admin click → execute):**
6. `send_whatsapp_reminder` — student id se → `wa.me` URL kholo with pre-filled message (existing `whatsappReminder.ts` use)
7. `mark_payment_paid` — student id + month + year → DB update via `updatePaymentStatus`
8. `bulk_send_reminders` — sare overdue students ko ek-ek karke WhatsApp links list kar do
9. `open_student_profile` — student dialog (payment tracker / analytics) khol do
10. `export_data` — CSV/PDF export trigger karo (existing `ExportButton` logic)
11. `scroll_to_section` — dashboard/students/analytics section pe le jao

---

### Kaise kaam karega (Flow)

```text
User: "Rahul ka October payment paid mark karo"
  ↓
Edge function (ai-insights) → Gemini with tools schema
  ↓
AI returns tool_call: mark_payment_paid({studentId, month:9, year:2026})
  ↓
Frontend (AIChatBot) intercepts tool_call:
  - Read-only tool → execute silently, send result back to AI → AI replies
  - Write tool → render "Confirm action" card in chat
      [✓ Confirm]  [✗ Cancel]
  ↓
On confirm → run handler from props (updatePaymentStatus, openWhatsApp, etc.)
  ↓
Send tool_result back → AI ka final natural-language confirmation aata hai
```

---

### Changes

1. **`supabase/functions/ai-insights/index.ts`**
   - Add `tools: [...]` array with JSON schemas for all 11 tools (only when `isAdmin`)
   - Switch from pure stream to **non-streaming first call** when tools present, then stream final text after tool results (multi-turn loop supported in same request via client round-trips)
   - Update system prompt: "You are an action-capable agent. Prefer calling tools over guessing."

2. **`src/components/AIChatBot.tsx`**
   - Accept new props: `onMarkPayment`, `onOpenStudent`, `onExport`, `onScrollTo` (callbacks from `Index.tsx`)
   - New `executeTool(name, args)` switch — handles all 11 tools client-side using already-available `students` data + handler props
   - Render **ToolCallCard** in message stream:
     - Read-only result → small collapsed "✓ Fetched data" chip
     - Write action → "Confirm" UI with action summary, Confirm/Cancel buttons
   - Multi-turn loop: after tool result, POST again to edge function with `tool` role messages until AI returns plain text

3. **`src/pages/Index.tsx`**
   - Pass `updatePaymentStatus`, `handleViewPayments`, `handleViewAnalytics`, `setIsBulkImportOpen` to `AIChatBot`
   - Add small `scrollToSection(id)` helper

4. **`src/utils/whatsappReminder.ts`** — already exists, reuse `getWhatsAppReminderUrl(student)`

---

### Safety / UX

- Write actions **always** show confirm card — AI cannot silently mutate data
- Non-admin users: tools array not sent → AI behaves like before (read-only Q&A)
- Each tool call logged to console for debugging
- If tool fails (e.g. student not found) → error returned to AI, AI explains in Hinglish
- Markdown rendering + premium UI (existing) stays as-is

---

### Example interactions admin try kar sakta hai

- "Top 5 defaulters dikhao aur sabko WhatsApp reminder bhej do"
- "Priya Sharma ka October aur November paid mark kardo"
- "Yoga course ke sare students ka revenue kitna hai?"
- "Mujhe Rahul ka payment tracker kholke do"
- "Pure data ka CSV export nikalo"

Approve karo toh implement kar deta hoon.
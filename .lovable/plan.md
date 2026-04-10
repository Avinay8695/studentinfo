

## Plan: WhatsApp Payment Reminders + AI-Powered Features

### Feature 1: WhatsApp Payment Reminders

**What it does**: Add a "Send WhatsApp Reminder" button on student cards and the notification bell's overdue list. Clicking it opens WhatsApp with a pre-filled message containing student name, pending months, and total amount.

**How it works**:
- Uses `https://wa.me/{phone}?text={message}` — no API key or backend needed
- The student's mobile number is already stored in the database
- Pre-formatted message in Hindi/English with student name, overdue months, and amount

**Changes**:
1. **Create `src/utils/whatsappReminder.ts`** — utility function that formats the mobile number (adds `91` country code if needed), builds a professional reminder message template, and returns the `wa.me` URL
2. **Update `src/components/NotificationBell.tsx`** — add a WhatsApp icon button next to each overdue student entry
3. **Update `src/components/MonthlyPaymentTracker.tsx`** — add a "Send Reminder" button in the payment tracker dialog
4. **Update `src/components/SwipeableStudentCard.tsx`** — add WhatsApp quick action on mobile cards for students with pending fees

---

### Feature 2: AI-Powered Smart Insights

**What it does**: Add an AI assistant that analyzes student/payment data and gives actionable insights — like revenue forecasts, at-risk students, collection suggestions.

**How it works**:
- Uses Lovable AI Gateway via a Supabase Edge Function
- A floating "AI Insights" button on the dashboard opens a panel
- Sends aggregated stats (not raw data) to AI for analysis
- Streams the response back with markdown rendering

**Changes**:
1. **Create edge function `supabase/functions/ai-insights/index.ts`** — accepts stats summary, calls Lovable AI Gateway with a system prompt tuned for institute analytics, streams response
2. **Create `src/components/AIInsightsPanel.tsx`** — floating button + slide-out panel with pre-built prompt buttons ("Revenue Forecast", "At-Risk Students", "Collection Tips") and streamed AI response display
3. **Update `src/pages/Index.tsx`** — add the AIInsightsPanel component
4. **Update `supabase/config.toml`** — register the new edge function

---

### Technical Details

- WhatsApp reminders use the free `wa.me` deep link — works on both mobile and desktop, no Twilio needed
- AI insights use `LOVABLE_API_KEY` (already available) with `google/gemini-3-flash-preview` model
- AI receives only aggregated numbers (total students, collection rate, overdue count) — no PII sent to AI
- Streaming SSE for real-time AI response rendering


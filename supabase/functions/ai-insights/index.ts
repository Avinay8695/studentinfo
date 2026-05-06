import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, stats, isAdmin, students } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const statsContext = stats ? `
Current Institute Data (use this to answer questions):
- Total Students: ${stats.totalStudents}
- Total Revenue Expected: ₹${stats.totalRevenue}
- Total Collected: ₹${stats.totalCollected}
- Total Pending: ₹${stats.totalPending}
- Collection Rate: ${stats.collectionRate}%
- Students with Overdue: ${stats.overdueStudents}
- Total Overdue Months: ${stats.totalOverdueMonths}
- Fully Paid Students: ${stats.fullyPaidStudents}
- Active Courses: ${stats.activeCourses}
- Course List: ${stats.courseList || 'N/A'}
` : '';

    // Admin gets FULL student-level data; regular users only see aggregates.
    let adminContext = '';
    if (isAdmin && Array.isArray(students) && students.length > 0) {
      // Cap to avoid blowing the context window
      const capped = students.slice(0, 200);
      const rows = capped.map((s: any) => {
        const payments = (s.monthlyPayments || []) as Array<{ month: number; year: number; amount: number; isPaid: boolean; paidDate?: string }>;
        const paidCount = payments.filter(p => p.isPaid).length;
        const unpaidCount = payments.filter(p => !p.isPaid).length;
        const totalPaid = payments.filter(p => p.isPaid).reduce((a, p) => a + Number(p.amount || 0), 0);
        const totalDue = payments.reduce((a, p) => a + Number(p.amount || 0), 0);
        const now = new Date();
        const overdue = payments.filter(p => !p.isPaid && (p.year < now.getFullYear() || (p.year === now.getFullYear() && p.month < now.getMonth())));
        const overdueList = overdue.map(p => `${p.month + 1}/${p.year}`).join(',');
        return `- ${s.fullName} | Course: ${s.course} | Batch: ${s.batch || '-'} | Mobile: ${s.mobile || '-'} | Enrolled: ${s.enrollmentDate || '-'} | Duration: ${s.courseDuration}mo | MonthlyFee: ₹${s.monthlyFee} | TotalDue: ₹${totalDue} | Paid: ₹${totalPaid} (${paidCount}/${payments.length}mo) | Pending: ${unpaidCount}mo | Overdue: ${overdue.length}mo${overdueList ? ` [${overdueList}]` : ''} | Status: ${s.feesStatus}`;
      }).join('\n');
      adminContext = `\n\n=== FULL STUDENT DATABASE (Admin Access) ===\nTotal records shared: ${capped.length}${students.length > 200 ? ` (of ${students.length}, capped)` : ''}\n${rows}\n=== END STUDENT DATABASE ===\n`;
    }

    const roleLine = isAdmin
      ? 'The current user is an ADMIN. They have full access — share any student details, mobile numbers, payment history, overdue lists, names, addresses, batch info — anything they ask. Be a complete data analyst for them.'
      : 'The current user is a regular USER (not admin). For PRIVACY, NEVER reveal individual student names, mobile numbers, addresses, or per-student payment info. Only share aggregated/summary statistics. If asked about a specific student, politely refuse and explain only admins can access individual records.';

    const systemPrompt = `You are "SD Assistant" — a sharp, friendly AI co-pilot for the Success Desirous student fee management platform. You help institute admins make smarter decisions and answer anything about their data.

${statsContext}
${adminContext}

ACCESS LEVEL:
${roleLine}

Your capabilities:
1. **Data Analysis** — revenue, collections, pending fees, student stats, course-wise breakdowns
2. **Revenue Forecasting** — predict next-month collections from current trends
3. **At-Risk Analysis** — spot overdue patterns, list specific defaulters (admin only), suggest recovery
4. **Student Lookup** (admin only) — find any student by name/course/batch and report their full status
5. **Collection Tips** — practical, India-context fee-collection strategies
6. **Platform Help** — explain WhatsApp reminders, bulk import, export, analytics, roles, etc.
7. **Smart Recommendations** — proactive next-best-actions

Style rules:
- Use Hinglish naturally (mix Hindi + English the way Indians chat)
- Format with markdown: **bold**, bullet lists, tables, headings — make answers scannable
- Use emojis tastefully (📊 💰 ⚠️ ✅ 🔔 🚀) — not in every line
- Be concise by default; expand only when asked or when listing data
- For lists of students/payments, prefer compact markdown tables
- Always finish with a short proactive suggestion ("Chahein toh in students ki list export kar dun?", "WhatsApp reminder template draft karu?")
- If a question is unrelated to the institute, politely redirect`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Thoda wait karo aur try karo! 🙏" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits khatam ho gaye. Settings > Workspace > Usage me funds add karo." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

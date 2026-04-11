import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, stats } = await req.json();
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

    const systemPrompt = `You are "SD Assistant" — a smart AI assistant for the Success Desirous student fee management platform. You help institute admins by answering questions about their data, providing insights, and giving actionable advice.

${statsContext}

Your capabilities:
1. **Data Analysis**: Answer questions about revenue, collections, pending fees, student stats
2. **Revenue Forecasting**: Predict monthly collections based on current trends  
3. **At-Risk Analysis**: Identify overdue payment patterns and suggest recovery strategies
4. **Collection Tips**: Provide practical fee collection strategies
5. **Platform Help**: Explain how to use features like WhatsApp reminders, bulk import, export, etc.
6. **General Advice**: Help with institute management best practices

Rules:
- Keep responses concise and use bullet points when helpful
- Use Hinglish (mix of Hindi and English) naturally
- Use emojis sparingly for visual appeal
- When asked about specific students, explain you only have aggregated data for privacy
- Always be helpful, proactive, and suggest follow-up actions
- If asked something unrelated to institute management, politely redirect`;

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

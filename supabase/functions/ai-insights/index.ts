import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { stats, promptType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an AI analytics assistant for a student fee management institute. You analyze aggregated data and provide actionable insights. Keep responses concise, use bullet points, and include specific numbers. Respond in a mix of Hindi and English (Hinglish) to match the user's preference. Use emojis sparingly for visual appeal.

IMPORTANT: You only receive aggregated statistics, never personal student data. Base your analysis on the numbers provided.`;

    let userPrompt = '';
    const statsText = `
Institute Stats:
- Total Students: ${stats.totalStudents}
- Total Revenue Expected: ₹${stats.totalRevenue}
- Total Collected: ₹${stats.totalCollected}
- Total Pending: ₹${stats.totalPending}
- Collection Rate: ${stats.collectionRate}%
- Students with Overdue: ${stats.overdueStudents}
- Total Overdue Months: ${stats.totalOverdueMonths}
- Fully Paid Students: ${stats.fullyPaidStudents}
- Active Courses: ${stats.activeCourses}
`;

    switch (promptType) {
      case 'revenue_forecast':
        userPrompt = `${statsText}\n\nBased on these stats, provide a revenue forecast and collection analysis. Include: current collection efficiency, projected monthly collection, suggestions to improve collection rate, and risk assessment.`;
        break;
      case 'at_risk':
        userPrompt = `${statsText}\n\nAnalyze the at-risk situation. ${stats.overdueStudents} students have overdue payments totaling ${stats.totalOverdueMonths} months. Provide: severity assessment, impact on revenue, recommended actions for recovery, and prioritization strategy.`;
        break;
      case 'collection_tips':
        userPrompt = `${statsText}\n\nProvide practical collection tips and strategies for the institute. Include: best practices for fee reminders, timing strategies, communication templates ideas, and how to handle chronic defaulters.`;
        break;
      case 'overall':
      default:
        userPrompt = `${statsText}\n\nProvide a comprehensive analysis of the institute's financial health. Cover: overall performance rating, key strengths, areas of concern, top 3 actionable recommendations, and a brief outlook.`;
        break;
    }

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
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }), {
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

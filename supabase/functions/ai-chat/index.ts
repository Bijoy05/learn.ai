import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { subject_id, topic_name, subject_name, message } = await req.json();

    // Fetch user's learning preferences from onboarding
    const { data: prefs } = await supabase
      .from("onboarding_responses")
      .select("question_text, answer")
      .eq("user_id", userId);

    const prefContext = (prefs || [])
      .map((p: any) => `${p.question_text}: ${typeof p.answer === "string" ? p.answer : JSON.stringify(p.answer)}`)
      .join("\n");

    // Fetch recent chat history for context
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content, message_type")
      .eq("user_id", userId)
      .eq("subject_id", subject_id)
      .order("created_at", { ascending: true })
      .limit(30);

    const chatHistory = (history || []).map((m: any) => ({
      role: m.role === "student" ? "user" : "assistant",
      content: m.content,
    }));

    // Save the student message
    await supabase.from("chat_messages").insert({
      user_id: userId,
      subject_id,
      role: "student",
      content: message,
      message_type: "text",
    });

    const systemPrompt = `You are an expert, caring ${subject_name || "subject"} teacher for a student. Your goal is to help them deeply understand ${topic_name || "the current topic"} in ${subject_name || "their subject"}.

## Student Learning Profile
${prefContext || "No preferences available yet."}

## Your Teaching Style Rules
- Adapt your explanations to match how this student learns best (see their preferences above)
- Be encouraging, patient, and break complex ideas into digestible steps
- Use analogies and real-world examples relevant to their grade level
- Keep responses focused and not too long unless they ask for detail

## Rich Content Generation
You can generate special interactive content by wrapping it in specific tags. Use these FREQUENTLY to make learning engaging:

### Quizzes
When testing understanding, generate a quiz block like this:
\`\`\`quiz
{"question":"What is 2+2?","options":["3","4","5","6"],"correct":1,"explanation":"2+2 equals 4 because adding two groups of two gives four total."}
\`\`\`

### Charts/Graphs  
When explaining data, trends, or mathematical functions, generate chart data:
\`\`\`chart
{"title":"y = 2x","data":[{"x":0,"y":0},{"x":1,"y":2},{"x":2,"y":4},{"x":3,"y":6},{"x":4,"y":8}]}
\`\`\`

### Callouts
For important tips, warnings, or key takeaways:
\`\`\`callout
Remember: Always check your units when solving physics problems!
\`\`\`

## Important
- Generate quizzes after explaining concepts to check understanding
- Use charts whenever discussing numerical relationships or data
- Make quizzes have 4 options, with clear explanations for the correct answer
- Keep quiz questions at the student's grade level
- Be conversational and friendly, like a real tutor`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory,
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

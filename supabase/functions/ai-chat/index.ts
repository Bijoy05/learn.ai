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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const { subject_id, topic_id, topic_name, subject_name, message, system_prompt } = await req.json();

    // Fetch user's learning preferences from onboarding
    const { data: prefs } = await supabase
      .from("onboarding_responses")
      .select("question_text, answer")
      .eq("user_id", userId);

    const prefContext = (prefs || [])
      .map((p: any) => `${p.question_text}: ${typeof p.answer === "string" ? p.answer : JSON.stringify(p.answer)}`)
      .join("\n");

    // Fetch recent chat history for context
    let historyQuery = supabase
      .from("chat_messages")
      .select("role, content, message_type")
      .eq("user_id", userId)
      .eq("subject_id", subject_id)
      .order("created_at", { ascending: true })
      .limit(30);
    if (topic_id) historyQuery = historyQuery.eq("topic_id", topic_id);
    const { data: history } = await historyQuery;

    const chatHistory = (history || []).map((m: any) => ({
      role: m.role === "student" ? "user" : "assistant",
      content: m.content,
    }));

    // Save the student message if provided and not a system initiation
    if (message && !message.startsWith("[SYSTEM:")) {
      await supabase.from("chat_messages").insert({
        user_id: userId,
        subject_id,
        topic_id: topic_id || null,
        role: "student",
        content: message,
        message_type: "text",
      });
    }

    // Use the system prompt passed from the client
    const finalSystemPrompt = system_prompt || `You are a helpful tutor for ${subject_name || "this subject"}.`;

    const messages: any[] = [
      { role: "system", content: finalSystemPrompt },
      ...chatHistory,
    ];
    if (message) {
      messages.push({ role: "user", content: message });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, pros, suggestions } = await req.json();
    const ZENMUX_API_KEY = Deno.env.get("ZENMUX_API_KEY");
    
    if (!ZENMUX_API_KEY) {
      throw new Error("ZENMUX_API_KEY is not configured");
    }

    const prosText = pros?.join("、") || "";
    const suggestionsText = suggestions?.join("、") || "";

    const response = await fetch("https://zenmux.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ZENMUX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `你是一位资深的女装销售顾问，擅长向顾客介绍服装穿搭。你的任务是根据穿搭照片和分析结果，生成一段专业、热情、有说服力的销售话术。

要求：
1. 用亲切自然的口吻，像面对面和顾客交流一样
2. 重点突出这套穿搭的优点和亮点
3. 描述衣服的风格、适合的场合、穿着效果
4. 可以适当提及搭配技巧和时尚元素
5. 语言要生动有感染力，让顾客产生购买欲望
6. 控制在200-300字左右

已知的穿搭优点：${prosText}
搭配建议：${suggestionsText}

请直接输出销售话术，不要有任何前缀或标题。`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "请根据这张穿搭照片，生成一段向顾客介绍这套衣服的销售话术。"
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 服务额度不足，请联系管理员" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI 服务暂时不可用" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    return new Response(JSON.stringify({ introduction: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-sales-intro error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "生成失败" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

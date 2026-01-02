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
            content: `你是一位在店里和顾客一对一说话的真实导购，不是培训老师，也不是官方文案。

【核心原则】
你在帮顾客挑衣服，不是在介绍产品。语气要自然、口语化。

【强制禁止】
以下词语禁止单独使用，必须绑定具体承接：
- 稳 / 高级 / 气质 / 显贵 / 有质感 / 提升气场

若使用，必须说明：
- 具体身体部位（肩、腰、比例、上身是否塌）
- 穿着对比（和现在这件比有什么不同）
- 使用场景（上班、见人、日常、出门是否出错）

❌ 错误示例：
穿上很显气质
会显得人更稳一点

✅ 正确示例：
肩线是立住的，人看着不松垮
上半身一挺，整个人就精神了

【表达方式】
- 多用【感受 + 画面】，少用形容词
- 每句话都要让顾客"能想象自己穿上后的样子"
- 允许不完美，但要真实
- 用短句、分行，像真实聊天

【必须包含：导购搭配建议】
话术中必须包含你作为导购的搭配建议，例如：
- 我一般会建议你里面配浅色，看着更干净
- 裤子不用太紧，直一点反而显腿长
- 鞋子不用复杂，这套本身已经够了
禁止使用"官方搭配建议""标准搭配方案"等说法

【结尾方式】
必须是低压、不推销的导购收尾，例如：
- 你先穿出来看一眼，合不合适我们再说
- 上身感觉最重要，其他都是其次

【输出格式】
- 不要一整段输出
- 用短句、分行
- 像真实聊天，不是朗读稿
- 控制在200-300字

已知的穿搭优点：${prosText}
搭配建议：${suggestionsText}

请直接输出销售话术，不要有任何前缀、标题或"销售话术："等字样。`
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

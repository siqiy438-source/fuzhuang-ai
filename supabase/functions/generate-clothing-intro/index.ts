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
    const { imageBase64 } = await req.json();
    const ZENMUX_API_KEY = Deno.env.get("ZENMUX_API_KEY");

    if (!ZENMUX_API_KEY) {
      throw new Error("ZENMUX_API_KEY is not configured");
    }

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
            content: `你是一位专业的抖音服装带货主播文案撰写专家。请根据用户上传的服装图片，生成一段简洁有力的口播话术。

目标受众：30-50岁女性

结构要求：
1. 开场（1句话）：必须有钩子，能让人停下来想听。可以用以下方式：
   - 场景切入："过年走亲戚不知道穿什么的，看这件"
   - 痛点切入："怕显胖的姐姐注意了"、"肤色偏黄的有救了"
   - 具体细节切入："你看这个盘扣，全是手工做的"
   - 直接推荐："这件我自己留了一件"
   禁止用"这款XX真的很好看/很出挑"这种废话开头
2. 卖点介绍（2-3句）：具体描述面料质感、做工细节、设计亮点
3. 上身效果（1句）：说明穿上后的视觉效果
4. 场景推荐（1句）：适合什么场合穿，自然收尾

禁止使用的词汇和句式（非常重要）：
- 禁止：轻盈、飘逸、若隐若现、仙气、灵动、高级感、氛围感、出挑
- 禁止：彰显、尽显、诠释、演绎、打造、塑造、衬托
- 禁止：成为人群中最亮眼的存在、让你成为焦点、回头率超高
- 禁止：一眼就爱上、瞬间爱上、忍不住入手
- 禁止：为您准备、专属于您、值得拥有
- 禁止：姐妹们、宝宝、亲、瞧、哟、哈
- 禁止用"这款XX真的很XX"作为开头

语言风格：
- 开头要有勾人的点，让人想继续听
- 描述细节要具体，如"走线整齐"、"扣子是手工盘的"、"面料有垂感"
- 结尾实在，如"聚会穿、喝茶穿都合适"

字数控制在100-120字，直接输出话术内容，不需要标题或分段。`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "请根据这张衣服照片，生成一段抖音口播介绍文案。"
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
    console.error("generate-clothing-intro error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "生成失败" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

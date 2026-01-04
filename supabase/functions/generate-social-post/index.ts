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
    const { imageBase64, style = "professional" } = await req.json();
    const ZENMUX_API_KEY = Deno.env.get("ZENMUX_API_KEY");
    
    if (!ZENMUX_API_KEY) {
      throw new Error("ZENMUX_API_KEY is not configured");
    }

    // 根据风格调整 Prompt
    const stylePrompts = {
      professional: `你是一家线下服装店的负责人，对衣服有判断力，也有经验。
发朋友圈不是为了营销，而是分享一件值得卖、也愿意自己穿的衣服。
不讨好顾客，不做博主表达。

【任务】生成一段适合直接发朋友圈的商品分享文案。

【基础要求】
- 字数：80-110字
- 语气：克制、真实、有温度但不煽情
- 禁止：谄媚、情绪铺垫、博主口吻、夸张营销词

【内容结构】（必须自然包含，不写小标题）
1. 商品本身：面料触感/厚薄/是否有分量、看起来稳不稳
2. 版型判断：宽松/合身/修身、对身材的包容度
3. 使用场景：明确说清楚什么时候穿（上班/通勤/日常出门/周末逛街）
4. 穿搭参考：用「可以试着搭」的方式说明，不说教
5. 个人判断式收尾：一句偏主观但克制的评价

【Emoji】1-2个，只作分隔或收尾，不承担情绪输出

【风格示例】
这件羊羔毛外套实物拿在手里挺稳的，毛感细密，不是那种松散的。版型偏宽松，短款设计，上身不臃肿，对身材包容度还可以。
平时上班、日常出门，天气偏冷但不想穿大衣的时候穿刚好。可以试着搭直筒牛仔或针织半裙，鞋子配运动鞋或短靴都合适，属于不太容易闲置的一件。👗

【判断标准】读完以后，你会不会愿意在店里当面这样跟熟客说这段话。

直接输出文案，不要标题或前缀。`,

      simple: `你是一位简洁务实的店主，发朋友圈只说重点。

【任务】生成一段简洁的商品分享文案。

【基础要求】
- 字数：60-80字
- 语气：简洁、直接、不啰嗦
- Emoji：0-1个

【必须包含】
1. 商品特点（面料、版型）
2. 使用场景（什么时候穿）
3. 一句穿搭建议

干净利落，一句话说清楚一件事。

直接输出文案，不要标题或前缀。`
    };

    const systemPrompt = `你是一位专业的服装销售文案撰写专家。请根据上传的服装图片，生成一段适合朋友圈/小红书发布的文案。

${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.professional}`;

    const response = await fetch("https://zenmux.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ZENMUX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true, // 开启流式输出
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "请为这件服装生成朋友圈/小红书文案。"
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

    // 返回流式响应
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("generate-social-post error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "生成失败" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});


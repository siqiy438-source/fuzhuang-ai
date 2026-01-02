import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stylePrompts = [
  { name: "休闲日常", prompt: "casual everyday outfit, relaxed and comfortable" },
  { name: "职业通勤", prompt: "professional office outfit, elegant and polished" },
  { name: "约会甜美", prompt: "romantic date outfit, sweet and charming" },
  { name: "街头潮流", prompt: "streetwear fashion, trendy and cool" },
  { name: "优雅气质", prompt: "elegant sophisticated outfit, classy and refined" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, userPrompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting outfit generation with user prompt:", userPrompt);

    // Generate all 5 styles in parallel
    const generationPromises = stylePrompts.map(async (style, index) => {
      const fullPrompt = `Based on this reference image, create a new outfit design in ${style.prompt} style. ${userPrompt || ""}. 
      The generated image should show a complete outfit suitable for a young woman, maintaining similar body proportions and pose. 
      High quality fashion photography style, full body shot, clean background.`;

      console.log(`Generating style ${index + 1}: ${style.name}`);

      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image-preview",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: fullPrompt
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
          const errorText = await response.text();
          console.error(`Style ${style.name} generation failed:`, response.status, errorText);
          return {
            styleName: style.name,
            success: false,
            error: `生成失败: ${response.status}`
          };
        }

        const data = await response.json();
        console.log(`Style ${style.name} response received`);

        // Extract image from response
        const content = data.choices?.[0]?.message?.content;
        
        // Check if content contains inline image data
        if (Array.isArray(content)) {
          const imageContent = content.find((item: any) => item.type === "image_url" || item.type === "image");
          if (imageContent) {
            return {
              styleName: style.name,
              success: true,
              imageUrl: imageContent.image_url?.url || imageContent.url
            };
          }
        }

        // Check if there's inline_data in the response
        const inlineData = data.choices?.[0]?.message?.inline_data;
        if (inlineData) {
          return {
            styleName: style.name,
            success: true,
            imageUrl: `data:${inlineData.mime_type};base64,${inlineData.data}`
          };
        }

        // Try to extract base64 image from text content
        if (typeof content === "string" && content.includes("data:image")) {
          const match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
          if (match) {
            return {
              styleName: style.name,
              success: true,
              imageUrl: match[0]
            };
          }
        }

        console.log(`Style ${style.name} - no image found in response, content type:`, typeof content);
        return {
          styleName: style.name,
          success: false,
          error: "未能生成图片",
          textContent: typeof content === "string" ? content.substring(0, 200) : null
        };

      } catch (error) {
        console.error(`Style ${style.name} error:`, error);
        return {
          styleName: style.name,
          success: false,
          error: error instanceof Error ? error.message : "生成失败"
        };
      }
    });

    const results = await Promise.all(generationPromises);
    console.log("All generations completed:", results.map(r => ({ name: r.styleName, success: r.success })));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-outfits error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "生成失败" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

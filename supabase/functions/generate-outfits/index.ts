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
        console.log(`Style ${style.name} full response:`, JSON.stringify(data, null, 2));

        // Extract image from response - check multiple possible formats
        const message = data.choices?.[0]?.message;
        const content = message?.content;
        
        // Format 1: Content is an array with image parts (Gemini multimodal response)
        if (Array.isArray(content)) {
          for (const part of content) {
            // Check for inline_data format
            if (part.inline_data?.data) {
              const mimeType = part.inline_data.mime_type || "image/png";
              return {
                styleName: style.name,
                success: true,
                imageUrl: `data:${mimeType};base64,${part.inline_data.data}`
              };
            }
            // Check for image_url format
            if (part.type === "image_url" || part.image_url) {
              return {
                styleName: style.name,
                success: true,
                imageUrl: part.image_url?.url || part.url
              };
            }
          }
        }

        // Format 2: Direct inline_data on message
        if (message?.inline_data?.data) {
          const mimeType = message.inline_data.mime_type || "image/png";
          return {
            styleName: style.name,
            success: true,
            imageUrl: `data:${mimeType};base64,${message.inline_data.data}`
          };
        }

        // Format 3: Check for image in a different response structure
        const candidates = data.candidates;
        if (candidates?.[0]?.content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inline_data?.data) {
              const mimeType = part.inline_data.mime_type || "image/png";
              return {
                styleName: style.name,
                success: true,
                imageUrl: `data:${mimeType};base64,${part.inline_data.data}`
              };
            }
          }
        }

        // Format 4: Base64 embedded in text
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

        console.log(`Style ${style.name} - no image found, content type:`, typeof content, "content preview:", typeof content === "string" ? content.substring(0, 500) : JSON.stringify(content)?.substring(0, 500));
        return {
          styleName: style.name,
          success: false,
          error: "模型返回了文字而非图片",
          textContent: typeof content === "string" ? content.substring(0, 300) : null
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

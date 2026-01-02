import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Sparkles, Loader2, ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GenerationResult {
  styleName: string;
  success: boolean;
  imageUrl?: string;
  error?: string;
  textContent?: string;
}

const OutfitGenerator = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "图片过大",
        description: "请上传小于10MB的图片",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setResults([]);
    };
    reader.readAsDataURL(file);
  };

  const generateOutfits = async () => {
    if (!selectedImage) {
      toast({
        title: "请先上传图片",
        description: "需要一张参考图片来生成穿搭风格",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后即可使用AI穿搭生成功能",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-outfits", {
        body: { imageBase64: selectedImage, userPrompt },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results || []);
      
      const successCount = data.results?.filter((r: GenerationResult) => r.success).length || 0;
      toast({
        title: "生成完成",
        description: `成功生成 ${successCount} 种穿搭风格`,
      });

    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setSelectedImage(null);
    setUserPrompt("");
    setResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI 穿搭生成</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            一键生成多种穿搭风格
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            上传一张参考图片，AI将为您生成5种不同风格的穿搭建议
          </p>
        </div>

        {/* Upload and Prompt Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image Upload */}
          <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="text-center">
                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Reference"
                      className="max-h-80 mx-auto rounded-lg object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={resetAll}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer py-16"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      上传参考图片
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      支持 JPG、PNG 格式，最大 10MB
                    </p>
                    <Button variant="outline">选择图片</Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </CardContent>
          </Card>

          {/* Prompt Input */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                添加您的偏好（可选）
              </h3>
              <Textarea
                placeholder="例如：我喜欢简约风格、偏爱浅色系、希望适合春天穿着..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="min-h-[120px] mb-4"
              />
              <div className="space-y-3">
                <Button
                  onClick={generateOutfits}
                  disabled={!selectedImage || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      正在生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      生成5种穿搭风格
                    </>
                  )}
                </Button>
                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    请先登录后使用此功能
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {(isGenerating || results.length > 0) && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground text-center">
              生成结果
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {isGenerating
                ? Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="aspect-[3/4] bg-muted flex items-center justify-center">
                          <div className="text-center p-4">
                            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">
                              生成中...
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : results.map((result, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="aspect-[3/4] bg-muted relative">
                          {result.success && result.imageUrl ? (
                            <img
                              src={result.imageUrl}
                              alt={result.styleName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-4">
                              <div className="text-center">
                                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {result.error || "生成失败"}
                                </p>
                                {result.textContent && (
                                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                                    {result.textContent}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-3 text-center border-t">
                          <p className="font-medium text-foreground">
                            {result.styleName}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default OutfitGenerator;

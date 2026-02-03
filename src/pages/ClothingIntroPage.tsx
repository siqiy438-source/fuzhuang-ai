import { useState, useRef } from "react";
import { Upload, Copy, RefreshCw, Sparkles, ImagePlus, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { SUPABASE_URL } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { usePerformance } from "@/hooks/usePerformance";

const ClothingIntroPage = () => {
  usePerformance();

  const [image, setImage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 压缩图片
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // 限制最大尺寸为 1920px
          const maxSize = 1920;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // 压缩质量 0.8
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("图片大小不能超过10MB");
        return;
      }

      try {
        toast.loading("正在处理图片...");
        const compressedImage = await compressImage(file);
        setImage(compressedImage);
        setGeneratedText("");
        toast.dismiss();
        toast.success("图片上传成功");
      } catch (error) {
        console.error("Image compression error:", error);
        toast.error("图片处理失败，请重试");
      }
    }
  };

  const generateIntro = async () => {
    if (!image) {
      toast.error("请先上传服装图片");
      return;
    }

    setIsGenerating(true);
    setGeneratedText("");

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-clothing-intro`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64: image }),
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // 响应不是 JSON 格式，使用默认错误消息
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.introduction) {
        setGeneratedText(data.introduction);
        toast.success("话术生成完成！");
      } else {
        throw new Error("生成失败，请重试");
      }
    } catch (error: any) {
      console.error("Generate error:", error);
      toast.error(error.message || "生成失败，请重试");
      setGeneratedText("");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedText) return;

    try {
      await navigator.clipboard.writeText(generatedText);
      toast.success("已复制到剪贴板");
    } catch (error) {
      toast.error("复制失败，请重试");
    }
  };

  const resetImage = () => {
    setImage(null);
    setGeneratedText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />

      <main className="relative pt-24 pb-32 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* 标题区域 */}
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass border border-primary/10 mb-6">
              <Video className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">抖音销售话术</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              AI 帮你写
              <span className="text-gradient"> 带货话术</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
              上传服装图片，一键生成适合 30-50 岁女性的抖音口播话术
            </p>
          </div>

          {/* 图片上传区 */}
          <Card className="p-4 sm:p-6 mb-6 glass border-border/30 shadow-elevated animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="clothing-photo-upload"
            />

            {!image ? (
              <label
                htmlFor="clothing-photo-upload"
                className="relative flex flex-col items-center justify-center h-[300px] sm:h-[340px] border-2 border-dashed border-primary/20 rounded-2xl cursor-pointer active:scale-[0.99] hover:border-primary/40 hover:bg-primary-muted/30 transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex flex-col items-center px-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary-muted flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                    <ImagePlus className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                  </div>
                  <p className="text-lg sm:text-xl font-medium text-foreground mb-2">点击上传服装照片</p>
                  <p className="text-sm sm:text-base text-muted-foreground text-center">支持 JPG、PNG 格式，最大 10MB</p>
                </div>
              </label>
            ) : (
              <div className="relative h-[300px] sm:h-[340px] rounded-2xl overflow-hidden group">
                <img
                  src={image}
                  alt="Uploaded clothing"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6">
                  <Button variant="glass" onClick={resetImage} className="backdrop-blur-md active:scale-95 transition-transform">
                    <Upload className="w-4 h-4" />
                    重新上传
                  </Button>
                </div>
                {/* 移动端：添加固定在图片上的重新上传按钮 */}
                <div className="absolute top-4 right-4 sm:hidden">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={resetImage}
                    className="backdrop-blur-md shadow-soft"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* 生成的话术显示区 */}
          {generatedText && (
            <Card className="p-5 sm:p-6 mb-6 glass border-border/30 shadow-elevated animate-fade-up">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/30">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">生成的话术</h3>
                  <p className="text-xs text-muted-foreground">可直接用于抖音口播</p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap leading-[1.8] text-foreground/90 text-[15px] sm:text-base select-text">
                  {generatedText}
                </div>
              </div>
            </Card>
          )}

          {/* 等待状态提示 */}
          {!generatedText && !isGenerating && image && (
            <Card className="p-8 sm:p-10 glass border-border/30 text-center animate-fade-up">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">点击生成按钮，AI 将为你创作话术</p>
            </Card>
          )}

          {/* 生成中状态 */}
          {isGenerating && (
            <Card className="p-6 sm:p-8 glass border-border/30 text-center animate-fade-up">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">AI 正在创作话术...</p>
              <p className="text-sm text-muted-foreground">请稍候</p>
            </Card>
          )}
        </div>
      </main>

      {/* 底部固定操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-5 bg-background/98 backdrop-blur-xl border-t border-border/50 shadow-elevated safe-area-bottom">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 sm:gap-3">
            <Button
              onClick={generateIntro}
              disabled={!image || isGenerating}
              className="flex-1 h-14 text-base font-semibold shadow-soft active:scale-98 transition-transform disabled:active:scale-100"
              variant="rose"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="hidden sm:inline">生成中...</span>
                  <span className="sm:hidden">生成中</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span className="hidden sm:inline">生成话术</span>
                  <span className="sm:hidden">生成</span>
                </>
              )}
            </Button>

            {generatedText && (
              <>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="lg"
                  className="h-14 w-14 sm:w-auto sm:px-6 shadow-soft active:scale-95 transition-transform flex items-center justify-center"
                >
                  <Copy className="w-5 h-5" />
                  <span className="hidden sm:inline sm:ml-2">复制</span>
                </Button>
                <Button
                  onClick={generateIntro}
                  variant="outline"
                  size="lg"
                  className="h-14 w-14 sm:w-auto sm:px-6 shadow-soft active:scale-95 transition-transform flex items-center justify-center"
                  disabled={isGenerating}
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="hidden sm:inline sm:ml-2">重新生成</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingIntroPage;

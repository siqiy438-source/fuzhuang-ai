import { useState, useRef } from "react";
import { Upload, Camera, Loader2, CheckCircle2, XCircle, Lightbulb, Sparkles, LogIn, ImagePlus } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface AnalysisResult {
  pros: string[];
  cons: string[];
  suggestions: string[];
}

const PhotoAnalysis = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("图片大小不能超过10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeOutfit = async () => {
    if (!image) return;
    
    if (!user) {
      toast.error("请先登录后再使用分析功能");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-outfit', {
        body: { imageBase64: image }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast.success("分析完成！");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "分析失败，请重试");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="min-h-screen py-28 bg-gradient-hero relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      <div className="absolute top-40 right-[20%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="relative container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass border border-primary/10 mb-8 animate-fade-up">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">穿搭分析</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            上传照片，获取
            <span className="text-gradient"> 专业建议</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            拍摄模特穿搭照片，AI 将为您分析搭配的优缺点并提供改进建议
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Upload Area */}
          <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Card className="p-8 bg-card/80 glass border-border/30 shadow-elevated hover:shadow-float transition-shadow duration-500">
              <div className="space-y-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="photo-upload"
                />
                
                {!image ? (
                  <label
                    htmlFor="photo-upload"
                    className="relative flex flex-col items-center justify-center h-[360px] border-2 border-dashed border-primary/20 rounded-2xl cursor-pointer hover:border-primary/40 hover:bg-primary-muted/30 transition-all duration-300 group overflow-hidden"
                  >
                    {/* Decorative Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-2xl bg-primary-muted flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                        <ImagePlus className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-lg font-medium text-foreground mb-2">点击上传穿搭照片</p>
                      <p className="text-sm text-muted-foreground">支持 JPG、PNG 格式，最大 10MB</p>
                    </div>
                  </label>
                ) : (
                  <div className="relative h-[360px] rounded-2xl overflow-hidden group">
                    <img
                      src={image}
                      alt="Uploaded outfit"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-8">
                      <Button variant="glass" onClick={resetAnalysis} className="backdrop-blur-md">
                        <Upload className="w-4 h-4" />
                        重新上传
                      </Button>
                    </div>
                  </div>
                )}
                
                {!user ? (
                  <Link to="/auth" className="block">
                    <Button variant="rose" size="lg" className="w-full h-14 text-base">
                      <LogIn className="w-5 h-5" />
                      登录后使用 AI 分析
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="rose"
                    size="lg"
                    className="w-full h-14 text-base"
                    disabled={!image || isAnalyzing}
                    onClick={analyzeOutfit}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        AI 正在分析中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        开始 AI 分析
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Results Area */}
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {result ? (
              <>
                {/* Pros */}
                <Card className="p-6 bg-card/80 glass border-border/30 shadow-soft hover-lift">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-foreground">优点亮点</h3>
                      <p className="text-sm text-muted-foreground">搭配中的精彩之处</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {result.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-3 text-foreground/90 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2.5 shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Cons */}
                <Card className="p-6 bg-card/80 glass border-border/30 shadow-soft hover-lift">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-xs">
                      <XCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-foreground">可改进之处</h3>
                      <p className="text-sm text-muted-foreground">值得优化的细节</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {result.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-3 text-foreground/90 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2.5 shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Suggestions */}
                <Card className="p-6 bg-card/80 glass border-border/30 shadow-soft hover-lift">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary-muted flex items-center justify-center shadow-xs">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-foreground">搭配建议</h3>
                      <p className="text-sm text-muted-foreground">专业提升方案</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3 text-foreground/90 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </Card>
              </>
            ) : (
              <Card className="p-12 bg-card/80 glass border-border/30 shadow-soft h-full flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mb-8">
                  <Sparkles className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">
                  等待分析
                </h3>
                <p className="text-muted-foreground max-w-sm leading-relaxed">
                  上传穿搭照片后，AI 将自动分析并提供专业的搭配建议
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhotoAnalysis;
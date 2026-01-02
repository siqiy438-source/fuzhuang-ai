import { useState, useRef } from "react";
import { Upload, Camera, Loader2, CheckCircle2, XCircle, Lightbulb, Sparkles, LogIn } from "lucide-react";
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
    <section id="photo-analysis" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">穿搭分析</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            上传照片，获取专业建议
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            拍摄模特穿搭照片，AI将为您分析搭配的优缺点并提供改进建议
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Upload Area */}
          <Card className="p-8 bg-gradient-card border-border/50 shadow-soft">
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
                  className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">点击上传穿搭照片</p>
                  <p className="text-sm text-muted-foreground">支持 JPG、PNG 格式，最大 10MB</p>
                </label>
              ) : (
                <div className="relative h-80 rounded-xl overflow-hidden group">
                  <img
                    src={image}
                    alt="Uploaded outfit"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" onClick={resetAnalysis}>
                      重新上传
                    </Button>
                  </div>
                </div>
              )}
              
              {!user ? (
                <Link to="/auth">
                  <Button variant="rose" size="lg" className="w-full">
                    <LogIn className="w-5 h-5" />
                    登录后使用 AI 分析
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="rose"
                  size="lg"
                  className="w-full"
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

          {/* Results Area */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Pros */}
                <Card className="p-6 bg-gradient-card border-border/50 shadow-soft animate-fade-up">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground">优点亮点</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-3 text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Cons */}
                <Card className="p-6 bg-gradient-card border-border/50 shadow-soft animate-fade-up" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground">可改进之处</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-3 text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Suggestions */}
                <Card className="p-6 bg-gradient-card border-border/50 shadow-soft animate-fade-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground">搭配建议</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3 text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </Card>
              </>
            ) : (
              <Card className="p-12 bg-gradient-card border-border/50 shadow-soft h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">
                  等待分析
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  上传穿搭照片后，AI将自动分析并提供专业的搭配建议
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

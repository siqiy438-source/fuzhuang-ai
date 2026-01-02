import { Camera, MessageSquareText, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const HeroSection = () => {
  // 检测是否为移动设备
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-mesh" />
      
      {/* Animated Decorative Orbs - 移动端简化版 */}
      {!isMobile ? (
        <>
          <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-20 right-[10%] w-[600px] h-[600px] bg-primary-glow/8 rounded-full blur-[120px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/3 to-transparent rounded-full" />
        </>
      ) : (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      )}
      
      {/* Content */}
      <div className="relative container mx-auto px-6 pt-32 pb-20 min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass border border-primary/10 mb-10 animate-fade-up">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-subtle" />
            <span className="text-sm font-medium text-foreground">AI 智能时尚搭配助手</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          
          {/* Headline */}
          <h1 
            className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 animate-fade-up leading-[1.1]"
            style={{ animationDelay: "0.1s" }}
          >
            让每一次穿搭
            <br />
            <span className="text-gradient-subtle">都成为经典</span>
          </h1>
          
          {/* Subheadline */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            专业的 AI 穿搭分析与搭配建议，帮助店员提升搭配水平，
            <br className="hidden sm:block" />
            为顾客打造完美造型
          </p>
          
          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button variant="hero" size="xl" asChild className="group w-full sm:w-auto">
              <Link to="/photo-analysis" className="gap-3">
                <Camera className="w-5 h-5" />
                上传照片分析
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="elegant" size="xl" asChild className="w-full sm:w-auto">
              <Link to="/style-advisor" className="gap-3">
                <MessageSquareText className="w-5 h-5" />
                文字搭配咨询
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div 
            className="mt-20 pt-10 border-t border-border/30 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="text-sm text-muted-foreground mb-6">为什么选择 StyleAI</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-foreground mb-1">AI</div>
                <div className="text-sm text-muted-foreground">智能分析</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-foreground mb-1">秒级</div>
                <div className="text-sm text-muted-foreground">快速响应</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-foreground mb-1">专业</div>
                <div className="text-sm text-muted-foreground">搭配建议</div>
              </div>
            </div>
            
            {/* Acknowledgment */}
            <p className="mt-8 text-xs text-muted-foreground/70 italic">
              能走到今天，离不开最初那次正确的引导——在 AI 的起点上，感谢聂老师。
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
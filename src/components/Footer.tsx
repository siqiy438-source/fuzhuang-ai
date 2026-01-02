import { Sparkles, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-secondary/50 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-heading text-lg font-semibold text-foreground">
              StyleAI
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            用心打造 <Heart className="w-3 h-3 text-primary fill-primary" /> AI 驱动时尚搭配
          </p>
          
          <p className="text-sm text-muted-foreground">
            © 2026 StyleAI. 保留所有权利。
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

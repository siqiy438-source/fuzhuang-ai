import { Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="font-heading text-xl font-semibold text-foreground">
            StyleAI
          </span>
        </a>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#photo-analysis" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            穿搭分析
          </a>
          <a href="#style-advisor" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            搭配顾问
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

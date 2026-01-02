import { Sparkles, Heart, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative py-16 bg-secondary/30 border-t border-border/30">
      {/* Decorative Gradient */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      
      <div className="relative container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 group mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-semibold text-foreground">
                StyleAI
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              AI 驱动的智能时尚搭配助手，帮助您轻松打造完美造型。
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">功能</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/photo-analysis" className="text-muted-foreground hover:text-primary transition-colors">
                  穿搭分析
                </Link>
              </li>
              <li>
                <Link to="/style-advisor" className="text-muted-foreground hover:text-primary transition-colors">
                  搭配顾问
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">关注我们</h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            用心打造 <Heart className="w-3.5 h-3.5 text-primary fill-primary" /> AI 驱动时尚搭配
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
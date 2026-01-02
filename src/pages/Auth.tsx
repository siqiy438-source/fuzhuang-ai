import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, Loader2, User } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("登录成功！");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username || email.split("@")[0],
            },
          },
        });
        if (error) throw error;
        toast.success("注册成功！");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message.includes("User already registered")) {
        toast.error("该邮箱已注册，请直接登录");
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("邮箱或密码错误");
      } else if (error.message.includes("Password should be")) {
        toast.error("密码至少需要6个字符");
      } else {
        toast.error(error.message || "操作失败，请重试");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 bg-gradient-card border-border/50 shadow-elevated">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </a>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            {isLogin ? "欢迎回来" : "创建账号"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "登录您的 StyleAI 账号" : "开启您的时尚之旅"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                用户名（可选）
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="您的昵称"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              邮箱地址
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              密码
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="至少6个字符"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="rose"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                处理中...
              </>
            ) : isLogin ? (
              "登录"
            ) : (
              "注册"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            {isLogin ? "还没有账号？" : "已有账号？"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isLogin ? "立即注册" : "去登录"}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;

import { useState, useRef, useEffect } from "react";
import { Send, MessageSquareText, Loader2, Shirt, LogIn, Sparkles, Bot, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const exampleQuestions = [
  "黑色上衣配什么裤子？",
  "牛仔裤怎么搭配？",
  "婚礼穿什么？",
  "职场穿搭建议",
];

const StyleAdvisor = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    if (!user) {
      toast.error("请先登录后再使用咨询功能");
      return;
    }

    const userMessage: Message = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/style-chat`;
      
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "请求失败");
      }

      if (!resp.body) {
        throw new Error("无响应数据");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const updateAssistant = (content: string) => {
        assistantContent = content;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: "assistant", content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              updateAssistant(assistantContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(error.message || "发送失败，请重试");
      setMessages(prev => prev.filter(m => m !== userMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="min-h-screen py-28 bg-gradient-hero relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      <div className="absolute bottom-40 left-[20%] w-[400px] h-[400px] bg-primary-glow/5 rounded-full blur-[100px]" />
      
      <div className="relative container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass border border-primary/10 mb-8 animate-fade-up">
            <MessageSquareText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">搭配顾问</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            文字咨询，
            <span className="text-gradient">智能搭配</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            描述您的单品或需求，AI 将为您提供专业的搭配方案
          </p>
        </div>

        <div className="max-w-4xl mx-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Card className="bg-card/80 glass border-border/30 shadow-elevated overflow-hidden">
            {/* Chat Messages */}
            <div className="h-[520px] overflow-y-auto p-6 space-y-5">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-muted to-accent flex items-center justify-center mb-8 shadow-soft">
                    <Shirt className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">
                    开始您的搭配咨询
                  </h3>
                  <p className="text-muted-foreground mb-10 max-w-md">
                    输入您的穿搭问题，或选择下方的热门问题开始对话
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {exampleQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => user && sendMessage(question)}
                        disabled={!user}
                        className="px-5 py-2.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-soft"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-9 h-9 rounded-xl bg-primary-muted flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-5 py-4 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md shadow-soft'
                            : 'bg-secondary text-secondary-foreground rounded-bl-md shadow-xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0 mt-1">
                          <User className="w-5 h-5 text-accent-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex gap-3 justify-start animate-slide-up">
                      <div className="w-9 h-9 rounded-xl bg-primary-muted flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div className="bg-secondary rounded-2xl rounded-bl-md px-5 py-4 shadow-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI 正在思考...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border/30 p-5 bg-muted/20">
              {!user ? (
                <Link to="/auth" className="block">
                  <Button variant="rose" size="lg" className="w-full h-14 text-base">
                    <LogIn className="w-5 h-5" />
                    登录后开始咨询
                  </Button>
                </Link>
              ) : (
                <>
                  <div className="flex gap-3">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="输入您的搭配问题，例如：黑色连衣裙配什么外套好看？"
                      className="min-h-[56px] max-h-32 resize-none bg-background border-border/50 focus:border-primary/50 rounded-xl text-base"
                      rows={1}
                    />
                    <Button
                      variant="rose"
                      size="icon"
                      className="h-14 w-14 shrink-0 rounded-xl"
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    按 Enter 发送，Shift + Enter 换行
                  </p>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StyleAdvisor;
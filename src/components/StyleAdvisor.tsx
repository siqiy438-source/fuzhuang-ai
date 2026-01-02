import { useState, useRef, useEffect } from "react";
import { Send, MessageSquareText, Loader2, Shirt, LogIn } from "lucide-react";
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
  "黑色上衣可以搭配什么颜色的裤子？",
  "牛仔裤适合搭配什么样的上衣或外套？",
  "参加婚礼应该穿什么风格的裙子？",
  "如何打造职场优雅风格？"
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
      // Remove the user message if failed
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
    <section id="style-advisor" className="min-h-screen py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
            <MessageSquareText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">搭配顾问</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            文字咨询，智能搭配
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            描述您的单品或需求，AI将为您提供专业的搭配方案
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-card border-border/50 shadow-elevated overflow-hidden">
            {/* Chat Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-6">
                    <Shirt className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">
                    开始您的搭配咨询
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md">
                    输入您的穿搭问题，或选择下方的热门问题开始对话
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {exampleQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => user && sendMessage(question)}
                        disabled={!user}
                        className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-secondary text-secondary-foreground rounded-tl-sm'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex justify-start animate-fade-up">
                      <div className="bg-secondary rounded-2xl rounded-tl-sm px-5 py-4">
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
            <div className="border-t border-border/50 p-4 bg-muted/30">
              {!user ? (
                <Link to="/auth" className="block">
                  <Button variant="rose" size="lg" className="w-full">
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
                      className="min-h-[52px] max-h-32 resize-none bg-background border-border/50 focus:border-primary/50"
                      rows={1}
                    />
                    <Button
                      variant="rose"
                      size="icon"
                      className="h-[52px] w-[52px] shrink-0"
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
                  <p className="text-xs text-muted-foreground mt-2 text-center">
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

import { useState } from "react";
import { Send, MessageSquareText, Loader2, Shirt, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";

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

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response - will be replaced with actual AI call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const assistantMessage: Message = {
      role: "assistant",
      content: generateMockResponse(messageText)
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const generateMockResponse = (question: string): string => {
    if (question.includes("黑色上衣")) {
      return `黑色上衣是非常百搭的单品，以下是一些搭配建议：

**经典搭配：**
• 白色裤子 - 黑白配永不过时，干净利落
• 米色/卡其色裤子 - 温柔优雅，适合日常

**时尚搭配：**
• 牛仔蓝 - 休闲又时髦
• 酒红色 - 增添一抹复古气质
• 焦糖色 - 秋冬高级感首选

**注意事项：**
建议根据场合选择裤装版型，正式场合选择直筒或阔腿裤，休闲场合可以选择小脚裤或烟管裤。`;
    }
    
    if (question.includes("牛仔裤")) {
      return `牛仔裤是衣橱必备单品，搭配建议如下：

**上衣推荐：**
• 白色T恤/衬衫 - 简约清爽，百搭首选
• 条纹衫 - 法式慵懒风
• 针织衫 - 温柔知性

**外套推荐：**
• 西装外套 - 休闲正式两相宜
• 牛仔外套 - 同色系更高级
• 风衣 - 优雅大气
• 皮衣 - 酷感十足

**小技巧：**
高腰牛仔裤搭配短款上衣，可以拉长腿部比例；选择深色牛仔裤更显瘦。`;
    }

    return `感谢您的咨询！针对您的问题，我有以下建议：

**整体原则：**
• 注意色彩协调，同色系或对比色都可以
• 考虑场合需求，正式or休闲
• 注重版型搭配，上松下紧或上紧下松

**具体建议：**
您可以根据自己的身材特点和个人风格进行调整。如果需要更具体的建议，可以告诉我更多关于您想要的风格或场合信息。

还有其他搭配问题吗？我很乐意继续为您解答！`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section id="style-advisor" className="py-24 bg-background">
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
                        onClick={() => sendMessage(question)}
                        className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-accent transition-colors"
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
                  {isLoading && (
                    <div className="flex justify-start animate-fade-up">
                      <div className="bg-secondary rounded-2xl rounded-tl-sm px-5 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI 正在思考...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border/50 p-4 bg-muted/30">
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
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StyleAdvisor;

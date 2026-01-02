import { useState, useEffect } from "react";
import { History, Camera, MessageSquareText, Trash2, ChevronRight, Loader2, LogIn } from "lucide-react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

interface OutfitAnalysis {
  id: string;
  image_url: string;
  pros: string[];
  cons: string[];
  suggestions: string[];
  created_at: string;
}

interface StyleConsultation {
  id: string;
  query: string;
  response: string;
  created_at: string;
}

const HistoryPage = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<OutfitAnalysis[]>([]);
  const [consultations, setConsultations] = useState<StyleConsultation[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [loadingConsultations, setLoadingConsultations] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<OutfitAnalysis | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalyses();
      fetchConsultations();
    } else {
      setLoadingAnalyses(false);
      setLoadingConsultations(false);
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('outfit_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error("Fetch analyses error:", error);
    } finally {
      setLoadingAnalyses(false);
    }
  };

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('style_consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error("Fetch consultations error:", error);
    } finally {
      setLoadingConsultations(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('outfit_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAnalyses(prev => prev.filter(a => a.id !== id));
      if (selectedAnalysis?.id === id) setSelectedAnalysis(null);
      toast.success("删除成功");
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const deleteConsultation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('style_consultations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setConsultations(prev => prev.filter(c => c.id !== id));
      toast.success("删除成功");
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "yyyy年MM月dd日 HH:mm", { locale: zhCN });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20 min-h-screen bg-gradient-hero relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="absolute top-40 right-[20%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />

        <div className="relative container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass border border-primary/10 mb-8 animate-fade-up">
              <History className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">历史记录</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              您的
              <span className="text-gradient"> 搭配足迹</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
              查看您之前的穿搭分析和咨询记录
            </p>
          </div>

          {!user ? (
            <div className="max-w-md mx-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Card className="p-12 bg-card/80 glass border-border/30 shadow-elevated text-center">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                  <LogIn className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">请先登录</h3>
                <p className="text-muted-foreground mb-6">登录后即可查看您的历史记录</p>
                <Link to="/auth">
                  <Button variant="rose" size="lg" className="w-full">
                    <LogIn className="w-5 h-5" />
                    立即登录
                  </Button>
                </Link>
              </Card>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Tabs defaultValue="analyses" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-card/80 glass border border-border/30">
                  <TabsTrigger value="analyses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Camera className="w-4 h-4 mr-2" />
                    穿搭分析
                  </TabsTrigger>
                  <TabsTrigger value="consultations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <MessageSquareText className="w-4 h-4 mr-2" />
                    咨询记录
                  </TabsTrigger>
                </TabsList>

                {/* Outfit Analyses Tab */}
                <TabsContent value="analyses">
                  {loadingAnalyses ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : analyses.length === 0 ? (
                    <Card className="p-12 bg-card/80 glass border-border/30 shadow-soft text-center">
                      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                        <Camera className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-3">暂无分析记录</h3>
                      <p className="text-muted-foreground mb-6">上传穿搭照片开始您的第一次分析</p>
                      <Link to="/photo-analysis">
                        <Button variant="rose">
                          <Camera className="w-4 h-4" />
                          去分析穿搭
                        </Button>
                      </Link>
                    </Card>
                  ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Analysis List */}
                      <div className="lg:col-span-1 space-y-4">
                        {analyses.map((analysis) => (
                          <Card
                            key={analysis.id}
                            onClick={() => setSelectedAnalysis(analysis)}
                            className={`p-4 bg-card/80 glass border-border/30 cursor-pointer transition-all duration-300 hover-lift ${
                              selectedAnalysis?.id === analysis.id ? 'ring-2 ring-primary shadow-glow' : 'shadow-soft hover:shadow-elevated'
                            }`}
                          >
                            <div className="flex gap-4">
                              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                                <img
                                  src={analysis.image_url}
                                  alt="穿搭照片"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-muted-foreground mb-1">
                                  {formatDate(analysis.created_at)}
                                </p>
                                <p className="text-sm text-foreground line-clamp-2">
                                  {analysis.pros?.[0] || "穿搭分析"}
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 self-center" />
                            </div>
                          </Card>
                        ))}
                      </div>

                      {/* Analysis Detail */}
                      <div className="lg:col-span-2">
                        {selectedAnalysis ? (
                          <Card className="p-6 bg-card/80 glass border-border/30 shadow-elevated">
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {formatDate(selectedAnalysis.created_at)}
                                </p>
                                <h3 className="font-heading text-xl font-semibold text-foreground">分析详情</h3>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAnalysis(selectedAnalysis.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="mb-6">
                              <div className="w-full max-w-sm rounded-xl overflow-hidden bg-muted">
                                <img
                                  src={selectedAnalysis.image_url}
                                  alt="穿搭照片"
                                  className="w-full h-auto object-cover"
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              {selectedAnalysis.pros && selectedAnalysis.pros.length > 0 && (
                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                                  <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">优点亮点</h4>
                                  <ul className="space-y-1">
                                    {selectedAnalysis.pros.map((pro, i) => (
                                      <li key={i} className="text-sm text-green-600 dark:text-green-300 flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                                        {pro}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {selectedAnalysis.cons && selectedAnalysis.cons.length > 0 && (
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                                  <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">可改进之处</h4>
                                  <ul className="space-y-1">
                                    {selectedAnalysis.cons.map((con, i) => (
                                      <li key={i} className="text-sm text-amber-600 dark:text-amber-300 flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                        {con}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {selectedAnalysis.suggestions && selectedAnalysis.suggestions.length > 0 && (
                                <div className="p-4 rounded-xl bg-primary-muted">
                                  <h4 className="font-medium text-primary mb-2">搭配建议</h4>
                                  <ul className="space-y-1">
                                    {selectedAnalysis.suggestions.map((suggestion, i) => (
                                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                        {suggestion}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </Card>
                        ) : (
                          <Card className="p-12 bg-card/80 glass border-border/30 shadow-soft text-center h-full flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                              <Camera className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">选择左侧记录查看详情</p>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Style Consultations Tab */}
                <TabsContent value="consultations">
                  {loadingConsultations ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : consultations.length === 0 ? (
                    <Card className="p-12 bg-card/80 glass border-border/30 shadow-soft text-center">
                      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                        <MessageSquareText className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-3">暂无咨询记录</h3>
                      <p className="text-muted-foreground mb-6">开始您的第一次搭配咨询</p>
                      <Link to="/style-advisor">
                        <Button variant="rose">
                          <MessageSquareText className="w-4 h-4" />
                          去咨询搭配
                        </Button>
                      </Link>
                    </Card>
                  ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
                      {consultations.map((consultation) => (
                        <Card
                          key={consultation.id}
                          className="p-6 bg-card/80 glass border-border/30 shadow-soft hover-lift"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <p className="text-sm text-muted-foreground">
                              {formatDate(consultation.created_at)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteConsultation(consultation.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-primary text-primary-foreground">
                              <p className="text-sm font-medium mb-1">我的问题</p>
                              <p className="text-sm leading-relaxed">{consultation.query}</p>
                            </div>

                            <div className="p-4 rounded-xl bg-secondary">
                              <p className="text-sm font-medium text-foreground mb-2">AI 回复</p>
                              <div className="prose prose-sm dark:prose-invert max-w-none text-secondary-foreground prose-p:leading-relaxed prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                                <ReactMarkdown>{consultation.response}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
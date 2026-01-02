import Header from "@/components/Header";
import StyleAdvisor from "@/components/StyleAdvisor";
import { usePerformance } from "@/hooks/usePerformance";

const StyleAdvisorPage = () => {
  usePerformance();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <StyleAdvisor />
      </main>
    </div>
  );
};

export default StyleAdvisorPage;

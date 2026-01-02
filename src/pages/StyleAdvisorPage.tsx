import Header from "@/components/Header";
import StyleAdvisor from "@/components/StyleAdvisor";
import Footer from "@/components/Footer";
import { usePerformance } from "@/hooks/usePerformance";

const StyleAdvisorPage = () => {
  usePerformance();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <StyleAdvisor />
      </main>
      <Footer />
    </div>
  );
};

export default StyleAdvisorPage;

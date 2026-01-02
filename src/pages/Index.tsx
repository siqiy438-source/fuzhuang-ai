import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { usePerformance } from "@/hooks/usePerformance";

const Index = () => {
  usePerformance();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
      </main>
    </div>
  );
};

export default Index;

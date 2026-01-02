import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PhotoAnalysis from "@/components/PhotoAnalysis";
import StyleAdvisor from "@/components/StyleAdvisor";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PhotoAnalysis />
        <StyleAdvisor />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

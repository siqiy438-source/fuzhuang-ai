import Header from "@/components/Header";
import PhotoAnalysis from "@/components/PhotoAnalysis";
import { usePerformance } from "@/hooks/usePerformance";

const PhotoAnalysisPage = () => {
  usePerformance();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <PhotoAnalysis />
      </main>
    </div>
  );
};

export default PhotoAnalysisPage;

import Header from "@/components/Header";
import StyleAdvisor from "@/components/StyleAdvisor";
import Footer from "@/components/Footer";

const StyleAdvisorPage = () => {
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

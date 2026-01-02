import Header from "@/components/Header";
import OutfitGenerator from "@/components/OutfitGenerator";
import Footer from "@/components/Footer";

const OutfitGeneratorPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <OutfitGenerator />
      </main>
      <Footer />
    </div>
  );
};

export default OutfitGeneratorPage;

import React from "react";
import {
  HeroSection,
  BankIntro,
  KeyFeatures,
  ProductsPreview,
  TrustStats,
  CtaSection,
} from "../../components/landing";

const HomePage = () => {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Bank Introduction */}
      <BankIntro />

      {/* 3. Key Banking Features */}
      <KeyFeatures />

      {/* 4. Products Showcase */}
      <ProductsPreview />

      {/* 5. Trust & Statistics */}
      <TrustStats />

      {/* 6. Call to Action */}
      <CtaSection />
    </div>
  );
};

export default HomePage;

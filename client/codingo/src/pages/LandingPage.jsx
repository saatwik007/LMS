import React from "react";
import FeatureSection from "../components/LandingPage/FeatureSection";
import LandingFooter from "../components/LandingPage/LandingFooter";
import LandingSection from "../components/LandingPage/LandingSection";
import { useNavigate } from "react-router-dom";
import Header from "../components/LandingPage/Header";
import ParticleCanvas from "../components/LandingPage/ParticleCanvas";
import { PathSection } from "../components/LandingPage/PathSection";
import TestimonialsSection from "../components/LandingPage/TestimonialsSection";
import StartSection from "../components/LandingPage/StartSection";
import Divider from "../components/LandingPage/Divider";

export default function LandingPage() {

  const navigate = useNavigate();

  const handleSelectLanguage = (langId) => {
    navigate(`/language/${langId}`);
  };
  return (
    <>
      <ParticleCanvas />
      <div className="z-10 overflow-x-hidden" style={{ background: "#111113", color: "#f0f0f5" }}>
      <Header />
      <LandingSection onSelectLanguage={handleSelectLanguage} />
      <Divider />
      <FeatureSection onSelect={handleSelectLanguage} />
      <Divider />
      <PathSection />
      <Divider />
      <TestimonialsSection />
      <Divider />
      <StartSection />
      <Divider />
      <LandingFooter />
      </div>
    </>
  );
}
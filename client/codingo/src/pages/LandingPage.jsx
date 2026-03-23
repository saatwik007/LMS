import React from "react";
import FeatureSection from "../components/LandingPage/FeatureSection";
<<<<<<< HEAD
=======
import LearnAnywhereSection from "../components/LandingPage/LearnAnyWhereSection";
import LandingSubscription from "../components/LandingPage/LandingSubscription";
>>>>>>> e00a5573103f84dcb993544902de6c298ac7ce59
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
<<<<<<< HEAD
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
=======
      <LandingSection onSelectLanguage={handleSelectLanguage} />
      <FeatureSection onSelect={handleSelectLanguage} />
      <LearnAnywhereSection />
      <LandingSubscription />
      <LandingHero />
      <LandingFooter />
>>>>>>> e00a5573103f84dcb993544902de6c298ac7ce59
    </>
  );
}
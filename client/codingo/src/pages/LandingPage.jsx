import React from "react";
import FeatureSection from "../components/LandingPage/FeatureSection";
import LandingHeader from "../components/LandingPage/LandingHeader";
import LearnAnywhereSection from "../components/LandingPage/LearnAnyWhereSection";
import LandingSubscription from "../components/LandingPage/LandingSubscription";
import LandingFooter from "../components/LandingPage/LandingFooter";
import LandingSection from "../components/LandingPage/LandingSection";
import LandingHero from "../components/LandingPage/LandingHero";
import Robo from "../components/LandingPage/Robo";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {

    const navigate = useNavigate();

  const handleSelectLanguage = (langId) => {
    navigate(`/language/${langId}`);
  };
  return (
    <>
    <LandingHeader  />
    <LandingSection onSelectLanguage={handleSelectLanguage} /> 
      <FeatureSection onSelect={handleSelectLanguage} />  
      <LearnAnywhereSection />
      <LandingSubscription />
      <LandingHero />
      <LandingFooter />
      </>
  );
}
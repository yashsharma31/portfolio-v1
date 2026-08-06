import Hero from "@/components/sections/Hero";
import ProofBar from "@/components/sections/ProofBar";
import Work from "@/components/sections/Work";
import Lab from "@/components/sections/Lab";
import ExperienceSection from "@/components/sections/ExperienceSection";
import AiJourney from "@/components/ai/AiJourney";
import Writing from "@/components/sections/Writing";
import About from "@/components/sections/About";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <ProofBar />
      <Work />
      <Lab />
      <ExperienceSection />
      <AiJourney />
      <Writing />
      <About />
      <ContactSection />
      <Footer />
    </>
  );
}

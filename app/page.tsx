import TopNav from "@/components/marketing/TopNav";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import HowItWorks from "@/components/marketing/HowItWorks";
import WhoItsFor from "@/components/marketing/WhoItsFor";
import Cta from "@/components/marketing/Cta";
import Footer from "@/components/marketing/Footer";

export default function Home() {
  return (
    <main>
      <TopNav />
      <Hero />
      <Features />
      <HowItWorks />
      <WhoItsFor />
      <Cta />
      <Footer />
    </main>
  );
}

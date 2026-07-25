import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Capabilities } from "@/components/sections/Capabilities";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Achievements } from "@/components/sections/Achievements";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Capabilities />
        <Experience />
        <Projects />
        <Achievements />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

// src/app/[locale]/page.tsx
import NavBar from "@/app/components/NavBar";
import Smooth from "@/app/components/Smooth";
import Hero3D from "@/app/components/Hero3D";
import ServicesSection from "@/app/components/ServicesSection";
import ProjectsSection from "@/app/components/ProjectsSection";
import SmoothHash from "@/app/components/SmoothHash";
import Footer from "@/app/components/footer"; // ⬅️ DODANE

export default function HomePage() {
  return (
    <main id="home" className="min-h-screen">
      <NavBar />
      <Smooth />

      {/* overlay + szybkie przejście po hashach */}
      <SmoothHash offset={96} fadeInMs={220} loadMs={1100} fadeOutMs={220} />

      {/* HOME */}
      <section id="home" className="scroll-mt-[96px]">
        <Hero3D />
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-[96px]">
        <ServicesSection />
      </section>

      {/* PROJECTS */}
      <section id="projects" className="scroll-mt-[96px]">
        <ProjectsSection />
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}

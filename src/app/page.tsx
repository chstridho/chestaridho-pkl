import Navbar from '@/components/sections/Navbar';
import Hero from '@/components/sections/Hero';
import AboutSection from '@/components/sections/AboutSection';
import ScrollProgress from '@/components/motion/ScrollProgress';
import ProjectsSection from '@/components/sections/ProjectsSection';
import SiteFooter from '@/components/sections/SiteFooter';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <ScrollProgress />
      
      {/* main tanpa bg solid, tapi di atas canvas */}
      <main className="relative z-10">
        <Hero />
        <section id="about" className="scroll-mt-20">
          <AboutSection />
          <ProjectsSection />
          <SiteFooter />
        </section>
      </main>
    </>
  );
}
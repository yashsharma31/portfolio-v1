"use client";

import Profile from "@/components/Profile";
import Stats from "@/components/Stats";
import RecentProjects from "@/components/RecentProjects";
import Experience from "@/components/Experience";
import DesignThoughts from "@/components/DesignThoughts";
import PremiumTools from "@/components/PremiumTools";
import Certifications from "@/components/Certifications";
import Resume from "@/components/Resume";
import GitHubContributions from "@/components/GitHubContributions";
import ParticleBackground from "@/components/ParticleBackground";
import { useEffect, useState } from "react";
import { CONTACT_LINKS } from "@/utils/constants";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      className="relative min-h-screen"
      itemScope
      itemType="http://schema.org/Person"
    >
      <ParticleBackground />
      <div className="relative mx-auto px-4 py-8 md:pt-0 max-w-(--breakpoint-xl)">
        <div className={`flex  ${isMobile ? "flex-col" : "gap-24"}`}>
          <aside
            id="profile"
            className="md:shrink-0 md:w-[400px]"
            itemProp="author"
            itemScope
            itemType="http://schema.org/Person"
          >
            <Profile />
          </aside>

          <main className="flex-1 space-y-8">
            <section aria-label="Statistics" className="hidden">
              <span itemProp="jobTitle">Software Engineer</span>
              <span itemProp="worksFor">Glue Labs</span>
              <meta itemProp="email" content="yash.sh0031@gmail.com" />
            </section>

            <section aria-label="Statistics">
              <Stats />
            </section>

            <section aria-label="GitHub Activity">
              <GitHubContributions />
            </section>

            <section
              id="projects"
              aria-label="Recent Projects"
              itemScope
              itemType="http://schema.org/CollectionPage"
            >
              <meta itemProp="name" content="Portfolio Projects" />
              <RecentProjects />
            </section>

            <section
              id="experience"
              aria-label="Work Experience"
              itemScope
              itemType="http://schema.org/WorkExperience"
            >
              <meta itemProp="name" content="Professional Experience" />
              <Experience />
            </section>

            <section
              id="tech-stack"
              aria-label="Technical Skills"
              itemScope
              itemType="http://schema.org/ItemList"
            >
              <meta itemProp="name" content="Technical Skills" />
              <PremiumTools />
            </section>

            <section
              id="resume"
              aria-label="Resume"
              itemScope
              itemType="http://schema.org/DigitalDocument"
            >
              <meta itemProp="name" content="Yash Sharma's Resume" />
              <Resume />
            </section>

            <section
              id="blog"
              aria-label="Blog Posts"
              itemScope
              itemType="http://schema.org/Blog"
            >
              <meta itemProp="name" content="Design Thoughts Blog" />
              <DesignThoughts />
            </section>

            <section
              id="contact"
              aria-label="Contact Form"
              itemScope
              itemType="http://schema.org/ContactPoint"
              className="space-y-8 md:space-y-12 px-4 md:px-6 pt-16 md:pt-32"
            >
              <meta itemProp="name" content="Contact Information" />
              <div className="space-y-6">
                <h2 className="font-bold text-4xl text-white md:text-[120px] leading-none">
                  LET&apos;S WORK TOGETHER
                </h2>
                <p className="max-w-2xl text-lg text-zinc-400 leading-relaxed">
                  I&apos;m always interested in hearing about new projects and
                  opportunities. Whether you have a question or just want to say
                  hi, I&apos;ll try my best to get back to you!
                </p>
              </div>

              <div className="gap-8 grid md:grid-cols-3 max-w-4xl">
                <div className="space-y-4 border-zinc-800/50 bg-zinc-900/50 p-6 border rounded-2xl">
                  <h3 className="font-semibold text-white text-xl">
                    Quick Response
                  </h3>
                  <p className="text-zinc-400">
                    I typically respond within 24-48 hours to all inquiries and
                    messages.
                  </p>
                </div>

                <div className="space-y-4 border-zinc-800/50 bg-zinc-900/50 p-6 border rounded-2xl">
                  <h3 className="font-semibold text-white text-xl">Location</h3>
                  <p className="text-zinc-400">
                    Based in India
                    <br />
                    Available for remote work worldwide
                  </p>
                </div>

                <div className="space-y-4 border-zinc-800/50 bg-zinc-900/50 p-6 border rounded-2xl">
                  <h3 className="font-semibold text-white text-xl">
                    Work Hours
                  </h3>
                  <p className="text-zinc-400">
                    Mon - Fri: 9:00 AM - 6:00 PM IST
                    <br />
                    Flexible for different time zones
                  </p>
                </div>
              </div>

              <div className="space-y-6 max-w-4xl">
                <a
                  href="/contact"
                  className="inline-block bg-linear-to-r from-indigo-500 hover:from-indigo-600 to-purple-500 hover:to-purple-600 shadow-indigo-500/20 shadow-lg px-8 py-4 rounded-xl w-full font-semibold text-center text-lg text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get in Touch
                </a>
                <div className="flex justify-center gap-6 pt-4">
                  <a
                    href={CONTACT_LINKS.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <FaGithub className="text-lg" />
                  </a>
                  <a
                    href={CONTACT_LINKS.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <FaLinkedin className="text-lg" />
                  </a>
                  <a
                    href={CONTACT_LINKS.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <FaXTwitter className="text-lg" />
                  </a>
                </div>
              </div>
            </section>

            <section
              id="certifications"
              aria-label="Certifications"
              itemScope
              itemType="http://schema.org/ItemList"
            >
              <meta itemProp="name" content="Professional Certifications" />
              <Certifications />
            </section>
          </main>
        </div>

        <footer className="mt-16 mb-20 md:mb-0 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Yash Sharma. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

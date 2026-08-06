"use client";

import ContactForm from "@/components/ContactForm";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { HiArrowLeft } from "react-icons/hi";
import Link from "next/link";
import { CONTACT_LINKS } from "@/utils/constants";
import { FaXTwitter } from "react-icons/fa6";

export default function ContactPage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="mx-auto px-4 py-8 max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
          Back to Portfolio
        </Link>

        <div className="gap-12 grid md:grid-cols-[1fr_400px]">
          <ContactForm />

          <aside className="space-y-8">
            <div className="space-y-4 border-zinc-800/50 bg-zinc-900/50 p-6 border rounded-2xl">
              <h3 className="font-semibold text-white text-xl">
                Let&apos;s Connect
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                I&apos;m always interested in hearing about new projects and
                opportunities. Whether you have a question or just want to say
                hi, I&apos;ll try my best to get back to you!
              </p>
              <div className="flex gap-4">
                <a
                  href={CONTACT_LINKS.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <FaGithub className="w-6 h-6 text-zinc-300" />
                </a>
                <a
                  href={CONTACT_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <FaLinkedin className="w-6 h-6 text-zinc-300" />
                </a>
                <a
                  href={CONTACT_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-800 hover:bg-zinc-700 p-3 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <FaXTwitter className="w-6 h-6 text-zinc-300" />
                </a>
              </div>
            </div>

            <div className="space-y-4 border-zinc-800/50 bg-zinc-900/50 p-6 border rounded-2xl">
              <h3 className="font-semibold text-white text-xl">
                Quick Response
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                I typically respond within 24-48 hours. For urgent matters, you
                can reach out to me directly on LinkedIn or Twitter.
              </p>
            </div>

            <div className="space-y-4 border-zinc-800/50 bg-zinc-900/50 p-6 border rounded-2xl">
              <h3 className="font-semibold text-white text-xl">Location</h3>
              <p className="text-zinc-400 leading-relaxed">
                Based in India
                <br />
                Available for remote work worldwide
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion, useScroll, AnimatePresence } from "framer-motion";
import { HiHome } from "react-icons/hi";
import { BsBriefcaseFill, BsFileEarmarkTextFill } from "react-icons/bs";
import { GoProjectSymlink } from "react-icons/go";
import { BiSolidLayer } from "react-icons/bi";
import { IoMdMail } from "react-icons/io";
import { PiCertificateFill } from "react-icons/pi";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  {
    text: "Projects",
    icon: <GoProjectSymlink className="text-lg" />,
    href: "#projects",
  },
  {
    text: "Experience",
    icon: <BsBriefcaseFill className="text-lg" />,
    href: "#experience",
  },
  {
    text: "Tech Stack",
    icon: <BiSolidLayer className="text-lg" />,
    href: "#tech-stack",
  },
  {
    text: "Blog",
    icon: <BsFileEarmarkTextFill className="text-lg" />,
    href: "#blog",
  },
  {
    text: "Contact",
    icon: <IoMdMail className="text-lg" />,
    href: "#contact",
  },
  {
    text: "Certifications",
    icon: <PiCertificateFill className="text-lg" />,
    href: "#certifications",
  },
];

const mobileNavItems = [
  {
    text: "Projects",
    icon: <GoProjectSymlink className="text-lg" />,
    href: "#projects",
  },
  {
    text: "Experience",
    icon: <BsBriefcaseFill className="text-lg" />,
    href: "#experience",
  },
  {
    text: "Tech Stack",
    icon: <BiSolidLayer className="text-lg" />,
    href: "#tech-stack",
  },
  {
    text: "Blog",
    icon: <BsFileEarmarkTextFill className="text-lg" />,
    href: "#blog",
  },
];

const containerVariants = {
  expanded: {
    width: "36rem",
    height: "4rem",
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  expandedNoText: {
    width: "24rem",
    height: "4rem",
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  collapsed: {
    width: "24rem",
    height: "3rem",
    transition: { duration: 0.3, delay: 0.2, ease: "easeInOut" as const },
  },
};

const contentVariants = {
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.1,
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  }),
  hidden: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

function MobileNav() {
  const [activeSection, setActiveSection] = useState("profile");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Update active section
      const sections = navItems.map((item) => ({
        id: item.href.slice(1),
        element: document.getElementById(item.href.slice(1)),
      }));

      const currentSection = sections.find((section) => {
        if (!section.element) return false;
        const rect = section.element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }

      // Show/hide scroll to top button
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.getElementById(href.slice(1));
    if (element) {
      const offset = -40;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <motion.div
        className="right-0 bottom-0 left-0 z-50 fixed border-gray-800 md:hidden bg-black/90 backdrop-blur-xs border-t"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <div className="gap-1 grid grid-cols-4 px-2 py-2">
          {mobileNavItems.map(({ text, icon, href }) => (
            <motion.button
              key={text}
              onClick={() => handleNavClick(href)}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeSection === href.slice(1)
                  ? "text-blue-400"
                  : "text-white/70"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="mb-0.5 text-lg">{icon}</div>
              <span className="w-full font-medium text-[10px] text-center truncate">
                {text}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="right-4 bottom-20 z-50 fixed md:hidden bg-blue-500 hover:bg-blue-600 shadow-lg p-3 rounded-full text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileTap={{ scale: 0.9 }}
          >
            <HiHome className="text-xl" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setShowScrollTop(latest > 200);
    });
  }, [scrollY]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) => ({
        id: item.href.slice(1),
        element: document.getElementById(item.href.slice(1)),
      }));

      const currentSection = sections.find((section) => {
        if (!section.element) return false;
        const rect = section.element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.getElementById(href.slice(1));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isHome) {
    return null;
  }

  return (
    <div className="">
      <div className="mx-auto w-full max-w-(--breakpoint-xl) md:h-20" />
      <AnimatePresence>
        {isLoaded && (
          <>
            <MobileNav />
            {/* Web Scroll to Top Button */}
            <AnimatePresence>
              {showScrollTop && (
                <motion.button
                  onClick={scrollToTop}
                  className="right-8 bottom-8 z-50 fixed md:flex hidden bg-blue-500 hover:bg-blue-600 shadow-lg p-3 rounded-full text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <HiHome className="text-xl" />
                </motion.button>
              )}
            </AnimatePresence>
            <motion.div
              className="md:block top-0 right-0 left-0 z-50 fixed hidden"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="mx-auto px-4 py-6 max-w-(--breakpoint-xl)">
                <motion.div
                  className="relative flex items-center border-2 border-gray-800 bg-black mx-auto rounded-full"
                  variants={containerVariants}
                  animate="collapsed"
                >
                  <motion.div
                    className="flex justify-center items-center px-8 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center gap-8">
                      {navItems.map(({ text, icon, href }, i) => (
                        <motion.button
                          key={text}
                          onClick={() => handleNavClick(href)}
                          className={`group relative transition-all duration-200 ${
                            activeSection === href.slice(1)
                              ? "text-blue-400"
                              : "text-white/80 hover:text-white"
                          }`}
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          custom={i}
                        >
                          <div className="group-hover:scale-110 transform transition-transform duration-200">
                            {icon}
                          </div>
                          <div className="top-0 left-1/2 absolute border-gray-700 bg-gray-900/95 opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-xs mb-2 px-2 py-1 border rounded-sm text-white text-xs whitespace-nowrap transition-all -translate-x-1/2 -translate-y-full duration-200 pointer-events-none">
                            {text}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

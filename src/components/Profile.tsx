"use client";

import { CONTACT_LINKS } from "@/utils/constants";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiTwitterXFill, RiLinkedinFill, RiGithubFill } from "react-icons/ri";
import { useEffect, useRef } from "react";

const imageAnimation = {
  initial: { scale: 0.8, borderRadius: "16px" },
  animate: {
    scale: 1,
    transition: {
      borderRadius: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
      scale: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  },
};

const socialIconVariants = {
  initial: { scale: 0 },
  animate: (i: number) => ({
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
      delay: i * 0.1 + 1,
    },
  }),
  hover: {
    scale: 1.2,
    rotate: 360,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10,
    },
  },
};

const shimmerEffect = {
  hidden: { backgroundPosition: "200% 0" },
  visible: {
    backgroundPosition: "-200% 0",
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

function MobileProfile() {
  return (
    <motion.div
      id="profile"
      className="flex flex-col md:hidden px-4 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="border-2 border-gray-800 mx-auto py-10 rounded-3xl w-full max-w-[280px]">
        {/* Profile Image */}
        <motion.div
          className="relative mx-auto w-52 h-52"
          variants={imageAnimation}
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.05 }}
        >
          <Image
            src="/images/profile.jpeg"
            alt="Yash Sharma"
            className="relative rounded-2xl object-cover"
            fill
            sizes="(max-width: 768px) 280px, 280px"
            priority
          />
        </motion.div>

        {/* Text Content */}
        <motion.div
          className="flex flex-col items-center space-y-1.5 mt-3"
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: {
              opacity: 1,
              y: 0,
              transition: { delay: 0.2, duration: 0.4 },
            },
          }}
          initial="initial"
          animate="animate"
        >
          <motion.h1
            className="font-bold text-3xl text-white"
            whileHover={{ scale: 1.05 }}
          >
            YASH SHARMA
          </motion.h1>
          <motion.h4
            className="text-center text-gray-400 text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            A software engineer developing seamless user experiences
          </motion.h4>
        </motion.div>

        {/* Social Links */}
        <motion.div
          className="flex justify-center gap-3 mt-3"
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.1 },
            },
          }}
          initial="initial"
          animate="animate"
        >
          {[
            { icon: <RiTwitterXFill size={16} />, href: CONTACT_LINKS.twitter },
            {
              icon: <RiLinkedinFill size={16} />,
              href: CONTACT_LINKS.linkedin,
            },
            { icon: <RiGithubFill size={16} />, href: CONTACT_LINKS.github },
          ].map((social, i) => (
            <motion.div
              key={social.href}
              variants={socialIconVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              custom={i}
            >
              <Link
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-center items-center bg-gray-800/50 hover:bg-gray-700/50 rounded-lg w-8 h-8 text-gray-300 transition-all"
              >
                {social.icon}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (profileRef.current) {
        const hue = Math.random() * 360;
        profileRef.current.style.setProperty(
          "--gradient-color",
          `hsl(${hue}, 70%, 50%)`
        );
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <MobileProfile />
      <motion.div
        ref={profileRef}
        className="md:block top-32 fixed hidden bg-linear-to-br from-gray-900 to-black rounded-3xl w-[400px] h-[680px] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, var(--gradient-color, #4f46e5) 0%, transparent 60%)",
            opacity: 0.15,
            mixBlendMode: "screen",
          }}
        />

        <motion.div
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent"
          variants={shimmerEffect}
          initial="hidden"
          animate="visible"
          style={{
            backgroundSize: "200% 100%",
          }}
        />

        <div className="relative flex flex-col items-center px-8 py-12">
          <motion.div
            className="group relative w-[300px] h-[340px]"
            variants={imageAnimation}
            initial="initial"
            animate="animate"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-2xl" />
            <Image
              src="/images/profile.jpeg"
              alt="Yash Sharma"
              className="relative rounded-2xl object-cover"
              fill
              sizes="300px"
              priority
            />
          </motion.div>

          <motion.div className="space-y-5 mt-10 text-center">
            <motion.h1
              className="font-bold text-4xl text-white"
              whileHover={{ scale: 1.05 }}
            >
              YASH SHARMA
            </motion.h1>

            <motion.p
              className="max-w-[320px] text-gray-300 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              A software engineer developing seamless user experiences with
              modern web technologies.
            </motion.p>
          </motion.div>

          <div className="flex gap-5 mt-10">
            {[
              {
                icon: <RiTwitterXFill size={22} />,
                href: CONTACT_LINKS.twitter,
              },
              {
                icon: <RiLinkedinFill size={22} />,
                href: CONTACT_LINKS.linkedin,
              },
              { icon: <RiGithubFill size={22} />, href: CONTACT_LINKS.github },
            ].map((social, i) => (
              <motion.div
                key={social.href}
                variants={socialIconVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                custom={i}
              >
                <Link
                  href={social.href}
                  className="flex justify-center items-center bg-linear-to-r from-blue-500/20 hover:from-blue-500/30 to-purple-500/20 hover:to-purple-500/30 rounded-full w-11 h-11 text-white transition-all"
                >
                  {social.icon}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

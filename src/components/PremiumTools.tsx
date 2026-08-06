"use client";

import { motion } from "framer-motion";
import {
  SiTypescript,
  SiJavascript,
  SiPython,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiWebgl,
  SiPixiv,
  SiFramer,
  SiRedux,
  SiGit,
  SiAmazon,
  SiFirebase,
  SiSupabase,
} from "react-icons/si";
import { TbBrandReactNative } from "react-icons/tb";

const skillCategories = [
  {
    title: "Languages",
    items: [
      { name: "TypeScript", icon: SiTypescript, color: "text-blue-400" },
      { name: "JavaScript", icon: SiJavascript, color: "text-yellow-400" },
      { name: "Python", icon: SiPython, color: "text-blue-500" },
    ],
  },
  {
    title: "Frontend",
    items: [
      { name: "React.js", icon: SiReact, color: "text-cyan-400" },
      { name: "Next.js", icon: SiNextdotjs, color: "text-white" },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "text-cyan-300" },
    ],
  },
  {
    title: "UI/Graphics",
    items: [
      { name: "WebGL", icon: SiWebgl, color: "text-red-400" },
      { name: "Pixi.js", icon: SiPixiv, color: "text-pink-400" },
      { name: "Framer Motion", icon: SiFramer, color: "text-purple-400" },
    ],
  },
  {
    title: "State Management",
    items: [
      { name: "Redux", icon: SiRedux, color: "text-purple-500" },
      { name: "React Query", icon: TbBrandReactNative, color: "text-red-400" },
      { name: "Zustand", icon: SiReact, color: "text-blue-400" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "Git", icon: SiGit, color: "text-orange-500" },
      { name: "AWS", icon: SiAmazon, color: "text-yellow-500" },
      { name: "Firebase", icon: SiFirebase, color: "text-yellow-400" },
      { name: "Supabase", icon: SiSupabase, color: "text-emerald-500" },
    ],
  },
];

export default function PremiumTools() {
  return (
    <motion.div
      className="space-y-8 md:space-y-16 px-4 md:px-0 pt-16 md:pt-32"
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      <motion.h2
        className="font-bold text-5xl md:text-[120px] leading-none"
        variants={{
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
        }}
      >
        <span className="text-white">TECH</span>{" "}
        <span className="text-gray-600">STACK</span>
      </motion.h2>

      <div className="space-y-4 md:space-y-6">
        {skillCategories.map((category) => (
          <motion.div
            key={category.title}
            className="space-y-4 md:space-y-6"
            variants={{
              initial: { opacity: 0 },
              animate: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            <h3 className="font-semibold text-white/80 text-xl md:text-2xl">
              {category.title}
            </h3>
            <motion.div
              className="gap-3 md:gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              variants={{
                initial: { opacity: 0 },
                animate: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {category.items.map((item) => (
                <motion.div
                  key={item.name}
                  className="relative flex items-center gap-3 md:gap-4 border-white/10 bg-white/5 md:hover:bg-white/10 backdrop-blur-xs p-3 md:p-4 border rounded-2xl transition-colors cursor-default md:cursor-pointer group"
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                  }}
                >
                  <item.icon
                    className={`w-6 h-6 md:w-8 md:h-8 ${item.color}`}
                  />
                  <div>
                    <h4 className="md:group-hover:text-white/90 font-medium text-sm text-white md:text-base">
                      {item.name}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

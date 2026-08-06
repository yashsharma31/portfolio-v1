import { motion } from "framer-motion";
import Image from "next/image";
import { FiArrowRight, FiLayers } from "react-icons/fi";
import { MdOutlineChat } from "react-icons/md";

import cicle from "../assets/svg/circle1.svg";
import waves from "../assets/svg/waves1.svg";

interface StatItemProps {
  number: string;
  text: string;
  delay: number;
}

const variants = {
  fadeInUp: {
    initial: { y: 20, opacity: 0 },
    animate: (delay: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay, duration: 0.5, ease: "easeOut" as const },
    }),
  },
  staggerContainer: {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  },
  projectHover: {
    rest: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3, ease: "easeInOut" as const },
    },
  },
  arrowHover: {
    rest: { x: 0 },
    hover: {
      x: 10,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
  },
};

const StatItem = ({ number, text, delay }: StatItemProps) => (
  <motion.div
    variants={variants.fadeInUp}
    custom={delay}
    className="flex flex-col gap-2"
  >
    <motion.h2
      className="font-bold text-5xl md:text-8xl"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.7 + delay, duration: 0.5 }}
    >
      {number}
    </motion.h2>
    <p className="text-base text-gray-500 md:text-xl">{text}</p>
  </motion.div>
);

const Stats = () => {
  const stats = [
    { number: "~3", text: "YEARS OF EXPERIENCE" },
    { number: "+18", text: "PROJECTS COMPLETED" },
    { number: "+28", text: "WORKED LIBRARIES" },
  ];

  const projects = [
    {
      src: cicle,
      icon: <FiLayers className="w-8 md:w-10 h-8 md:h-10" color="white" />,
      title: "VIDEO EDITOR WITH PIXI.JS",
      link: "https://glue.is",
      isDark: true,
    },
    {
      src: waves,
      icon: <MdOutlineChat className="w-8 md:w-10 h-8 md:h-10" color="black" />,
      title: "AI CHAT WITH MULTIPLE LANGUAGES",
      link: "https://dashgen.in",
      isDark: false,
    },
  ];

  return (
    <div className="space-y-12 md:space-y-16 px-4 md:px-8">
      <motion.div
        className="space-y-8"
        variants={variants.staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={variants.fadeInUp} custom={0}>
          <motion.h2 className="font-bold text-5xl md:text-9xl leading-tight">
            SOFTWARE <span className="text-gray-600">ENGINEER</span>
          </motion.h2>
          <motion.h4 className="mt-6 md:mt-10 max-w-3xl text-gray-300 text-lg md:text-2xl">
            Passionate about creating intuitive and engaging user experiences.
            Specialize in transforming ideas into beautifully crafted products.
          </motion.h4>
        </motion.div>
      </motion.div>

      <motion.div
        className="gap-8 grid grid-cols-1 md:grid-cols-3"
        variants={variants.staggerContainer}
        initial="initial"
        animate="animate"
      >
        {stats.map((stat, i) => (
          <StatItem
            key={stat.text}
            number={stat.number}
            text={stat.text}
            delay={i * 0.2}
          />
        ))}
      </motion.div>

      <motion.div
        className="gap-8 grid grid-cols-1 md:grid-cols-2"
        variants={variants.staggerContainer}
        initial="initial"
        animate="animate"
      >
        {projects.map((project, i) => (
          <motion.div
            key={project.title}
            className="relative rounded-3xl cursor-pointer aspect-4/3"
            variants={variants.projectHover}
            initial="rest"
            whileHover="hover"
            custom={i}
          >
            <Image
              src={project.src}
              alt={project.title}
              className="border-2 opacity-80 border-black rounded-2xl object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <motion.div
              className="top-8 left-8 absolute"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
            >
              {project.icon}
            </motion.div>
            <motion.p
              className={`absolute inset-0 flex items-center justify-center px-8 font-semibold text-2xl md:text-3xl ${
                project.isDark ? "text-white" : "text-black"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.2, duration: 0.5 }}
            >
              {project.title}
            </motion.p>
            <motion.div
              className={`absolute right-8 bottom-8 border-2 p-3 rounded-2xl ${
                project.isDark ? "border-white" : "border-black"
              }`}
              variants={variants.arrowHover}
              onClick={() => window.open(project.link, "_blank")}
            >
              <FiArrowRight
                size={24}
                className="md:w-[30px] md:h-[30px]"
                color={project.isDark ? "white" : "black"}
              />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Stats;

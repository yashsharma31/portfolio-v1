import { motion } from "framer-motion";
import { FiDownload } from "react-icons/fi";

export default function Resume() {
  return (
    <motion.div
      className="space-y-8 md:space-y-12 px-4 md:px-0 pt-10 md:pt-32"
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
        className="font-bold text-4xl md:text-[120px] leading-none"
        variants={{
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
        }}
      >
        <span className="text-white">MY</span>{" "}
        <span className="text-gray-600">RESUME</span>
      </motion.h2>

      <motion.div
        className="relative rounded-3xl overflow-hidden"
        variants={{
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
        }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xs" />

        <div className="relative flex flex-col items-center gap-6 md:gap-8 p-8 md:p-16 text-center">
          <div className="bg-white/5 backdrop-blur-xs p-6 md:p-8 rounded-full">
            <FiDownload className="w-8 md:w-12 h-8 md:h-12 text-white" />
          </div>

          <div className="space-y-3 md:space-y-4">
            <h3 className="font-bold text-2xl text-white md:text-4xl">
              Download My Resume
            </h3>
            <p className="max-w-2xl text-base text-gray-400 md:text-xl">
              Get a detailed overview of my skills, experience, and achievements
              in a comprehensive PDF format.
            </p>
          </div>

          <motion.a
            href="/Yash-Sharma-Resume.pdf"
            download
            className="flex items-center gap-2 bg-linear-to-r from-blue-500 md:hover:from-blue-600 to-purple-500 md:hover:to-purple-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base text-white md:text-lg transition-all md:hover:scale-105 active:scale-95"
          >
            <FiDownload className="w-4 md:w-5 h-4 md:h-5" />
            <span>Download Resume</span>
          </motion.a>

          <div className="bottom-0 left-0 absolute bg-linear-to-t from-black/50 to-transparent w-full h-1/2 pointer-events-none" />
        </div>
      </motion.div>
    </motion.div>
  );
}

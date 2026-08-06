import { motion } from "framer-motion";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  gradient: string;
}

const ProjectCard = ({
  title,
  description,
  image,
  gradient,
}: ProjectCardProps) => {
  return (
    <motion.div
      className="relative flex items-center gap-8 border-white/5 bg-black/20 backdrop-blur-xs p-6 border rounded-3xl cursor-pointer overflow-hidden group"
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }}
      whileHover={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        transition: { duration: 0.2 },
      }}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-linear-to-r ${gradient} opacity-0 
        group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Project Image */}
      <div className="relative rounded-2xl w-72 h-40 overflow-hidden">
        <Image src={image} alt={title} className="object-cover" fill />
      </div>

      {/* Content */}
      <div className="relative flex-1">
        <h3 className="mb-2 font-bold text-4xl text-white">{title}</h3>
        <p className="text-gray-400 text-lg">{description}</p>
      </div>

      {/* Arrow */}
      <motion.div
        className="bg-white/5 p-4 rounded-xl"
        whileHover={{
          x: 5,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          transition: { duration: 0.2 },
        }}
      >
        <FiArrowRight size={24} className="text-white" />
      </motion.div>
    </motion.div>
  );
};

export default ProjectCard;

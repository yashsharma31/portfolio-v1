import { motion } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiBriefcase,
  FiChevronRight,
} from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";

interface ExperienceCardProps {
  company: string;
  role: string;
  period: string;
  responsibilities: string[];
}

const ExperienceCard = ({
  company,
  role,
  period,
  responsibilities,
}: ExperienceCardProps) => {
  const formatPeriod = (period: string) => {
    const [start, end] = period.split(" - ");
    const isPresent = end.toLowerCase() === "present";
    return { start, end, isPresent };
  };

  return (
    <motion.div
      className="relative flex flex-col gap-4 md:gap-6 border-white/10 md:hover:border-white/20 bg-linear-to-br from-white/5 to-white/10 backdrop-blur-xs p-5 md:p-8 border rounded-3xl transition-all overflow-hidden group md:hover:scale-105"
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }}
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[20px_20px]" />
      <div className="relative space-y-3 md:space-y-4">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-2 md:gap-3">
            <HiOutlineOfficeBuilding className="w-5 md:w-6 h-5 md:h-6 text-white" />
            <h3 className="md:group-hover:text-white/90 font-semibold text-3xl text-white md:text-5xl transition-colors">
              {company}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <FiBriefcase className="w-4 md:w-5 h-4 md:h-5" />
            <p className="text-lg md:text-2xl">{role}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <FiCalendar className="w-4 h-4" />
            <p className="text-base md:text-lg">{formatPeriod(period).start}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <FiClock className="w-4 h-4" />
            <p
              className={`text-base md:text-lg ${
                formatPeriod(period).isPresent ? "text-green-400" : ""
              }`}
            >
              {formatPeriod(period).end}
            </p>
          </div>
        </div>
      </div>

      <ul className="relative space-y-3 md:space-y-4">
        {responsibilities.map((responsibility, index) => (
          <motion.li
            key={index}
            className="flex items-start gap-2 md:gap-3 text-gray-300 text-sm md:text-lg leading-relaxed"
            variants={{
              initial: { opacity: 0, x: -20 },
              animate: { opacity: 1, x: 0 },
            }}
            transition={{ delay: index * 0.1 }}
          >
            <FiChevronRight className="md:group-hover:text-white/60 shrink-0 mt-1 w-4 md:w-5 h-4 md:h-5 text-gray-500 transition-colors" />
            <span>{responsibility}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default ExperienceCard;

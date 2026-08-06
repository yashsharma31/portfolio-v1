import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaGithub, FaFire } from "react-icons/fa";
import { IoMdGitCommit } from "react-icons/io";
import { BiGitPullRequest } from "react-icons/bi";
import { IconType } from "react-icons";

type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

type GitHubContributionsResponse = {
  total: Record<string, number>;
  contributions: Array<{
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
  }>;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.01,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1 },
};

interface StatCardProps {
  icon: IconType;
  label: string;
  value: string;
}

const StatCard = ({ icon: Icon, label, value }: StatCardProps) => (
  <motion.div
    className="flex items-center gap-3 bg-white/5 p-3 rounded-xl"
    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
    transition={{ duration: 0.2 }}
  >
    <div className="bg-indigo-500/20 p-2 rounded-lg">
      <Icon className="w-5 h-5 text-indigo-400" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="font-medium text-white">{value}</p>
    </div>
  </motion.div>
);

export default function GitHubContributions() {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState({ 2023: 0, 2024: 0 });
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const username = "yashsharma31";
        const response = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${username}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = (await response.json()) as GitHubContributionsResponse;

        if (!data.contributions || !Array.isArray(data.contributions)) {
          throw new Error("Invalid data format received");
        }

        // Filter only 2024 contributions
        const contributions2024 = data.contributions.filter((day) =>
          day.date.startsWith("2024")
        );
        setContributions(contributions2024);

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date().toISOString().split("T")[0];
        for (let i = data.contributions.length - 1; i >= 0; i--) {
          const contribution = data.contributions[i];
          if (contribution.date > today) continue;
          if (contribution.count > 0) {
            currentStreak++;
          } else {
            break;
          }
        }
        setStreakCount(currentStreak);

        // Set totals for both years
        setTotals({
          2023: data.total?.[2023] || 0,
          2024: data.total?.[2024] || 0,
        });

        setError(null);
      } catch (error) {
        console.error("Failed to fetch GitHub contributions:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load contributions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-zinc-900 hover:bg-zinc-800";
      case 1:
        return "bg-indigo-900/50 hover:bg-indigo-800/60";
      case 2:
        return "bg-indigo-700/50 hover:bg-indigo-600/60";
      case 3:
        return "bg-indigo-500/50 hover:bg-indigo-400/60";
      case 4:
        return "bg-indigo-400 hover:bg-indigo-300";
      default:
        return "bg-zinc-900 hover:bg-zinc-800";
    }
  };

  if (loading) {
    return (
      <motion.div
        className="bg-zinc-900/50 backdrop-blur-xs p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-4 animate-pulse">
          <div className="bg-zinc-800/50 rounded-sm w-1/4 h-6"></div>
          <div className="gap-4 grid grid-cols-2 mb-4">
            <div className="bg-zinc-800/50 rounded-xl h-20"></div>
            <div className="bg-zinc-800/50 rounded-xl h-20"></div>
          </div>
          <div className="bg-zinc-800/50 rounded-sm h-[200px]"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-zinc-900/50 backdrop-blur-xs p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <FaGithub className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="font-semibold text-white text-xl">
            GitHub Contributions
          </h2>
          <p className="text-red-400">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white transition-colors"
          >
            Retry
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6 border-white/5 hover:border-white/10 bg-zinc-900/50 backdrop-blur-xs mx-auto p-6 border rounded-xl max-w-3xl transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <FaGithub className="w-8 h-8 text-white" />
          <h2 className="font-semibold text-2xl text-white">GitHub Activity</h2>
        </div>

        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={IoMdGitCommit}
            label="2024 Contributions"
            value={totals[2024].toLocaleString()}
          />
          <StatCard
            icon={BiGitPullRequest}
            label="2023 Contributions"
            value={totals[2023].toLocaleString()}
          />
          <StatCard
            icon={FaFire}
            label="Current Streak"
            value={`${streakCount} days`}
          />
        </div>
      </motion.div>

      <div className="py-2 overflow-x-auto">
        <motion.div
          className="inline-grid gap-[3px] grid-cols-[repeat(53,minmax(10px,1fr))] py-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {contributions.map((day) => (
            <motion.div
              key={day.date}
              variants={item}
              className={`aspect-square w-full rounded-xs ${getLevelColor(
                day.level
              )} transition-all duration-300 hover:ring-2 hover:ring-white/20 hover:scale-125 cursor-pointer`}
              title={`${day.count} contributions on ${new Date(
                day.date
              ).toLocaleDateString()}`}
            />
          ))}
        </motion.div>
      </div>

      <motion.div
        className="flex justify-end items-center gap-2 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-gray-400">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <motion.div
            key={level}
            whileHover={{ scale: 1.2 }}
            className={`w-2.5 h-2.5 rounded-xs ${getLevelColor(
              level
            )} cursor-pointer`}
          />
        ))}
        <span className="text-gray-400">More</span>
      </motion.div>
    </motion.div>
  );
}

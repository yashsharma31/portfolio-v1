"use client";

import { motion } from "framer-motion";
import { FiArrowRight, FiClock, FiTag } from "react-icons/fi";
import { useEffect, useState } from "react";
import { getMediumPosts, type MediumPost } from "@/utils/medium";
import Image from "next/image";

const MEDIUM_PROFILE = "https://medium.com/@yash.sh0031";

export default function DesignThoughts() {
  const [posts, setPosts] = useState<MediumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const mediumPosts = await getMediumPosts();
        setPosts(mediumPosts.slice(0, 4)); // Only take first 4 posts
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <motion.div
      className="space-y-8 md:space-y-12 px-4 md:px-0 pt-16 md:pt-32"
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
      <div className="flex justify-between items-end">
        <motion.h2
          className="font-bold text-4xl md:text-[120px] leading-none"
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
          }}
        >
          <span className="text-white">BLOG</span>{" "}
          <span className="text-gray-600">POSTS</span>
        </motion.h2>

        <a
          href={MEDIUM_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="md:flex items-center gap-2 hidden pb-4 text-blue-400 hover:text-blue-300 transition-colors group"
        >
          <span>View all posts</span>
          <FiArrowRight className="transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      <motion.div
        className="gap-4 md:gap-6 grid grid-cols-1 md:grid-cols-2"
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
        {loading
          ? // Loading skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                className="relative flex flex-col gap-3 md:gap-4 border-white/5 bg-black/20 backdrop-blur-xs p-4 md:p-6 border rounded-3xl overflow-hidden"
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                }}
              >
                <div className="bg-white/5 rounded-2xl w-full animate-pulse aspect-[1.91/1]" />
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-white/5 rounded-lg w-3/4 h-6 md:h-8 animate-pulse" />
                  <div className="bg-white/5 rounded-lg w-full h-3 md:h-4 animate-pulse" />
                  <div className="bg-white/5 rounded-lg w-2/3 h-3 md:h-4 animate-pulse" />
                </div>
              </motion.div>
            ))
          : posts.map((post) => (
              <motion.a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                key={post.title}
                className="relative flex flex-col gap-3 md:gap-4 border-white/5 bg-black/20 md:hover:bg-white/5 backdrop-blur-xs p-4 md:p-6 border rounded-3xl transition-all overflow-hidden active:scale-[0.99] group"
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                }}
              >
                {post.thumbnail ? (
                  <div className="relative rounded-2xl w-full overflow-hidden aspect-[1.91/1]">
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="md:group-hover:scale-105 transition-transform duration-300 object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-2xl w-full aspect-[1.91/1]" />
                )}

                <div className="space-y-2 md:space-y-3">
                  <h3 className="md:group-hover:text-blue-400 line-clamp-2 font-semibold text-lg text-white md:text-xl transition-colors">
                    {post.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-400 text-xs md:text-sm">
                    <div className="flex items-center gap-1">
                      <FiClock className="w-3 md:w-4 h-3 md:h-4 shrink-0" />
                      <span>{post.pubDate}</span>
                    </div>
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 md:gap-2">
                        <FiTag className="w-3 md:w-4 h-3 md:h-4 shrink-0" />
                        {post.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="bg-white/5 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 md:gap-2 text-blue-400 text-xs md:text-sm">
                    <span>Read article</span>
                    <FiArrowRight className="w-3 md:w-4 h-3 md:h-4 transition-transform md:group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.a>
            ))}
      </motion.div>

      <a
        href={MEDIUM_PROFILE}
        target="_blank"
        rel="noopener noreferrer"
        className="flex justify-center items-center gap-2 md:hidden mt-4 text-blue-400"
      >
        <span>View all posts</span>
        <FiArrowRight />
      </a>
    </motion.div>
  );
}

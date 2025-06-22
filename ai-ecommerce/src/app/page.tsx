"use client";

import { BentoDemo } from "@/components/magicui/bento-card";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FeatureHighlight } from "@/components/feature-highlight";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Ensure animations only run after component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  if (!mounted) return null;

  return (
    <motion.main
      className="flex min-h-screen flex-col items-center justify-center py-12 px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        variants={fadeInUpVariants}
        className="mb-12 text-center"
      >
        <motion.div variants={fadeInUpVariants}>
          <FeatureHighlight />
        </motion.div>
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500"
        >
          AI-Powered E-Commerce
        </motion.h1>
        <motion.p 
          className="text-lg text-gray-400 max-w-2xl mx-auto"
        >
          Experience the future of online shopping with intelligent pricing, smart bartering, and personalized recommendations.
        </motion.p>
      </motion.div>

      <motion.div variants={fadeInUpVariants}>
        <BentoDemo />
      </motion.div>
      
      <motion.div
        variants={fadeInUpVariants}
        className="mt-12 flex flex-wrap justify-center gap-6"
      >
        <motion.a
          href="https://github.com/sahil454521/ai-ecommerce"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub Repository
        </motion.a>
        
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Demo
        </motion.button>
      </motion.div>
    </motion.main>
  );
}